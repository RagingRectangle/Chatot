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
  - Nests
  - Raids
- Add/remove areas
- View area outlines
- Set location
- Change profile
- Remove individual alerts
- Full customization of Discord command names/text
- Localized user translations based on Poracle/Discord languages
- Only for user alerts (Channels not supported)


## Requirements
1: [PoracleJS](https://github.com/KartulUdus/PoracleJS)


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
 - **host:** IP address
 - **port:** Port
 - **database:** Poracle database info

- **ignoreTemplates:** List names of any templates you don't want to appear as options.
- **xxxCommand:** Slash command names. Use only lowercase. Leave blank if you don't want to include it.


## Basic/English Translations
- Copy default to local override file:
```
cd locale/custom/
cp default.json local.json
```
- Edit *local.json* to create new default Discord commands/texts.
- _NOTE:_ Any key name ending with "..Name" __cannot__ include uppercase/spaces. [More details.](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming)
- Optional: The source of most game related texts can be found [here](https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/static/enRefMerged/en.json). Override by manually adding any keys to *local.json*.


## Localized Translations
- Most game related texts translated based on the user's language set in Poracle.
- Languages: de, es, fr, hi, id, it, ja, ko, pl, pt-br, ru, sv, th, tr, zh-tw
- To create translation from scratch (de/German):
```
cd locale/custom/
cp default.json de.json
```
- To start with a ChatGPT translated sample (de/German):
```
cd locale/custom/
cp ./examples/de.json de.json
```
- Please create a PR if there are any bad translations to help the rest of the community. (Thank you petap0w for translating French)
- _NOTE:_ Any key name ending with "..Name" __cannot__ include uppercase/spaces. [More details.](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming)
- Optional: The source of most game related texts can be found [here](https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/static/enRefMerged/en.json). Override by manually adding any keys to translation file.
- Optional: The base Discord commands in *config.json* (*lureCommand*, *raidCommand*, *etc*) can be manually added to any custom translations files.
- Optional: Create overrides with *local.json*. More info above.
- Custom language translations will override anything added in *local.json*.
- Command names/texts are based on the user's language set in the Discord app.

## Usage
- Start the bot in a console with `node chatot.js`
- Can (*should*) use PM2 to run instead with `pm2 start chatot.js`
- All commands should be done in DMs with the bot.


Adding Pokemon:

![AddingPokemon](https://i.imgur.com/K4LtGPo.gif)


Removing Pokemon:

![RemovingPokemon](https://i.imgur.com/69r08Hr.gif)