const {
   Client,
   GatewayIntentBits,
   Partials,
   Collection,
   Permissions,
   ActionRowBuilder,
   SelectMenuBuilder,
   MessageButton,
   EmbedBuilder,
   ButtonBuilder,
   ButtonStyle,
   InteractionType,
   ChannelType,
} = require('discord.js');
const client = new Client({
   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.DirectMessages],
   partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const fs = require('fs');
const fetch = require('node-fetch');
const request = require('request');
const superagent = require('superagent');
var config = require('./config.json');
const SlashRegistry = require('./functions/slashRegistry.js');
const Area = require('./functions/area.js');
const Profile = require('./functions/profile.js');
const Track = require('./functions/track.js');
const Raid = require('./functions/raid.js');
const Incident = require('./functions/incident.js');
const Quest = require('./functions/quest.js');
const Lure = require('./functions/lure.js');
const Remove = require('./functions/remove.js');
var util = require('./util.json');
var pokemonList = [];
var pokemonLists = {};
var templateList = {};
var incidentList = {};
var questList = {};
var master = "";

client.on('ready', async () => {
   console.log("Chatot Logged In");
   //Update masterfile
   request("https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest-react-map.json", {
      json: true
   }, (error, res, body) => {
      if (error) {
         return console.log(error)
      };
      if (!error && res.statusCode == 200) {
         master = body;
         getLanguages(client, config);
      }
   });
}); //End of ready()

//Buttons
client.on('interactionCreate', async interaction => {
   if (interaction.type !== InteractionType.MessageComponent) {
      return;
   }
   //Verify interaction
   if (!interaction.customId.startsWith('chatot~')) {
      return;
   }
   let user = interaction.member;
   var interactionID = interaction.customId.replace('chatot~', '');
   //Delete message
   if (interactionID == 'delete') {
      try {
         setTimeout(() => interaction.message.delete().catch(err => console.log("Failed to delete message:", err)), 1);
      } catch (err) {
         console.log("Failed to delete message:", err);
      }
   }
   //Add pokemon
   else if (interactionID == 'track~verify') {
      Track.addTrackCommand(client, interaction, config, util, master);
   }
   //Edit areas
   else if (interactionID.startsWith('area~edit')) {
      Area.editAreas(client, interaction, config, util);
   }
   //Show area
   else if (interactionID.startsWith('area~show')) {
      Area.showArea(client, interaction, config, util);
   }
   //Add area
   else if (interactionID.startsWith('area~add~')) {
      Area.editAreaButton(client, interaction, config, util, 'add', interactionID.replace('area~add~', ''));
   }
   //Remove area
   else if (interactionID.startsWith('area~remove~')) {
      Area.editAreaButton(client, interaction, config, util, 'remove', interactionID.replace('area~remove~', ''));
   }
   //Change profile
   else if (interactionID.startsWith('profile~change')) {
      Profile.changeProfile(client, interaction, config, util);
   }
   //Add raid
   else if (interactionID.startsWith('raid~verify')) {
      Raid.addRaid(client, interaction, config, util, master);
   }
   //Add incident
   else if (interactionID.startsWith('incident~verify')) {
      Incident.addIncident(client, interaction, config, util, incidentList);
      delete require.cache[Incident];
   }
   //Add quest
   else if (interactionID.startsWith('quest~verify')) {
      Quest.addQuest(client, interaction, config, util, questList);
   }
   //Add lure
   else if (interactionID.startsWith('lure~verify')) {
      Lure.addLure(client, interaction, config, util);
   }
   //Remove tracking
   else if (interactionID.startsWith('remove~verify')) {
      let splitId = interactionID.replace('remove~verify~', '').split('~');
      Remove.removeTracking(client, interaction, config, util, splitId[0].replace('incident', 'invasion'), splitId[1]);
   }
}); //End of buttons


//Slash commands
client.on('interactionCreate', async interaction => {
   if (interaction.type !== InteractionType.ApplicationCommand) {
      return;
   }
   let user = interaction.user;
   if (user.bot == true) {
      return;
   }
   const command = await interaction.client.commands.get(interaction.commandName);
   if (!command) {
      return;
   }
   //Check for user
   superagent
      .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
      .set('X-Poracle-Secret', config.poracle.secret)
      .end((error, response) => {
         if (error) {
            console.log('Api error:', error);
         } else {
            let humanInfo = JSON.parse(response.text);
            if (humanInfo.status != 'ok') {
               console.log(`User: ${interaction.user.id} | Command: ${interaction.commandName} | Error: ${humanInfo}`);
               return;
            }
         }
      }); //End of superagent
   try {
      let slashReturn = await command.execute(client, interaction, config, util);
   } catch (error) {
      console.error(error);
      await interaction.reply({
         content: 'There was an error while executing this command!',
         ephemeral: true
      }).catch(console.error);
   }
}); //End of slash commands


//AutoComplete
client.on('interactionCreate', async interaction => {
   if (!interaction.isAutocomplete()) return;
   let focusedValue = await interaction.options.getFocused();
   for (var i in interaction.options._hoistedOptions) {
      if (!interaction.options._hoistedOptions[i]['focused'] == true) {
         continue;
      }
      let optionName = interaction.options._hoistedOptions[i]['name'];
      //Remove
      if (optionName == 'tracking' && interaction.commandName == config.removeCommand.toLowerCase().replaceAll(/[^a-z0-9]/gi, '_')) {
         Remove.autoComplete(client, interaction, config, util, questList);
         break;
      }

      //Get user language
      superagent
         .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
         .set('X-Poracle-Secret', config.poracle.secret)
         .set('accept', 'application/json')
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
               autoCompleteCommands("en");
            } else {
               let responseText = JSON.parse(response.text);
               if (responseText.human.language) {
                  autoCompleteCommands(responseText.human.language);
               } else {
                  autoCompleteCommands("en");
               }
            }
         }); //End of superagent

      async function autoCompleteCommands(language) {
         //Pokemon
         if (optionName == 'pokemon') {
            //let filteredList = pokemonList.filter(choice => choice.includes(focusedValue)).slice(0, 25);
            let filteredList = pokemonLists[language].filter(choice => choice.includes(focusedValue)).slice(0, 25);
            sendAutoResponse(filteredList);
         }
         //Raid
         else if (optionName == 'type' && interaction.commandName == config.raidCommand.toLowerCase().replaceAll(/[^a-z0-9]/gi, '_')) {
            let filteredList = (Object.keys(util.raidLevels).concat(pokemonList)).filter(choice => choice.includes(focusedValue)).slice(0, 25);
            sendAutoResponse(filteredList);
         }
         //Incident
         else if (optionName == 'type' && interaction.commandName == config.incidentCommand.toLowerCase().replaceAll(/[^a-z0-9]/gi, '_')) {
            var incidents = [];
            for (const [type, rewards] of Object.entries(incidentList)) {
               incidents.push(`${type} (${rewards.join(', ')})`);
            } //End of type loop
            let filteredList = incidents.filter(choice => choice.includes(focusedValue)).slice(0, 25);
            sendAutoResponse(filteredList);
         }
         //Quest
         else if (optionName == 'type' && interaction.commandName == config.questCommand.toLowerCase().replaceAll(/[^a-z0-9]/gi, '_')) {
            let filteredList = await Object.keys(questList).filter(choice => choice.includes(focusedValue)).slice(0, 25);
            //console.log(filteredList)
            sendAutoResponse(filteredList);
         }
         //Templates
         else if (optionName == 'template') {
            let templateType = interaction.commandName.replace(config.pokemonCommand, 'monster').replace(config.raidCommand, 'raid').replace(config.incidentCommand, 'invasion').replace(config.questCommand, 'quest').replace(config.lureCommand, 'lure');
            let allTemplates = templateList[templateType];
            var availableTemplates = [];
            for (var a in allTemplates) {
               if (!config.ignoreTemplates.includes(allTemplates[a])) {
                  availableTemplates.push(allTemplates[a]);
               }
            }
            try {
               let filteredList = availableTemplates.filter(choice => choice.includes(focusedValue)).slice(0, 25);
               if (filteredList.length > 0) {
                  sendAutoResponse(filteredList);
               }
            } catch (err) {
               console.log("Error getting templates:", err);
            }
         }
         //Profiles
         else if (optionName == 'profile') {
            createProfileList();
         }
      } //End of autoCompleteCommands()
   } //End of i loop

   async function createProfileList() {
      superagent
         .get(util.api.getProfiles.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
         .set('X-Poracle-Secret', config.poracle.secret)
         .set('accept', 'application/json')
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else {
               let responseText = JSON.parse(response.text);
               if (responseText.status == 'ok') {
                  let apiProfiles = responseText.profile;
                  if (apiProfiles.length == 0) {
                     sendAutoResponse(['No profiles']);
                  } else {
                     var profileList = [];
                     for (var p in apiProfiles) {
                        profileList.push(`${apiProfiles[p]['name']} (${apiProfiles[p]['profile_no']})`)
                     }
                     let filteredList = profileList.filter(choice => choice.includes(focusedValue)).slice(0, 25);
                     sendAutoResponse(filteredList);
                  }
               } else {
                  console.log("Failed to fetch profiles:", response);
               }
            }
         }); //End of superagent
   } //End of createProfileList()

   async function sendAutoResponse(filteredList) {
      await interaction.respond(
         filteredList.map(choice => ({
            name: choice,
            value: choice
         }))
      ).catch(console.error);
   } //End of sendAutoResponse()
}); //End of autoComplete


