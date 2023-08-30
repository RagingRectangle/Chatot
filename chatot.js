const {
  Client,
  GatewayIntentBits,
  Partials,
  InteractionType
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
const Pokemon = require('./functions/pokemon.js');
const Raid = require('./functions/raid.js');
const Incident = require('./functions/incident.js');
const Quest = require('./functions/quest.js');
const Lure = require('./functions/lure.js');
const Nest = require('./functions/nest.js');
const Remove = require('./functions/remove.js');
const defaults = require('./locale/custom/default.json');
var util = require('./util.json');
var pokemonListBasic = [];
var pokemonLists = {};
var megaLists = {};
var moveLists = {};
var templateList = {};
var templateLists = {};
var incidentLists = {};
var raidLists = {};
var questLists = {};
var master = "";
var gameData = "";

//Config check
let newConfigChecklist = ["infoCommand", "nestCommand"];
for (var n in newConfigChecklist) {
  if (!config[newConfigChecklist[n]]) {
    console.error("Config is missing:", newConfigChecklist[n])
  }
}

client.on('ready', async () => {
  console.log("Chatot Logged In");
  //Update gameData
  request("https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest-poracle.json", {
    json: true
  }, (error, res, body) => {
    if (!error && res.statusCode == 200) {
      gameData = body;
      updateMaster();
    } else {
      console.log('Error updating gameData:', error);
      process.exit();
    }
  })
  async function updateMaster() {
    request("https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest-react-map.json", {
      json: true
    }, (error, res, body) => {
      if (!error && res.statusCode == 200) {
        master = body;
        gameData['questRewardTypes'] = master['questRewardTypes'];
        getLanguages(client, config);
      } else {
        console.log('Error updating data/locales:', error);
        process.exit();
      }
    });
  } //End of updateMaster()
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
  var interactionID = interaction.customId;
  //Delete message
  if (interactionID == 'chatot~delete') {
    try {
      setTimeout(() => interaction.message.delete().catch(err => console.log("Failed to delete message:", err)), 1);
    } catch (err) {
      console.log("Failed to delete message:", err);
    }
    return;
  }
  //Doesn't need additional humanInfo
  //Add lure
  if (interactionID.startsWith('chatot~lure~verify~')) {
    Lure.addLure(client, interaction, config, util, interactionID.replace('chatot~lure~verify~', ''));
  }
  //Add nest
  if (interactionID.startsWith('chatot~nest~verify~')) {
    Nest.addNest(client, interaction, config, util, interactionID.replace('chatot~nest~verify~', ''));
  }
  //Add incident
  else if (interactionID.startsWith('chatot~incident~verify')) {
    Incident.addIncident(client, interaction, config, util, interactionID.replace('chatot~incident~verify~', ''));
  }
  //Add raid
  else if (interactionID.startsWith('chatot~raid~verify~')) {
    Raid.addRaid(client, interaction, config, util, interactionID.replace('chatot~raid~verify~', ''));
  }
  //Add quest
  else if (interactionID.startsWith('chatot~quest~verify')) {
    Quest.addQuest(client, interaction, config, util, interactionID.replace('chatot~quest~verify~', ''));
  }
  //Add pokemon
  if (interactionID.startsWith('chatot~pokemon~verify~')) {
    Pokemon.addPokemonCommand(client, interaction, config, util, interactionID.replace('chatot~pokemon~verify~', ''));
  }
  //Get humanInfo
  try {
    superagent
        .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
        .set('X-Poracle-Secret', config.poracle.secret)
        .end((error, response) => {
          if (error) {
            console.log('Api error:', error);
          } else {
            let humanInfo = JSON.parse(response.text);
            humanInfoButtons(humanInfo.human);
          }
        }); //End of superagent
  } catch (err) {
    console.log("Error fetching humanInfo:", err);
  }

  async function humanInfoButtons(humanInfo) {
    //Edit areas
    if (interactionID.startsWith('chatot~area~edit')) {
      Area.editAreas(client, interaction, config, util, humanInfo);
    }
    //Add area
    else if (interactionID.startsWith('chatot~area~add~')) {
      Area.editAreaButton(client, interaction, config, util, humanInfo, 'add', interactionID.replace('chatot~area~add~', ''));
    }
    //Remove area
    else if (interactionID.startsWith('chatot~area~remove~')) {
      Area.editAreaButton(client, interaction, config, util, humanInfo, 'remove', interactionID.replace('chatot~area~remove~', ''));
    }
    //Show area
    else if (interactionID.startsWith('chatot~area~show')) {
      Area.showArea(client, interaction, config, util, humanInfo);
    }
    //Change profile
    else if (interactionID.startsWith('chatot~profile~change')) {
      Profile.changeProfile(client, interaction, config, util, humanInfo);
    }
    //Remove tracking
    else if (interactionID.startsWith('chatot~remove~verify~')) {
      Remove.removeTracking(client, interaction, config, util, humanInfo, interactionID.replace('chatot~remove~verify~', ''));
    }
  } //End of humanInfoButtons()
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
  var humanInfo = '';
  superagent
      .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
      .set('X-Poracle-Secret', config.poracle.secret)
      .end((error, response) => {
        if (error) {
          console.log('Api error:', error);
        } else {
          humanInfo = JSON.parse(response.text);
          if (humanInfo.status != 'ok') {
            console.log(`User: ${interaction.user.id} | Command: ${interaction.commandName} | Error: ${humanInfo}`);
            return;
          } else {
            runSlashCommand(humanInfo.human.language ? humanInfo.human.language : 'en');
          }
        }
      }); //End of superagent

  async function runSlashCommand(language) {
    try {
      let locale = await require(`./locale/${language}.json`);
      let slashReturn = await command.execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo.human, incidentLists, raidLists, questLists);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      }).catch(console.error);
    }
  }
}); //End of slash commands


