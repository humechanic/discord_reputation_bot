import { scanCommand } from "./scan.js";
import { meRankCommand } from "./merank.js";
import { setBaseRoleCommand } from "./setBaseRole.js";
import { discordClient } from "@api/discordClient.js";
import { Events } from "discord.js";
import { initRolesCommand } from "./initRoles.js";
import { rankCommand } from "./rank.js";


export const initCommands = async () => {
    discordClient.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;


        await initRolesCommand(interaction);
        // await setBaseRoleCommand(interaction);
        await meRankCommand(interaction);
        await rankCommand(interaction);
        await scanCommand(interaction);

    });
}