const { SlashCommandBuilder } = require('discord.js');

let hangmanStarted = false
const Words = ["armastus", "kimu", "kokaiin", "kanep", "alkohol", "ahv", "tarkus", "mets", "päike", "vabadus", "õnn", "raamat", "kaunis", "meri", "linn", "õun", "mägi", "tänav", "autobus", "saabastega", "kolleeg", "sõber", "keel", "eesti", "elamine"];
let HangManWord = ""
let GuessedWord = ""
let wordCount = 0

async function GenerateWord() {
    return new Promise((resolve) => {
        var randomChoice = Math.floor(Math.random() * Words.length);
        HangManWord = Words[randomChoice];

        for (let i = 0; i < HangManWord.length; i++) {
            GuessedWord += "X";
            wordCount++;
        }

        resolve(GuessedWord);
    });
}

async function Guess(letter) {
    return new Promise((callback) => {
        let gotany = false
        for(i = 0; i < wordCount; i++) {
            if(HangManWord[i] === letter) {
                GuessedWord = GuessedWord.substring(0, i) + letter + GuessedWord.substring(i + letter.length)
                gotany = true
            }
        }
            callback(gotany)
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hangman')
        .setDescription('Loob hangmanni mängu')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Sisesta oma arvatav täht või sõna')
                .setRequired(true)),

    async execute(interaction) {
        if (!hangmanStarted) {
            let Reply = await GenerateWord()
            await interaction.reply(`Hangman mäng polnud alustatud, genereerisin sõna ${Reply}`);
            hangmanStarted = true
            return;
        }
        const userInput = interaction.options.getString('input');
        if(userInput.length > 1) {
            await interaction.reply("Sisestus peab olema ükstäht1");  
            return;
        };
        const ResponseFromGuess = await Guess(userInput)
        if(GuessedWord.search('X') === -1) {
            await interaction.reply(`Sõna arvati ära, mäng algab uuesti. Sõna oli: ${HangManWord}`); 
            HangManWord = ""
            GuessedWord = ""
            hangmanStarted = false 
            return
        }
        if(ResponseFromGuess) {
            await interaction.reply(`Said ühe pihta! Nüüd:  ${GuessedWord}`);  
            return;
        }
        await interaction.reply(`Ei saanud ühtegi pihta: ${GuessedWord}`);
    },
};