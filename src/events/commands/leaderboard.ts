import { getUsersDB } from '@shared/utils/dbAccess.js';
import { SlashCommandBuilder } from 'discord.js';
import { getRoleForReputation } from '../../shared/utils/roleManager.js';

interface UserData {
    reputationScore: number;
    lastReputationGiven: string | null;
}

export const leaderboardCommandSettings = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the top users by reputation score')
    .addIntegerOption(option =>
        option.setName('limit')
            .setDescription('Number of users to show (1-10)')
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('silent')
            .setDescription('Whether to show the response only to you')
            .setRequired(false));

export async function leaderboardCommand(interaction: any) {
    if (interaction.commandName === 'leaderboard') {
        try {
            const limit = interaction.options.getInteger('limit') ?? 10;
            const isSilent = interaction.options.getBoolean('silent') ?? false;

            const usersDB = getUsersDB();
            const guild = interaction.guild;
            const members = await guild.members.fetch();

            const usersWithData = Object.entries(usersDB as Record<string, UserData>)
                .map(([userId, data]) => {
                    const member = members.get(userId);
                    return {
                        userId,
                        username: member?.user.username ?? 'Unknown User',
                        reputationScore: data.reputationScore,
                        joinedAt: member?.joinedAt,
                        role: getRoleForReputation(data.reputationScore)
                    };
                })
                .filter(user => user.joinedAt)
                .sort((a, b) => b.reputationScore - a.reputationScore)
                .slice(0, limit);

            if (usersWithData.length === 0) {
                await interaction.reply({
                    content: '❌ **No Data Found**\nThere are no users with reputation scores yet.',
                    ephemeral: isSilent
                });
                return;
            }

            // Fixed widths
            const posWidth = 4;
            const minUsername = 8;
            const minRole = 6;
            const minScore = 2;

            // Dynamic widths
            const maxUsernameLength = Math.max(
                'Username'.length,
                minUsername,
                ...usersWithData.map(u => u.username.length)
            );
            const maxRoleLength = Math.max(
                'Role'.length,
                minRole,
                ...usersWithData.map(u => u.role.length)
            );
            const maxScoreLength = Math.max(
                'Score'.length,
                minScore,
                ...usersWithData.map(u => u.reputationScore.toString().length)
            );
            const joinedAtLength = 10; // DD.MM.YYYY

            // Header
            const header = [
                '## 🏆 Reputation Leaderboard',
                '### Top Users by Reputation Score',
                '```',
                `┌${'─'.repeat(posWidth + 2)}┬${'─'.repeat(maxUsernameLength + 2)}┬${'─'.repeat(maxRoleLength + 2)}┬${'─'.repeat(maxScoreLength + 2)}┬${'─'.repeat(joinedAtLength + 2)}┐`,
                `│ ${'Pos'.padEnd(posWidth)} │ ${'Username'.padEnd(maxUsernameLength)} │ ${'Role'.padEnd(maxRoleLength)} │ ${'Score'.padStart(maxScoreLength)} │ ${'Joined At'.padEnd(joinedAtLength)} │`,
                `├${'─'.repeat(posWidth + 2)}┼${'─'.repeat(maxUsernameLength + 2)}┼${'─'.repeat(maxRoleLength + 2)}┼${'─'.repeat(maxScoreLength + 2)}┼${'─'.repeat(joinedAtLength + 2)}┤`
            ];

            // Rows
            const rows = usersWithData.map((user, index) => {
                let pos;

                pos = `[${index + 1}]`.padEnd(posWidth, ' ');
                const username = user.username.length > maxUsernameLength
                    ? user.username.slice(0, maxUsernameLength - 1) + '…'
                    : user.username;
                const role = user.role.length > maxRoleLength
                    ? user.role.slice(0, maxRoleLength - 1) + '…'
                    : user.role;
                const score = user.reputationScore.toString().padStart(maxScoreLength, ' ');
                const joinedAt = user.joinedAt?.toLocaleDateString('ru-RU') ?? 'Unknown';
                return `│ ${pos} │ ${username.padEnd(maxUsernameLength)} │ ${role.padEnd(maxRoleLength)} │ ${score} │ ${joinedAt.padEnd(joinedAtLength)} │`;
            });

            // Footer
            const footer = [
                `└${'─'.repeat(posWidth + 2)}┴${'─'.repeat(maxUsernameLength + 2)}┴${'─'.repeat(maxRoleLength + 2)}┴${'─'.repeat(maxScoreLength + 2)}┴${'─'.repeat(joinedAtLength + 2)}┘`,
                '```'
            ];

            const message = [...header, ...rows, ...footer].join('\n');

            await interaction.reply({
                content: message,
                ephemeral: isSilent
            });
        } catch (error) {
            console.error('Error in leaderboard command:', JSON.stringify(error));
            await interaction.reply({
                content: '❌ **Error**\nThere was an error fetching the leaderboard.',
                ephemeral: true,
                details: JSON.stringify(error)
            });
        }
    }
} 