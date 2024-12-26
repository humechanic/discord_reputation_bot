import { Events } from 'discord.js';
import { discordClient } from '../api/discordClient.js';
import { initReactionEvents } from './reactions/index.js';
import { onJoinUsersEvents } from './voice/index.js';
import { initCommands } from './commands/index.js';

export const initEvents = () => {
    discordClient
        .on(Events.ClientReady, () => {
            console.log(`Logged in as ${discordClient.user.tag}!`);
        });

    initCommands();
    initReactionEvents();
    onJoinUsersEvents();
}