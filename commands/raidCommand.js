const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Raid = require('../functions/raid.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.raidCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.raidCommand ? localizations.raidCommand : {})
		.setDescription(defaults.raidDescription)
		.setDescriptionLocalizations(localizations.raidDescription)
		//Raid type
		.addStringOption(option =>
			option.setName(defaults.raidTypeName)
			.setNameLocalizations(localizations.raidTypeName)
			.setDescription(defaults.raidTypeDescription)
			.setDescriptionLocalizations(localizations.raidTypeDescription)
			.setRequired(true)
			.setAutocomplete(true))
		//Gym
		.addStringOption(option =>
			option.setName(defaults.gymName)
			.setNameLocalizations(localizations.gymName)
			.setDescription(defaults.gymDescription)
			.setDescriptionLocalizations(localizations.gymDescription)
			.setAutocomplete(true))
		//Team
		.addStringOption(option =>
			option.setName(defaults.raidTeamName)
			.setNameLocalizations(localizations.raidTeamName)
			.setDescription(defaults.raidTeamDescription)
			.setDescriptionLocalizations(localizations.raidTeamDescription)
			.addChoices({
				name: defaults.teamAll,
				name_localizations: localizations.teamAll,
				value: '0'
			}, {
				name: defaults.teamBlue,
				name_localizations: localizations.teamBlue,
				value: '1'
			}, {
				name: defaults.teamRed,
				name_localizations: localizations.teamRed,
				value: '2'
			}, {
				name: defaults.teamYellow,
				name_localizations: localizations.teamYellow,
				value: '3'
			}, {
				name: defaults.teamWhite,
				name_localizations: localizations.teamWhite,
				value: '4'
			}))
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


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo, incidentLists, raidLists) {
		await interaction.deferReply();
		Raid.verifyRaid(client, interaction, config, util, locale, humanInfo, raidLists);
	}, //End of execute()
};