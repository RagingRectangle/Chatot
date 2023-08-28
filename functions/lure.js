const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');
let defaults = require(`../locale/custom/default.json`);

module.exports = {
  addLure: async function addLure(client, interaction, config, util, lureInteractionID) {
    //${lureID}~${distance}~${clean}~${template}
    let lureOptions = lureInteractionID.split('~');
    try {
      var filters = {
        "lure_id": lureOptions[0],
        "distance": lureOptions[1] ? lureOptions[1] : 0,
        "clean": lureOptions[2] ? lureOptions[2] : 0,
        "template": lureOptions[3] ? lureOptions[3] : config.defaultTemplateName,
        "ping": ""
      };
      //console.log(filters);
      superagent
        .post(util.api.addLure.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
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
              console.log("Failed to add new lure tracking:", response);
            }
          }
        }); //End of superagent
    } catch (err) {
      console.log("Error adding lure tracking:", err);
    }
  }, //End of addLure()


  verifyLure: async function verifyLure(client, interaction, util, locale) {
    try {
      let options = await interaction.options._hoistedOptions;
      let lureID = options[0]['value'];
      var lureEmbed = new EmbedBuilder().setTitle(locale.lureDescription)
        //Lure type
        .addFields({
          name: locale.lureTypeName,
          value: locale[util.lures[lureID]]
        });
      //Other options
      var distance = '';
      var template = '';
      var clean = '';
      for (var i = 1; i < options.length; i++) {
        //Distance
        if (options[i]['name'] == defaults.distanceName) {
          distance = options[i].value.toString();
          lureEmbed.addFields({
            name: locale.distanceName,
            value: distance
          });
        }
        //Clean
        if (options[i]['name'] == defaults.cleanName && options[i]['value'] == true) {
          clean = '1';
          lureEmbed.addFields({
            name: locale.cleanName,
            value: 'true'
          });
        }
        //Template
        if (options[i]['name'] == defaults.templateName) {
          template = options[i]['value'];
          lureEmbed.addFields({
            name: locale.templateName,
            value: template
          });
        }
      } //End of i loop
      let customID = `chatot~lure~verify~${lureID}~${distance}~${clean}~${template}`;
      let lureComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(locale.buttonVerify).setCustomId(customID).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel(locale.buttonCancel).setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
        embeds: [lureEmbed],
        components: [lureComponents]
      }).catch(console.error);
    } catch (err) {
      console.log("verifyLure error:", err);
    }
  } //End of verifyLure()
}