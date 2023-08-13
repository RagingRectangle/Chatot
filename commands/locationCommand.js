const {
	EmbedBuilder,
	SlashCommandBuilder
} = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const Location = require('../functions/location.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.locationCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Set 'home' location`)
		.addStringOption(option =>
			option.setName('coordinates')
			.setDescription(`latitude, longitude`)
			.setRequired(true)),


	async execute(client, interaction, config, util) {
		await interaction.deferReply({
			ephemeral: true
		});
		Location.addLocation(client, interaction, config, util);
	}, //End of execute()
};