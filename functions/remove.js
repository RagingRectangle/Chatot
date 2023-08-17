const {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
 } = require('discord.js')
 const fetch = require('node-fetch')
 const NodeCache = require('node-cache')
 const superagent = require('superagent')
 
 const autoCompleteCache = new NodeCache({ stdTTL: 60 })
 
 async function removeTracking(client, interaction, config, util, apiName, uid) {
   superagent
     .delete(
       `http://${config.poracle.host}:${config.poracle.port}/api/tracking/${apiName}/${interaction.user.id}/byUid/${uid}`
     )
     .set('X-Poracle-Secret', config.poracle.secret)
     .set('accept', 'application/json')
     .end((error, response) => {
       if (error) {
         console.log('Api error:', error)
       } else {
         if (response.text.startsWith('{"status":"ok"')) {
           editResponse()
         } else {
           console.log('Failed to remove user tracking:', response)
         }
       }
     }) //End of superagent
 
   async function editResponse() {
     const newEmbed = interaction.message.embeds[0]
     newEmbed['data']['title'] = `Removed ${apiName} alert!`
     newEmbed['data']['color'] = 2067276
 
     // Remove cache after completing?
     autoCompleteCache.del(`${apiName}-${interaction.user.id}`)
 
     await interaction.message
       .edit({
         embeds: [newEmbed],
         components: [],
       })
       .catch(console.error)
   } //End of editResponse()
 } //End of removeTracking()
 
 async function fetchAndCache(config, interaction, apiName) {
   if (autoCompleteCache.has(`${apiName}-${interaction.user.id}`)) {
     return autoCompleteCache.get(`${apiName}-${interaction.user.id}`)
   }
   const data = await fetch(
     `http://${config.poracle.host}:${config.poracle.port}/api/tracking/${apiName}/${interaction.user.id}`,
     {
       method: 'GET',
       headers: {
         'X-Poracle-Secret': config.poracle.secret,
         accept: 'application/json',
       },
     }
   )
   const userTracks = await data.json()
   autoCompleteCache.set(`${apiName}-${interaction.user.id}`, userTracks)
   return userTracks
 }
 
 async function autoComplete(client, interaction, config, util, questList) {
   const start = Date.now()
   let focusedValue = await interaction.options.getFocused()
   let apiName = await interaction.options._hoistedOptions[0]['value'].replace(
     'incident',
     'invasion'
   )
   const userTracks = await fetchAndCache(config, interaction, apiName)
   //console.log(`AutoComplete ${apiName} took ${Date.now() - start}ms to fetch`)
   //const start2 = Date.now()
   const { uidList, trackingList } = createTrackingList(
     userTracks[apiName],
     focusedValue,
     apiName
   )
   //console.log(
   //  `AutoComplete ${apiName} took ${Date.now() - start2}ms to create list`
   //)
   await interaction
     .respond(
       trackingList
         .map((choice) => ({
           name: choice,
           value: `${apiName}~${uidList[choice]}~${choice}`.slice(0, 100),
         }))
         .sort((a, b) => a.name.localeCompare(b.name))
     )
     .catch(console.error)
 } //End of autoComplete()
 
 function createTrackingList(userTracks, focusedValue, apiName) {
   const trackingList = []
   const uidList = {}
 
   const handleAdd = (track) => {
     if (track.toLowerCase().includes(focusedValue.toLowerCase())) {
       trackingList.push(track)
     }
   }
 
   for (let i = 0; i < userTracks.length; i++) {
     //Pokemon + Raids
     if (trackingList.length === 25) break
     if (apiName == 'pokemon' || apiName == 'raid') {
       let tracking = editDescription(userTracks[i]['description'])
       uidList[tracking] = userTracks[i]['uid']
       handleAdd(tracking)
     }
     //Incident
     else if (apiName == 'invasion') {
       const trackings = [
         userTracks[i]['grunt_type'].replace('pokemon-contest', 'showcase'),
       ]
       if (userTracks[i]['gender'] != 0) {
         handleAdd(userTracks[i]['gender'] == 1 ? 'male' : 'female')
       }
       if (userTracks[i]['distance'] != 0) {
         handleAdd(`dist:${userTracks[i]['distance']}m`)
       }
       if (userTracks[i]['clean'] == 1) {
         handleAdd('clean')
       }
       let tracking = trackings.join(' | ').slice(0, 100)
       uidList[tracking] = userTracks[i]['uid']
       handleAdd(tracking)
     }
     //Quest
     else if (apiName == 'quest') {
       for (const [questName, questInfo] of Object.entries(questList)) {
         if (
           questInfo.reward == userTracks[i]['reward'] &&
           questInfo.type == userTracks[i]['reward_type'] &&
           questInfo.form == userTracks[i]['form']
         ) {
           const trackings = [questName]
           if (userTracks[i]['amount'] > 0) {
             handleAdd(`min:${userTracks[i]['amount']}`)
           }
           if (userTracks[i]['distance'] > 0) {
             handleAdd(`dist:${userTracks[i]['distance']}m`)
           }
           if (userTracks[i]['clean'] == 1) {
             handleAdd('clean')
           }
           let tracking = trackings.join(' | ').slice(0, 100)
           uidList[tracking] = userTracks[i]['uid']
           handleAdd(tracking)
         }
       } //End of loop
     }
     //Lure
     else if (apiName == 'lure') {
       for (const [lureName, lureId] of Object.entries(util.lures)) {
         if (lureId == userTracks[i]['lure_id']) {
           const trackings = [lureName]
           if (userTracks[i]['distance'] > 0) {
             handleAdd(`dist:${userTracks[i]['distance']}m`)
           }
           if (userTracks[i]['clean'] == 1) {
             handleAdd('clean')
           }
           let tracking = trackings.join(' | ').slice(0, 100)
           uidList[tracking] = userTracks[i]['uid']
           handleAdd(tracking)
         }
       }
     }
     //  trackingList.sort()
   } //End of i loop
   return {
     uidList,
     trackingList,
   }
 } //End of createTrackingList()
 
 function editDescription(longDescription) {
   return longDescription
     .replace(
       /\*\*|\| iv: ?%-100% |\| cp: 0-9000 |\| level: 0-40 |\| stats: 0\/0\/0 - 15\/15\/15 |size: |\| XXS-XXL | pvp ranking:| gender:|gender-|distance: |iv: |level: |stats: |controlled by |pvp ranking: |minimum time| with move|at gym| controlled by/g,
       ''
     )
     .replace(/pokemon-contest/g, 'showcase')
     .replace(/littlepvp/g, 'little')
     .replace(/greatpvp/g, 'great')
     .replace(/ultrapvp/g, 'ultra')
     .replace(/(XXS|XXL) - \1/g, '$1')
     .replace(/\s{2,}/g, ' ')
     .replace(/\s-\s/g, '-')
     .replace(/ clean/g, ' | clean')
     .slice(0, 100)
 } //End of editDescription()
 
 async function verifyRemove(client, interaction) {
   let options = interaction.options._hoistedOptions
   let splitValue = options[1]['value'].split('~')
   const removeEmbed = new EmbedBuilder()
     .setTitle(`Remove ${options[0]['value']} alert?`)
     .setColor('Red')
     .setDescription(splitValue[2])
   let removeComponents = new ActionRowBuilder()
     .addComponents(
       new ButtonBuilder()
         .setLabel('Verify')
         .setCustomId(`chatot~remove~verify~${splitValue[0]}~${splitValue[1]}`)
         .setStyle(ButtonStyle.Success)
     )
     .addComponents(
       new ButtonBuilder()
         .setLabel('Cancel')
         .setCustomId(`chatot~delete`)
         .setStyle(ButtonStyle.Danger)
     )
   await interaction
     .editReply({
       embeds: [removeEmbed],
       components: [removeComponents],
     })
     .catch(console.error)
 } //End of verifyRemove()
 
 module.exports = {
   removeTracking,
   autoComplete,
   editDescription,
   verifyRemove,
 }
 