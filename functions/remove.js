const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const _ = require('lodash');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const superagent = require('superagent');
const autoCompleteCache = new NodeCache({
  stdTTL: 60
});

async function removeTracking(client, interaction, config, util, humanInfo, removeInteractionID) {
  //apiName~uid
  try {
    let locale = require(`../locale/${humanInfo.language}.json`);
    let removeOptions = removeInteractionID.split('~');
    superagent
      .delete(
        `http://${config.poracle.host}:${config.poracle.port}/api/tracking/${removeOptions[0]}/${interaction.user.id}/byUid/${removeOptions[1]}`
      )
      .set('X-Poracle-Secret', config.poracle.secret)
      .set('accept', 'application/json')
      .end((error, response) => {
        if (error) {
          console.log('Api error:', error)
        } else {
          if (response.text.startsWith('{"status":"ok"')) {
            editResponse(removeOptions[0], locale);
          } else {
            console.log('Failed to remove user tracking:', response)
          }
        }
      }); //End of superagent
  } catch (err) {
    console.log(err);
  }


  async function editResponse(apiName, locale) {
    try {
      const newEmbed = interaction.message.embeds[0];
      newEmbed['data']['title'] = `${locale.removedAlert} (${apiName})`;
      newEmbed['data']['color'] = 2067276;
      // Remove cache after completing?
      autoCompleteCache.del(`${apiName}-${interaction.user.id}`);
      await interaction.message
        .edit({
          embeds: [newEmbed],
          components: [],
        })
        .catch(console.error);
    } catch (err) {
      console.log(err);
    }
  } //End of editResponse()
} //End of removeTracking()


async function fetchAndCache(config, interaction, apiName) {
  try {
    if (autoCompleteCache.has(`${apiName}-${interaction.user.id}`)) {
      return autoCompleteCache.get(`${apiName}-${interaction.user.id}`)
    }
    const data = await fetch(
      `http://${config.poracle.host}:${config.poracle.port}/api/tracking/${apiName}/${interaction.user.id}`, {
        method: 'GET',
        headers: {
          'X-Poracle-Secret': config.poracle.secret,
          accept: 'application/json',
        },
      }
    );
    const userTracks = await data.json();
    autoCompleteCache.set(`${apiName}-${interaction.user.id}`, userTracks);
    return userTracks;
  } catch (err) {
    console.log(err);
  }
}


