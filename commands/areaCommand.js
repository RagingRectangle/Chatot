const {
	EmbedBuilder,
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Area = require('../functions/area.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.areaCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.areaCommand ? localizations.areaCommand : {})
		.setDescription(defaults.areaDescription)
		.setDescriptionLocalizations(localizations.areaDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName(defaults.areaEditName)
				.setNameLocalizations(localizations.areaEditName)
				.setDescription(defaults.areaEditDescription)
				.setDescriptionLocalizations(localizations.areaEditDescription))
		.addSubcommand(subcommand =>
			subcommand
				.setName(defaults.areaShowName)
				.setNameLocalizations(localizations.areaShowName)
				.setDescription(defaults.areaShowDescription)
				.setDescriptionLocalizations(localizations.areaShowDescription)),


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo) {
		await interaction.deferReply();
		if (interaction.options._subcommand == defaults.areaEditName) {
			Area.getAvailabeAreas(client, interaction, config, util, locale, humanInfo, 'edit');
		} else if (interaction.options._subcommand == defaults.areaShowName) {
			Area.getAvailabeAreas(client, interaction, config, util, locale, humanInfo, 'show');
		}
	}, //End of execute()
};