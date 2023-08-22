const {
   ActionRowBuilder,
   EmbedBuilder,
   ButtonBuilder,
   ButtonStyle
} = require('discord.js');
const superagent = require('superagent');

module.exports = {
   addTrackCommand: async function addTrackCommand(client, interaction, config, util, master, dex_form) {
      try {
         let customFilters = await interaction.message.embeds[0]['data']['fields'];
         var filters = {
            "ping": "",
            "pokemon_id": "",
            "distance": 0,
            "min_iv": -1,
            "max_iv": 100,
            "min_cp": 0,
            "max_cp": 9000,
            "min_level": 0,
            "max_level": 40,
            "atk": 0,
            "def": 0,
            "sta": 0,
            "max_atk": 15,
            "max_def": 15,
            "max_sta": 15,
            "min_weight": 0,
            "max_weight": 9000000,
            "form": 0,
            "gender": 0,
            "clean": false,
            "pvp_ranking_league": 0,
            "pvp_ranking_best": 1,
            "pvp_ranking_worst": 4096,
            "pvp_ranking_min_cp": 0,
            "pvp_ranking_cap": 0,
            "size": -1,
            "max_size": 5,
            "rarity": -1,
            "max_rarity": 6,
            "min_time": 0
         };
         //Add Pokemon/form
         let monOptions = dex_form.split('_');
         filters.pokemon_id = monOptions[0] * 1;
         filters.form = monOptions[1] * 1;
         //Other stuff
         filters.template = config.defaultTemplateName;
         for (var c = 1; c < customFilters.length; c++) {
            //Fix names for min atk/def/sta
            if (customFilters[c]['name'] == 'min_atk' || customFilters[c]['name'] == 'min_def' || customFilters[c]['name'] == 'min_sta') {
               filters[customFilters[c]['name'].replace('min_', '')] = customFilters[c]['value'] * 1;
               continue;
            }
            //Clean
            if (customFilters[c]['name'] == 'clean' && customFilters[c]['value'] == 'true') {
               filters['clean'] = 1;
               continue;
            }
            //Gender
            if (customFilters[c]['name'] == 'gender') {
               filters['gender'] = customFilters[c]['value'] == 'male' ? 1 : customFilters[c]['value'] == 'female' ? 2 : 0;
               continue;
            }
            //Size
            if (customFilters[c]['name'] == 'size' && customFilters[c]['value'] != 'all') {
               filters['size'] = util.pokemonSizes[customFilters[c]['value']];
               filters['max_size'] = util.pokemonSizes[customFilters[c]['value']];
               continue;
            }
            //Template
            if (customFilters[c]['name'] == 'template') {
               filters.template = customFilters[c]['value'].replace(' (Default)', '');
               continue;
            }
            //PVP
            if (customFilters[c]['name'] == 'pvp_league') {
               //Check for ranks requirement
               for (var f in customFilters) {
                  if (customFilters[f]['name'] == 'pvp_ranks') {
                     let league = customFilters[c]['value'].replace('little', 500).replace('great', 1500).replace('ultra', 2500);
                     let minCP = league.replace(2500, config.pvpFilterUltraMinCP).replace(1500, config.pvpFilterGreatMinCP).replace(500, config.pvpFilterLittleMinCP);
                     filters.pvp_ranking_league = league;
                     filters.pvp_ranking_min_cp = minCP;
                     filters.pvp_ranking_worst = customFilters[f]['value'] * 1;
                  }
               }
            }
            //No changes needed: distance, min_iv, max_iv, min_cp, max_cp, min_level, max_level, max_atk, max_def, max_sta, min_time
            filters[customFilters[c]['name']] = customFilters[c]['value'] * 1;
         } //End of c loop
         //console.log(filters);
         superagent
            .post(util.api.addSpawnTracking.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
            .send([filters])
            .set('X-Poracle-Secret', config.poracle.secret)
            .set('accept', 'application/json')
            .end((error, response) => {
               if (error) {
                  console.log('Api error:', error);
               } else if (response.text.startsWith('{"status":"ok"')) {
                  //Delete command, Poracle will send follow-up
                  try {
                     setTimeout(() => interaction.message.delete().catch(err => console.log("Failed to delete message:", err)), 1);
                  } catch (err) {
                     console.log("Failed to delete message:", err);
                  }
               } else {
                  console.log("Error adding pokemon tracking:", response);
               }
            }); //End of superagent
      } catch (err) {
         console.log("Error adding tracking:", err);
      }
   }, //End of addTrackCommand()


   verifyTrackCommand: async function verifyTrackCommand(client, interaction) {
      try {
         await interaction.deferReply();
         let options = interaction.options._hoistedOptions;
         let userPokemonOptions = options[0]['value'].split('~');
         let monName = userPokemonOptions[0];
         let dexForm = userPokemonOptions[1];
         var trackEmbed = new EmbedBuilder().setTitle(`New Pokemon Alert:`).addFields({
            name: 'pokemon',
            value: monName,
            inline: true
         });
         for (var i = 1; i < options.length; i++) {
            //Verify pvp options
            if (options[i].name == 'pvp_ranks') {
               continue;
            }
            if (options[i].name == 'pvp_league') {
               for (var p in options) {
                  if (options[p].name == 'pvp_ranks') {
                     trackEmbed.addFields({
                           name: options[i].name,
                           value: options[i].value.toString(),
                           inline: true
                        })
                        .addFields({
                           name: options[p].name,
                           value: options[p].value.toString(),
                           inline: true
                        });
                  }
               } //End of p loop
            } else {
               trackEmbed.addFields({
                  name: options[i].name,
                  value: options[i].value.toString(),
                  inline: true
               });
            }
         } //End of i loop
         let trackComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Verify').setCustomId(`chatot~track~verify~${dexForm}`).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel('Cancel').setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
         await interaction.editReply({
            embeds: [trackEmbed],
            components: [trackComponents],
            ephemeral: true
         }).catch(console.error);
      } catch (err) {
         console.log(err);
      }
   }, //End of verifyTrackCommand()
}