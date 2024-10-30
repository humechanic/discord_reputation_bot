import { Events } from 'discord.js';

discordClient.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

discordClient.on(Events.InteractionCreate, async interaction => {
    console.log(interaction);
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

discordClient.on(Events.MessageCreate, message => {
    if (message.content === '!ping') {
        message.channel.send('Pong!');
    }
});