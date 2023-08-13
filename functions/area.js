const {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   StringSelectMenuBuilder
} = require('discord.js');
const _ = require('lodash');
const chunk = require('lodash.chunk');
const superagent = require('superagent');

module.exports = {
   editAreas: async function editAreas(client, interaction, config, util) {
      try {
         await interaction.deferReply({
            ephemeral: true
         }).catch(console.error);
         let areasToEdit = interaction.values;
         var messageAreaList = interaction.message.embeds[0]['description'];
         messageAreaList = messageAreaList.split('\n');
         var messageAreas = [];
         for (var a in messageAreaList) {
            messageAreas.push(messageAreaList[a].replace('- ', ''));
         }
         //Create new message list
         var newMessageList = [];
         var areasToAdd = [];
         var areasToRemove = [];
         for (var m in messageAreas) {
            //Add area
            if (areasToEdit.includes(messageAreas[m]) && !messageAreas[m].includes('✅')) {
               newMessageList.push(`${messageAreas[m]}✅`);
               areasToAdd.push(messageAreas[m]);
            }
            //Remove area
            else if (areasToEdit.includes(messageAreas[m]) && messageAreas[m].includes('✅')) {
               newMessageList.push(messageAreas[m].replace('✅', ''));
               areasToRemove.push(messageAreas[m].replace('✅', ''));
            } else {
               newMessageList.push(messageAreas[m]);
            }
         }

         //Get all enabled areas
         superagent
            .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
            .set('X-Poracle-Secret', config.poracle.secret)
            .end((error, response) => {
               if (error) {
                  console.log('Api error:', error);
               } else {
                  let humanInfo = JSON.parse(response.text);
                  var enabledAreas = JSON.parse(humanInfo.human.area);
                  enabledAreas.sort();
                  createNewAreaList(enabledAreas)
               }
            }); //End of superagent
      } catch (err) {
         console.log("Error editing areas:", err);
      }

      async function createNewAreaList(oldAreaList) {
         var newAreaList = [];
         for (var a in oldAreaList) {
            if (!areasToRemove.includes(oldAreaList[a])) {
               newAreaList.push(oldAreaList[a]);
            }
         }
         newAreaList = newAreaList.concat(areasToAdd);
         newAreaList.sort();
         newAreaList = [...new Set(newAreaList)];
         updateAreasApi(newAreaList);
      } //End of createNewAreaList()

      async function updateAreasApi(newAreaList) {
         superagent
            .post(util.api.updateAreas.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
            .send(newAreaList)
            .set('X-Poracle-Secret', config.poracle.secret)
            .end((error, response) => {
               if (error) {
                  console.log('Api error:', error);
               } else {
                  interaction.editReply({
                     content: `**Enabled areas:** ${newAreaList.join(', ')}`,
                     ephemeral: true
                  }).catch(console.error);
                  updateMessage();
               }
            }); //End of superagent
      } //End of updateAreasApi()

      async function updateMessage() {
         try {
            var areaEmbed = new EmbedBuilder().setTitle('Select Areas to Add or Remove').setDescription(`- ${newMessageList.join('\n- ')}`).setFooter({
               text: 'Enabled Areas✅'
            });
            let dropdownVar = interaction.customId.replace('chatot~area~edit~', '') * 1;
            var newComponents = interaction.message.components;
            var oldOptions = newComponents[dropdownVar]['components'][0]['data']['options'];
            var newOptions = [];
            for (var i in oldOptions) {
               //Add area
               if (areasToAdd.includes(oldOptions[i]['value'])) {
                  newOptions.push({
                     value: `${oldOptions[i]['value']}✅`,
                     label: `${oldOptions[i]['value']}✅`
                  });
               }
               //Remove area
               else if (areasToRemove.includes(oldOptions[i]['value'].replace('✅', ''))) {
                  newOptions.push({
                     value: oldOptions[i]['value'].replace('✅', ''),
                     label: oldOptions[i]['value'].replace('✅', '')
                  });
               } else {
                  newOptions.push(oldOptions[i]);
               }
            } //End of i loop
            newComponents[dropdownVar]['components'][0]['data']['options'] = newOptions;
            await interaction.message.edit({
               embeds: [areaEmbed],
               components: newComponents
            }).catch(console.error);
         } catch (err) {
            console.log("Error updating area list message:", err);
         }
      } //End of updateMessage()
   }, //End of editAreas()


   showArea: async function showArea(client, interaction, config, util) {
      let areaName = interaction.values[0].replace('✅', '');
      superagent
         .get(util.api.showArea.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{area}}', areaName))
         .set('X-Poracle-Secret', config.poracle.secret)
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else if (response['_body']['url']) {
               var areaEmbed = new EmbedBuilder().setImage(response['_body']['url']);
               var optionButton = new ActionRowBuilder();
               if (interaction.values[0].includes('✅')) {
                  areaEmbed.setTitle(`Area: ${areaName}✅`).setColor('DarkGreen');
                  optionButton.addComponents(new ButtonBuilder().setLabel('Remove Area').setCustomId(`chatot~area~remove~${areaName}`).setStyle(ButtonStyle.Danger));
               } else {
                  areaEmbed.setTitle(`Area: ${areaName}`).setColor('NotQuiteBlack');
                  optionButton.addComponents(new ButtonBuilder().setLabel('Add Area').setCustomId(`chatot~area~add~${areaName}`).setStyle(ButtonStyle.Success));
               }
               interaction.reply({
                  embeds: [areaEmbed],
                  components: [optionButton],
                  ephemeral: true
               }).catch(console.error);
               interaction.message.edit({
                  components: interaction.message.components
               });
            }
         }); //End of superagent
   }, //End of showArea()


   getAvailabeAreas: async function getAvailabeAreas(client, interaction, config, util, commandType) {
      superagent
         .get(util.api.availableAreas.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
         .set('X-Poracle-Secret', config.poracle.secret)
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else {
               var allAreas = JSON.parse(response.text);
               allAreas = allAreas.areas;
               var availableAreas = [];
               for (var a in allAreas) {
                  if (allAreas[a]['userSelectable'] == true) {
                     availableAreas.push(allAreas[a]['name'].toLowerCase());
                  }
               } //End of a loop
               if (availableAreas.length == 0) {
                  interaction.editReply('No available areas found.');
               } else {
                  availableAreas.sort();
                  this.getEnabledAreas(client, interaction, config, util, commandType, availableAreas);
               }
            }
         });
   }, //End of getAvailabeAreas()


   getEnabledAreas: async function getEnabledAreas(client, interaction, config, util, commandType, availableAreas) {
      superagent
         .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
         .set('X-Poracle-Secret', config.poracle.secret)
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else {
               let humanInfo = JSON.parse(response.text);
               var enabledAreas = JSON.parse(humanInfo.human.area);
               enabledAreas.sort();
               let available25Chunks = _.chunk(availableAreas, 25);
               let messageChunks = _.chunk(available25Chunks, 5);
               for (var m = 0; m < messageChunks.length; m++) {
                  let messageAreas = messageChunks[m];
                  var messageComponents = [];
                  var embedAreaList = [];
                  //Each group of 25
                  for (var d = 0; d < messageAreas.length; d++) {
                     var dropdown = new StringSelectMenuBuilder()
                        .setCustomId(`chatot~area~${commandType}~${d}`);
                     var actionRow = new ActionRowBuilder();
                     for (var a in messageAreas[d]) {
                        let areaName = enabledAreas.includes(messageAreas[d][a]) ? `${messageAreas[d][a]}✅` : messageAreas[d][a];
                        dropdown.addOptions({
                           label: areaName,
                           value: areaName
                        });
                        embedAreaList.push(areaName);
                     } //End of a loop
                     dropdown.setMaxValues(commandType == 'edit' ? dropdown.options.length : 1);
                     dropdown.setPlaceholder(`${dropdown.options[0]['data']['label'].replace('✅','')} - ${dropdown.options[dropdown.options.length - 1]['data']['label'].replace('✅','')}`);
                     actionRow.addComponents(dropdown);
                     messageComponents.push(actionRow);
                  } //End of d loop
                  var areaEmbed = new EmbedBuilder().setTitle(commandType == 'edit' ? 'Select Areas to Add or Remove' : 'Select Area to Show Outline').setFooter({
                     text: 'Enabled Areas✅'
                  });
                  if (commandType == 'edit') {
                     areaEmbed.setDescription(`- ${embedAreaList.join('\n- ')}`);
                  }
                  if (m == 0) {
                     interaction.editReply({
                        embeds: [areaEmbed],
                        components: messageComponents
                     }).catch(console.error);
                  } else {
                     interaction.followUp({
                        embeds: [areaEmbed],
                        components: messageComponents
                     }).catch(console.error);
                  }
               } //End of m loop
            }
         }); //End of superagent
   }, //End of getEnabledAreas()


   editAreaButton: async function editAreaButton(client, interaction, config, util, editType, areaName) {
      await interaction.deferReply({
         ephemeral: true
      });
      //Get enabled areas
      superagent
         .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
         .set('X-Poracle-Secret', config.poracle.secret)
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else {
               let humanInfo = JSON.parse(response.text);
               let enabledAreas = JSON.parse(humanInfo.human.area);
               editAreaList(enabledAreas);
            }
         }); //End of superagent

      async function editAreaList(enabledAreas) {
         var newAreaList = [];
         //Add area
         if (editType == 'add') {
            newAreaList = enabledAreas.concat(areaName);
         }
         //Remove area
         else if (editType == 'remove') {
            for (var e in enabledAreas) {
               if (enabledAreas[e] != areaName) {
                  newAreaList.push(enabledAreas[e]);
               }
            } //End of e loop
         }
         newAreaList = [...new Set(newAreaList)];
         newAreaList.sort();
         updateApi(client, interaction, newAreaList);
      } //End of editAreaList()

      async function updateApi(client, interaction, newAreaList) {
         superagent
            .post(util.api.updateAreas.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
            .send(newAreaList)
            .set('X-Poracle-Secret', config.poracle.secret)
            .end((error, response) => {
               if (error) {
                  console.log('Api error:', error);
               } else {
                  interaction.editReply({
                     content: `**Enabled areas:** ${newAreaList.join(', ')}`,
                     ephemeral: true
                  }).catch(console.error);
               }
            }); //End of superagent
      } //End of updateAreasApi()
   }, //End of editAreaButton()
}