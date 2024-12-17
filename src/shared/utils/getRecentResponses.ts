import { discordClient } from "@api/discordClient.js";
import { EMOJI_MESSAGES_MAP } from "@events/reactions/constants/messages.js";

const BOT_RESPONSE_TYPE = {
    AUTO: 'auto',
    REPUTATION: 'repo',
}

export const getRecentResponses = async (reaction, emoji, type = BOT_RESPONSE_TYPE.AUTO) => {

    const fetchedMessage = await reaction.message.fetch();

    const existingMessages = await fetchedMessage.channel.messages.fetch({ limit: 100 });

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3); // check last 3 hours

    // discordClient.user.id === bot id
    const recentResponses = existingMessages.filter(msg => msg.author.id === discordClient.user!.id && msg.content === EMOJI_MESSAGES_MAP.get(emoji) && msg.createdTimestamp >= currentDate.getTime());

    return recentResponses;
}