const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Incident = require('../functions/incident.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.incidentCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.incidentCommand ? localizations.incidentCommand : {})
		.setDescription(defaults.incidentDescription)
		.setDescriptionLocalizations(localizations.incidentDescription)
		//Incident Type
		.addStringOption(option =>
			option.setName(defaults.incidentTypeName)
			.setNameLocalizations(localizations.incidentTypeName)
			.setDescription(defaults.incidentTypeDescription)
			.setDescriptionLocalizations(localizations.incidentTypeDescription)
			.setRequired(true)
			.setAutocomplete(true))
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


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo, incidentLists) {
		await interaction.deferReply();
		Incident.verifyIncident(client, interaction, incidentLists, locale, humanInfo);
	}, //End of execute()
};