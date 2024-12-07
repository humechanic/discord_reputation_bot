import { Events } from "discord.js";
import { discordClient } from "../../api/discordClient.js";
import { autoResponse } from "./autoResponse.js";

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

        autoResponse(reaction, emoji);
    });
}