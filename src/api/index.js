
import { REST, Routes } from 'discord.js';
import { InitBot } from '../init/index.js';
import { discordClient } from './discordClient.js';

const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },

];

export const init = async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    } finally {
        discordClient.login(process.env.BOT_TOKEN);
        InitBot();
    }

}



