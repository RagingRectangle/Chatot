const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Lure = require('../functions/lure.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.lureCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.lureCommand ? localizations.lureCommand : {})
		.setDescription(defaults.lureDescription)
		.setDescriptionLocalizations(localizations.lureDescription)
		.addStringOption(option =>
			//Lure Type
			option.setName(defaults.lureTypeName)
			.setNameLocalizations(localizations.lureTypeName)
			.setDescription(defaults.lureTypeDescription)
			.setDescriptionLocalizations(localizations.lureTypeDescription)
			.setRequired(true)
			.addChoices({
				name: defaults.lureStandard,
				name_localizations: localizations.lureStandard,
				value: "501"
			}, {
				name: defaults.lureGlacial,
				name_localizations: localizations.lureGlacial,
				value: "502"
			}, {
				name: defaults.lureMagnetic,
				name_localizations: localizations.lureMagnetic,
				value: "504"
			}, {
				name: defaults.lureMossy,
				name_localizations: localizations.lureMossy,
				value: "503"
			}, {
				name: defaults.lureRainy,
				name_localizations: localizations.lureRainy,
				value: "505"
			}, {
				name: defaults.lureGolden,
				name_localizations: localizations.lureGolden,
				value: "506"
			}))
		//Max Distance
		.addIntegerOption(option =>
			option.setName(defaults.distanceName)
			.setNameLocalizations(localizations.distanceName)
			.setDescription(defaults.distanceDescription)
			.setDescriptionLocalizations(localizations.distanceDescription)
			.setMinValue(0)
			.setMaxValue(config.maxDistance != 0 ? config.maxDistance : 999999))
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
		Lure.verifyLure(client, interaction, util, locale);
	}, //End of execute()
};