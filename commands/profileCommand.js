const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Profile = require('../functions/profile.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.profileCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Profile Configuration`)
		.addSubcommand(subcommand =>
			subcommand
			.setName('change')
			.setDescription('Change Active Profile')),


	async execute(client, interaction, config, util) {
		await interaction.deferReply();
		Profile.showAvailableProfiles(client, interaction, config, util);
	}, //End of execute()
};