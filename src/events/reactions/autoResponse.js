import { discordClient } from "@api/discordClient.js";
import { EMOJI_MESSAGES_MAP } from "./constants/messages.js";
import { getRecentResponses } from "@shared/utils/getRecentResponses.js";

export const autoResponse = async (reaction, emoji) => {
    if (!EMOJI_MESSAGES_MAP.has(emoji)) return;

    const recentResponses = await getRecentResponses(reaction, emoji);
    if (recentResponses.size) return;

    const message = EMOJI_MESSAGES_MAP.get(emoji)
    if (message) {
        await reaction.message.channel.send(message);
    }
}