//AutoComplete
client.on('interactionCreate', async interaction => {
  if (!interaction.isAutocomplete()) return;
  let focusedValue = await interaction.options.getFocused().toLowerCase();
  for (var i in interaction.options._hoistedOptions) {
    if (!interaction.options._hoistedOptions[i]['focused'] == true) {
      continue;
    }
    let optionName = interaction.options._hoistedOptions[i]['name'];
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
      try {
        //Remove
        if (optionName == defaults.removeAlertName && interaction.commandName == config.removeCommand) {
          Remove.autoComplete(client, interaction, config, util, gameData, language);
        }
        //Pokemon
        if (optionName == defaults.pokemonName) {
          let filteredList = Object.keys(pokemonLists[language]).filter(choice => choice.toLowerCase().includes(focusedValue)).slice(0, 25);
          await interaction.respond(
              filteredList.map(choice => ({
                name: choice,
                value: `${choice}~${pokemonLists[language][choice]}`
              }))
          ).catch(console.error);
        }
        //Move
        else if (optionName == defaults.infoMoveName && interaction.options['_subcommand'] == defaults.infoMoveName && interaction.commandName == config.infoCommand) {
          let filteredList = Object.keys(moveLists[language]).filter(choice => choice.toLowerCase().includes(focusedValue)).slice(0, 25);
          await interaction.respond(
              filteredList.map(choice => ({
                name: choice,
                value: `${moveLists[language][choice]}~${language}`
              }))
          ).catch(console.error);
        }
        //Incident
        else if (optionName == defaults.incidentTypeName && interaction.commandName == config.incidentCommand) {
          let filteredList = Object.keys(incidentLists[language]).filter(choice => choice.toLowerCase().includes(focusedValue)).slice(0, 25);
          sendAutoResponse(filteredList);
        }
        //Raid
        else if (optionName == defaults.raidTypeName && interaction.commandName == config.raidCommand) {
          let filteredList = Object.keys(raidLists[language]).filter(choice => choice.toLowerCase().includes(focusedValue)).slice(0, 25);
          sendAutoResponse(filteredList);
        }
        //Quest
        else if (optionName == defaults.questTypeName && interaction.commandName == config.questCommand) {
          let filteredList = Object.keys(questLists[language]).filter(choice => choice.toLowerCase().includes(focusedValue)).slice(0, 25);
          //console.log(filteredList)
          sendAutoResponse(filteredList);
        }
        //Templates
        else if (optionName == defaults.templateName) {
          let templateType = interaction.commandName.replace(config.pokemonCommand, 'monster').replace(config.raidCommand, 'raid').replace(config.incidentCommand, 'invasion').replace(config.questCommand, 'quest').replace(config.lureCommand, 'lure');
          if (templateLists[templateType][language]) {
            let filteredList = templateLists[templateType][language].filter(choice => choice.toString().toLowerCase().includes(focusedValue) && !config.ignoreTemplates.includes(choice)).slice(0, 25);
            sendAutoResponse(filteredList);
          }
        }
      } catch (err) {
        console.log(err);
      }
    } //End of autoCompleteCommands()
  } //End of i loop

  async function sendAutoResponse(filteredList) {
    await interaction.respond(
        filteredList.map(choice => ({
          name: choice.toString(),
          value: choice.toString()
        }))
    ).catch(console.error);
  } //End of sendAutoResponse()
}); //End of autoComplete


