const {
	EmbedBuilder,
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Area = require('../functions/area.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.areaCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Edit/Show Areas`)
		.addSubcommand(subcommand =>
			subcommand
			.setName('edit')
			.setDescription('Add/Remove Areas'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('show')
			.setDescription('Show Area Outlines')),


	async execute(client, interaction, config, util) {
		await interaction.deferReply();
		if (interaction.options._subcommand == 'edit') {
			Area.getAvailabeAreas(client, interaction, config, util, 'edit');
		} else if (interaction.options._subcommand == 'show') {
			Area.getAvailabeAreas(client, interaction, config, util, 'show');
		}
	}, //End of execute()
};