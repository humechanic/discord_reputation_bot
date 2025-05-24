import { SlashCommandBuilder, PermissionFlagsBits, PermissionResolvable } from 'discord.js';
import { writeFile } from 'fs/promises';
import path from 'path';

interface RoleConfig {
    name: string;
    color: string;
    permissions: PermissionResolvable;
    requiredReputation: number;
    id?: string;
}

const setupSessions = new Map<string, { roles: RoleConfig[]; step: number; currentRole: Partial<RoleConfig>; channelId: string }>();

export const setupCommandSettings = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Start interactive setup for roles (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option =>
        option.setName('finished')
            .setDescription('Finish setup and save roles')
            .setRequired(false));

const ROLES_PATH = path.join(process.cwd(), 'db', 'roles.json');

export async function setupCommand(interaction: any) {
    if (interaction.commandName !== 'setup') return;
    const userId = interaction.user.id;
    const finished = interaction.options.getBoolean('finished') ?? false;
    const channel = interaction.channel;

    // Если finished == true, завершаем и сохраняем
    if (finished) {
        const session = setupSessions.get(userId);
        if (!session || !session.roles.length) {
            await interaction.reply({ content: '❌ Нет данных для сохранения. Сначала добавьте хотя бы одну роль через /setup.', ephemeral: true });
            return;
        }
        // Создать роли на сервере
        const guild = interaction.guild;
        const createdRoles: RoleConfig[] = [];
        for (const role of session.roles) {
            let discordRole = guild.roles.cache.find((r: any) => r.name === role.name);
            if (!discordRole) {
                discordRole = await guild.roles.create({
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions,
                    reason: 'Setup command: auto-created reputation role'
                });
            }
            createdRoles.push({ ...role, id: discordRole.id });
        }
        // Преобразуем permissions к строке для JSON
        const serializableRoles = createdRoles.map(role => ({
            ...role,
            permissions: typeof role.permissions === 'bigint' ? role.permissions.toString() : role.permissions
        }));
        await writeFile(ROLES_PATH, JSON.stringify(serializableRoles, null, 2), 'utf-8');
        setupSessions.delete(userId);
        await interaction.reply({ content: '✅ Все роли созданы на сервере и конфигурация сохранена в @db/roles.json!', ephemeral: true });
        return;
    }

    // Если нет сессии — стартуем интерактив
    if (!setupSessions.has(userId)) {
        setupSessions.set(userId, { roles: [], step: 0, currentRole: {}, channelId: interaction.channelId });
        await interaction.reply({ content: '🛠️ Начинаем настройку ролей! Введите название первой роли в этот канал:', ephemeral: true });
        waitForNextStep(interaction, userId);
        return;
    } else {
        await interaction.reply({ content: '❗ Сессия setup уже запущена. Введите данные в канал или завершите через /setup finished:true.', ephemeral: true });
        return;
    }
}

