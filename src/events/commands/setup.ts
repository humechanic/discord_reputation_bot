import { SlashCommandBuilder, PermissionFlagsBits, PermissionResolvable, ChatInputCommandInteraction, ColorResolvable } from 'discord.js';
import { writeFile } from 'fs/promises';
import path from 'path';
import { waitForNextStep } from './utils/setup.js';

export interface RoleConfig {
    name: string;
    color: string;
    permissions: PermissionResolvable;
    requiredReputation: number;
    id?: string;
}
export interface SetupSession {
    roles: RoleConfig[];
    step: number;
    currentRole: Partial<RoleConfig>;
    channelId: string
}

export const setupSessions = new Map<string, SetupSession>();

export const setupCommandSettings = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Start interactive setup for roles (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option =>
        option.setName('finished')
            .setDescription('Finish setup and save roles')
            .setRequired(false));

const ROLES_PATH = path.join(process.cwd(), 'db', 'roles.json');

export async function setupCommand(interaction: ChatInputCommandInteraction) {
    if (interaction.commandName !== 'setup') return;
    const userId = interaction.user.id;
    const finished = interaction.options.getBoolean('finished') ?? false;
    const channel = interaction.channel;


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
            let discordRole = guild?.roles.cache.find((r: any) => r.name === role.name);
            if (!discordRole) {
                discordRole = await guild?.roles.create({
                    name: role.name,
                    color: role.color as ColorResolvable,
                    permissions: role.permissions,
                    reason: 'Setup command: auto-created reputation role'
                });
            }
            createdRoles.push({ ...role, id: discordRole?.id || '' });
        }

        const serializableRoles = createdRoles.map(role => ({
            ...role,
            permissions: typeof role.permissions === 'bigint' ? role.permissions.toString() : role.permissions
        }));
        await writeFile(ROLES_PATH, JSON.stringify(serializableRoles, null, 2), 'utf-8');
        setupSessions.delete(userId);
        await interaction.reply({ content: '✅  Все роли созданы на сервере и конфигурация сохранена в db/roles.json', ephemeral: true });
        return;
    }

    // Если нет сессии — стартуем интерактив
    if (!setupSessions.has(userId)) {
        setupSessions.set(userId, { roles: [], step: 0, currentRole: {}, channelId: interaction.channelId });
        await interaction.reply({ content: '🛠️ Начинаем настройку ролей! Введите название первой роли в этот канал:', ephemeral: true });
        await waitForNextStep(interaction, userId, setupSessions);
        return;
    } else {
        await interaction.reply({ content: '❗ Сессия setup уже запущена. Введите данные в канал или завершите через /setup finished:true.', ephemeral: true });
        return;
    }
}