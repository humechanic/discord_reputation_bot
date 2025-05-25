import { userMention } from 'discord.js';
import { MESSAGE_TYPES } from '../../../../shared/constants/messageTypes.js';
import { addMessageType } from '../../../../shared/utils/messageTypeUtils.js';

export async function getEditMessage(message: any, author: any, ups: string[], downs: string[], score: number) {
    const content =
        `### 📊 Изменение репутации\n` +
        `**Пользователь:** ${userMention(author.id)}\n` +
        `**Действие:** Изменение репутации\n` +
        `**Повысили:** ${ups.join(', ')}\n` +
        `**Понизили:** ${downs.join(', ')}\n` +
        `**Новый рейтинг:** ${score} ⭐`;

    await message.edit(addMessageType(content, MESSAGE_TYPES.REPUTATION_CHANGE));
}