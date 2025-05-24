import { REST, Routes } from 'discord.js';
import { InitBot } from './init/index.js';
import { discordClient } from '../api/discordClient.js';
import { meRankCommandSettings, meRankPrivateCommandSettings } from '../events/commands/merank.js';
import { rankCommandSettings } from '../events/commands/rank.js';
import { initRolesSettings } from '../events/commands/initRoles.js';
import { scanCommandSettings } from '../events/commands/scan.js';


const commands = [
    scanCommandSettings.toJSON(),
    initRolesSettings.toJSON(),
    meRankCommandSettings.toJSON(),
    meRankPrivateCommandSettings.toJSON(),
    rankCommandSettings.toJSON(),
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
        await InitBot();
    }
}



