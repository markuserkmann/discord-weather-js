const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Testing test'),
    async execute(interaction) {
        await interaction.reply('tes2t!');
    },
};