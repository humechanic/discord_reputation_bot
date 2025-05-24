import { PermissionFlagsBits } from "discord.js";

export const ProtectCommand = async (interaction: any) => {
    // Check if user has administrator permissions
    if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
            content: '❌ You need Administrator permissions to use this command.',
            ephemeral: true
        });
        return;
    }
}
