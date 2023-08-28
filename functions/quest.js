const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');
const defaults = require('../locale/custom/default.json');

module.exports = {
  addQuest: async function addQuest(client, interaction, config, util, questInteractionID) {
    //rewardType~reward~form~${minAmount}~${distance}~${clean}~${template}
    try {
      let questOptions = questInteractionID.split('~');
      var filters = {
        "reward_type": questOptions[0] * 1,
        "reward": questOptions[1] * 1,
        "form": questOptions[2] * 1,
        "amount": questOptions[3] * 1,
        "distance": questOptions[4] * 1,
        "clean": questOptions[5] * 1,
        "template": questOptions[6],
        "shiny": 0,
        "ping": ""
      };
      //console.log(filters);
      superagent
        .post(util.api.addQuest.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
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
              console.log("Failed to add new quest tracking:", response);
            }
          }
        }); //End of superagent
    } catch (err) {
      console.log(err);
    }
  }, //End of addQuest()


  verifyQuest: async function verifyQuest(client, interaction, config, locale, humanInfo, questLists) {
    try {
      let options = await interaction.options._hoistedOptions;
      let questData = await questLists[humanInfo.language][options[0]['value']]; //rewardType~reward~form
      var questEmbed = new EmbedBuilder().setTitle(locale.questDescription).addFields({
        name: locale.questTypeName,
        value: options[0]['value']
      });
      //Other options
      var minAmount = 0;
      var distance = 0;
      var clean = '';
      var template = config.defaultTemplateName;
      for (var i = 1; i < options.length; i++) {
        //Min amount
        if (options[i]['name'] == defaults.questMinAmountName && !questData.startsWith('7~')) {
          minAmount = options[i]['value'].toString();
          questEmbed.addFields({
            name: locale.questMinAmountName,
            value: minAmount
          });
        }
        //Distance
        if (options[i]['name'] == defaults.distanceName) {
          distance = options[i]['value'].toString();
          questEmbed.addFields({
            name: locale.distanceName,
            value: distance
          });
        }
        //Clean
        if (options[i]['name'] == defaults.cleanName && options[i]['value'] == true) {
          clean = '1';
          questEmbed.addFields({
            name: locale.cleanName,
            value: 'true'
          });
        }
        //Template
        if (options[i]['name'] == defaults.templateName) {
          template = options[i]['value'];
          questEmbed.addFields({
            name: locale.templateName,
            value: template
          });
        }
      } //End of i loop
      let customID = `chatot~quest~verify~${questData}~${minAmount}~${distance}~${clean}~${template}`;
      let questComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(locale.buttonVerify).setCustomId(customID).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel(locale.buttonCancel).setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
        embeds: [questEmbed],
        components: [questComponents]
      }).catch(console.error);
    } catch (err) {
      console.log(err);
    }
  } //End of verifyQuest()
}