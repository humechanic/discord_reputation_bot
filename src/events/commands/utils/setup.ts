import { RoleConfig } from "@shared/config/roles.js";
import { ChatInputCommandInteraction, PermissionResolvable, TextChannel } from "discord.js";
import { SetupSession } from "../setup.js";

export async function waitForNextStep(interaction: ChatInputCommandInteraction, userId: string, setupSessions: Map<string, SetupSession>) {
    const session = setupSessions.get(userId)!;
    const channel = interaction.channel as TextChannel;
    const step = session?.step;
    const filter = (m: any) => m.author.id === userId && m.channelId === session.channelId;
    const ask = async (content: string) => {
        await channel?.send({ content: content });
        const collected = await channel?.awaitMessages({ filter, max: 1, time: 120_000, errors: ['time'] }).catch(() => null);
        if (!collected || collected.size === 0) {
            await channel?.send('⏰ Время ожидания истекло. Сессия setup завершена.');
            setupSessions.delete(userId);
            return;
        }
        return collected.first()?.content.trim() || '';
    };

    // Step 0: Название роли
    if (step === 0) {
        const name = await ask('Введите название роли:');
        if (!name || name.length < 2) {
            await channel?.send('❌ Название роли слишком короткое. Попробуйте снова.');
            return waitForNextStep(interaction, userId, setupSessions);
        }
        session.currentRole = { name };
        session.step = 1;
        return waitForNextStep(interaction, userId, setupSessions);
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
        if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            await channel?.send('❌ Некорректный hex-код. Попробуйте снова.');
            return waitForNextStep(interaction, userId, setupSessions);
        }
        session.currentRole.color = color;
        session.step = 2;
        return waitForNextStep(interaction, userId, setupSessions);
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
            await channel?.send('❌ Некорректные permissions. Попробуйте снова.');
            return waitForNextStep(interaction, userId, setupSessions);
        }
        session.currentRole.permissions = permissions;
        session.step = 3;
        return waitForNextStep(interaction, userId, setupSessions);
    }
    // Step 3: Порог репутации
    if (step === 3) {
        const rep = await ask('⭐ Введите порог репутации для этой роли (целое число):');
        const repNum = Number(rep);
        if (!Number.isInteger(repNum) || repNum < 0) {
            await channel?.send('❌ Некорректный порог. Попробуйте снова.');
            return waitForNextStep(interaction, userId, setupSessions);
        }
        session.currentRole.requiredReputation = repNum;
        session.roles.push(session.currentRole as RoleConfig);
        session.currentRole = {};
        session.step = 0;
        await channel?.send('✅ Роль добавлена! Введите название следующей роли или используйте /setup finished:true для завершения.');
        return waitForNextStep(interaction, userId, setupSessions);
    }
} 