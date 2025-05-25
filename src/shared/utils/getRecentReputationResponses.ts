import { discordClient } from "@api/discordClient.js";

export const getRecentReputationResponses = async (reaction, emoji) => {
    const fetchedMessage = await reaction.message.fetch();
    const existingMessages = await fetchedMessage.channel.messages.fetch({ limit: 100 });

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3); // check last 3 hours

    const recentResponses = existingMessages.filter(msg => {
        if (msg.author.id !== discordClient.user!.id) return false;
        if (msg.createdTimestamp <= currentDate.getTime()) return false;
        if (!msg.reference?.messageId) return false;
        return msg.reference.messageId === reaction.message.id;
    });

    return Array.from(recentResponses.entries()).shift() || [null, null];
}