async function getLanguages(client, config) {
  //Get languages
  request("https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/index.json", {
    json: true
  }, (error, res, body) => {
    if (!error && res.statusCode == 200) {
      let languages = body;
      createLocales(client, config, languages);
    } else {
      console.log(err);
    }
  });
} //End of getLanguages()


async function createLocales(client, config, languages) {
  var defaultJson = require('./locale/custom/default.json');
  //Local default override
  try {
    if (fs.existsSync(`./locale/custom/local.json`)) {
      let localOverride = require(`./locale/custom/local.json`);
      defaultJson = Object.assign(defaultJson, localOverride);
    }
  }
  catch(err){
    console.log(err);
  }
  await Promise.all(languages.map((locale) =>
      fetch(`https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/static/enRefMerged/${locale}`)
          .then((response) => response.json())
          .then((pogoJson) => {
            //Merge over defaults
            var languageJson = Object.assign(pogoJson, defaultJson);
            //Merge any custom files over defaults
            try {
              if (fs.existsSync(`./locale/custom/${locale}`)) {
                let customJson = require(`./locale/custom/${locale}`);
                languageJson = Object.assign(customJson, languageJson);
              }
            } catch (err) {
              console.log(err);
            }
            fs.writeFileSync(`./locale/${locale}`, JSON.stringify(languageJson, null, 2));
            //Create duplicates for Discord differences
            if (locale == 'es.json') {
              fs.writeFileSync(`./locale/es-ES.json`, JSON.stringify(languageJson, null, 2));
            }
            if (locale == 'pt-br.json') {
              fs.writeFileSync(`./locale/pt-BR.json`, JSON.stringify(languageJson, null, 2));
            }
            if (locale == 'sv.json') {
              fs.writeFileSync(`./locale/sv-SE.json`, JSON.stringify(languageJson, null, 2));
            }
            if (locale == 'zh-tw.json') {
              fs.writeFileSync(`./locale/zh-TW.json`, JSON.stringify(languageJson, null, 2));
            }
            if (locale == 'en.json') {
              fs.writeFileSync(`./locale/en-GB.json`, JSON.stringify(languageJson, null, 2));
            }
          })
          .catch((e) => console.log(`Error fetching translations for ${locale}: ${e}`))
  ));
  console.log("Finished updating locales");

  try {
    //Create localizations for commands
    let customCommandFiles = fs.readdirSync('./locale/custom').filter(file => file != 'default.json' && file != 'customCommands.json' && file != 'local.json' && file.endsWith('.json'));
    let defaultKeys = Object.keys(require('./locale/custom/default.json'));
    var commandLocalizations = {};
    for (var d in defaultKeys) {
      commandLocalizations[defaultKeys[d]] = {};
    }
    for (const file of customCommandFiles) {
      let customCommands = require(`./locale/custom/${file}`);
      let language = file.replace('.json', '');
      for (const [key, value] of Object.entries(customCommands)) {
        if (defaultKeys.includes(key)) {
          commandLocalizations[key][language] = value;
        }
      } //End of customCommands loop
    } //End of file loop
    fs.writeFileSync('./locale/custom/customCommands.json', JSON.stringify(commandLocalizations))
  } catch (err) {
    console.log(err);
  }
  //Register Commands
  updateConfigRegisterCommands(client, config);
  //Update lists
  createPokemonList();
  createIncidentLists();
  createMoveLists();
  createTemplateLists();
}


