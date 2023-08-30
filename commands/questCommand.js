const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Quest = require('../functions/quest.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.questCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.questCommand ? localizations.questCommand : {})
		.setDescription(defaults.questDescription)
		.setDescriptionLocalizations(localizations.questDescription)
		//Quest type
		.addStringOption(option =>
			option.setName(defaults.questTypeName)
			.setNameLocalizations(localizations.questTypeName)
			.setDescription(defaults.questTypeDescription)
			.setDescriptionLocalizations(localizations.questTypeDescription)
			.setRequired(true)
			.setAutocomplete(true))
		//Min amount
		.addIntegerOption(option =>
			option.setName(defaults.questMinAmountName)
			.setNameLocalizations(localizations.questMinAmountName)
			.setDescription(defaults.questMinAmountDescription)
			.setDescriptionLocalizations(localizations.questMinAmountDescription)
			.setMinValue(0))
		//Max distance
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


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo, incidentLists, raidLists, questLists) {
		await interaction.deferReply();
		Quest.verifyQuest(client, interaction, config, locale, humanInfo, questLists);
	}, //End of execute()
};