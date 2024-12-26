import { Events } from "discord.js";
import { discordClient } from "../../api/discordClient.js";
import { sendAutoResponse } from "./autoResponse.js";
import { onReputationChange } from "@events/reputation/onReputationChange.js";

export const initReactionEvents = () => {

    discordClient.on(Events.MessageReactionAdd, async (reaction, user, details) => {
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
        onReputationChange(reaction, user)
        sendAutoResponse(reaction, emoji);
    });
}