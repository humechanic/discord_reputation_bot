import { Events } from "discord.js";
import { discordClient } from "../../api/discordClient.js";
import { EMOJI_MESSAGES_MAP } from "./constants/messages.js";

export const reactionEvents = () => {

    discordClient.on(Events.MessageReactionAdd, async (reaction, user) => {
        if (user.bot) return;

        // cache update if no reactions or messages loaded
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Failed to get reaction', error);
                return;
            }
        }
        const emoji = reaction.emoji.name;
        if (EMOJI_MESSAGES_MAP.has(emoji)) {

            const fetchedMessage = await reaction.message.fetch();

            const existingMessages = await fetchedMessage.channel.messages.fetch({ limit: 100 });

            const currentDate = new Date();
            currentDate.setDate(currentDate.getHours() - 8); // check last 8 hours

            const recentResponses = existingMessages.filter(msg =>
                msg.author.id === discordClient.user.id && msg.createdAt >= currentDate
            );

            const hasResponse = existingMessages.find(msg => msg.author.id === discordClient.user.id && msg.content === EMOJI_MESSAGES_MAP.get(emoji));

            if (!hasResponse || !recentResponses.size) {
                const message = EMOJI_MESSAGES_MAP.get(emoji) || 'Ммм... ну ладн)';

                await reaction.message.channel.send(message);
            }
        }
    });
}