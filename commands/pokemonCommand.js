const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Pokemon = require('../functions/pokemon.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.pokemonCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.pokemonCommand ? localizations.pokemonCommand : {})
		.setDescription(defaults.trackPokemonDescription)
		.setDescriptionLocalizations(localizations.trackPokemonDescription)
		//Pokemon
		.addStringOption(option =>
			option.setName(defaults.pokemonName)
			.setNameLocalizations(localizations.pokemonName)
			.setDescription(defaults.pokemonDescription)
			.setDescriptionLocalizations(localizations.pokemonDescription)
			.setRequired(true)
			.setAutocomplete(true))
		//Min IV
		.addIntegerOption(option =>
			option.setName(defaults.minIvName)
			.setNameLocalizations(localizations.minIvName)
			.setDescription(defaults.minIvDescription)
			.setDescriptionLocalizations(localizations.minIvDescription)
			.setMinValue(0)
			.setMaxValue(100))
		//Max IV
		.addIntegerOption(option =>
			option.setName(defaults.maxIvName)
			.setNameLocalizations(localizations.maxIvName)
			.setDescription(defaults.maxIvDescription)
			.setDescriptionLocalizations(localizations.maxIvDescription)
			.setMinValue(0)
			.setMaxValue(100))
		//Min Atk
		.addIntegerOption(option =>
			option.setName(defaults.minAtkName)
			.setNameLocalizations(localizations.minAtkName)
			.setDescription(defaults.minAtkDescription)
			.setDescriptionLocalizations(localizations.minAtkDescription)
			.setMinValue(0)
			.setMaxValue(15))
		//Max Atk
		.addIntegerOption(option =>
			option.setName(defaults.maxAtkName)
			.setNameLocalizations(localizations.maxAtkName)
			.setDescription(defaults.maxAtkDescription)
			.setDescriptionLocalizations(localizations.maxAtkDescription)
			.setMinValue(0)
			.setMaxValue(15))
		//Min Def
		.addIntegerOption(option =>
			option.setName(defaults.minDefName)
			.setNameLocalizations(localizations.minDefName)
			.setDescription(defaults.minDefDescription)
			.setDescriptionLocalizations(localizations.minDefDescription)
			.setMinValue(0)
			.setMaxValue(15))
		//Max Def
		.addIntegerOption(option =>
			option.setName(defaults.maxDefName)
			.setNameLocalizations(localizations.maxDefName)
			.setDescription(defaults.maxDefDescription)
			.setDescriptionLocalizations(localizations.maxDefDescription)
			.setMinValue(0)
			.setMaxValue(15))
		//Min Sta
		.addIntegerOption(option =>
			option.setName(defaults.minStaName)
			.setNameLocalizations(localizations.minStaName)
			.setDescription(defaults.minStaDescription)
			.setDescriptionLocalizations(localizations.minStaDescription)
			.setMinValue(0)
			.setMaxValue(15))
		//Max Sta
		.addIntegerOption(option =>
			option.setName(defaults.maxStaName)
			.setNameLocalizations(localizations.maxStaName)
			.setDescription(defaults.maxStaDescription)
			.setDescriptionLocalizations(localizations.maxStaDescription)
			.setMinValue(0)
			.setMaxValue(15))
		//Min CP
		.addIntegerOption(option =>
			option.setName(defaults.minCpName)
			.setNameLocalizations(localizations.minCpName)
			.setDescription(defaults.minCpDescription)
			.setDescriptionLocalizations(localizations.minCpDescription)
			.setMinValue(0))
		//Max CP
		.addIntegerOption(option =>
			option.setName(defaults.maxCpName)
			.setNameLocalizations(localizations.maxCpName)
			.setDescription(defaults.maxCpDescription)
			.setDescriptionLocalizations(localizations.maxCpDescription)
			.setMinValue(10))
		//Min Level
		.addIntegerOption(option =>
			option.setName(defaults.minLevelName)
			.setNameLocalizations(localizations.minLevelName)
			.setDescription(defaults.minLevelDescription)
			.setDescriptionLocalizations(localizations.minLevelDescription)
			.setMinValue(1)
			.setMaxValue(50))
		//Max Level
		.addIntegerOption(option =>
			option.setName(defaults.maxLevelName)
			.setNameLocalizations(localizations.maxLevelName)
			.setDescription(defaults.maxLevelDescription)
			.setDescriptionLocalizations(localizations.maxLevelDescription)
			.setMinValue(1)
			.setMaxValue(50))
		//Size
		.addStringOption(option =>
			option.setName(defaults.sizeName)
			.setNameLocalizations(localizations.sizeName)
			.setDescription(defaults.sizeDescription)
			.setDescriptionLocalizations(localizations.sizeDescription)
			.addChoices({
				name: defaults.sizeAll,
				name_localizations: localizations.sizeAll,
				value: defaults.sizeAll
			}, {
				name: defaults.sizeXxs,
				name_localizations: localizations.sizeXxs,
				value: defaults.sizeXxs
			}, {
				name: defaults.sizeXs,
				name_localizations: localizations.sizeXs,
				value: defaults.sizeXs
			}, {
				name: defaults.sizeM,
				name_localizations: localizations.sizeM,
				value: defaults.sizeM
			}, {
				name: defaults.sizeXl,
				name_localizations: localizations.sizeXl,
				value: defaults.sizeXl
			}, {
				name: defaults.sizeXxl,
				name_localizations: localizations.sizeXxl,
				value: defaults.sizeXxl
			}))
		//Gender
		.addStringOption(option =>
			option.setName(defaults.genderName)
			.setNameLocalizations(localizations.genderName)
			.setDescription(defaults.genderDescription)
			.setDescriptionLocalizations(localizations.genderDescription)
			.addChoices({
				name: defaults.genderAll,
				name_localizations: localizations.genderAll,
				value: defaults.genderAll
			}, {
				name: defaults.genderMale,
				name_localizations: localizations.genderMale,
				value: defaults.genderMale
			}, {
				name: defaults.genderFemale,
				name_localizations: localizations.genderFemale,
				value: defaults.genderFemale
			}))
		//PvP League
		.addStringOption(option =>
			option.setName(defaults.pvpLeagueName)
			.setNameLocalizations(localizations.pvpLeagueName)
			.setDescription(defaults.pvpLeagueDescription)
			.setDescriptionLocalizations(localizations.pvpLeagueDescription)
			.addChoices({
				name: defaults.littleLeague,
				name_localizations: localizations.littleLeague,
				value: defaults.littleLeague
			}, {
				name: defaults.greatLeague,
				name_localizations: localizations.greatLeague,
				value: defaults.greatLeague
			}, {
				name: defaults.ultraLeague,
				name_localizations: localizations.ultraLeague,
				value: defaults.ultraLeague
			}))
		//PvP Rank
		.addIntegerOption(option =>
			option.setName(defaults.pvpRankName)
			.setNameLocalizations(localizations.pvpRankName)
			.setDescription(defaults.pvpRankDescription)
			.setDescriptionLocalizations(localizations.pvpRankDescription)
			.setMinValue(0)
			.setMaxValue(config.pvpFilterMaxRank))
		//Min Time
		.addIntegerOption(option =>
			option.setName(defaults.minTimeName)
			.setNameLocalizations(localizations.minTimeName)
			.setDescription(defaults.minTimeDescription)
			.setDescriptionLocalizations(localizations.minTimeDescription))
		//Distance
		.addIntegerOption(option =>
			option.setName(defaults.distanceName)
			.setNameLocalizations(localizations.distanceName)
			.setDescription(defaults.distanceDescription)
			.setDescriptionLocalizations(localizations.distanceDescription)
			.setMinValue(0)
			.setMaxValue(config.maxDistance))
		//Clean
		.addBooleanOption(option =>
			option.setName(defaults.cleanName)
			.setNameLocalizations(localizations.cleanName)
			.setDescription(defaults.cleanDescription)
			.setDescriptionLocalizations(localizations.cleanDescription))
		//Template
		.addStringOption(option =>
			option.setName(defaults.templateName)
			.setNameLocalizations(localizations.templateName)
			.setDescription(defaults.templateDescription)
			.setDescriptionLocalizations(localizations.templateDescription)
			.setAutocomplete(true)),


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo) {
		await interaction.deferReply();
		Pokemon.verifyPokemonCommand(client, interaction, config, util, locale, humanInfo, pokemonLists);
	}, //End of execute()
};