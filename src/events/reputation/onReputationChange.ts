import fs from 'fs';

import { getUsersDB } from '@shared/utils/dbAccess.js';
import { getDBFile } from '@shared/utils/paths.js';
import { TRACKED_EMOJI } from '@events/reactions/constants/trackEmojiMap.js';
import { getRecentResponses } from '@shared/utils/getRecentResponses';

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

    const recentResponses = await getRecentResponses(reaction, emoji, 'repo');
    // few reactions handle
    // handle delete reaction?
    // toggle reaction

    if (!recentResponses.size) {
        switch (emoji) {
            case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_UP: {
                if (reaction.message.author.username === user.username) {
                    await reaction.message.channel.send('Kak tebe eto v golovu prishlo, ebanat))')
                    return;
                }
                db[reaction.message.author.id].reputationScore += 1;
                await writeDatabase(db);
                await reaction.message.channel.send(`${reaction.message.author.username}'s reputation increased by ${user.username}, total score ${db[reaction.message.author.id].reputationScore}`);
                break;
            }
            case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_DOWN: {
                if (reaction.message.author.username === user.username) {
                    await reaction.message.channel.send(`A вот это - прекрасная идея ${user.username}`)
                }
                db[reaction.message.author.id].reputationScore -= 1;
                await writeDatabase(db);
                await reaction.message.channel.send(`${reaction.message.author.username}'s reputation decreased by ${user.username}, total score ${db[reaction.message.author.id].reputationScore}`);
                break;
            }
            default: break;
        }
    }
}