import { Events, GuildMember } from 'discord.js';
import { ROLE_HIERARCHY } from '../shared/config/roles.js';
export const name = Events.GuildMemberAdd;
export const once = false;

const baseRoleName = 'случайный';
const baseRoleId = process.env.ROLE_RANDOM_ID;

export async function onMemberJoin(member: GuildMember) {
    try {
        // Try to add role by ID first
        if (baseRoleId) {
            await member.roles.add(baseRoleId);
            return;
        }

        // Fallback: Find role by name
        const baseRole = member.guild.roles.cache.find(role =>
            role.name.toLowerCase() === baseRoleName.toLowerCase()
        );

        if (baseRole) {
            await member.roles.add(baseRole);
        }
    } catch (error) {
        console.error('Error adding base role:', error);
    }
}

// Function to update roles based on reputation
export async function updateRolesBasedOnReputation(member: GuildMember, reputation: number) {
    try {
        const currentRoles = member.roles.cache.map(role => role.id);

        // Remove all reputation-based roles
        for (const { id } of ROLE_HIERARCHY) {
            if (currentRoles.includes(id)) {
                await member.roles.remove(id);
            }
        }

        // Add highest applicable role based on reputation
        const applicableRole = ROLE_HIERARCHY
            .filter(({ requiredReputation }) => reputation >= requiredReputation)
            .sort((a, b) => b.requiredReputation - a.requiredReputation)[0];

        if (applicableRole) {
            await member.roles.add(applicableRole.id);
        }
    } catch (error) {
        console.error('Error updating roles based on reputation:', error);
    }
} 