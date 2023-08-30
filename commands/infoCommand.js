const {
	EmbedBuilder,
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Info = require('../functions/info.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.infoCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.infoCommand ? localizations.infoCommand : {})
		.setDescription(defaults.infoDescription)
		.setDescriptionLocalizations(localizations.infoDescription)
		//.addSubcommand(subcommand =>
		//	subcommand
		//	.setName(defaults.pokemonName)
		//	.setNameLocalizations(localizations.pokemonName)
		//	.setDescription(defaults.pokemonDescription)
		//	.setDescriptionLocalizations(localizations.pokemonDescription)
		//	.addStringOption(option =>
		//		option.setName(defaults.pokemonName)
		//		.setNameLocalizations(localizations.pokemonName)
		//		.setDescription(defaults.pokemonDescription)
		//		.setDescriptionLocalizations(localizations.pokemonDescription)
		//		.setRequired(true)
		//		.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
			.setName(defaults.infoMoveName)
			.setNameLocalizations(localizations.infoMoveName)
			.setDescription(defaults.infoMoveDescription)
			.setDescriptionLocalizations(localizations.infoMoveDescription)
			.addStringOption(option =>
				option.setName(defaults.infoMoveName)
				.setNameLocalizations(localizations.infoMoveName)
				.setDescription(defaults.infoMoveDescription)
				.setDescriptionLocalizations(localizations.infoMoveDescription)
				.setRequired(true)
				.setAutocomplete(true))),


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo, incidentLists, raidLists, questLists, gameData) {
		await interaction.deferReply();
		if (interaction.options._subcommand == defaults.pokemonName) {
			Info.pokemon(client, interaction, config, util, master, pokemonLists, moveLists, locale, gameData);
		} else if (interaction.options._subcommand == defaults.infoMoveName) {
			Info.move(client, interaction, config, util, master, pokemonLists, moveLists, locale, gameData);
		}
	}, //End of execute()
};