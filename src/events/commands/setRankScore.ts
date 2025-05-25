import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

export const setRankScoreCommandSettings = new SlashCommandBuilder()
    .setName('set-rank-score')
    .setDescription('Изменить репутацию пользователя вручную (админ)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Пользователь, которому изменить репутацию')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('score')
            .setDescription('Новое значение репутации')
            .setRequired(true));

export const setRankScoreCommand = async (interaction: any) => {
    if (interaction.commandName !== 'set-rank-score') return;
    const user = interaction.options.getUser('user');
    const score = interaction.options.getInteger('score');
    const usersPath = path.join(process.cwd(), 'db', 'users.json');
    let usersDB = {};
    try {
        usersDB = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    } catch {
        await interaction.reply({ content: '❌ Не удалось загрузить базу пользователей.', ephemeral: true });
        return;
    }
    if (!usersDB[user.id]) {
        await interaction.reply({ content: `❌ Пользователь ${user.tag} не найден в базе.`, ephemeral: true });
        return;
    }
    usersDB[user.id].reputationScore = score;
    fs.writeFileSync(usersPath, JSON.stringify(usersDB, null, 2), 'utf-8');
    await interaction.reply({ content: `✅ Репутация пользователя ${user.tag} изменена на ${score}.`, ephemeral: true });
}; 