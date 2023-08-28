const {
  EmbedBuilder,
} = require('discord.js');
const superagent = require('superagent');

module.exports = {
  addLocation: async function addLocation(client, interaction, config, util, locale) {
    try {
      let latLon = interaction.options.getString('coordinates').replace(', ', ' ').replace(',', ' ').replaceAll('  ', ' ').split(' ');
      let lat = latLon[0] * 1;
      let lon = latLon[1] * 1;
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        locationApi(lat, lon);
      }
    } catch (err) {
      console.log("Error adding new location:", err);
    }

    async function locationApi(lat, lon) {
      superagent
        .post(util.api.addLocation.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{id}}', interaction.user.id).replace('{{lat}}', lat).replace('{{lon}}', lon))
        .set('X-Poracle-Secret', config.poracle.secret)
        .set('accept', 'application/json')
        .end((error, response) => {
          if (error) {
            console.log('Api error:', error);
          } else {
            showNewLocation(lat, lon);
          }
        });
    } //End of locationApi()

    async function showNewLocation(lat, lon) {
      superagent
        .get(util.api.showLocation.replace('{{host}}', config.poracle.host).replace('{{port}}', config.poracle.port).replace('{{lat}}', lat).replace('{{lon}}', lon))
        .set('X-Poracle-Secret', config.poracle.secret)
        .set('accept', 'application/json')
        .end(async (error, response) => {
          if (error) {
            console.log('Api error:', error);
          } else if (response['_body']['url']) {
            let locationEmbed = new EmbedBuilder().setTitle(locale.locationNew).setImage(response['_body']['url']);
            await interaction.editReply({
              embeds: [locationEmbed],
              ephemeral: true
            }).catch(console.error);
          }
        });
    } //End of showNewLocation()
  }, //End of addLocation()
}