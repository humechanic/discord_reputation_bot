import { scanCommand } from "./scan.js";
import { setBaseRoleCommand } from "./setBaseRole.js";
import { discordClient } from "@api/discordClient.js";
import { Events } from "discord.js";
import { initRolesCommand } from "./initRoles.js";
import { rankCommand } from "./rank.js";
import { leaderboardCommand } from "./leaderboard.js";
import { setupCommand } from "./setup.js";
import { setRankScoreCommand } from "./setRankScore.js";

export const initCommands = async () => {
    discordClient.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        await initRolesCommand(interaction);
        // await setBaseRoleCommand(interaction);
        await rankCommand(interaction);
        await setupCommand(interaction);
        await leaderboardCommand(interaction);
        await scanCommand(interaction);
        await setRankScoreCommand(interaction);

    });
}