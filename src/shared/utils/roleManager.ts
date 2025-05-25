import { GuildMember, PermissionsBitField } from 'discord.js';
import { ROLE_HIERARCHY } from '../config/roles.js';
import fs from 'fs/promises';
import path from 'path';

interface RoleData {
    name: string;
    color: string;
    permissions: string[];
    requiredReputation: number;
    id: string;
}

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

export async function getRolesFromConfig(): Promise<RoleData[]> {
    try {
        const rolesPath = path.join(process.cwd(), 'db', 'roles.json');
        const rolesData = await fs.readFile(rolesPath, 'utf-8');
        return JSON.parse(rolesData);
    } catch (error) {
        console.error('Error reading roles config:', error);
        return [];
    }
}

export function getRoleForReputation(reputationScore: number, roles: RoleData[]): string {
    const eligibleRoles = roles
        .filter(role => role.requiredReputation <= reputationScore)
        .sort((a, b) => b.requiredReputation - a.requiredReputation);

    return eligibleRoles[0]?.name || 'No Role';
} 