async function autoComplete(client, interaction, config, util, gameData, language) {
  try {
    const start = Date.now();
    let focusedValue = await interaction.options.getFocused();
    var apiName = await interaction.options._hoistedOptions[0]['value'].replace(config.pokemonCommand, 'pokemon').replace(config.raidCommand, 'raid').replace(config.incidentCommand, 'invasion').replace(config.questCommand, 'quest').replace(config.lureCommand, 'lure');
    const userTracks = await fetchAndCache(config, interaction, apiName);
    //console.log(`AutoComplete ${apiName} took ${Date.now() - start}ms to fetch`);
    //const start2 = Date.now();
    const {
      uidList,
      trackingList
    } = createTrackingList(
      userTracks[apiName],
      focusedValue,
      apiName,
      config,
      util,
      gameData,
      language
    );
    //console.log(`AutoComplete ${apiName} took ${Date.now() - start2}ms to create list`);
    await interaction
      .respond(
        trackingList
        .map((choice) => ({
          name: choice,
          value: `${uidList[choice]}~${choice}`.slice(0, 100)
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      )
      .catch(console.error);
  } catch (err) {
    console.log(err);
  }
} //End of autoComplete()


function createTrackingList(userTracks, focusedValue, apiName, config, util, gameData, language) {
  if (!userTracks) {
    console.log('Error: userTracks not found for removal.');
    return;
  }
  try {
    const trackingList = [];
    const uidList = {};
    const handleAdd = (track) => {
      if (track.toLowerCase().includes(focusedValue.toLowerCase())) {
        trackingList.push(track)
      }
    };
    for (let i = 0; i < userTracks.length; i++) {
      if (trackingList.length === 25) break;
      let tracking = createDescription(apiName, config, util, gameData, language, userTracks[i]);
      uidList[tracking] = userTracks[i]['uid'];
      handleAdd(tracking);
    } //End of i loop
    return {
      uidList,
      trackingList,
    }
  } catch (err) {
    console.log(err);
  }
} //End of createTrackingList()


function createDescription(apiName, config, util, gameData, language, alert) {
  try {
    let locale = require(`../locale/${language}.json`);
    var alertEntry = '';
    //Nest
    if (apiName == 'nest') {
      var filters = [];
      let monData = gameData.monsters[`${alert.pokemon_id}_${alert.form}`] ? gameData.monsters[`${alert.pokemon_id}_${alert.form}`] : gameData.monsters[`${alert.pokemon_id}_0`];
      var monName = monData.name;
      //Form
      if (monData.form.id != 0) {
        monName = monName.concat(` (${locale[monData.form.name] ? locale[monData.form.name] : monData.form.name})`);
      }
      filters.push(monName);
      //Min Avg
      if (alert.min_spawn_avg > 0){
        filters.push(`${locale.nestAverageName}: ${alert.min_spawn_avg}+`)
      }
      //Distance
      if (alert.distance > 0) {
        filters.push(`${locale.Distance}: ${alert.distance}m`);
      }
      //Clean
      if (alert.clean == 1) {
        filters.push(locale.cleanName);
      }
      //Template
      if (alert.template != config.defaultTemplateName) {
        filters.push(`${locale.templateName}: ${alert.template}`);
      }
      alertEntry = filters.join(' | ').slice(0, 100);
      return alertEntry;
    } //End of nest

    //Lure
    if (apiName == 'lure') {
      var filters = [];
      filters.push(locale[util.lures[alert.lure_id.toString()]] ? locale[util.lures[alert.lure_id.toString()]] : '???');
      //Distance
      if (alert.distance > 0) {
        filters.push(`${locale.Distance}: ${alert.distance}m`);
      }
      //Clean
      if (alert.clean == 1) {
        filters.push(locale.cleanName);
      }
      //Template
      if (alert.template != config.defaultTemplateName) {
        filters.push(`${locale.templateName}: ${alert.template}`);
      }
      alertEntry = filters.join(' | ').slice(0, 100);
      return alertEntry;
    } //End of lure

    //Quest
    if (apiName == 'quest') {
      var filters = [];
      //XP
      if (alert.reward_type == 1) {
        filters.push(locale.XP ? locale.XP : 'XP');
      }
      //Item
      else if (alert.reward_type == 2) {
        itemName = locale[util.questItems[alert.reward]] ? locale[util.questItems[alert.reward]] : locale[gameData.items[alert.reward]['name']] ? locale[gameData.items[alert.reward]['name']] : '???';
        filters.push(itemName);
      }
      //Stardust
      else if (alert.reward_type == 3) {
        filters.push(locale.Stardust ? locale.Stardust : 'Stardust');
      }
      //Candy:4 + Pokemon:7 + XL:9 + Mega:12
      else if (alert.reward_type == 4 || alert.reward_type == 7 || alert.reward_type == 9 || alert.reward_type == 12) {
        let monData = gameData.monsters[`${alert.reward}_${alert.form}`] ? gameData.monsters[`${alert.reward}_${alert.form}`] : gameData.monsters[`${alert.reward}_0`];
        var monName = monData.name;
        //Form
        if (monData.form.id != 0) {
          monName = monName.concat(` (${locale[monData.form.name] ? locale[monData.form.name] : monData.form.name})`);
        }
        var monAddition = '';
        //Candy
        if (alert.reward_type == 4) {
          monAddition = locale.Candy ? locale.Candy : 'Candy';
        }
        //XL
        else if (alert.reward_type == 9) {
          monAddition = locale['XL Candy'] ? locale['XL Candy'] : 'XL Candy';
        }
        //Mega
        else if (alert.reward_type == 12) {
          //Primal
          if (alert.reward == 382 || alert.reward == 383) {
            monAddition = locale['Primal Energy'] ? locale['Primal Energy'] : 'Primal Energy';
          } else {
            locale['Mega Energy'] ? locale['Mega Energy'] : 'Mega Energy';
          }
        }
        if (monAddition) monName = monName.concat(` ${monAddition}`);
        filters.push(monName);
      }
      //Unknown
      else {
        let otherType = gameData.questRewardTypes[alert.reward_type.toString()];
        filters.push(locale[otherType] ? locale[otherType] : otherType);
      }
      //Optional Filters
      //Amount
      if (alert.reward_type != 7 && alert.amount > 0) {
        filters.push(`${alert.amount}+`);
      }
      //Distance
      if (alert.distance > 0) {
        filters.push(`${locale.Distance}: ${alert.distance}m`);
      }
      //Clean
      if (alert.clean == 1) {
        filters.push(locale.cleanName);
      }
      //Template
      if (alert.template != config.defaultTemplateName) {
        filters.push(`${locale.templateName}: ${alert.template}`);
      }
      alertEntry = filters.join(' | ').slice(0, 100);
      return alertEntry;
    } //End of quest

    //Incident
    if (apiName == 'invasion') {
      var filters = [];
      //Type
      var incidentType = _.capitalize(alert.grunt_type).replace('Mixed', locale.rocketGruntMixed).replace('Gold-stop', 'Gold Coins');
      var incidentType = locale[incidentType] ? locale[incidentType] : incidentType;
      //Gender
      if (alert.gender == 1 || alert.gender == 2) {
        incidentType = incidentType.concat(alert.gender.toString().replace('1', '♂').replace('2', '♀'));
      }
      filters.push(incidentType);
      //Distance
      if (alert.distance > 0) {
        filters.push(`${locale.Distance}: ${alert.distance}m`);
      }
      //Clean
      if (alert.clean == 1) {
        filters.push(locale.cleanName);
      }
      //Template
      if (alert.template != config.defaultTemplateName) {
        filters.push(`${locale.templateName}: ${alert.template}`);
      }
      alertEntry = filters.join(' | ').slice(0, 100);
      return alertEntry;
    } //End of incident

    //Raid
    if (apiName == 'raid') {
      var filters = [];
      //Pokemon
      if (alert.level == 9000) {
        let monData = gameData.monsters[`${alert.pokemon_id}_${alert.form}`];
        var monName = monData.name;
        //Form
        if (monData.form.id != 0) {
          monName = monName.concat(` (${locale[monData.form.name] ? locale[monData.form.name] : monData.form.name})`);
        }
        filters.push(monName);
      }
      //Level
      if (alert.pokemon_id == 9000 && alert.level <= 15) {
        filters.push(locale[util.raidLevels[alert.level.toString()]]);
      }
      //Distance
      if (alert.distance > 0) {
        filters.push(`${locale.Distance}: ${alert.distance}m`);
      }
      //Team
      if (alert.team != 4) {
        filters.push(locale[util.teams[alert.team.toString()]] ? locale[util.teams[alert.team.toString()]] : util.teams[alert.team.toString()]);
      }
      //Move
      if (alert.move != 9000 && gameData.moves[alert.move.toString()]) {
        let moveName = gameData.moves[alert.move.toString()]['name'];
        filters.push(locale[moveName] ? locale[moveName] : moveName);
      }
      //Clean
      if (alert.clean == 1) {
        filters.push(locale.cleanName);
      }
      //Template
      if (alert.template != config.defaultTemplateName) {
        filters.push(`${locale.templateName}: ${alert.template}`);
      }
      //Gym
      if (alert.gym_id != null) {
        filters.push(`@${alert.gym_id}`);
      }
      alertEntry = filters.join(' | ').slice(0, 100);
      return alertEntry;
    } //End of raid

    //Pokemon
    if (apiName == 'pokemon') {
      let monData = gameData.monsters[`${alert.pokemon_id}_${alert.form}`] ? gameData.monsters[`${alert.pokemon_id}_${alert.form}`] :  gameData.monsters[`${alert.pokemon_id}_0`];
      var filters = [];
      //Pokemon
      filters.push(locale[monData.name] ? locale[monData.name] : monData.name);
      //Form
      if (monData.form.id != 0) {
        filters.push(` (${locale[monData.form.name] ? locale[monData.form.name] : monData.form.name})`);
      }
      //IV
      if (alert.min_iv != -1 || alert.max_iv != 100) {
        filters.push(`${alert.min_iv.toString().replace('-1','?')}-${alert.max_iv}%`);
      }
      //Stats
      if (alert.atk != 0 || alert.def != 0 || alert.sta != 0 || alert.max_atk != 15 || alert.max_def != 15 || alert.max_sta != 15) {
        filters.push(`${alert.atk}/${alert.def}/${alert.sta}-${alert.max_atk}/${alert.max_def}/${alert.max_sta}`);
      }
      //CP
      if (alert.pvp_ranking_league == 0) {
        if (alert.min_cp != 0 || alert.max_cp != 9000) {
          filters.push(`${local.cp}: ${alert.min_cp}-${alert.max_cp}`);
        }
      }
      //Level
      if (alert.min_level != 0 || alert.max_level != 40) {
        filters.push(`${locale.level}: ${alert.min_level}-${alert.max_level}`);
      }
      //PvP
      if (alert.pvp_ranking_league != 0) {
        let leagueName = locale[alert.pvp_ranking_league == 500 ? 'littleLeague' : alert.pvp_ranking_league == 1500 ? 'greatLeague' : 'ultraLeague'];
        filters.push(`${leagueName}: ${alert.pvp_ranking_best}-${alert.pvp_ranking_worst} (@${alert.pvp_ranking_min_cp}+)`);
      }
      //Size
      if (alert.size != -1 && alert.max_size != 5) {
        let sizeName = (`${alert.size}-${alert.max_size}`).replace('-1', '?').replace(1, locale.sizeXxs).replace('2', locale.sizeXs).replace('3', locale.sizeM).replace('4', locale.sizeXl).replace('5', locale.sizeXxl);
        filters.push(sizeName);
      }
      //Gender
      if (alert.gender == 1 || alert.gender == 2) {
        filters.push(alert.gender.toString().replace('1', '♂').replace('2', '♀'));
      }
      //Distance
      if (alert.distance != 0) {
        filters.push(`${locale.Distance}: ${alert.distance}m`);
      }
      //Min time
      if (alert.min_time != 0) {
        filters.push(`${locale.time}: ${alert.min_time}s`);
      }
      //Clean
      if (alert.clean == 1) {
        filters.push(locale.cleanName);
      }
      //Template
      if (alert.template != config.defaultTemplateName) {
        filters.push(`${locale.templateName}: ${alert.template}`);
      }
      alertEntry = filters.join(' | ').slice(0, 100);
      return alertEntry;
    } //End of pokemon
  } catch (err) {
    console.log(err);
  }
} //End of createDescription()


async function verifyRemove(client, interaction, config, util, pokemonLists, locale, humanInfo) {
  try {
    let apiName = await interaction.options._hoistedOptions[0]['value'].replace(config.pokemonCommand, 'pokemon').replace(config.raidCommand, 'raid').replace(config.incidentCommand, 'invasion').replace(config.questCommand, 'quest').replace(config.lureCommand, 'lure');
    let alertIdChoice = await interaction.options._hoistedOptions[1]['value'].split('~'); //uid~choice
    const removeEmbed = new EmbedBuilder()
      .setTitle(`${locale.removeDescription} (${apiName})`)
      .setColor('Red')
      .setDescription(`- ${alertIdChoice[1].replaceAll(' | ', '\n- ')}`);

    let removeComponents = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setLabel(locale.buttonVerify)
        .setCustomId(`chatot~remove~verify~${apiName}~${alertIdChoice[0]}`)
        .setStyle(ButtonStyle.Success)
      )
      .addComponents(
        new ButtonBuilder()
        .setLabel(locale.buttonCancel)
        .setCustomId(`chatot~delete`)
        .setStyle(ButtonStyle.Danger)
      );
    await interaction.editReply({
      embeds: [removeEmbed],
      components: [removeComponents]
    }).catch(console.error);
  } catch (err) {
    console.log(err);
  }
} //End of verifyRemove()

module.exports = {
  removeTracking,
  autoComplete,
  createDescription,
  verifyRemove,
}