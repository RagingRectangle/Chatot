const {
	EmbedBuilder,
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Info = require('../functions/info.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.infoCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Get more information`)
		//.addSubcommand(subcommand =>
		//	subcommand
		//	.setName('pokemon')
		//	.setDescription('Details about Pokemon')
		//	.addStringOption(option =>
		//		option.setName('name')
		//		.setDescription(`Enter Pokemon name`)
		//		.setRequired(true)
		//		.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
			.setName('move')
			.setDescription('Details about moves')
			.addStringOption(option =>
				option.setName('name')
				.setDescription(`Enter move name`)
				.setRequired(true)
				.setAutocomplete(true))),


	async execute(client, interaction, config, util, master, pokemonLists, moveLists) {
		await interaction.deferReply();
		if (interaction.options._subcommand == 'pokemon') {
			Info.pokemon(client, interaction, config, util, master, pokemonLists, moveLists);
		} else if (interaction.options._subcommand == 'move') {
			Info.move(client, interaction, config, util, master, pokemonLists, moveLists);
		}
	}, //End of execute()
};