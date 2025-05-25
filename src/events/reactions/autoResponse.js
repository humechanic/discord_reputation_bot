import { EMOJI_MESSAGES_MAP } from "./constants/messages.js";
import { getRecentResponses } from "@shared/utils/getRecentResponses.js";

export const sendAutoResponse = async (reaction, emoji) => {

    if (!EMOJI_MESSAGES_MAP.has(emoji)) return;

    const recentResponses = await getRecentResponses(reaction, emoji);
    if (recentResponses.size) return;

    const message = EMOJI_MESSAGES_MAP.get(emoji)

    // '517421257243754496' = osnovnoy
    if (reaction.message.channelId == '517421257243754496' && message) {
        await reaction.message.channel.send(message);
    }
}