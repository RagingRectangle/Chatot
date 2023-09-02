const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Profile = require('../functions/profile.js');
const defaults = require('../locale/custom/default.json');
const localizations = require('../locale/custom/customCommands.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.profileCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setNameLocalizations(localizations.profileCommand ? localizations.profileCommand : {})
		.setDescription(defaults.profileDescription)
		.setDescriptionLocalizations(localizations.profileDescription)
		.addSubcommand(subcommand =>
			subcommand
			.setName(defaults.profileChangeName)
			.setNameLocalizations(localizations.profileChangeName)
			.setDescription(defaults.profileChangeDescription)
			.setDescriptionLocalizations(localizations.profileChangeDescription)),


	async execute(client, interaction, config, util, master, pokemonLists, moveLists, locale, humanInfo) {
		await interaction.deferReply();
		Profile.showAvailableProfiles(client, interaction, config, util, locale, humanInfo);
	}, //End of execute()
};