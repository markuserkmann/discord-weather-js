const { DiscordAPI } = require('./secret.js'); // API KEY
const { Client, Events, SlashCommandBuilder, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands automaticly
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log("Error loading command in commands");
        }
    }
}

client.once(Events.ClientReady, async () => {
    console.log('Logged in as ' + client.user.tag);

    const commands = client.commands.map(command => command.data.toJSON());

    const rest = new REST({ version: '10' }).setToken(DiscordAPI);

    try {
        console.log('Started refreshing application (/) commands.');

        // Listen for only our community
        const guildId = '1063829879549874286';
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
    }
});

client.login(DiscordAPI);
