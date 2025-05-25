import { getUsersDB } from '@shared/utils/dbAccess.js';
import { SlashCommandBuilder, User } from 'discord.js';
import { getRoleForReputation, getRolesFromConfig } from '../../shared/utils/roleManager.js';


export const rankCommandSettings = new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Shows reputation score and role information')
    .addSubcommand(subcommand =>
        subcommand
            .setName('me')
            .setDescription('Shows your own reputation score and role information')
            .addBooleanOption(option =>
                option.setName('silent')
                    .setDescription('Whether to show the response only to you')
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('user')
            .setDescription('Shows reputation score and role information for a specific user')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user to check')
                    .setRequired(true))
            .addBooleanOption(option =>
                option.setName('silent')
                    .setDescription('Whether to show the response only to you')
                    .setRequired(false)));

export async function rankCommand(interaction: any) {
    if (interaction.commandName === 'rank') {
        try {
            const isSilent = interaction.options.getBoolean('silent') ?? false;
            let targetUser: User;

            if (interaction.options.getSubcommand() === 'me') {
                targetUser = interaction.user;
            } else {
                targetUser = interaction.options.getUser('target')!;
            }

            const userId = targetUser.id;
            const usersDB = getUsersDB();
            const userData = usersDB[userId];

            if (!userData) {
                await interaction.reply({
                    content: `❌ **No Data Found**\n${targetUser.id === interaction.user.id ? 'You' : targetUser.username} don't have a reputation score yet.`,
                    ephemeral: isSilent
                });
                return;
            }

            const roles = await getRolesFromConfig();
            const currentRole = getRoleForReputation(userData.reputationScore, roles);
            const nextRole = roles
                .filter(role => role.requiredReputation > userData.reputationScore)
                .sort((a, b) => a.requiredReputation - b.requiredReputation)[0];

            const message = [
                `### 🏆 Reputation Status`,
                `### 👤 User Information`,
                `**User:** ${targetUser.username}`,
                `**Reputation Score:** ${userData.reputationScore} ⭐`,
                `**Current Role:** ${currentRole} 👑`,
                nextRole
                    ? `## 🎯 Next Milestone\n**Role:** ${nextRole.name}\n**Required Reputation:** ${nextRole.requiredReputation} ⭐\n**Points Needed:** ${nextRole.requiredReputation - userData.reputationScore} ⭐`
                    : '## 🎉 Achievement\nThis user has reached the highest role!'
            ].join('\n\n');

            await interaction.reply({
                content: message,
                ephemeral: isSilent
            });
        } catch (error) {
            console.error('Error in rank command:', JSON.stringify(error));
            await interaction.reply({
                content: '❌ **Error**\nThere was an error fetching reputation information.',
                ephemeral: true,
                details: JSON.stringify(error)
            });
        }
    }
} 