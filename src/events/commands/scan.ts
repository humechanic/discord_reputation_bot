
import { DiscordAPIError, DiscordErrorData, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { discordClient } from '../../api/discordClient.js';
import { getUsersDB } from '@shared/utils/dbAccess.js';

export const scanCommandSettings = new SlashCommandBuilder()
    .setName('scan')
    .setDescription('Scan server for create a snapshot of current user database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const scanCommand = async (interaction: any) => {
    if (interaction.commandName === 'scan') {
        const usersDB = getUsersDB()
        const { guilds } = discordClient;
        const guild = await guilds.fetch(process.env.GUILD_ID || '');
        const members = await guild.members.fetch();

        const userNames = await Promise.all(Array.from(members.entries()).map(async ([userId, userData]) => {
            const existingRole = usersDB[userId].role;
            try {
                await userData.roles.add(existingRole);
                return userData.displayName
            } catch (e) {
                console.error(JSON.stringify(e));
                return null
            }
        }))
        try {
            await interaction.deferReply(JSON.stringify(userNames));
        } catch (e) {
            if (e instanceof DiscordAPIError) {
                console.log((e.rawError as DiscordErrorData).errors)
                await interaction.reply('Opss')
            } else {
                console.log(e)
                await interaction.reply('Unhandled error')
            }

        }
    }

}