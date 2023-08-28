const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Remove = require('../functions/remove.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.removeCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.removeCommand ? localizations.removeCommand : {})
		.setDescription(defaults.removeDescription)
		.setDescriptionLocalizations(localizations.removeDescription)
		//Tracking type
		.addStringOption(option =>
			option.setName(defaults.removeTypeName)
			.setNameLocalizations(localizations.removeTypeName)
			.setDescription(defaults.removeTypeDescription)
			.setDescriptionLocalizations(localizations.removeTypeDescription)
			.setRequired(true)
			.addChoices({
				name: config.pokemonCommand,
				name_localizations: localizations.pokemonName,
				value: config.pokemonCommand
			}, {
				name: config.raidCommand,
				name_localizations: localizations.raidCommand,
				value: config.raidCommand
			}, {
				name: config.incidentCommand,
				name_localizations: localizations.incidentCommand,
				value: config.incidentCommand
			}, {
				name: config.questCommand,
				name_localizations: localizations.questCommand,
				value: config.questCommand
			}, {
				name: config.lureCommand,
				name_localizations: localizations.lureCommand,
				value: config.lureCommand
			}, {
				name: config.nestCommand,
				name_localizations: localizations.nestCommand,
				value: config.nestCommand
			}))
		//Tracking entry
		.addStringOption(option =>
			option.setName(defaults.removeAlertName)
			.setNameLocalizations(localizations.removeAlertName)
			.setDescription(defaults.removeAlertDescription)
			.setDescriptionLocalizations(localizations.removeAlertDescription)
			.setRequired(true)
			.setAutocomplete(true)),


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo) {
		await interaction.deferReply();
		Remove.verifyRemove(client, interaction, config, util, pokemonLists, locale, humanInfo);
	}, //End of execute()
};