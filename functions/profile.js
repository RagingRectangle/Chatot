const {
   ActionRowBuilder,
   EmbedBuilder,
   StringSelectMenuBuilder
} = require('discord.js');
const _ = require('lodash');
const superagent = require('superagent');

module.exports = {
   showAvailableProfiles: async function showAvailableProfiles(client, interaction, config, util) {
      //Get profile list
      superagent
         .get(util.api.getProfiles.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
         .set('X-Poracle-Secret', config.poracle.secret)
         .end((error, response) => {
            if (error) {
               console.log('Api error:', error);
            } else {
               let profileInfo = JSON.parse(response.text);
               var profileList = profileInfo.profile;
               if (profileList.length == 0) {
                  interaction.editReply('No profiles found.').catch(console.error);
               } else {
                  getActiveProfile(profileList);
               }
            }
         }); //End of superagent

      async function getActiveProfile(profileList) {
         superagent
            .get(util.api.humanInfo.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id))
            .set('X-Poracle-Secret', config.poracle.secret)
            .end((error, response) => {
               if (error) {
                  console.log('Api error:', error);
               } else {
                  let humanInfo = JSON.parse(response.text);
                  let activeProfileNumber = humanInfo.human.current_profile_no;
                  sendProfileChangeMessage(profileList, activeProfileNumber);
               }
            }); //End of superagent
      } //End of getActiveProfile()

      async function sendProfileChangeMessage(profileList, activeProfileNumber) {
         try {
            var profileEmbed = new EmbedBuilder().setTitle('Available Profiles:');
            var profileDescription = [];
            var namesOfProfiles = [];
            var activeProfileName = '';
            for (var p = 0; p < profileList.length; p++) {
               let profileNumber = profileList[p]['profile_no'];
               var profileName = profileList[p]['name'];
               namesOfProfiles.push({
                  name: profileNumber == activeProfileNumber ? `${profileName}✅` : profileName,
                  number: profileNumber
               });
               let fieldName = profileNumber == activeProfileNumber ? `${profileName}✅` : profileName;
               var fieldNameLink = fieldName;
               if (profileNumber == activeProfileNumber) {
                  activeProfileName = profileList[p]['name'];
               }
               if (profileList[p]['latitude'] != 0 && profileList[p]['longitude'] != 0) {
                  fieldNameLink = `[${fieldName}](http://maps.google.com/maps?q=${profileList[p]['latitude']},${profileList[p]['longitude']})`
               }
               var areaArray = await JSON.parse(profileList[p]['area']);
               areaArray.sort();
               //Get hours
               var hoursArray = [];
               var profileHours = await JSON.parse(profileList[p]['active_hours']);
               if (profileHours.length > 0) {
                  profileHours = await _.orderBy(profileHours, ["day", "hours", "mins"], ["asc", "asc", "asc"]);
                  var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  for (var d = 1; d < 8; d++) {
                     var dayHours = [];
                     for (var h in profileHours) {
                        if (profileHours[h]['day'] == d) {
                           dayHours.push(`${profileHours[h]['hours']}:${profileHours[h]['mins'] == 0 ? '00' : profileHours[h]['mins']}`);
                        }
                     } //End of p loop
                     if (dayHours.length > 0) {
                        hoursArray.push(`${days[d-1]}: ${dayHours.join(', ')}`);
                     }
                  } //End of d loop
               }
               let areaInfo = areaArray.length > 0 ? `\n- **Areas:** ${areaArray.join(', ')}` : ``;
               let hoursInfo = hoursArray.length > 0 ? `\n- **Activation Times:**\n-- ${hoursArray.join('\n-- ')}` : ``;
               profileDescription.push(`### ${fieldNameLink}${areaInfo}${hoursInfo}`);
            } //End of p loop
            profileEmbed.setDescription(profileDescription.join('\n'));
            //Only one profile
            if (profileList.length == 1) {
               await interaction.editReply({
                  embeds: [profileEmbed]
               }).catch(console.error);
               return;
            }
            var profileDropdown = new StringSelectMenuBuilder()
               .setCustomId(`chatot~profile~change`)
               .setPlaceholder('Select new profile');
            for (var n in namesOfProfiles) {
               profileDropdown.addOptions({
                  label: namesOfProfiles[n]['name'],
                  value: `${namesOfProfiles[n]['name'].replace('✅','')}~${namesOfProfiles[n]['number']}~${activeProfileName}`
               });
            }
            var actionRow = new ActionRowBuilder().addComponents(profileDropdown);
            await interaction.editReply({
               embeds: [profileEmbed],
               components: [actionRow]
            }).catch(console.error);
         } catch (err) {
            console.log("Error sending profile message:", err);
         }
      } //End of sendProfileChangeMessage()
   }, //End of showAvailableProfiles()


   changeProfile: async function changeProfile(client, interaction, config, util) {
      let newProfileInfo = interaction.values[0].split('~');
      let newProfileName = newProfileInfo[0];
      let newProfileNumber = newProfileInfo[1];
      let oldProfileName = newProfileInfo[2];
      if (newProfileName == oldProfileName) {
         await interaction.reply({
            content: `Profile **${newProfileName.replace('✅','')}** is already active.`,
            ephemeral: true
         });
         updateProfileMessage();
      } else {
         superagent
            .post(util.api.switchProfile.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id).replace('{{profile}}', newProfileNumber))
            .set('X-Poracle-Secret', config.poracle.secret)
            .end((error, response) => {
               if (error) {
                  console.log('Api error:', error);
               } else if (response.text == '{"status":"ok"}') {
                  interaction.reply({
                     content: `Active profile changed to **${newProfileName}**`,
                     ephemeral: true
                  }).catch(console.error);
                  updateProfileMessage();
               }
            }); //End of superagent
      }

      async function updateProfileMessage() {
         let oldEmbed = interaction.message.embeds[0];
         let newDescription = oldEmbed.description.replace(`${oldProfileName}✅`, oldProfileName).replace(`### ${newProfileName}`, `### ${newProfileName}✅`).replace(`### [${newProfileName}`, `### [${newProfileName}✅`)
         let profileEmbed = new EmbedBuilder().setTitle(oldEmbed.title).setDescription(newDescription);
         let oldDropdown = interaction.message.components[0]['components'][0]['options'];
         var newDropdown = new StringSelectMenuBuilder()
            .setCustomId(`chatot~profile~change`)
            .setPlaceholder('Select new profile');
         for (var d in oldDropdown) {
            let oldValue = oldDropdown[d]['value'].split('~');
            var newLabel = oldDropdown[d]['label'].replace('✅', '');
            if (newLabel == newProfileName) {
               newLabel = newLabel.concat('✅');
            }
            newDropdown.addOptions({
               label: newLabel,
               value: `${oldValue[0].replace('✅','')}~${oldValue[1]}~${newProfileName}`
            });
         } //End of d loop
         let actionRow = new ActionRowBuilder().addComponents(newDropdown);
         await interaction.message.edit({
            embeds: [profileEmbed],
            components: [actionRow]
         }).catch(console.error);
      } //End of updateProfileMessage()
   }, //End of changeProfile()
}