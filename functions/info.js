const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');
const defaults = require('../locale/custom/default.json');

module.exports = {
  //pokemon: async function pokemon(client, interaction, config, util, master, pokemonLists, moveLists, locale, gameData) {
  //  let monData = interaction.options._hoistedOptions[0]['value'].split('~');
  //  let monName = monData[0];
  //  let dexForm = monData[1];
  //  var pokemonEmbed = new EmbedBuilder().setTitle()

  //}, //End of pokemon()


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
        var description = `- **${locale['moveType'] ? locale['moveType'] : defaults['moveType']}:** ${locale[moveData.type] ? locale[moveData.type] : moveData.type}
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