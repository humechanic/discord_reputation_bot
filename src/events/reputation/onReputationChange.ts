import fs from 'fs';

import { getUsersDB } from '@shared/utils/dbAccess.js';
import { getDBFile } from '@shared/utils/paths.js';
import { TRACKED_EMOJI } from '@events/reactions/constants/trackEmojiMap.js';
import { getRecentReputationResponses } from '@shared/utils/getRecentReputationResponses';


const usersFile = getDBFile();

async function writeDatabase(data: any) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(usersFile, jsonData, 'utf8');
    } catch (error) {
        console.error('Error while writing into db', error);
        throw error;
    }
}

export const onReputationChange = async (reaction, user) => {
    const emoji = reaction.emoji.name
    const db = await getUsersDB();

    const lastReputationResponseCortage = await getRecentReputationResponses(reaction, emoji) as any;

    // few reactions handle
    // handle delete reaction?
    // toggle reaction
    const ups: string[] = [];
    const downs: string[] = [];
    for (const reactionDataItem of reaction.message.reactions.cache.values()) {
        const users = await reactionDataItem.users.fetch();
        if (reactionDataItem.emoji.name === TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_UP) {

            users.forEach((user) => ups.push(user.username));
        }
        if (reactionDataItem.emoji.name === TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_DOWN) {

            users.forEach((user) => downs.push(user.username));
        }
    }
    const [_, existReputationBotMessage] = lastReputationResponseCortage;


    switch (emoji) {
        case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_UP: {
            if (reaction.message.author.username === user.username) {
                reaction.message.channel.messages.fetch()
                await reaction.message.channel.send('Kak tebe eto v golovu prishlo, ebanat))')
                return;
            }

            db[reaction.message.author.id].reputationScore += 1;
            await writeDatabase(db);
            if (existReputationBotMessage) {
                existReputationBotMessage.edit(`${reaction.message.author.username}'s reputation increased by ${ups.join(', ')}, total score ${db[reaction.message.author.id].reputationScore}`);
            } else {
                await reaction.message.channel.send(`${reaction.message.author.username}'s reputation increased by ${ups.join(', ')}, total score ${db[reaction.message.author.id].reputationScore}`);
            }
            break;
        }
        case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_DOWN: {

            if (reaction.message.author.username === user.username) {
                await reaction.message.channel.send(`A вот это - прекрасная идея ${user.username}`)
            }
            db[reaction.message.author.id].reputationScore -= 1;
            await writeDatabase(db);
            if (existReputationBotMessage) {
                existReputationBotMessage.edit(`${reaction.message.author.username}'s reputation decreased by ${downs.join(', ')}, total score ${db[reaction.message.author.id].reputationScore}`);

            } else {
                await reaction.message.channel.send(`${reaction.message.author.username}'s reputation decreased by ${downs.join(', ')}, total score ${db[reaction.message.author.id].reputationScore}`);
            }

            break;

        }
    }
}