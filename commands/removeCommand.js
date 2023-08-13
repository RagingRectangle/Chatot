const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Remove = require('../functions/remove.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.removeCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Delete custom trackings`)
		.addStringOption(option =>
			option.setName('type')
			.setDescription(`Select tracking type`)
			.setRequired(true)
			.addChoices({
				name: 'pokemon',
				value: 'pokemon'
			}, {
				name: 'raid',
				value: 'raid'
			}, {
				name: 'incident',
				value: 'incident'
			}, {
				name: 'quest',
				value: 'quest'
			}, {
				name: 'lure',
				value: 'lure'
			}))
		.addStringOption(option =>
			option.setName('tracking')
			.setDescription(`Select tracking to remove`)
			.setRequired(true)
			.setAutocomplete(true)),


	async execute(client, interaction) {
		await interaction.deferReply();
		Remove.verifyRemove(client, interaction);
	}, //End of execute()
};