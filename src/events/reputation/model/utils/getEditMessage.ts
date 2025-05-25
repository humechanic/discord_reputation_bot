export async function getEditMessage(message: any, author: any, ups: string[], downs: string[], score: number) {
    await message.edit(
        `### 📊 Изменение репутации\n` +
        `**Пользователь:** ${author.username}\n` +
        `**Действие:** Изменение репутации\n` +
        `**Повысили:** ${ups.join(', ')}\n` +
        `**Понизили:** ${downs.join(', ')}\n` +
        `**Новый рейтинг:** ${score} ⭐`
    );
}