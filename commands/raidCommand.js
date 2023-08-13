const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Raid = require('../functions/raid.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.raidCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Add Raid Alert`)
		.addStringOption(option =>
			option.setName('type')
			.setDescription(`Enter level or Pokemon`)
			.setRequired(true)
			.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('team')
			.setDescription(`Select controlling team`)
			.addChoices({
				name: 'All',
				value: 'Blue'
			}, {
				name: 'Blue',
				value: 'Blue'
			}, {
				name: 'Red',
				value: 'Red'
			}, {
				name: 'Yellow',
				value: 'Yellow'
			}, {
				name: 'White',
				value: 'White'
			}))
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
		Raid.verifyRaid(client, interaction);
	}, //End of execute()
};