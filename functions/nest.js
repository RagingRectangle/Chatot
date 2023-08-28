const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');
let defaults = require(`../locale/custom/default.json`);

module.exports = {
  addNest: async function addNest(client, interaction, config, util, nestInteractionID) {
    //monID~monForm~${min_spawn_avg}~${distance}~${clean}~${template}
    let nestOptions = nestInteractionID.split('~');
    try {
      var filters = {
        "pokemon_id": nestOptions[0],
        "form": nestOptions[1] ? nestOptions[1] : 0,
        "min_spawn_avg": nestOptions[2] ? nestOptions[2] : 0,
        "distance": nestOptions[3] ? nestOptions[3] : 0,
        "clean": nestOptions[4] ? nestOptions[4] : 0,
        "template": nestOptions[5] ? nestOptions[5] : config.defaultTemplateName,
        "ping": ""
      };
      //console.log(filters);
      superagent
        .post(util.api.addNest.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
        .send([filters])
        .set('X-Poracle-Secret', config.poracle.secret)
        .set('accept', 'application/json')
        .end((error, response) => {
          if (error) {
            console.log('Api error:', error);
          } else {
            let responseText = JSON.parse(response.text);
            if (responseText.status == 'ok') {
              setTimeout(() => interaction.message.delete().catch(err => console.log("Failed to delete message:", err)), 1);
            } else {
              console.log("Failed to add new nest tracking:", response);
            }
          }
        }); //End of superagent
    } catch (err) {
      console.log(err);
    }
  }, //End of addNest()


  verifyNest: async function verifyNest(client, interaction, util, locale) {
    try {
      let options = await interaction.options._hoistedOptions;
      let pokemonInfo = options[0]['value'].split('~'); //pokemonName~id_form
      let monIdForm = pokemonInfo[1].replace('_', '~');
      var nestEmbed = new EmbedBuilder().setTitle(locale.nestDescription)
        //Pokemon
        .addFields({
          name: locale.pokemonName,
          value: pokemonInfo[0]
        });
      //Other options
      var min_spawn_avg = 0;
      var distance = 0;
      var template = '';
      var clean = 0;
      for (var i = 1; i < options.length; i++) {
        //Min Average
        if (options[i]['name'] == defaults.nestAverageName) {
          nestEmbed.addFields({
            name: locale.nestAverageName,
            value: options[i]['value'].toString()
          });
        }
        //Distance
        if (options[i]['name'] == defaults.distanceName) {
          distance = options[i]['value'].toString();
          nestEmbed.addFields({
            name: locale.distanceName,
            value: distance
          });
        }
        //Clean
        if (options[i]['name'] == defaults.cleanName && options[i]['value'] == true) {
          clean = '1';
          nestEmbed.addFields({
            name: locale.cleanName,
            value: 'true'
          });
        }
        //Template
        if (options[i]['name'] == defaults.templateName) {
          template = options[i]['value'];
          nestEmbed.addFields({
            name: locale.templateName,
            value: template
          });
        }
      } //End of i loop
      let customID = `chatot~nest~verify~${monIdForm}~${min_spawn_avg}~${distance}~${clean}~${template}`;


      let nestComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(locale.buttonVerify).setCustomId(customID).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel(locale.buttonCancel).setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
        embeds: [nestEmbed],
        components: [nestComponents]
      }).catch(console.error);
    } catch (err) {
      console.log("verifyNest error:", err);
    }
  } //End of verifyNest()
}