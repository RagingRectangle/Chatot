const {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');

module.exports = {
   addQuest: async function addQuest(client, interaction, config, util, questList) {
      try {
         let customFilters = interaction.message.embeds[0]['data']['fields'];
         var filters = {
            "ping": "",
            "amount": 0,
            "shiny": 0,
            "distance": 0,
            "clean": 0
         };
         //Type
         filters.reward = questList[customFilters[0]['value']]['reward'];
         filters.reward_type = questList[customFilters[0]['value']]['type'];
         filters.form = questList[customFilters[0]['value']]['form'];
         //Other stuff
         filters.template = config.defaultTemplateName;
         for (var f in customFilters) {
            //Distance
            if (customFilters[f]['name'] == 'distance') {
               filters.distance = customFilters[f]['value'] * 1;
            }
            //Clean
            if (customFilters[f]['name'] == 'clean' && customFilters[f]['value'] == 'true') {
               filters.clean = 1;
            }
            //Template
            if (customFilters[f]['name'] == 'template') {
               filters.template = customFilters[f]['value'].replace(' (Default)', '');
            }
            //Min_amount
            if (customFilters[f]['name'] == 'min_amount' && filters.reward_type != 7) {
               filters.amount = customFilters[f]['value'] * 1;
            }
         } //End of f loop
         //console.log(filters)
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
         console.log("Error adding quest:", err);
      }
   }, //End of addQuest()


   verifyQuest: async function verifyQuest(client, interaction) {
      let options = interaction.options._hoistedOptions;
      var questEmbed = new EmbedBuilder().setTitle(`New Quest Alert:`);
      for (var i in options) {
         questEmbed.addFields({
            name: options[i].name,
            value: options[i].value.toString()
         });
      } //End of i loop
      let questComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Verify').setCustomId(`chatot~quest~verify`).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel('Cancel').setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
         embeds: [questEmbed],
         components: [questComponents]
      }).catch(console.error);
   } //End of verifyQuest()
}