const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Permissions,
  ActionRowBuilder,
  SelectMenuBuilder,
  MessageButton,
  EmbedBuilder,
  ButtonBuilder,
  InteractionType,
  ChannelType
} = require('discord.js');
const fs = require('fs');

module.exports = {
  registerCommands: async function registerCommands(client, config) {
    var commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    var finalCommands = [];
    const {
      REST
    } = require('@discordjs/rest');
    const {
      Routes
    } = require('discord-api-types/v10');
    for (const file of commandFiles) {
      if (config[file.replace('.js', '')]) {
        const command = require(`../commands/${file}`);
        try {
          commands.push(command.data.toJSON());
          finalCommands.push(file);
        } catch (err) {
          console.log(err);
        }
      }
    }
    const rest = new REST({
      version: '10'
    }).setToken(config.token);
    await rest.put(
        Routes.applicationCommands(client.user.id), {
          body: commands
        },
      ).then(() => console.log(`Registered Chatot commands`))
      .catch(console.error);

    client.commands = new Collection();
    for (const file of finalCommands) {
      const command = require(`../commands/${file}`);
      client.commands.set(command.data.name, command);
    }
  } //End of registerCommands()
}