async function createPokemonList() {
  try {
    let ignoreForms = [];
    //Create basic English list
    for (const [dex, monData] of Object.entries(master.pokemon)) {
      pokemonListBasic.push(monData.name.toLowerCase());
      if (monData.forms['0'] == {} || Object.keys(monData.forms).length == 1) {
        continue;
      }
      for (const [form, formData] of Object.entries(monData.forms)) {
        if (formData.name) {
          pokemonListBasic.push(`${monData.name.toLowerCase()} (${formData.name.toLowerCase()})`);
        }
      }
    } //End of pokemon loop
    let localeFiles = fs.readdirSync('./locale').filter(file => file.endsWith('.json'));
    //Loop over each locale
    for (const file of localeFiles) {
      let language = file.replace('.json', '');
      let locale = JSON.parse(fs.readFileSync(`./locale/${file}`));
      var localeMonList = {};
      var localeMegaList = {};
      for (const [dexForm, monData] of Object.entries(gameData.monsters)) {
        let monName = locale[monData.name] ? locale[monData.name] : monData.name;
        //Add base form
        if (dexForm.endsWith('_0')) {
          localeMonList[monName] = dexForm;
          //Mega list
          if (monData.tempEvolutions && monData.tempEvolutions[0]) {
            if (monData.tempEvolutions[0].tempEvoId > 0 && monData.tempEvolutions[0].tempEvoId <= 4) {
              var megaName = '';
              //Primals: Kyogre + Groudon
              if (dexForm.startsWith('382_') || dexForm.startsWith('383_')) {
                megaName = `${monName} ${locale['Primal Energy'] ? locale['Primal Energy'] : 'Primal Energy'}`;
              }
              //Regular
              else {
                megaName = `${monName} ${locale['Mega Energy'] ? locale['Mega Energy'] : 'Mega Energy'}`;
              }
              localeMegaList[megaName] = dexForm;
            }
          }
        }
        //Add alt form
        else {
          //Compare to list in master to help skip some
          if (pokemonListBasic.includes(`${monData.name.toLowerCase()} (${monData.form.name.toLowerCase()})`)) {
            let formName = locale[monData.form.name] ? locale[monData.form.name] : monData.form.name;
            localeMonList[`${monName} (${formName})`] = dexForm;
          }
        }
      } //End of monsters loop
      pokemonLists[language] = localeMonList;
      megaLists[language] = localeMegaList;
    } //End of file loop
    //Other lists
    createRaidLists();
    createQuestLists();
  } catch (err) {
    console.log(err);
  }
} //End of createPokemonList()


