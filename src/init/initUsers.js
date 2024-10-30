import { discordClient } from "../api/discordClient.js";

export const initUsers = async () => {
    const { guilds } = discordClient;
    const guild = await guilds.fetch(process.env.GUILD_ID);
    const members = await guild.members.fetch();
    const channels = await guild.channels.fetch();
    const roles = await guild.roles.fetch();

}