const {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');

module.exports = {
   addRaid: async function addRaid(client, interaction, config, util, master) {
      try {
         let customFilters = interaction.message.embeds[0]['data']['fields'];
         var filters = {
            "ping": "",
            "pokemon_id": 9000,
            "exclusive": 0,
            "distance": 0,
            "team": 4,
            "clean": 0,
            "level": 9000,
            "form": 0,
            "move": 9000,
            "evolution": 9000,
            "gym_id": null
         };
         //Type
         if (Object.keys(util.raidLevels).includes(customFilters[0]['value'])) {
            filters.level = util.raidLevels[customFilters[0]['value']]
         } else {
            for (const [dex, monData] of Object.entries(master.pokemon)) {
               var monFormCheck = customFilters[0]['value'].split(' (');
               var monName = monFormCheck[0];
               if (monData['name'].toLowerCase().startsWith(monName)) {
                  filters.pokemon_id = dex * 1;
                  //No form
                  filters.form = 0;
                  //Special form  --- API NOT WORKING YET
                  if (monData['name'].toLowerCase() != customFilters[0]['value']) {
                     for (const [form, formData] of Object.entries(monData['forms'])) {
                        if (formData['name']) {
                           if (customFilters[0]['value'] == `${monData['name'].toLowerCase()} (${formData['name'].toLowerCase()})`) {
                              filters.form = form * 1;
                           }
                        }
                     } //End of form loop
                  }
               } //End of name start match
            } //End of master loop
         }
         //Other stuff
         filters.template = config.defaultTemplateName;
         for (var f in customFilters) {
            //Team
            if (customFilters[f]['name'] == 'team') {
               let team = customFilters[f]['value']
               filters.team = team.replace('White', 0).replace('Blue', 1).replace('Red', 2).replace('Yellow', 3).replace('All', 4) * 1;
            }
            //Tier
            if (customFilters[f]['name'] == 'tier') {
               filters.level = util.raidLevels[customFilters[f]['value']];
            }
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
      }
      catch(err){
         console.log("Error adding raid:", err);
      }
   }, //End of addRaid()


   verifyRaid: async function verifyRaid(client, interaction) {
      let options = interaction.options._hoistedOptions;
      var raidEmbed = new EmbedBuilder().setTitle(`New Raid Alert:`);
      for (var i in options) {
         raidEmbed.addFields({
            name: options[i].name,
            value: options[i].value.toString()
         });
      } //End of i loop
      let raidComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Verify').setCustomId(`chatot~raid~verify`).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel('Cancel').setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
         embeds: [raidEmbed],
         components: [raidComponents]
      }).catch(console.error);
   } //End of verifyRaid()
}