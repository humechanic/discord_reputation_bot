import fs from 'fs';
import { TRACKED_EMOJI } from "@events/reactions/constants/trackEmojiMap";
import { getDBFile } from "@shared/utils/paths";
import { getUsersDB } from '@shared/utils/dbAccess';


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

    switch (emoji) {
        case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_UP: {
            db[reaction.message.author.id].reputationScore += 1;
            await reaction.message.channel.send(`user ${user.username} increased ${reaction.message.author.username}'s reputation, total score ${db[reaction.message.author.id].reputationScore}`);
            break;
        }
        case TRACKED_EMOJI.REGULAR.ARROW_DOUBLE_DOWN: {
            db[reaction.message.author.id].reputationScore -= 1;
            await reaction.message.channel.send(`user ${user.username} decreased ${reaction.message.author.username}'s reputation, total score ${db[reaction.message.author.id].reputationScore}`);
            break;
        }
        default: break;
    }
    await writeDatabase(db);
}