async function getLanguages(client, config) {
   //Get languages
   request("https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/index.json", {
      json: true
   }, (error, res, body) => {
      if (error) {
         return console.log(error)
      };
      if (!error && res.statusCode == 200) {
         let languages = body;
         createLocales(client, config, languages);
      }
   });
} //End of getLanguages()


async function createLocales(client, config, languages) {
   await Promise.all(languages.map((locale) =>
      fetch(`https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/static/enRefMerged/${locale}`)
      .then((response) => response.json())
      .then((json) => fs.writeFileSync(`./locale/${locale}`, JSON.stringify(json, null, 2)))
      .catch((e) => console.log(`Error fetching translations for ${locale}: ${e}`))
   ));
   console.log("Finished updating locales");

   //Register Commands
   updateConfigRegisterCommands(client, config);

   //Update lists
   createPokemonList();
   createTemplateList();
   createIncidentList();
   createQuestList();
}


async function createPokemonList() {
   let ignoreForms = [];
   for (const [dex, monData] of Object.entries(master.pokemon)) {
      pokemonList.push(monData.name.toLowerCase());
      if (monData.forms['0'] == {} || Object.keys(monData.forms).length == 1) {
         continue;
      }
      for (const [form, formData] of Object.entries(monData.forms)) {
         if (formData.name) {
            pokemonList.push(`${monData.name.toLowerCase()} (${formData.name.toLowerCase()})`);
         }
      }
   }

   let localeFiles = fs.readdirSync('./locale').filter(file => file.endsWith('.json'));
   //Loop over each locale
   for (const file of localeFiles) {
      let localeName = file.replace('.json', '');
      let locale = JSON.parse(fs.readFileSync(`./locale/${file}`));
      var localeMonList = [];
      //Translate from master
      for (const [dex, monData] of Object.entries(master.pokemon)) {
         //Base form
         let baseMonName = locale[monData.name] ? locale[monData.name].toLowerCase() : monData.name.toLowerCase();
         localeMonList.push(baseMonName);
         if (monData.forms['0'] == {} || Object.keys(monData.forms).length == 1) {
            continue;
         }
         //Other forms
         for (const [form, formData] of Object.entries(monData.forms)) {
            if (formData.name) {
               let formName = locale[formData.name] ? locale[formData.name].toLowerCase() : formData.name.toLowerCase();
               localeMonList.push(`${baseMonName} (${formName})`);
            }
         }
      } //End of master loop
      //Save translations to memory
      pokemonLists[localeName] = localeMonList;
   } //End of locale loop
} //End of createPokemonList()


