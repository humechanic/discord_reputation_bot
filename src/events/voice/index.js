import { Events } from "discord.js";
import { discordClient } from "../../api/discordClient.js";
import { getRoles } from "../../api/users/index.js";
import { playSound } from "./adminRoleSound.js";

const userAudioPlayers = new Map(); // Хранит активные плееры для пользователей

export const onJoinUsersEvents = async () => {

    const roles = await getRoles();
    const { id: targetRoleId } = roles.find(r => r.name === 'admin')

    discordClient.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const userId = newState.member.user.id;
        const member = newState.member;

        if (member.roles.cache.has(targetRoleId)) {
            // Если пользователь переместился из одного канала в другой
            if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                handleUserChannelSwitch(oldState, newState);
            }
            // Если пользователь покинул канал
            else if (oldState.channelId && !newState.channelId) {
                stopAudioForUser(userId);
            }
            // Если пользователь впервые зашел в канал
            else if (!oldState.channelId && newState.channelId) {
                playAudioForUser(newState);
            }
        }
    });
}


function handleUserChannelSwitch(oldState, newState) {
    const userId = newState.member.user.id;
    stopAudioForUser(userId); // Останавливаем аудио в старом канале
    playAudioForUser(newState); // Проигрываем аудио в новом канале
}

function playAudioForUser(newState) {
    playSound(newState, userAudioPlayers)
}


function stopAudioForUser(userId) {
    const audioData = userAudioPlayers.get(userId);
    if (audioData) {
        audioData.player.stop(); // Останавливаем текущий плеер

        // Проверяем состояние подключения перед уничтожением
        if (audioData.connection && audioData.connection.state.status !== 'destroyed') {
            audioData.connection.destroy(); // Отключаемся от канала, если еще не уничтожено
        }

        userAudioPlayers.delete(userId); // Удаляем запись для пользователя
    }
}