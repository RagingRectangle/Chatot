const {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const superagent = require('superagent');
const defaults = require('../locale/custom/default.json');

module.exports = {
  addPokemonCommand: async function addPokemonCommand(client, interaction, config, util, pokemonInteractionID) {
    //id~form~${min_iv}~${max_iv}~${min_atk}~${max_atk}~${min_def}~${max_def}~${min_sta}~${max_sta}~${min_cp}~${max_cp}~${min_level}~${max_level}~${size}~${gender}~${pvp_league}~${pvp_ranks}~${min_time}~${distance}~${clean}~${template}
    try {
      let pokemonOptions = pokemonInteractionID.split('~');
      var filters = {
        pokemon_id: pokemonOptions[0] * 1,
        form: pokemonOptions[1] * 1 ? pokemonOptions[1] * 1 : 0,
        min_iv: pokemonOptions[2] * 1 ? pokemonOptions[2] * 1 : -1,
        max_iv: pokemonOptions[3] * 1 ? pokemonOptions[3] * 1 : 100,
        atk: pokemonOptions[4] * 1 ? pokemonOptions[4] * 1 : 0,
        max_atk: pokemonOptions[5] ? pokemonOptions[5] * 1 : 15,
        def: pokemonOptions[6] * 1 ? pokemonOptions[6] * 1 : 0,
        max_def: pokemonOptions[7] * 1 ? pokemonOptions[7] * 1 : 15,
        sta: pokemonOptions[8] * 1 ? pokemonOptions[8] * 1 : 0,
        max_sta: pokemonOptions[9] * 1 ? pokemonOptions[9] * 1 : 15,
        min_cp: pokemonOptions[10] * 1 ? pokemonOptions[10] * 1 : 0,
        max_cp: pokemonOptions[11] * 1 ? pokemonOptions[11] * 1 : 9000,
        min_level: pokemonOptions[12] * 1 ? pokemonOptions[12] * 1 : 0,
        max_level: pokemonOptions[13] * 1 ? pokemonOptions[13] * 1 : 40,
        size: pokemonOptions[14] * 1 ? pokemonOptions[14] * 1 : -1,
        max_size: pokemonOptions[14] * 1 ? pokemonOptions[14] * 1 : 5,
        gender: pokemonOptions[15] * 1 ? pokemonOptions[15] * 1 : 0,
        //pvp_league[16]
        //pvp_ranks[17]
        min_time: pokemonOptions[18] * 1 ? pokemonOptions[18] * 1 : 0,
        distance: pokemonOptions[19] * 1 ? pokemonOptions[19] * 1 : 0,
        clean: pokemonOptions[20] ? pokemonOptions[20] : 0,
        template: pokemonOptions[21] ? pokemonOptions[21] : config.defaultTemplateName,
        min_weight: 0,
        max_weight: 9000000,
        rarity: -1,
        max_rarity: 6,
        ping: 0
      };
      //Check for pvp_league[16]
      if (pokemonOptions[16]) {
        //Check for pvp_ranks[17]
        if (pokemonOptions[17]) {
          let league = pokemonOptions[16].replace(defaults.littleLeague, 500).replace(defaults.greatLeague, 1500).replace(defaults.ultraLeague, 2500);
          let minCP = league.replace(2500, config.pvpFilterUltraMinCP).replace(1500, config.pvpFilterGreatMinCP).replace(500, config.pvpFilterLittleMinCP);
          filters.pvp_ranking_league = league * 1;
          filters.pvp_ranking_min_cp = minCP * 1;
          filters.pvp_ranking_worst = pokemonOptions[17] * 1;
        }
      }
      //Everything Individually
      //else if (pokemonOptions[0] == '00' && pokemonOptions[1] == '00') {}
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
      console.log(err);
    }
  }, //End of addPokemonCommand()


  verifyPokemonCommand: async function verifyPokemonCommand(client, interaction, config, util, locale, humanInfo, pokemonLists) {
    try {
      let options = await interaction.options._hoistedOptions;
      let pokemonInfo = options[0]['value'].split('~'); //pokemonName~id_form
      let monIdForm = pokemonInfo[1].replace('_', '~');
      var pokemonEmbed = new EmbedBuilder().setTitle(locale.trackPokemonDescription).addFields({
        name: locale.pokemonName,
        value: pokemonInfo[0]
      });
      //Other options
      var customFilters = {
        "min_iv": "",
        "max_iv": "",
        "min_atk": "",
        "max_atk": "",
        "min_def": "",
        "max_def": "",
        "min_sta": "",
        "max_sta": "",
        "min_cp": "",
        "max_cp": "",
        "min_level": "",
        "max_level": "",
        "size": "",
        "gender": "",
        "pvp_league": "",
        "pvp_ranks": "",
        "min_time": "",
        "distance": "",
        "clean": "",
        "template": ""
      };
      for (var i = 1; i < options.length; i++) {
        //Verify pvp options
        if (options[i].name == 'pvp_ranks') {
          continue;
        }
        if (options[i].name == 'pvp_league') {
          for (var p in options) {
            if (options[p].name == 'pvp_ranks') {
              customFilters.pvp_league = options[i].value;
              customFilters.pvp_ranks = options[p].value;
              pokemonEmbed.addFields({
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
        }
        //Clean
        else if (options[i]['name'] == defaults.cleanName && options[i]['value'] == true) {
          customFilters.clean = '1';
          pokemonEmbed.addFields({
            name: locale.cleanName,
            value: 'true',
            inline: true
          });
        }
        //Gender
        else if (options[i]['name'] == defaults.genderName) {
          var genderType = locale.genderAll;
          if (options[i]['value'] == defaults.genderMale) {
            genderType = locale.genderMale;
            customFilters.gender = 1;
          } else if (options[i]['value'] == defaults.genderFemale) {
            genderType = locale.genderFemale;
            customFilters.gender = 2;
          }
          pokemonEmbed.addFields({
            name: locale.genderName,
            value: genderType,
            inline: true
          });
        }
        //Size
        else if (options[i]['name'] == defaults.sizeName) {
          for (const [sizeName, sizeValue] of Object.entries(util.pokemonSizes)) {
            if (options[i]['value'] == sizeName) {
              customFilters.size = sizeValue;
              pokemonEmbed.addFields({
                name: defaults.sizeName,
                value: sizeName,
                inline: true
              });
            }
          }
        }
        //Other options
        else {
          customFilters[options[i].name] = options[i].value;
          pokemonEmbed.addFields({
            name: options[i].name,
            value: options[i].value.toString(),
            inline: true
          });
        }
      } //End of i loop
      let customID = `chatot~pokemon~verify~${monIdForm}~${customFilters.min_iv}~${customFilters.max_iv}~${customFilters.min_atk}~${customFilters.max_atk}~${customFilters.min_def}~${customFilters.max_def}~${customFilters.min_sta}~${customFilters.max_sta}~${customFilters.min_cp}~${customFilters.max_cp}~${customFilters.min_level}~${customFilters.max_level}~${customFilters.size}~${customFilters.gender}~${customFilters.pvp_league}~${customFilters.pvp_ranks}~${customFilters.min_time}~${customFilters.distance}~${customFilters.clean}~${customFilters.template}`;
      let pokemonComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(locale.buttonVerify).setCustomId(customID).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel(locale.buttonCancel).setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
        embeds: [pokemonEmbed],
        components: [pokemonComponents],
        ephemeral: true
      }).catch(console.error);
    } catch (err) {
      console.log(err);
    }
  }, //End of verifyPokemonCommand()
}