async function createQuestList() {
   //Pokemon
   for (const [dex, monData] of Object.entries(master.pokemon)) {
      questList[monData.name.toLowerCase()] = {
         reward: monData.pokedexId,
         type: 7,
         form: 0
      }
      if (monData.tempEvolutions) {
         questList[`energy_${monData.name.toLowerCase()}`] = {
            reward: monData.pokedexId,
            type: 12,
            form: 0
         }
      }
      if (monData.forms['0'] == {} || Object.keys(monData.forms).length == 1) {
         continue;
      }
      for (const [form, formData] of Object.entries(monData.forms)) {
         if (formData.name) {
            questList[`${monData.name.toLowerCase()} (${formData.name.toLowerCase()})`] = {
               reward: monData.pokedexId,
               type: 7,
               form: form * 1
            }
         }
      }

   }
   //Energy
   questList['energy'] = {
      reward: 0,
      type: 12,
      form: 0
   }
   //Stardust
   questList['stardust'] = {
      reward: 0,
      type: 3,
      form: 0
   }
   //Candy
   questList['candy'] = {
      reward: 0,
      type: 4,
      form: 0
   }
   //XL candy
   questList['xl candy'] = {
      reward: 0,
      type: 9,
      form: 0
   }
   //Experience
   questList['experience'] = {
      reward: 0,
      type: 1,
      form: 0
   }
   //Items
   for (const [itemName, itemNumber] of Object.entries(util.questItems)) {
      questList[itemName] = {
         reward: itemNumber,
         type: 2,
         form: 0
      }
   }
} //End of createQuestList()


