import { Events } from 'discord.js';
import { discordClient } from '../api/discordClient.js';

export const initEvents = () => {

    discordClient.on(Events.ClientReady, () => {
        console.log(`Logged in as ${discordClient.user.tag}!`);
    });

    discordClient.on(Events.InteractionCreate, async interaction => {

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
}