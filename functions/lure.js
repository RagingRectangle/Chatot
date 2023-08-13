const {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');

module.exports = {
   addLure: async function addLure(client, interaction, config, util) {
      try {
         let customFilters = await interaction.message.embeds[0]['data']['fields'];
         var filters = {
            "ping": "",
            "distance": 0,
            "clean": 0
         };
         //Type
         filters['lure_id'] = util['lures'][customFilters[0]['value']];
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
         } //End of f loop
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
   }, //End of addIncident()


   verifyLure: async function verifyLure(client, interaction) {
      let options = interaction.options._hoistedOptions;
      var lureEmbed = new EmbedBuilder().setTitle(`New Lure Alert:`);
      for (var i in options) {
         lureEmbed.addFields({
            name: options[i].name,
            value: options[i].value.toString()
         });
      } //End of i loop
      let lureComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Verify').setCustomId(`chatot~lure~verify`).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel('Cancel').setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
         embeds: [lureEmbed],
         components: [lureComponents]
      }).catch(console.error);
   } //End of verifyLure()
}