import { DiscordAPIError, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { discordClient } from '../../api/discordClient.js';
import { getUsersDB } from '@shared/utils/dbAccess.js';
import { splitMessage } from '@shared/utils/splitMessage.js';
import { ProtectCommand } from '@shared/utils/isAdminCommand.js';
import fs from 'fs';
import path from 'path';

export const scanCommandSettings = new SlashCommandBuilder()
    .setName('scan')
    .setDescription('Scan server for create a snapshot of current user database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const scanCommand = async (interaction: any) => {
    if (interaction.commandName === 'scan') {
        await ProtectCommand(interaction);
        try {
            await interaction.deferReply({ ephemeral: true });

            // Загрузка users.json и roles.json
            const usersPath = path.join(process.cwd(), 'db', 'users.json');
            const rolesPath = path.join(process.cwd(), 'db', 'roles.json');
            const usersDB = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
            const rolesDB = JSON.parse(fs.readFileSync(rolesPath, 'utf-8'));

            // Сортируем роли по requiredReputation по возрастанию
            const sortedRoles = rolesDB.sort((a: any, b: any) => a.requiredReputation - b.requiredReputation);

            const { guilds } = discordClient;
            const guild = await guilds.fetch(process.env.GUILD_ID || '');
            const members = await guild.members.fetch();

            const results = await Promise.all(Object.entries(usersDB).map(async ([userId, userData]: any) => {
                const member = members.get(userId);
                if (!member) return `❌ ${userId} — не найден на сервере`;
                const rep = userData.reputationScore;
                // Найти подходящую роль
                const suitableRole = [...sortedRoles]
                    .filter((role: any) => rep >= role.requiredReputation)
                    .sort((a: any, b: any) => b.requiredReputation - a.requiredReputation)[0];
                if (!suitableRole) {
                    // Удалить все роли из roles.json
                    for (const role of sortedRoles) {
                        if (member.roles.cache.has(role.id)) {
                            await member.roles.remove(role.id).catch(() => { });
                        }
                    }
                    return `ℹ️ ${member.displayName} — нет подходящей роли (репутация: ${rep})`;
                }
                // Удалить все роли из roles.json, кроме подходящей
                for (const role of sortedRoles) {
                    if (role.id !== suitableRole.id && member.roles.cache.has(role.id)) {
                        await member.roles.remove(role.id).catch(() => { });
                    }
                }
                // Добавить подходящую роль, если её нет
                if (!member.roles.cache.has(suitableRole.id)) {
                    await member.roles.add(suitableRole.id).catch(() => { });
                    return `✅ ${member.displayName} — назначена роль ${suitableRole.name}`;
                } else {
                    return `✔️ ${member.displayName} — роль ${suitableRole.name} уже назначена`;
                }
            }));

            const successful = results.filter(r => r.startsWith('✅')).length;
            const already = results.filter(r => r.startsWith('✔️')).length;
            const noRole = results.filter(r => r.startsWith('ℹ️')).length;
            const failed = results.filter(r => r.startsWith('❌')).length;

            const summary = `**Scan Results**\n` +
                `Всего пользователей: ${results.length}\n` +
                `✅ Назначено ролей: ${successful}\n` +
                `✔️ Уже имели нужную роль: ${already}\n` +
                `ℹ️ Без подходящей роли: ${noRole}\n` +
                `❌ Не найдено на сервере: ${failed}\n`;

            const detailed = results.join('\n');
            const messages = splitMessage(summary + '\n' + detailed);
            await interaction.editReply(messages[0]);
            for (let i = 1; i < messages.length; i++) {
                await interaction.followUp({ content: messages[i], ephemeral: true });
            }
        } catch (e) {
            console.error('Scan command error:', e);
            if (e instanceof DiscordAPIError) {
                await interaction.editReply({
                    content: '❌ An error occurred while processing the command. Please try again later.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: '❌ An unexpected error occurred. Please try again later.',
                    ephemeral: true
                });
            }
        }
    }
}