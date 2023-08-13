const {
	SlashCommandBuilder
} = require('discord.js');
const config = require('../config.json');
const Track = require('../functions/track.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.pokemonCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Set Pokemon spawn filters`)
		.addStringOption(option =>
			option.setName('pokemon')
			.setDescription(`Enter Pokemon name`)
			.setRequired(true)
			.setAutocomplete(true))

		.addIntegerOption(option =>
			option.setName('min_iv')
			.setDescription(`Set minimum IV`)
			.setMinValue(0)
			.setMaxValue(100))

		.addIntegerOption(option =>
			option.setName('max_iv')
			.setDescription(`Set maximum IV`)
			.setMinValue(0)
			.setMaxValue(100))

		.addIntegerOption(option =>
			option.setName('min_atk')
			.setDescription(`Minimum attack`)
			.setMinValue(0)
			.setMaxValue(15))

		.addIntegerOption(option =>
			option.setName('max_atk')
			.setDescription(`Maximum attack`)
			.setMinValue(0)
			.setMaxValue(15))

		.addIntegerOption(option =>
			option.setName('min_def')
			.setDescription(`Minimum defense`)
			.setMinValue(0)
			.setMaxValue(15))

		.addIntegerOption(option =>
			option.setName('max_def')
			.setDescription(`Maximum defense`)
			.setMinValue(0)
			.setMaxValue(15))

		.addIntegerOption(option =>
			option.setName('min_sta')
			.setDescription(`Minimum stamina`)
			.setMinValue(0)
			.setMaxValue(15))

		.addIntegerOption(option =>
			option.setName('max_sta')
			.setDescription(`Maximum stamina`)
			.setMinValue(0)
			.setMaxValue(15))

		.addIntegerOption(option =>
			option.setName('min_cp')
			.setDescription(`Minimum CP`)
			.setMinValue(0))

		.addIntegerOption(option =>
			option.setName('max_cp')
			.setDescription(`Maximum CP`)
			.setMinValue(10))

		.addIntegerOption(option =>
			option.setName('min_level')
			.setDescription(`Minimum level`)
			.setMinValue(1)
			.setMaxValue(50))

		.addIntegerOption(option =>
			option.setName('max_level')
			.setDescription(`Maximum level`)
			.setMinValue(1)
			.setMaxValue(50))

		.addStringOption(option =>
			option.setName('size')
			.setDescription('Select size')
			.addChoices({
				name: 'all',
				value: 'all'
			}, {
				name: 'xxs',
				value: 'xxs'
			}, {
				name: 'xs',
				value: 'xs'
			}, {
				name: 'm',
				value: 'm'
			}, {
				name: 'xl',
				value: 'xl'
			}, {
				name: 'xxl',
				value: 'xxl'
			}))

		.addIntegerOption(option =>
			option.setName('distance')
			.setDescription(`Distance away in meters`)
			.setMinValue(0)
			.setMaxValue(config.maxDistance))

		.addStringOption(option =>
			option.setName('gender')
			.setDescription('Select gender')
			.addChoices({
				name: 'All',
				value: 'all'
			}, {
				name: 'Male',
				value: 'male'
			}, {
				name: 'Female',
				value: 'female'
			}))

		.addStringOption(option =>
			option.setName('pvp_league')
			.setDescription('Select pvp league (pvp_ranks required)')
			.addChoices({
				name: 'little',
				value: 'little'
			}, {
				name: 'great',
				value: 'great'
			}, {
				name: 'ultra',
				value: 'ultra'
			}))
			
		.addIntegerOption(option =>
				option.setName('pvp_ranks')
				.setDescription(`Set number of pvp ranks (pvp_league required)`)
				.setMinValue(0)
				.setMaxValue(config.pvpFilterMaxRank))

		.addIntegerOption(option =>
			option.setName('min_time')
			.setDescription(`Minimum time left in seconds`))

		.addBooleanOption(option =>
			option.setName('clean')
			.setDescription('Auto delete after despawn'))

		.addStringOption(option =>
			option.setName('template')
			.setDescription(`Optional template name`)
			.setAutocomplete(true)),


	async execute(client, interaction) {
		Track.verifyTrackCommand(client, interaction);
	}, //End of execute()
};