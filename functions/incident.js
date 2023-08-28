const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');
let defaults = require(`../locale/custom/default.json`);

module.exports = {
  addIncident: async function addIncident(client, interaction, config, util, incidentInteractionID) {
    //${grunt_type~gender}~${distance}~${clean}~${template}
    let incidentOptions = incidentInteractionID.split('~');
    try {
      var filters = {
        "grunt_type": incidentOptions[0],
        "gender": incidentOptions[1] ? incidentOptions[1] * 1 : 0,
        "distance": incidentOptions[2] ? incidentOptions[2] * 1 : 0,
        "clean": incidentOptions[3] ? 1 : 0,
        "template": incidentOptions[4] ? incidentOptions[4] : config.defaultTemplateName,
        "ping": ""
      }
      //console.log(filters);
      superagent
        .post(util.api.addIncident.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
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
              console.log("Failed to add new incident tracking:", response);
            }
          }
        }); //End of superagent
    } catch (err) {
      console.log("Error adding Incident:", err);
    }
  }, //End of addIncident()


  verifyIncident: async function verifyIncident(client, interaction, incidentLists, locale, humanInfo) {
    try {
      let options = await interaction.options._hoistedOptions;
      let incidentData = incidentLists[humanInfo.language][options[0]['value']];
      var incidentEmbed = new EmbedBuilder().setTitle(locale.incidentDescription).addFields({
        name: locale.incidentTypeName,
        value: options[0]['value']
      });
      //Other options
      var distance = '';
      var template = '';
      var clean = '';
      for (var i = 1; i < options.length; i++) {
        //Distance
        if (options[i]['name'] == defaults.distanceName) {
          distance = options[i].value.toString();
          incidentEmbed.addFields({
            name: locale.distanceName,
            value: distance
          });
        }
        //Clean
        if (options[i]['name'] == defaults.cleanName && options[i]['value'] == true) {
          clean = '1';
          incidentEmbed.addFields({
            name: locale.cleanName,
            value: 'true'
          });
        }
        //Template
        if (options[i]['name'] == defaults.templateName) {
          template = options[i]['value'];
          incidentEmbed.addFields({
            name: locale.templateName,
            value: template
          });
        }
      } //End of i loop
      let customID = `chatot~incident~verify~${incidentData}~${distance}~${clean}~${template}`;
      let incidentComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(locale.buttonVerify).setCustomId(customID).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel(locale.buttonCancel).setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
        embeds: [incidentEmbed],
        components: [incidentComponents]
      }).catch(console.error);
    } catch (err) {
      console.log("verifyIncident error:", err);
    }
  } //End of verifyIncident()
}