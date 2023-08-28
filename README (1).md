# Chatot

## About
A Discord bot for adding slash commands to PoracleJS.

Join the Discord server for any help and to keep up with updates: https://discord.gg/USxvyB9QTz


**Current Features:**

- Add custom alerts for:
  - Pokemon
  - Incidents
  - Lures
  - Quests
  - Raids (Specfic forms currently don't work with api)
- Add/remove areas
- View area outlines
- Set location
- Change profile
- Remove individual alerts
- Only English is currently supported
- Only for user alerts (Channels not supported)


   
## Requirements
- [PoracleJS](https://github.com/KartulUdus/PoracleJS)
  
## Installation

### Running Chatot locally

Run the following commands and it should run by itself:

```
git clone https://github.com/RagingRectangle/Chatot.git
cd Chatot
cp -r config.json.example config.json
npm install
```

### Using Docker

You can create a container inside your poracle-setup to make sure that the database is reachable.

```
git clone https://github.com/RagingRectangle/Chatot.git &&
cd Chatot &&
cp -r config.json.example config.json
```

Fill out config.json and copy/paste the contents from `docker-compose.yml.example` inside of your compose-file where PoracleJS is in and run:

```
docker-compose up chatot
```

## Config Setup
- **token:** Discord token used for Poracle bot.
Poracle:
 - **secret:** apiSecret
 - **host:** IP address *(**Note:** when using Docker, you can use the containername)*
 - **port:** Port
 - **database:** Poracle database info

- **ignoreTemplates:** List names of any templates you don't want to appear as options.
- **xxxCommand:** Slash command names. Leave blank if you don't want to include it.
- **EverythingElse:** Just a placeholder, will be filled out with api.

## Usage
- Start the bot in a console with `node chatot.js`
- Can (*should*) use PM2 to run instead with `pm2 start chatot.js`
- All commands should be done in DMs with the bot.

## Updates

In terminal, run `git pull` to get the latest updates. When using Docker, and after pulling from GitHub run the following:

```
docker-compose down chatot
docker rm chatot
docker-compose build chatot
docker-compose up chatot
```

Adding Pokemon:

![AddingPokemon](https://i.imgur.com/K4LtGPo.gif)


Removing Pokemon:

![RemovingPokemon](https://i.imgur.com/69r08Hr.gif)