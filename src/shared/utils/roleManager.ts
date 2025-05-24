import { GuildMember } from 'discord.js';
import { ROLE_HIERARCHY } from '../config/roles.js';

export async function updateUserRole(member: GuildMember, reputation: number): Promise<void> {
    try {
        // Get current roles
        const currentRoles = member.roles.cache.map(role => role.id);

        // Remove all reputation-based roles
        for (const role of ROLE_HIERARCHY) {
            if (currentRoles.includes(role.id)) {
                await member.roles.remove(role.id);
            }
        }

        // Find the highest applicable role based on reputation
        const applicableRole = ROLE_HIERARCHY
            .filter(role => reputation >= role.requiredReputation)
            .sort((a, b) => b.requiredReputation - a.requiredReputation)[0];

        if (applicableRole) {
            await member.roles.add(applicableRole.id);
            console.log(`Updated role for ${member.user.tag} to ${applicableRole.name} (Reputation: ${reputation})`);
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

export function getRoleForReputation(reputation: number): string {
    const applicableRole = ROLE_HIERARCHY
        .filter(role => reputation >= role.requiredReputation)
        .sort((a, b) => b.requiredReputation - a.requiredReputation)[0];

    return applicableRole ? applicableRole.name : 'No Role';
} 