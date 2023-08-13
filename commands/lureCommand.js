const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Lure = require('../functions/lure.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.lureCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Add Lure Alert`)
		.addStringOption(option =>
			option.setName('type')
			.setDescription(`Select lure type`)
			.setRequired(true)
			.addChoices({
				name: 'basic',
				value: 'basic'
			}, {
				name: 'glacial',
				value: 'glacial'
			}, {
				name: 'mossy',
				value: 'mossy'
			}, {
				name: 'magnetic',
				value: 'magnetic'
			}, {
				name: 'rainy',
				value: 'rainy'
			}, {
				name: 'golden',
				value: 'golden'
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
		Lure.verifyLure(client, interaction);
	}, //End of execute()
};