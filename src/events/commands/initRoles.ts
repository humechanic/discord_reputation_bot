import { ROLE_HIERARCHY } from '@shared/config/roles.js';
import { Colors, PermissionFlagsBits, PermissionResolvable, SlashCommandBuilder } from 'discord.js';


export const initRolesSettings = new SlashCommandBuilder()
    .setName('initroles')
    .setDescription('Initialize or update reputation-based roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function initRolesCommand(interaction: any) {
    if (interaction.commandName === 'initroles') {
        try {
            await interaction.deferReply({ ephemeral: true });
            const guild = interaction.guild;
            const results: string[] = [];

            for (const roleConfig of ROLE_HIERARCHY) {
                try {
                    // Try to find existing role
                    let role = guild.roles.cache.find(r => r.name === roleConfig.name);

                    if (!role) {
                        // Create new role if it doesn't exist
                        role = await guild.roles.create({
                            name: roleConfig.name,
                            color: getRoleColor(roleConfig.name),
                            permissions: roleConfig.permissions as PermissionResolvable,
                            reason: 'Initializing reputation-based roles'
                        });
                        results.push(`✨ **Created Role:** \`${role.name}\``);
                    } else {
                        // Update existing role
                        await role.edit({
                            permissions: roleConfig.permissions as PermissionResolvable,
                            color: getRoleColor(roleConfig.name)
                        });
                        results.push(`🔄 **Updated Role:** \`${role.name}\``);
                    }

                    // Store role ID in environment variable
                    process.env[`ROLE_${roleConfig.name.toUpperCase()}_ID`] = role.id;
                } catch (error: any) {
                    results.push(`❌ **Failed:** \`${roleConfig.name}\` - ${error.message}`);
                }
            }

            const message = [
                '# 🎭 Role Initialization Complete',
                '## 📋 Results',
                results.join('\n'),
                '\n> *Role IDs have been stored in environment variables*'
            ].join('\n');

            await interaction.editReply({
                content: message,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in initroles command:', error);
            await interaction.editReply({
                content: '❌ **Error**\nThere was an error initializing roles.',
                ephemeral: true
            });
        }
    }
}

function getRoleColor(roleName: string): number {
    const colorMap: { [key: string]: number } = {
        'Newcomer': Colors.Grey,
        'Trusted': Colors.Green,
        'Veteran': Colors.Blue,
        'Elite': Colors.Purple,
        'Moderator': Colors.Orange,
        'Admin': Colors.Red
    };
    return colorMap[roleName] || Colors.Default;
} 