const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Quest = require('../functions/quest.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.questCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Add Quest Alert`)
		.addStringOption(option =>
			option.setName('type')
			.setDescription(`Enter Pokemon or item`)
			.setRequired(true)
			.setAutocomplete(true))
		.addIntegerOption(option =>
			option.setName('min_amount')
			.setDescription(`Optional minimum value for items only`)
			.setMinValue(0))
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
		Quest.verifyQuest(client, interaction);
	}, //End of execute()
};