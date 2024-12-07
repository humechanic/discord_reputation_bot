import { discordClient } from "../../api/discordClient.js";
import { EMOJI_MESSAGES_MAP } from "./constants/messages.js";

export const autoResponse = async (reaction, emoji) => {
    if (EMOJI_MESSAGES_MAP.has(emoji)) {

        const fetchedMessage = await reaction.message.fetch();

        const existingMessages = await fetchedMessage.channel.messages.fetch({ limit: 100 });

        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 3); // check last 3 hours

        const recentResponses = existingMessages.filter(msg => msg.author.id === discordClient.user.id && msg.content === EMOJI_MESSAGES_MAP.get(emoji) && msg.createdTimestamp >= currentDate.getTime());

        if (!recentResponses.size) {
            const message = EMOJI_MESSAGES_MAP.get(emoji) || 'Ммм... ну ладн), поломалась мапа';

            await reaction.message.channel.send(message);
        }
    }
}