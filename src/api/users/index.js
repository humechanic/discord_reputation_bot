import { discordClient } from "../discordClient.js";

export const getGuild = async () => {
    const { guilds } = discordClient;
    const guild = await guilds.fetch(process.env.GUILD_ID);
    return guild;
}

export const getUsers = async () => {
    const guild = await getGuild();
    const members = await guild.members.fetch();
    return members
}

export const getRoles = async () => {
    const guild = await getGuild();
    const roles = await guild.roles.fetch();
    return roles
}