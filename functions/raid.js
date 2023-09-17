const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');
const defaults = require('../locale/custom/default.json');

module.exports = {
  addRaid: async function addRaid(client, interaction, config, util, areaGyms, raidInteractionID) {
    //${level}~${pokemonID}~${pokemonForm}~${team}~${distance}~${clean}~${template}~${gymInfo}
    let raidOptions = raidInteractionID.split('~');
    try {
      var filters = {
        "level": raidOptions[0] * 1,
        "pokemon_id": raidOptions[1] * 1,
        "form": raidOptions[2] * 1,
        "team": raidOptions[3] * 1,
        "distance": raidOptions[4] * 1,
        "clean": raidOptions[5] * 1,
        "template": raidOptions[6],
        "exclusive": 0,
        "ping": "",
        "move": 9000,
        "evolution": 9000,
        "gym_id": null
      };
      //Gym
      if (raidOptions[7]){
        let gymSplit = raidOptions[7].replaceAll(')','').split(' (');
        let areaName = gymSplit[gymSplit.length - 1];
        let gymID = areaGyms[areaName][raidOptions[7]];
        filters.gym_id = gymID;
      }
      superagent
        .post(util.api.addRaid.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
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
              console.log("Failed to add new raid tracking:", response);
            }
          }
        }); //End of superagent
    } catch (err) {
      console.log("Error adding raid:", err);
    }
  }, //End of addRaid()


  verifyRaid: async function verifyRaid(client, interaction, config, util, locale, humanInfo, raidLists) {
    try {
      let options = await interaction.options._hoistedOptions;
      let raidData = raidLists[humanInfo.language][options[0]['value']]; //level~id~form
      var raidEmbed = new EmbedBuilder().setTitle(locale.raidDescription).addFields({
        name: locale.raidTypeName,
        value: options[0]['value']
      });
      //Other options
      var gymInfo = '';
      var distance = 0;
      var team = 4;
      var template = config.defaultTemplateName;
      var clean = '';
      for (var i = 1; i < options.length; i++) {
        //Gym
        if (options[i]['name'] == defaults.gymName) {
          gymInfo = options[i]['value'];
          raidEmbed.addFields({
            name: locale.gymName,
            value: gymInfo
          });
        }
        //Team
        if (options[i]['name'] == defaults.raidTeamName) {
          team = options[i]['value'];
          raidEmbed.addFields({
            name: locale.raidTeamName,
            value: locale[util.teams[team]]
          });
        }
        //Distance
        if (options[i]['name'] == defaults.distanceName) {
          distance = options[i]['value'].toString();
          raidEmbed.addFields({
            name: locale.distanceName,
            value: distance
          });
        }
        //Clean
        if (options[i]['name'] == defaults.cleanName && options[i]['value'] == true) {
          clean = '1';
          raidEmbed.addFields({
            name: locale.cleanName,
            value: 'true'
          });
        }
        //Template
        if (options[i]['name'] == defaults.templateName) {
          template = options[i]['value'];
          raidEmbed.addFields({
            name: locale.templateName,
            value: template
          });
        }
      } //End of i loop
      let customID = `chatot~raid~verify~${raidData}~${team}~${distance}~${clean}~${template}~${gymInfo}`;
      let raidComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(locale.buttonVerify).setCustomId(customID).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel(locale.buttonCancel).setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
        embeds: [raidEmbed],
        components: [raidComponents]
      }).catch(console.error);
    } catch (err) {
      console.log(err);
    }
  } //End of verifyRaid()
}