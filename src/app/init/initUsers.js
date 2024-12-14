import { discordClient } from "../../api/discordClient.js";

// console.log(Array.from(roles.entries()).map(([id, data]) => [id, data.name])) ROLES

export const initUsers = async () => {
    const { guilds } = discordClient;
    const guild = await guilds.fetch(process.env.GUILD_ID);
    const members = await guild.members.fetch();
    const channels = await guild.channels.fetch();
    const roles = await guild.roles.fetch();

    return members
}