async function createMoveLists() {
  try {
    let localeFiles = fs.readdirSync('./locale').filter(file => file.endsWith('.json'));
    //Loop over each locale
    for (const file of localeFiles) {
      let localeName = file.replace('.json', '');
      let locale = JSON.parse(fs.readFileSync(`./locale/${file}`));
      var localeMoveList = {};
      //Translate from master
      for (const [moveNumber, moveData] of Object.entries(master.moves)) {
        if (moveData.type) {
          //localeMoveList.push(locale[moveData.name] ? locale[moveData.name] : moveData.name);
          localeMoveList[locale[moveData.name] ? locale[moveData.name] : moveData.name] = moveNumber;
        }
      } //End of master loop
      moveLists[localeName] = localeMoveList;
    } //End of locale loop
  } catch (err) {
    console.log(err);
  }
} //End of createMoveLists()


async function createQuestLists() {
  //Key = rewardType~reward~form
  try {
    let localeFiles = fs.readdirSync('./locale').filter(file => file.endsWith('.json'));
    //Loop over each locale
    for (const file of localeFiles) {
      let language = file.replace('.json', '');
      let locale = JSON.parse(fs.readFileSync(`./locale/${file}`));
      var localeQuestList = {};
      //XP (type:1)
      localeQuestList[locale.XP ? locale.XP : 'XP'] = `1~0~0`;
      //Items (type:2)
      for (const [itemNumber, item] of Object.entries(util.questItems)) {
        localeQuestList[locale.item ? locale.item : item] = `2~${itemNumber}~0`;
      }
      //Stardust (type:3)
      localeQuestList[locale.Stardust ? locale.Stardust : 'Stardust'] = `3~0~0`;
      //Pokemon encounter(type:7) + candy(type:4) + xl candy(type:9)
      for (const [pokemon, pokemonData] of Object.entries(pokemonLists[language])) {
        //Encounter
        localeQuestList[pokemon] = `7~${pokemonData.replace('_','~')}`;
        //Candy
        localeQuestList[`${pokemon} ${locale.Candy ? locale.Candy : 'Candy'}`] = `4~${pokemonData.replace('_','~')}`;
        //XL Candy
        localeQuestList[`${pokemon} ${locale['XL Candy'] ? locale['XL Candy'] : 'XL Candy'}`] = `9~${pokemonData.replace('_','~')}`;
      }
      //Mega energy (type:12)
      for (const [pokemon, pokemonData] of Object.entries(megaLists[language])) {
        localeQuestList[pokemon] = `12~${pokemonData.replace('_', '~')}`
      }
      questLists[language] = localeQuestList;
    } //End of locale loop
  } catch (err) {
    console.log(err);
  }
} //End of createQuestLists()


