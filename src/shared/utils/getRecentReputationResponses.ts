import { discordClient } from "@api/discordClient.js";

export const getRecentReputationResponses = async (reaction, emoji) => {

    const fetchedMessage = await reaction.message.fetch();

    const existingMessages = await fetchedMessage.channel.messages.fetch({ limit: 100 });

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3); // check last 3 hours

    // discordClient.user.id === bot id
    const recentResponses = existingMessages.filter(msg => msg.author.id === discordClient.user!.id && msg.content.includes('increased') || msg.content.includes('decreased') && msg.createdTimestamp >= currentDate.getTime());

    return Array.from(recentResponses.entries()).shift() || [null, null];
}
