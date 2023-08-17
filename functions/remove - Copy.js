const {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');

module.exports = {
   removeTracking: async function removeTracking(client, interaction, config, util, apiName, uid) {
      superagent
         .delete(`http://${config.poracle.host}:${config.poracle.port}/api/tracking/${apiName}/${interaction.user.id}/byUid/${uid}`)
         .set('X-Poracle-Secret', config.poracle.secret)
         .set('accept', 'application/json')
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else {
               if (response.text.startsWith('{"status":"ok"')) {
                  editResponse();
               } else {
                  console.log("Failed to remove user tracking:", response);
               }
            }
         }); //End of superagent

      async function editResponse() {
         var newEmbed = interaction.message.embeds[0];
         newEmbed['data']['title'] = `Removed ${apiName} alert!`;
         newEmbed['data']['color'] = 2067276;
         await interaction.message.edit({
            embeds: [newEmbed],
            components: []
         }).catch(console.error);
      } //End of editResponse()
   }, //End of removeTracking()


   autoComplete: async function autoComplete(client, interaction, config, util, questList) {
      let focusedValue = await interaction.options.getFocused();
      let apiName = await interaction.options._hoistedOptions[0]['value'].replace('incident', 'invasion');
      superagent
         .get(`http://${config.poracle.host}:${config.poracle.port}/api/tracking/${apiName}/${interaction.user.id}`)
         .set('X-Poracle-Secret', config.poracle.secret)
         .set('accept', 'application/json')
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else {
               let responseText = JSON.parse(response.text);
               if (responseText.status == 'ok') {
                  let userTracks = responseText[apiName];
                  if (userTracks.length > 0) {
                     createTrackingList(userTracks);
                  }
               } else {
                  console.log("Failed to fetch user trackings:", response);
               }
            }
         }); //End of superagent

      async function createTrackingList(userTracks) {
         var trackingList = [];
         var uidList = {};
         for (var u in userTracks) {
            //Pokemon + Raids
            if (apiName == 'pokemon' || apiName == 'raid') {
               let tracking = await module.exports.editDescription(userTracks[u]['description']);
               uidList[tracking] = userTracks[u]['uid'];
               trackingList.push(tracking);
            }
            //Incident
            else if (apiName == 'invasion') {
               var trackings = [userTracks[u]['grunt_type'].replace('pokemon-contest', 'showcase')];
               if (userTracks[u]['gender'] != 0) {
                  trackings.push(userTracks[u]['gender'] == 1 ? 'male' : 'female');
               }
               if (userTracks[u]['distance'] != 0) {
                  trackings.push(`dist:${userTracks[u]['distance']}m`);
               }
               if (userTracks[u]['clean'] == 1) {
                  trackings.push('clean');
               }
               let tracking = trackings.join(' | ').slice(0, 100);
               uidList[tracking] = userTracks[u]['uid'];
               trackingList.push(tracking);
            }
            //Quest
            else if (apiName == 'quest') {
               for (const [questName, questInfo] of Object.entries(questList)) {
                  if (questInfo.reward == userTracks[u]['reward'] && questInfo.type == userTracks[u]['reward_type'] && questInfo.form == userTracks[u]['form']) {
                     var trackings = [questName];
                     if (userTracks[u]['amount'] > 0) {
                        trackings.push(`min:${userTracks[u]['amount']}`);
                     }
                     if (userTracks[u]['distance'] > 0) {
                        trackings.push(`dist:${userTracks[u]['distance']}m`);
                     }
                     if (userTracks[u]['clean'] == 1) {
                        trackings.push('clean');
                     }
                     let tracking = trackings.join(' | ').slice(0, 100);
                     uidList[tracking] = userTracks[u]['uid'];
                     trackingList.push(tracking);
                  }
               } //End of loop
            }
            //Lure
            else if (apiName == 'lure') {
               for (const [lureName, lureId] of Object.entries(util.lures)) {
                  if (lureId == userTracks[u]['lure_id']) {
                     var trackings = [lureName];
                     if (userTracks[u]['distance'] > 0) {
                        trackings.push(`dist:${userTracks[u]['distance']}m`);
                     }
                     if (userTracks[u]['clean'] == 1) {
                        trackings.push('clean');
                     }
                     let tracking = trackings.join(' | ').slice(0, 100);
                     uidList[tracking] = userTracks[u]['uid'];
                     trackingList.push(tracking);
                  }
               }
            }
            trackingList.sort();
         } //End of u loop
         let filteredList = trackingList.filter(choice => choice.includes(focusedValue)).slice(0, 25);
         await interaction.respond(
            filteredList.map(choice => ({
               name: choice,
               value: (`${apiName}~${uidList[choice]}~${choice}`).slice(0, 100)
            }))
         ).catch(console.error);
      } //End of createTrackingList()
   }, //End of autoComplete()


   editDescription: async function editDescription(longDescription) {
      let shortDescription = longDescription.replaceAll('**', '').replace('| iv: ?%-100% ', '').replace('| cp: 0-9000 ', '').replace('| level: 0-40 ', '').replace('| stats: 0/0/0 - 15/15/15 ', '').replace('size: ', '').replace('| XXS-XXL ', '').replace(' pvp ranking:', '').replace(' gender:', '').replace('gender-', '').replace('pokemon-contest', 'showcase').replace('| gender: any ', '').replace('distance: ', 'dist:').replace('iv: ', '').replace('level: ', 'L:').replace('stats: ', '').replace('controlled by ', '').replace('pvp ranking: ', '').replace('littlepvp', 'little').replace('greatpvp', 'great').replace('ultrapvp', 'ultra').replace('XXS - XXS', 'XXS').replace('XXL - XXL', 'XXL').replace('minimum time', 'time').replace(' controlled by', '').replace(' with move', '').replace('at gym', '|').replace(' clean', ' | clean').replaceAll(' - ', '-').replaceAll('   ', ' ').replaceAll('  ', ' ').slice(0, 100);
      return shortDescription;
   }, //End of editDescription()


   verifyRemove: async function verifyRemove(client, interaction) {
      let options = interaction.options._hoistedOptions;
      let splitValue = options[1]['value'].split('~');
      var removeEmbed = new EmbedBuilder().setTitle(`Remove ${options[0]['value']} alert?`).setColor("Red").setDescription(splitValue[2]);
      let removeComponents = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Verify').setCustomId(`chatot~remove~verify~${splitValue[0]}~${splitValue[1]}`).setStyle(ButtonStyle.Success)).addComponents(new ButtonBuilder().setLabel('Cancel').setCustomId(`chatot~delete`).setStyle(ButtonStyle.Danger));
      await interaction.editReply({
         embeds: [removeEmbed],
         components: [removeComponents]
      }).catch(console.error);
   } //End of verifyRemove()
}