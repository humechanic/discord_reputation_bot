import { discordClient } from "@api/discordClient.js";


export const initRoles = async () => {
    const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD_ID ?? '');
    const roles = await guild.roles.fetch();
    return roles;
}