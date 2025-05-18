import fs from 'fs';

import { getUsersDB } from '@shared/utils/dbAccess.js';
import { getDBFile } from '@shared/utils/paths.js';
import { TRACKED_EMOJI } from '@events/reactions/constants/trackEmojiMap.js';
import { getRecentReputationResponses } from '@shared/utils/getRecentReputationResponses.js';
import { DMChannel, MessageReaction, User } from 'discord.js';
import { getEditMessage } from './model/utils/getEditMessage.js';

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

const userReactionCooldown = new Map();

export const onReputationChange = async (reaction: MessageReaction, user: User) => {
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

            users.forEach((u) => ups.push(u.username));
        }
        if (reactionDataItem.emoji.name === TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_DOWN) {

            users.forEach((u) => downs.push(u.username));
        }
    }

    const [_, existReputationBotMessage] = lastReputationResponseCortage;
    const isOldMessage = reaction.message.id === existReputationBotMessage?.id;
    const shouldEditExistingMessage = existReputationBotMessage && isOldMessage;

    const reactionAuthor = reaction.message.author;

    if (!reactionAuthor) return;

    const channel = (reaction.message.channel as DMChannel)

    switch (emoji) {
        case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_UP: {

            if (reactionAuthor.username === user.username) {
                channel.messages.fetch()
                await channel.send('Kak tebe eto v golovu prishlo, ebanat))')
                return;
            }
            if (userReactionCooldown.has(`${user.id}-up`)) {
                return;
            }
            userReactionCooldown.set(`${user.id}-up`, true);

            db[reactionAuthor.id].reputationScore += 1;
            await writeDatabase(db);
            if (shouldEditExistingMessage) {
                if (ups.length && downs.length) {
                    await getEditMessage(existReputationBotMessage, reactionAuthor, ups, downs, db[reactionAuthor.id].reputationScore)
                } else {
                    await existReputationBotMessage.edit(`${reactionAuthor.username}'s reputation increased by ${ups.join(', ')}, total score ${db[reactionAuthor.id].reputationScore}`);
                }
            } else {
                await channel.send(`${reactionAuthor.username}'s reputation increased by ${ups.join(', ')}, total score ${db[reactionAuthor.id].reputationScore}`);
            }
            setTimeout(() => {
                userReactionCooldown.delete(`${user.id}-up`)
            }, 60 * 3 * 60 * 1000)
            break;
        }
        case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_DOWN: {
            if (userReactionCooldown.has(`${user.id}-down`)) {
                // delete reaction
                return;
            }

            if (reactionAuthor.username === user.username) {
                await channel.send(`A вот это - прекрасная идея ${user.username}!`)
            }

            userReactionCooldown.set(`${user.id}-down`, true);

            db[reactionAuthor.id].reputationScore -= 1;
            await writeDatabase(db);
            if (shouldEditExistingMessage) {
                if (ups.length && downs.length) {
                    await getEditMessage(existReputationBotMessage, reactionAuthor, ups, downs, db[reactionAuthor.id].reputationScore)
                } else {
                    await existReputationBotMessage.edit(`${reactionAuthor.username}'s reputation decreased by ${downs.join(', ')}, total score ${db[reactionAuthor.id].reputationScore}`);
                }
            } else {
                await channel.send(`${reactionAuthor.username}'s reputation decreased by ${downs.join(', ')}, total score ${db[reactionAuthor.id].reputationScore}`);
            }
            setTimeout(() => {
                userReactionCooldown.delete(`${user.id}-down`)
            }, 60 * 3 * 60 * 1000)
            break;
        }
        default: break;
    }

}