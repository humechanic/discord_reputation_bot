import { Events } from "discord.js";
import { discordClient } from "../../api/discordClient.js";
import { sendAutoResponse } from "./autoResponse.js";
import { onReputationChange } from "@events/reputation/onReputationChange.js";

export const initReactionEvents = async () => {

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
        await onReputationChange(reaction, user)
        await sendAutoResponse(reaction, emoji);
    });

    discordClient.on(Events.MessageReactionRemove, async (reaction, user) => {
        try {

            if (reaction.partial) await reaction.fetch();

            console.log(`${user.displayName} убрал реакцию ${reaction.emoji.name} c сообщения "${reaction.message.content}"`);


        } catch (error) {
            console.error('Не удалось обработать снятие реакции:', error);
        }
    })
}