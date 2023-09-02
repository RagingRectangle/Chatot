const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const superagent = require('superagent');
const defaults = require('../locale/custom/default.json');

module.exports = {
  pokemon: async function pokemon(client, interaction, config, util, master, locale, gameData) {
    try {
      let interactionMonData = interaction.options._hoistedOptions[0]['value'].split('~');
      let monName = interactionMonData[0];
      let dexForm = interactionMonData[1].split('_');
      let messageData = await this.createInfoEmbed(util, master, gameData, locale, monName, dexForm[0], dexForm[1]);
      await interaction.editReply({
        embeds: [messageData[0]],
        components: messageData[1]
      }).catch(console.error);
    } catch (err) {
      console.log(err);
    }
  }, //End of pokemon()


  changePokemon: async function changePokemon(client, interaction, config, util, master, gameData, humanInfo, newPokeInfo) {
    await interaction.deferReply();
    interaction.deleteReply();
    try {
      let locale = require(`../locale/${humanInfo.language}.json`);
      //monName~monID_formID
      let interactionInfo = newPokeInfo.split('~');
      let monName = locale[interactionInfo[0]] ? locale[interactionInfo[0]] : interactionInfo[0];
      let dexForm = interactionInfo[1].split('_');
      let messageData = await this.createInfoEmbed(util, master, gameData, locale, monName, dexForm[0], dexForm[1]);
      await interaction.message.edit({
        embeds: [messageData[0]],
        components: messageData[1]
      }).catch(console.error);
    } catch (err) {
      console.log(err);
    }
  }, //End of changePokemon()


  createInfoEmbed: async function createInfoEmbed(util, master, gameData, locale, monName, dexID, formID) {
    try {
      let monData = gameData.monsters[`${dexID}_${formID}`];
      var thumbnail = `https://github.com/nileplumb/PkmnHomeIcons/blob/master/UICONS/pokemon/${dexID}_f${formID}.png?raw=true`.replace('_f0.png', '.png');
      if (master.pokemon[dexID]['defaultFormId'] == formID){
        thumbnail = thumbnail.replace(`_f${formID}.png`,'.png');
      }
      var pokemonEmbed = new EmbedBuilder().setTitle(`#${monData.id} ${monName}`).setThumbnail(thumbnail);
      var description = [];
      //Poracle form
      if (monName.includes('(')) {
        let monSplit = monName.replace(')', '').split(' (');
        let poracleForm = `*${monSplit[0]} form:${monSplit[1].replaceAll(' ','_')}*`;
        description.push(poracleForm);
      }
      else {
        description.push(`*${monName}* form:${locale.Normal}`);
      }

      //Types + Weather
      var types = [];
      var weathers = [];
      for (var t in monData.types) {
        types.push(locale[monData.types[t]['name']] ? locale[monData.types[t]['name']] : monData.types[t]['name']);
        weathers.push(locale[util.weather[monData.types[t]['name']]] ? locale[util.weather[monData.types[t]['name']]] : util.weather[monData.types[t]['name']]);

      }
      let typeNames = locale['Type(s): {{types}}'].replace('{{types}}', types.join(', ')) ? locale['Type(s): {{types}}'].replace('{{types}}', types.join(', ')) : `Type(s): ${types.join(', ')}`;
      description.push(typeNames);
      description.push(`${locale.boostedBy}: ${weathers.join(', ')}`);
      //Fighting info
      //Need to figure out how to combine dual types haha

      //Moves
      let masterMon = master.pokemon[dexID];
      if (masterMon.forms[formID] && masterMon.forms[formID]['quickMoves']) {
        createMovesLists(masterMon.forms[formID]['quickMoves'], masterMon.forms[formID]['chargedMoves']);
      } else {
        createMovesLists(masterMon.quickMoves, masterMon.chargedMoves);
      }
      async function createMovesLists(quick, charged) {
        var quickMoves = [];
        var chargedMoves = [];
        for (var q in quick){
          let moveName = locale[gameData.moves[quick[q]]['name']] ? locale[gameData.moves[quick[q]]['name']] : gameData.moves[quick[q]]['name'];
          let moveType = locale[gameData.moves[quick[q]]['type']] ? locale[gameData.moves[quick[q]]['type']] : gameData.moves[quick[q]]['type'];
          quickMoves.push(`${moveName} (${moveType})`);
        }
        for (var c in charged){
          let moveName = locale[gameData.moves[charged[c]]['name']] ? locale[gameData.moves[charged[c]]['name']] : gameData.moves[charged[c]]['name'];
          let moveType = locale[gameData.moves[charged[c]]['type']] ? locale[gameData.moves[charged[c]]['type']] : gameData.moves[charged[c]]['type'];
          chargedMoves.push(`${moveName} (${moveType})`);
        }
        description.push(`${locale.moveQuick}:\n- ${quickMoves.join('\n- ')}\n${locale.moveCharged}:\n- ${chargedMoves.join('\n- ')}`);
      }

      //Third move
      let thirdMoves = `${locale.thirdMoveCost}:\n- ${locale.Candy}: ${monData.thirdMoveCandy}\n- ${locale.Stardust}: ${monData.thirdMoveStardust}`;
      description.push(thirdMoves);
      //Evolutions

      //Need to create better logic first

      //Hundos
      let cpm = util.cpMultiplier;

      function getCP(level, atk, def, sta) {
        let cp = Math.floor((parseInt(15) + parseInt(atk)) * ((Math.sqrt(parseInt(15) + parseInt(def)))) * ((Math.sqrt(parseInt(15) + parseInt(sta)))) * (((cpm[level]) * (cpm[level])) / 10));
        return cp;
      }
      let level15 = getCP(15, monData.stats.baseAttack, monData.stats.baseDefense, monData.stats.baseStamina);
      let level20 = getCP(20, monData.stats.baseAttack, monData.stats.baseDefense, monData.stats.baseStamina);
      let level25 = getCP(25, monData.stats.baseAttack, monData.stats.baseDefense, monData.stats.baseStamina);
      let level30 = getCP(30, monData.stats.baseAttack, monData.stats.baseDefense, monData.stats.baseStamina);
      let level40 = getCP(40, monData.stats.baseAttack, monData.stats.baseDefense, monData.stats.baseStamina);
      let level50 = getCP(50, monData.stats.baseAttack, monData.stats.baseDefense, monData.stats.baseStamina);
      description.push(`💯:\n- ${locale.level} 15 @ ${level15} ${locale.cp}\n- ${locale.level} 20 @ ${level20} ${locale.cp}\n- ${locale.level} 25 @ ${level25} ${locale.cp}\n- ${locale.level} 30 @ ${level30} ${locale.cp}\n- ${locale.level} 40 @ ${level40} ${locale.cp}\n- ${locale.level} 50 @ ${level50} ${locale.cp}`);

      //Create embed description
      pokemonEmbed.setDescription(description.join('\n\n'));

      //Create list of forms
      var dropdown = new StringSelectMenuBuilder()
        .setCustomId(`chatot~info~pokemon`)
        .setMaxValues(1)
        .setPlaceholder('Other Forms')
      var actionRow = new ActionRowBuilder();
      let allForms = Object.values(gameData.monsters).filter(monster => monster.id == dexID);
      for (var a = 0; a < allForms.length && a < 25; a++) {
        if (allForms[a]['form']['name'] == 'Normal') continue; //Avoid double posting basic form
        let formMon = locale[allForms[a]['name']] ? locale[allForms[a]['name']] : allForms[a]['name'];
        let formForm = locale[allForms[a]['form']['name']] ? locale[allForms[a]['form']['name']] : allForms[a]['form']['name'];
        dropdown.addOptions({
          label: `${formMon} ${formForm}`,
          value: `${formMon} (${formForm})~${allForms[a]['id']}_${allForms[a]['form']['id']}`.replace(' ()', '')
        });
      }
      actionRow.addComponents(dropdown);
      let msgData = [pokemonEmbed, dropdown.options.length > 1 ? [actionRow] : []]
      return msgData;
    } catch (err) {
      console.log(err);
    }
  }, //End of createInfoEmbed()


  move: async function move(client, interaction, config, util, master, pokemonLists, moveLists, locale) {
    var moveData = {};
    try {
      // [moveNumber, language]
      let commandValues = interaction.options._hoistedOptions[0]['value'].split('~');
      moveData.number = commandValues[0] * 1;
      moveData.language = commandValues[1];
      moveData.name = locale[master.moves[commandValues[0]]['name']] ? locale[master.moves[commandValues[0]]['name']] : master.moves[commandValues[0]]['name'];
      createPokemonAvailability();
    } catch (err) {
      console.log(err);
    }

    async function createPokemonAvailability() {
      moveData.pokemon = [];
      try {
        for (const [dex, monData] of Object.entries(master.pokemon)) {
          //Base form
          let baseMonName = locale[monData.name] ? locale[monData.name] : monData.name;
          if (monData.quickMoves && monData.quickMoves.includes(moveData.number)) {
            moveData.pokemon.push(baseMonName);
            moveData.class = locale['moveQuick'] ? locale['moveQuick'] : defaults['moveQuick'];
          }
          if (monData.chargedMoves && monData.chargedMoves.includes(moveData.number)) {
            moveData.pokemon.push(baseMonName);
            moveData.class = locale['moveCharged'] ? locale['moveCharged'] : defaults['moveCharged'];
          }
          //Other forms
          for (const [form, formData] of Object.entries(monData.forms)) {
            let formName = locale[formData.name] ? locale[formData.name] : formData.name;
            if (formData.quickMoves && formData.quickMoves.includes(moveData.number)) {
              moveData.pokemon.push(`${baseMonName} (${formName})`);
              moveData.class = locale['moveQuick'] ? locale['moveQuick'] : defaults['moveQuick'];
            }
            if (formData.chargedMoves && formData.chargedMoves.includes(moveData.number)) {
              moveData.pokemon.push(`${baseMonName} (${formName})`);
              moveData.class = locale['moveCharged'] ? locale['moveCharged'] : defaults['moveCharged'];
            }
          }
        } //End of i loop
      } catch (err) {
        console.log(err);
      }
      getMoveType();
    } //End of createPokemonAvailability()

    async function getMoveType() {
      try {
        moveData.typeNumber = master.moves[moveData.number]['type'];
        moveData.type = master.types[moveData.typeNumber];
        let moveTypeInfo = util.types[moveData.type];
        moveData.strengths = [];
        for (var s in moveTypeInfo.strengths) {
          let tempType = locale[moveTypeInfo.strengths[s]['typeName']] ? locale[moveTypeInfo.strengths[s]['typeName']] : moveTypeInfo.strengths[s]['typeName'];
          moveData.strengths.push(tempType);
        }
        moveData.weakAgainst = [];
        for (var w in moveTypeInfo.weakAgainst) {
          let tempType = locale[moveTypeInfo.weakAgainst[w]['typeName']] ? locale[moveTypeInfo.weakAgainst[w]['typeName']] : moveTypeInfo.weakAgainst[w]['typeName'];
          moveData.weakAgainst.push(tempType);
        }
        moveData.veryWeakAgainst = [];
        for (var v in moveTypeInfo.veryWeakAgainst) {
          let tempType = locale[moveTypeInfo.veryWeakAgainst[v]['typeName']] ? locale[moveTypeInfo.veryWeakAgainst[v]['typeName']] : moveTypeInfo.veryWeakAgainst[v]['typeName'];
          moveData.veryWeakAgainst.push(tempType);
        }
        //Get weather boost
        moveData.weatherBoosts = [];
        for (const [weatherNumber, weatherData] of Object.entries(master.weather)) {
          if (weatherData.types && weatherData.types.includes(moveData.typeNumber)) {
            moveData.weatherBoosts.push(locale[weatherData.name] ? locale[weatherData.name] : weatherData.name);
          }
        } //End of weather loop
      } catch (err) {
        console.log(err);
      }
      sendMoveInfo();
    } //End of getMoveType()

    async function sendMoveInfo() {
      try {
        var moveEmbed = new EmbedBuilder().setTitle(`${moveData.name} (${moveData.class})`).setColor(util.typeColor[master.types[moveData.typeNumber]]);
        var description = `- **${locale['infoMoveType'] ? locale['infoMoveType'] : defaults['infoMoveType']}:** ${locale[moveData.type] ? locale[moveData.type] : moveData.type}
- **${locale['boostedBy'] ? locale['boostedBy'] : defaults['boostedBy']}:** ${moveData.weatherBoosts.join(', ')}
- **${locale['strongAgainst'] ? locale['strongAgainst'] : defaults['strongAgainst']}:** ${moveData.strengths.join(', ')}
- **${locale['weakAgainst'] ? locale['weakAgainst'] : defaults['weakAgainst']}:** ${moveData.weakAgainst.join(', ')}
- **${locale['veryWeakAgainst'] ? locale['veryWeakAgainst'] : defaults['veryWeakAgainst']}:** ${moveData.veryWeakAgainst.join(', ')}
- **${locale['pokemonAvailability'] ? locale['pokemonAvailability'] : defaults['pokemonAvailability']}:** 
   - ${moveData.pokemon.join('\n  - ')}`;
        moveEmbed.setDescription(description);
        await interaction.editReply({
          embeds: [moveEmbed]
        }).catch(console.error);
      } catch (err) {
        console.log(err);
      }
    } //End of sendMoveInfo()
  }, //End of move()
}