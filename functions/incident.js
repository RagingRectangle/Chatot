const {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');

module.exports = {
   addIncident: async function addIncident(client, interaction, config, util, incidentList) {
      try {
         let customFilters = interaction.message.embeds[0]['data']['fields'];
         var filters = {
            "ping": "",
            "distance": 0,
            "gender": 0,
            "clean": 0
         }
         //Type
         let incidentInfo = customFilters[0]['value'].split('_');
         let incidentName = incidentInfo[0].replace('showcase', 'pokemon-contest').split(' (');
         filters.grunt_type = incidentName[0];
         filters.gender = 0;
         if (incidentInfo[1]) {
            let incidentValue = incidentInfo[1].split(' ');
            filters.gender = incidentValue[0].replace('female', 2).replace('male', 1) * 1;
         }
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


   verifyIncident: async function verifyIncident(client, interaction) {
      let options = interaction.options._hoistedOptions;
      var incidentEmbed = new EmbedBuilder().setTitle(`New Incident Alert:`);
      for (var i in options) {
         incidentEmbed.addFields({
            name: options[i].name,
            value: options[i].value.toString()
         });
      } //End of i loop
      let incidentComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Verify').setCustomId(`chatot~incident~verify`).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel('Cancel').setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
         embeds: [incidentEmbed],
         components: [incidentComponents]
      }).catch(console.error);
   } //End of verifyIncident()
}