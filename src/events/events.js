import { Events } from 'discord.js';
import { discordClient } from '../api/discordClient.js';
import { reactionEvents } from './reactions/index.js';
import { onJoinUsersEvents } from './voice/index.js';

import { commands } from './commands/index.js';

export const initEvents = () => {
    discordClient
        .on(Events.ClientReady, () => {
            console.log(`Logged in as ${discordClient.user.tag}!`);
        });

    commands();
    reactionEvents();
    onJoinUsersEvents();
}