
import { REST, Routes } from 'discord.js';
import { InitBot } from './init/index.js';
import { discordClient } from '../api/discordClient.js';

const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'scan',
        description: 'Scan server for create a snapshot of current user database',
    },

];

export const initApp = async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
        console.info('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });

        console.info('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    } finally {

        discordClient.login(process.env.BOT_TOKEN);
        InitBot();
    }

}



