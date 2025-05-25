import { PermissionsBitField, PermissionFlagsBits } from "discord.js";

export interface RoleConfig {
    id: string;
    name: string;
    requiredReputation: number;
    permissions: bigint[];
}

export const ROLE_HIERARCHY: RoleConfig[] = [
    {
        id: process.env.ROLE_NEWCOMER_ID || '',
        name: 'Newcomer',
        requiredReputation: 0,
        permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
    },
    {
        id: process.env.ROLE_TRUSTED_ID || '',
        name: 'Trusted',
        requiredReputation: 100,
        permissions: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions]
    },
    {
        id: process.env.ROLE_VETERAN_ID || '',
        name: 'Veteran',
        requiredReputation: 500,
        permissions: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads]
    },
    {
        id: process.env.ROLE_ELITE_ID || '',
        name: 'Elite',
        requiredReputation: 1000,
        permissions: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.ManageThreads]
    },
    {
        id: process.env.ROLE_MODERATOR_ID || '',
        name: 'Moderator',
        requiredReputation: 2000,
        permissions: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.KickMembers]
    },
    {
        id: process.env.ROLE_ADMIN_ID || '',
        name: 'Admin',
        requiredReputation: 5000,
        permissions: [PermissionsBitField.Flags.Administrator]
    }
]; 