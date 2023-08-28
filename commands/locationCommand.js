const {
	EmbedBuilder,
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Location = require('../functions/location.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.locationCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.locationCommand ? localizations.locationCommand : {})
		.setDescription(defaults.locationDescription)
		.setDescriptionLocalizations(localizations.locationDescription)
		.addStringOption(option =>
			option.setName(defaults.locationCoordName)
			.setNameLocalizations(localizations.locationCoordName)
			.setDescription(defaults.locationCoordDescription)
			.setDescriptionLocalizations(localizations.locationCoordDescription)
			.setRequired(true)),


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo) {
		await interaction.deferReply({
			ephemeral: true
		});
		Location.addLocation(client, interaction, config, util, locale);
	}, //End of execute()
};