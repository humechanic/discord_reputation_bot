import { discordClient } from '../../api/discordClient.js';
import { Events } from 'discord.js';


export const pingCommand = () => {
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