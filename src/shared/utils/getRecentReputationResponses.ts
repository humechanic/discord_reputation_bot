import { discordClient } from "@api/discordClient.js";
import { MESSAGE_TYPES } from "../constants/messageTypes.js";
import { getMessageType } from "./messageTypeUtils.js";

export const getRecentReputationResponses = async (reaction, emoji) => {
    const fetchedMessage = await reaction.message.fetch();
    const existingMessages = await fetchedMessage.channel.messages.fetch({ limit: 100 });

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3); // check last 3 hours

    const recentResponses = existingMessages.filter(msg => {
        if (msg.author.id !== discordClient.user!.id) return false;
        if (msg.createdTimestamp <= currentDate.getTime()) return false;

        const messageType = getMessageType(msg.content);
        console.log('recentResponse type', messageType)
        return messageType === MESSAGE_TYPES.REPUTATION_CHANGE;
    });

    return Array.from(recentResponses.entries()).shift() || [null, null];
}