async function waitForNextStep(interaction: any, userId: string) {
    const session = setupSessions.get(userId)!;
    const channel = interaction.channel;
    const step = session?.step;
    const filter = (m: any) => m.author.id === userId && m.channelId === session.channelId;
    const ask = async (content: string) => {
        await channel.send({ content: content });
        const collected = await channel.awaitMessages({ filter, max: 1, time: 120_000, errors: ['time'] }).catch(() => null);
        if (!collected || collected.size === 0) {
            await channel.send('⏰ Время ожидания истекло. Сессия setup завершена.');
            setupSessions.delete(userId);
            return;
        }
        return collected.first().content.trim();
    };

    // Step 0: Название роли
    if (step === 0) {
        const name = await ask('Введите название роли:');
        if (!name || name.length < 2) {
            await channel.send('❌ Название роли слишком короткое. Попробуйте снова.');
            return waitForNextStep(interaction, userId);
        }
        session.currentRole = { name };
        session.step = 1;
        return waitForNextStep(interaction, userId);
    }
    // Step 1: Цвет
    if (step === 1) {
        const colorExamples = [
            '🔴 Красный:   #FF0000',
            '🟠 Оранжевый: #FFA500',
            '🟡 Жёлтый:    #FFFF00',
            '🟢 Зелёный:   #00FF00',
            '🔵 Синий:     #0000FF',
            '🟣 Фиолетовый: #800080',
            '⚪ Белый:     #FFFFFF',
        ].join('\n');
        const color = await ask(`🎨 Введите hex-код цвета роли (например, #00FF00):\n\nПримеры:\n${colorExamples}`);
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            await channel.send('❌ Некорректный hex-код. Попробуйте снова.');
            return waitForNextStep(interaction, userId);
        }
        session.currentRole.color = color;
        session.step = 2;
        return waitForNextStep(interaction, userId);
    }
    // Step 2: Permissions
    if (step === 2) {
        const permissionFlags = [
            { flag: 'ViewChannel', desc: 'Просмотр каналов' },
            { flag: 'SendMessages', desc: 'Отправка сообщений' },
            { flag: 'ManageRoles', desc: 'Управление ролями' },
            { flag: 'KickMembers', desc: 'Кикать участников' },
            { flag: 'BanMembers', desc: 'Банить участников' },
            { flag: 'Administrator', desc: 'Все права (админ)' },
            { flag: 'ManageChannels', desc: 'Управление каналами' },
            { flag: 'ManageGuild', desc: 'Управление сервером' },
            { flag: 'EmbedLinks', desc: 'Встраивать ссылки' },
            { flag: 'AttachFiles', desc: 'Прикреплять файлы' },
            { flag: 'ReadMessageHistory', desc: 'Читать историю сообщений' },
            { flag: 'MentionEveryone', desc: 'Упоминать всех' },
            { flag: 'ManageMessages', desc: 'Управлять сообщениями' },
            { flag: 'MuteMembers', desc: 'Мутить участников' },
            { flag: 'DeafenMembers', desc: 'Отключать звук участникам' },
            { flag: 'MoveMembers', desc: 'Перемещать участников' },
            { flag: 'ManageNicknames', desc: 'Управлять никами' },
            { flag: 'ManageWebhooks', desc: 'Управлять вебхуками' },
            { flag: 'ManageEmojisAndStickers', desc: 'Управлять эмодзи и стикерами' },
            // ... можно добавить остальные по необходимости
        ];
        const flagsList = permissionFlags.map(f => `- ${f.flag}: ${f.desc}`).join('\n');
        const perms = await ask(
            `🔒 Введите permissions (число, строка или список флагов через запятую, например, 104324673 или 'ViewChannel,SendMessages'):\n\nВозможные флаги:\n${flagsList}`
        );
        let permissions: PermissionResolvable = perms;
        if (/^\d+$/.test(perms)) permissions = BigInt(perms);
        else if (typeof perms === 'string' && perms.includes(',')) {
            permissions = perms.split(',').map(s => s.trim()) as PermissionResolvable;
        }
        if (!permissions) {
            await channel.send('❌ Некорректные permissions. Попробуйте снова.');
            return waitForNextStep(interaction, userId);
        }
        session.currentRole.permissions = permissions;
        session.step = 3;
        return waitForNextStep(interaction, userId);
    }
    // Step 3: Порог репутации
    if (step === 3) {
        const rep = await ask('⭐ Введите порог репутации для этой роли (целое число):');
        const repNum = Number(rep);
        if (!Number.isInteger(repNum) || repNum < 0) {
            await channel.send('❌ Некорректный порог. Попробуйте снова.');
            return waitForNextStep(interaction, userId);
        }
        session.currentRole.requiredReputation = repNum;
        session.roles.push(session.currentRole as RoleConfig);
        session.currentRole = {};
        session.step = 0;
        await channel.send('✅ Роль добавлена! Введите название следующей роли или используйте /setup finished:true для завершения.');
        return waitForNextStep(interaction, userId);
    }
} 