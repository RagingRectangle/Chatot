const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Incident = require('../functions/incident.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.incidentCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Add Incident Alert`)
		.addStringOption(option =>
			option.setName('type')
			.setDescription(`Enter leader or grunt type`)
			.setRequired(true)
			.setAutocomplete(true))
		.addIntegerOption(option =>
			option.setName('distance')
			.setDescription(`Distance away in meters`)
			.setMinValue(0)
			.setMaxValue(config.maxDistance))
		.addBooleanOption(option =>
			option.setName('clean')
			.setDescription('Auto delete after expiration'))
		.addStringOption(option =>
			option.setName('template')
			.setDescription(`Optional template name`)
			.setAutocomplete(true)),


	async execute(client, interaction) {
		await interaction.deferReply();
		Incident.verifyIncident(client, interaction);
	}, //End of execute()
};