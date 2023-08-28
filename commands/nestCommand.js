const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Nest = require('../functions/nest.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.nestCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.nestCommand ? localizations.nestCommand : {})
		.setDescription(defaults.nestDescription)
		.setDescriptionLocalizations(localizations.nestDescription)
		.addStringOption(option =>
			//Nesting Pokemon
			option.setName(defaults.pokemonName)
			.setNameLocalizations(localizations.pokemonName)
			.setDescription(defaults.pokemonDescription)
			.setDescriptionLocalizations(localizations.pokemonDescription)
			.setRequired(true)
			.setAutocomplete(true))
		//Min Average
		.addIntegerOption(option =>
			option.setName(defaults.nestAverageName)
			.setNameLocalizations(localizations.nestAverageName)
			.setDescription(defaults.nestAverageDescription)
			.setDescriptionLocalizations(localizations.nestAverageDescription)
			.setMinValue(0))
		//Max Distance
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
		Nest.verifyNest(client, interaction, util, locale);
	}, //End of execute()
};