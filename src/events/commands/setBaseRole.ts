import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';


export const data = new SlashCommandBuilder()
    .setName('setbaserole')
    .setDescription('Set the base role for new members')
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('The role to set as base role')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function setBaseRoleCommand(interaction: any) {
    const role = interaction.options.getRole('role');

    await interaction.reply({
        content: `Base role set to: ${role?.name}`,
        ephemeral: true
    });
}  