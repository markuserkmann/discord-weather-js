const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const axios = require('axios')
const path = require('path');
const { WeatherKey } = require(path.resolve(__dirname, '../../secret.js'));

async function ProcessWeather(data) {
    return new Promise((resolve) => {
    const current = data.currentConditions;
    const currentWeather = {
      temp: current.temp,
      feelslike: current.feelslike,
      conditions: current.conditions,
      windspeed: current.windspeed,
      visibility: current.visibility,
      sunrise: current.sunrise,
      sunset: current.sunset,
    };
  
    const nextTwoDays = data.days.slice(1, 3).map(day => ({
      date: day.datetime,
      tempMax: day.tempmax,
      tempMin: day.tempmin,
      temp: day.temp,
      feelslike: day.feelslike,
      description: day.description
    }));
  
    resolve({
      currentWeather,
      nextTwoDays
    })
    })
}


async function PullInfo() {
    return new Promise((callback)  => {
        axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/tartu?unitGroup=metric&key=${WeatherKey}`)
        .then(response => {
            const Data = response.data
            callback(Data)
            return
        })
        .catch(error => {
            console.error("Error fetching data: ", error)
            callback('Puudub')
            return
        })
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ilm')
        .setDescription('Annab praeguse ilma peremeestele'),
    async execute(interaction) {
        const Data = await PullInfo();
        if (Data === 'Puudub') {
            return interaction.reply({ content: 'Ilmaandmete hankimisel tekkis probleem.', ephemeral: true });
        }

        const FinalData = await ProcessWeather(Data);

        const EmbedT = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Ilm')
            .setDescription('Näitab praegust ilma ja järgmised 2 päeva')
            .addFields(
                { name: '**Praegu** :alarm_clock:', value: " " },
                { name: 'Temperatuur', value: `${FinalData.currentWeather.temp}°C`, inline: true },
                { name: 'Tundub', value: `${FinalData.currentWeather.feelslike}°C`, inline: true },
                { name: 'Tuulekiirus', value: `${FinalData.currentWeather.windspeed} km/h`, inline: true },
                { name: 'Sunrise :sunrise:', value: FinalData.currentWeather.sunrise, inline: true },
                { name: 'Sunset :city_sunset:', value: FinalData.currentWeather.sunset, inline: true },
                { name: '---------------', value: " " },
            );

        for (let day of FinalData.nextTwoDays) {
            EmbedT.addFields(
                { name: `${day.date} :sunny:`, value: `${day.tempMin}°C - ${day.tempMax}°C`, inline: true },
                { name: 'Tundub', value: `${day.feelslike}°C`, inline: true },
                { name: 'Kirjeldus', value: day.description, inline: true }
            );
        }

        await interaction.reply({ embeds: [EmbedT] });
    },
};
