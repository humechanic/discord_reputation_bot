import { getUsersDB } from '@shared/utils/dbAccess.js';
import { SlashCommandBuilder } from 'discord.js';
import { getRoleForReputation } from '../../shared/utils/roleManager.js';
import { ROLE_HIERARCHY } from '../../shared/config/roles.js';

export const data = new SlashCommandBuilder()
    .setName('merank')
    .setDescription('Shows your current reputation score and role information (public)');

export const privateData = new SlashCommandBuilder()
    .setName('merankprivate')
    .setDescription('Shows your current reputation score and role information (private)');

export async function meRankCommand(interaction: any) {
    if (interaction.commandName.includes('merank')) {
        const isPrivate = interaction.commandName === 'merankprivate';

        try {
            const userId = interaction.user.id;
            const usersDB = getUsersDB();
            const userData = usersDB[userId];

            if (!userData) {
                await interaction.reply({
                    content: '❌ **No Data Found**\nYou don\'t have a reputation score yet.',
                    ephemeral: isPrivate
                });
                return;
            }

            const currentRole = getRoleForReputation(userData.reputationScore);
            const nextRole = ROLE_HIERARCHY
                .filter(role => role.requiredReputation > userData.reputationScore)
                .sort((a, b) => a.requiredReputation - b.requiredReputation)[0];

            const message = [
                `# 🏆 Reputation Status`,
                `## 👤 User Information`,
                `**Reputation Score:** ${userData.reputationScore} ⭐`,
                `**Current Role:** ${currentRole} 👑`,
                nextRole
                    ? `## 🎯 Next Milestone\n**Role:** ${nextRole.name}\n**Required Reputation:** ${nextRole.requiredReputation} ⭐\n**Points Needed:** ${nextRole.requiredReputation - userData.reputationScore} ⭐`
                    : '## 🎉 Achievement\nYou have reached the highest role!'
            ].join('\n\n');

            await interaction.reply({
                content: message,
                ephemeral: isPrivate
            });
        } catch (error) {
            console.error('Error in merank command:', JSON.stringify(error));
            await interaction.reply({
                content: '❌ **Error**\nThere was an error fetching your reputation information.',
                ephemeral: isPrivate,
                details: JSON.stringify(error)
            });
        }
    }
} 