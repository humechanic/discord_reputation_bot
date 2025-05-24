import { DiscordAPIError, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { discordClient } from '../../api/discordClient.js';
import { getUsersDB } from '@shared/utils/dbAccess.js';
import { splitMessage } from '@shared/utils/splitMessage.js';
import { ProtectCommand } from '@shared/utils/isAdminCommand.js';

export const scanCommandSettings = new SlashCommandBuilder()
    .setName('scan')
    .setDescription('Scan server for create a snapshot of current user database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const scanCommand = async (interaction: any) => {

    if (interaction.commandName === 'scan') {

        await ProtectCommand(interaction);

        try {
            await interaction.deferReply({ ephemeral: true });

            const usersDB = getUsersDB();
            const { guilds } = discordClient;
            const guild = await guilds.fetch(process.env.GUILD_ID || '');
            const members = await guild.members.fetch();

            const results = await Promise.all(Array.from(members.entries()).map(async ([userId, userData]) => {
                const existingRole = usersDB[userId]?.role;
                if (!existingRole) return null;

                try {
                    await userData.roles.add(existingRole);
                    return `✅ ${userData.displayName}(aka ${userData.nickname || userData.user.username}) - Role assigned`;
                } catch (e) {
                    console.error(`Failed to assign role to ${userData.displayName}:`, e);
                    return `❌ ${userData.displayName}(aka ${userData.nickname || userData.user.username}) - Failed to assign role`;
                }
            }));

            const successfulAssignments = results.filter(r => r?.includes('✅')).length;
            const failedAssignments = results.filter(r => r?.includes('❌')).length;

            // Create the summary message
            const summaryMessage = `**Scan Results**\n` +
                `Total members processed: ${results.length}\n` +
                `✅ Successful assignments: ${successfulAssignments}\n` +
                `❌ Failed assignments: ${failedAssignments}\n\n` +
                `Detailed results:`;

            // Create the detailed results message
            const detailedResults = results.filter(Boolean).join('\n');

            // Split messages if needed
            const messages = splitMessage(summaryMessage + '\n' + detailedResults);

            // Send the first message as a reply
            await interaction.editReply(messages[0]);

            // Send additional messages as follow-ups
            for (let i = 1; i < messages.length; i++) {
                await interaction.followUp({
                    content: messages[i],
                    ephemeral: true
                });
            }

        } catch (e) {
            console.error('Scan command error:', e);
            if (e instanceof DiscordAPIError) {
                await interaction.editReply({
                    content: '❌ An error occurred while processing the command. Please try again later.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: '❌ An unexpected error occurred. Please try again later.',
                    ephemeral: true
                });
            }
        }
    }
}