async function createTemplateList() {
   superagent
      .get(util.api.getTemplates.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port))
      .set('X-Poracle-Secret', config.poracle.secret)
      .set('accept', 'application/json')
      .end((error, response) => {
         if (error) {
            console.log('Api error:', error);
         } else {
            let responseText = JSON.parse(response.text);
            if (responseText.status == 'ok') {
               var templates = {};
               //Each type (monster/raid/lure/etc)
               for (const [type, langInfo] of Object.entries(responseText.discord)) {
                  var typeTemplates = [];
                  //Each language
                  for (const [langName, temps] of Object.entries(langInfo)) {
                     typeTemplates.push(Object.values(temps));
                  } //End of language loop
                  typeTemplates.sort();
                  typeTemplates = [...new Set(typeTemplates)];
                  var cleanTemplates = [];
                  for (var t in typeTemplates[0]) {
                     if (!config.ignoreTemplates.includes(typeTemplates[0][t])) {
                        if (typeTemplates[0][t].toString() == config.defaultTemplateName) {
                           cleanTemplates.push(`${typeTemplates[0][t].toString()} (Default)`);
                        } else {
                           cleanTemplates.push(typeTemplates[0][t].toString());
                        }
                     }
                  } //End of t loop
                  templates[type] = cleanTemplates.slice(0, 25);
               } //End of type loop
               templateList = templates;
            } else {
               console.log('Failed to fetch templates:', response);
            }
         }
      }); //End of superagent
} //End of createTemplateList()


async function createIncidentList() {
   request("https://rocket.malte.im/api/characters", {
      json: true
   }, (error, res, body) => {
      if (error) {
         return console.log(error)
      };
      if (!error && res.statusCode == 200) {
         //Kecleon
         incidentList['kecleon'] = ['encounter'];
         //Showcase
         incidentList['showcase'] = ['contest'];
         for (var i in body.characters) {
            let rewardsApi = body.characters[i]['rewards'];
            var characterRewards = [];
            for (var r in rewardsApi) {
               var monName = rewardsApi[r]['pokemon']['name'].toLowerCase();
               if (rewardsApi[r]['form']['name'] != "FORM_UNSET") {
                  monName = rewardsApi[r]['form']['name'].replaceAll('_', ' ').toLowerCase();
               }
               if (rewardsApi[r]['shinies']) {
                  let shinyOdds = Math.round(100 / (rewardsApi[r]['shinies'] / rewardsApi[r]['total'] * 100));
                  monName = monName.concat(`✨ (1:${shinyOdds})`);
               }
               characterRewards.push(monName);
            } //End of r loop
            //Leaders
            if (body.characters[i]['character']['name'].includes('_EXECUTIVE_')) {
               incidentList[body.characters[i]['character']['name'].replace('CHARACTER_EXECUTIVE_', '').toLowerCase()] = characterRewards;
            }
            //Grunts
            else {
               let gruntName = body.characters[i]['character']['name'].replace('CHARACTER_GRUNT_FEMALE', 'mixed_female').replace('CHARACTER_GRUNT_MALE', 'mixed_male').replace('CHARACTER_', '').replace('_GRUNT_', '_').toLowerCase();
               incidentList[gruntName] = characterRewards;
            }
         } //End of i loop
      };
   });
} //End of createIncidentList()


async function updateConfigRegisterCommands(client, config) {
   superagent
      .get(`http://${config.poracle.host}:${config.poracle.port}/api/config/poracleWeb`)
      .set('X-Poracle-Secret', config.poracle.secret)
      .set('accept', 'application/json')
      .end((error, response) => {
         if (error) {
            console.log('Api error:', error);
         } else {
            let body = JSON.parse(response.text);
            config.pvpFilterMaxRank = body.pvpFilterMaxRank;
            config.pvpFilterGreatMinCP = body.pvpFilterGreatMinCP;
            config.pvpFilterUltraMinCP = body.pvpFilterUltraMinCP;
            config.pvpFilterLittleMinCP = body.pvpFilterLittleMinCP;
            config.maxDistance = body.maxDistance;
            config.defaultTemplateName = body.defaultTemplateName;
            fs.writeFileSync("./config.json", JSON.stringify(config));
            //Register Slash Commands
            SlashRegistry.registerCommands(client, config);
         }
      });
} //End of updateConfigRegisterCommands()


client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.login(config.token);