async function createIncidentLists() {
  try {
    request(util.api.rocketApi, {
      json: true
    }, (error, res, body) => {
      if (!error && res.statusCode == 200) {
        createLocaleIncidents(body.characters);
      } else {
        console.log('Error fetching current incident list:', err);
      }
    }); //End of request()
  } catch (err) {
    console.log('Error fetching current incident list:', err);
  }

  async function createLocaleIncidents(invasions) {
    //Key = grunt_type~gender
    try {
      //Loop over each locale
      let localeFiles = fs.readdirSync('./locale').filter(file => file.endsWith('.json'));
      for (const file of localeFiles) {
        let language = file.replace('.json', '');
        let locale = JSON.parse(fs.readFileSync(`./locale/${file}`));
        var localeIncidentList = {};
        //Gold-Stop
        localeIncidentList[locale['Gold Coins']] = 'gold-stop~0';
        //Kecleon
        localeIncidentList[locale.Kecleon] = 'kecleon~0';
        //Showcase
        localeIncidentList[locale.Showcase] = 'showcase~0';
        //Others
        for (var i in invasions) {
          let rocketData = gameData.grunts[invasions[i]['character']['value']];
          //Get rocket type
          var rocketType = locale[rocketData.type.replace('Mixed', 'Grunt').replace('Darkness', 'Dark')] ? locale[rocketData.type.replace('Mixed', 'Grunt').replace('Darkness', 'Dark')] : rocketData.type;
          var rocketGender = '';
          if (rocketData.gender > 0) {
            rocketGender = rocketData.gender == 1 ? '♂' : '♀';
          }
          rocketType = rocketType.concat(rocketGender);
          //Get rewards
          let rewards = invasions[i]['rewards'];
          var rewardList = [];
          for (var r in rewards) {
            let rewardMonData = gameData.monsters[`${rewards[r]['pokemon']['value']}_${rewards[r]['form']['value']}`] ? gameData.monsters[`${rewards[r]['pokemon']['value']}_${rewards[r]['form']['value']}`] : gameData.monsters[`${rewards[r]['pokemon']['value']}_0`];
            //Get name and form
            var rewardMonName = locale[rewardMonData.name] ? locale[rewardMonData.name] : rewardMonData.name;
            if (rewardMonData.form && rewardMonData.form.name && rewardMonData.form.name !== 'Normal') {
              rewardMonName = rewardMonName.concat(' ', locale[rewardMonData.form.name] ? locale[rewardMonData.form.name] : rewardMonData.form.name);
            }
            //Get shiny stats
            if (rewards[r]['shinies'] > 0) {
              let shinyOdds = Math.round(100 / (rewards[r]['shinies'] / rewards[r]['total'] * 100));
              rewardMonName = rewardMonName.concat(`✨(1:${shinyOdds})`);
            }
            rewardList.push(rewardMonName);
          } //End of r loop
          let rocketValue = `${rocketType} (${rewardList.join(', ')})`;
          //Assign Poracle values: grunt_type~gender
          localeIncidentList[rocketValue] = `${rocketData.type.toLowerCase()}~${rocketData.gender}`;
        } //End of i loop
        incidentLists[language] = localeIncidentList;
      } //End of file loop
    } catch (err) {
      console.log(err);
    }
  } //End of createLocaleIncidents()
} //End of createIncidentLists()


async function createRaidLists() {
  //Key = level~pokemonID~pokemonForm
  try {
    //Loop over each locale
    let localeFiles = fs.readdirSync('./locale').filter(file => file.endsWith('.json'));
    for (const file of localeFiles) {
      let language = file.replace('.json', '');
      let locale = JSON.parse(fs.readFileSync(`./locale/${file}`));
      var localeRaidList = {};
      //Add raid levels
      for (const [level, levelText] of Object.entries(util.raidLevels)) {
        localeRaidList[locale[levelText] ? locale[levelText] : levelText] = `${level}~9000~0`
      } //End of raid level loop
      //Add Pokemon
      for (const [pokemon, pokemonData] of Object.entries(pokemonLists[language])) {
        localeRaidList[pokemon] = `9000~${pokemonData.replace('_','~')}`;
      } //End of pokemon loop
      raidLists[language] = localeRaidList;
    } //End of file loop
  } catch (err) {
    console.log(err);
  }
} //End of createRaidLists()


async function createTemplateLists() {
  try {
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
              templateLists = responseText.discord;
            }
          }
        }); //End of superagent
  } catch (err) {
    console.log(err);
  }
} //End of createTemplateLists()


async function updateConfigRegisterCommands(client, config) {
  superagent
      .get(util.api.poracleWebConfig.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port))
      .set('X-Poracle-Secret', config.poracle.secret)
      .set('accept', 'application/json')
      .end((error, response) => {
        if (error) {
          console.log('Api error:', error);
        } else {
          let body = JSON.parse(response.text);
          config.defaultLocale = body.locale;
          config.pvpFilterMaxRank = body.pvpFilterMaxRank;
          config.pvpFilterGreatMinCP = body.pvpFilterGreatMinCP;
          config.pvpFilterUltraMinCP = body.pvpFilterUltraMinCP;
          config.pvpFilterLittleMinCP = body.pvpFilterLittleMinCP;
          config.maxDistance = body.maxDistance;
          config.defaultTemplateName = body.defaultTemplateName;
          //Register Slash Commands
          SlashRegistry.registerCommands(client, config);
        }
      });
} //End of updateConfigRegisterCommands()


client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.login(config.token);