import { RoleConfig } from "@shared/config/roles.js";
import { ChatInputCommandInteraction, PermissionResolvable, TextChannel } from "discord.js";
import { SetupSession } from "../setup.js";
import { COLOR_EXAMPLES } from "@shared/constants/colors.js";
import { PERMISSION_FLAGS } from "@shared/constants/permissions.js";

export async function waitForNextStep(
    interaction: ChatInputCommandInteraction,
    userId: string,
    setupSessions: Map<string, SetupSession>,
    isEdit?: boolean
) {
    const channel = interaction.channel;
    const textChannel = channel && channel instanceof TextChannel ? channel : undefined;
    const session = setupSessions.get(userId);
    if (!session) {
        // if session is not found, maybe finished was called — just finish
        if (isEdit) {
            await textChannel?.send('Setup session finished.');
            setupSessions.delete(userId);
        }
        return;
    }
    if (interaction.commandName) {
        console.log(interaction.commandName);
    }

    const step = session?.step;
    const filter = (m: any) => m.author.id === userId && m.channelId === session.channelId;
    const ask = async (content: string) => {
        if (!textChannel) {
            setupSessions.delete(userId);
            return '';
        }
        await textChannel.send({ content: content });
        const collected = await textChannel.awaitMessages({ filter, max: 1, time: 120_000, errors: ['time'] }).catch(() => null);
        if (!collected || collected.size === 0) {
            await textChannel.send('⏰ Время ожидания истекло. Сессия setup завершена.');
            setupSessions.delete(userId);
            return '';
        }
        return collected.first()?.content.trim() || '';
    };

    // if user called finished during the dialog
    if (isEdit) {
        if (textChannel) {
            await textChannel.send('Сессия setup завершена по вашему запросу.');
        }
        setupSessions.delete(userId);
        return;
    }

    // Step 0: Role name
    if (step === 0) {
        const name = await ask('Введите название роли:');
        if ((!name || name.length < 2) && !(isEdit && name === '0')) {
            if (textChannel) {
                await textChannel.send('❌ Название роли слишком короткое. Попробуйте снова.');
            }
            return waitForNextStep(interaction, userId, setupSessions, isEdit);
        }
        if (!isEdit || name !== '0') {
            session.currentRole.name = name;
        }
        session.step = 1;
        return waitForNextStep(interaction, userId, setupSessions, isEdit);
    }
    // Step 1: Color
    if (step === 1) {
        const color = await ask(`🎨 Enter the hex code of the role color (e.g., #00FF00):\n\nExamples:\n${COLOR_EXAMPLES.join('\n')}`);
        if ((!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) && !(isEdit && color === '0')) {
            if (textChannel) {
                await textChannel.send('❌ Некорректный hex-код. Попробуйте снова.');
            }
            return waitForNextStep(interaction, userId, setupSessions, isEdit);
        }
        if (isEdit && color === '0') {
            // Пропуск — оставляем старый цвет
        } else {
            session.currentRole.color = color;
        }
        session.step = 2;
        return waitForNextStep(interaction, userId, setupSessions, isEdit);
    }
    // Step 2: Permissions
    if (step === 2) {
        const flagsList = PERMISSION_FLAGS.map(f => `- ${f.flag}: ${f.desc}`).join('\n');
        const permsRaw = await ask(
            `🔒 Введите permissions (число, строка или список флагов через запятую, например, 104324673 или 'ViewChannel,SendMessages'):\n\nВозможные флаги:\n${flagsList}`
        );
        let permissions: PermissionResolvable | undefined = undefined;
        const perms = permsRaw || '';
        if (isEdit && permsRaw === '0') {
            // Пропуск — оставляем старые permissions
        } else {
            if (/^\d+$/.test(perms)) permissions = BigInt(perms);
            else if (typeof perms === 'string' && perms.includes(',')) {
                permissions = perms.split(',').map(s => s.trim()) as PermissionResolvable;
            } else if (typeof perms === 'string' && perms.length > 0) {
                permissions = perms as PermissionResolvable;
            }
            if (!permissions) {
                if (textChannel) {
                    await textChannel.send('❌ Некорректные permissions. Попробуйте снова.');
                }
                return waitForNextStep(interaction, userId, setupSessions, isEdit);
            }
            session.currentRole.permissions = permissions;
        }
        session.step = 3;
        return waitForNextStep(interaction, userId, setupSessions, isEdit);
    }
    // Step 3: Reputation threshold
    if (step === 3) {
        const rep = await ask('⭐ Enter the reputation threshold for this role (integer):');
        let repNum: number | undefined = undefined;
        if (isEdit && rep === '0') {
            // Пропуск — оставляем старый requiredReputation
            repNum = session.currentRole.requiredReputation;
        } else {
            repNum = Number(rep);
            if (!Number.isInteger(repNum) || repNum < 0) {
                if (textChannel) {
                    await textChannel.send('❌ Некорректный порог. Попробуйте снова.');
                }
                return waitForNextStep(interaction, userId, setupSessions, isEdit);
            }
            session.currentRole.requiredReputation = repNum;
        }
        // Если это редактирование существующей роли
        if (isEdit) {
            // Найти роль на сервере по ID или имени
            const guild = interaction.guild;
            let discordRole: any = undefined;
            if (session.currentRole.id) {
                discordRole = guild?.roles.cache.get(session.currentRole.id);
            }
            if (!discordRole && session.currentRole.name) {
                discordRole = guild?.roles.cache.find((r: any) => r.name === session.currentRole.name);
            }
            if (discordRole) {
                await discordRole.edit({
                    name: session.currentRole.name,
                    color: session.currentRole.color,
                    permissions: session.currentRole.permissions
                });
            }
            // Обновить только requiredReputation в roles.json
            const path = require('path');
            const fs = require('fs');
            const ROLES_PATH = path.join(process.cwd(), 'db', 'roles.json');
            let roles: RoleConfig[] = [];
            try {
                const file = fs.readFileSync(ROLES_PATH, 'utf-8');
                roles = JSON.parse(file);
            } catch { }
            const idx = roles.findIndex(r => (r.id && r.id === session.currentRole.id) || r.name === session.currentRole.name);
            if (idx !== -1 && repNum !== undefined) {
                roles[idx].requiredReputation = repNum;
                fs.writeFileSync(ROLES_PATH, JSON.stringify(roles, null, 2), 'utf-8');
            }
            if (textChannel) {
                await textChannel.send('✅ Роль на сервере обновлена! Порог репутации изменён.');
            }
            setupSessions.delete(userId);
            return;
        } else {
            session.roles.push({
                name: session.currentRole.name!,
                color: session.currentRole.color!,
                permissions: session.currentRole.permissions!,
                requiredReputation: session.currentRole.requiredReputation!,
            });
            session.currentRole = {};
            session.step = 0;
            if (textChannel) {
                await textChannel.send('✅ Роль добавлена! Введите название следующей роли или используйте /setup finished:true для завершения.');
            }
            return waitForNextStep(interaction, userId, setupSessions);
        }
    }
} 