import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { soundFilePath } from "./constants/index.js";
import fs from 'fs';
import prism from 'prism-media';

const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe';

export async function playSound(newState, userAudioPlayers) {
    const userId = newState.member.user.id;
    const connection = joinVoiceChannel({
        channelId: newState.channelId,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
    });
    try {
        const player = createAudioPlayer();

        const resource = createAudioResource(
            fs.createReadStream(soundFilePath)
                .pipe(new prism.FFmpeg({
                    args: [
                        '-i', 'pipe:0',      // Чтение из потока
                        '-f', 'opus',        // Формат Opus
                        '-ar', '48000',      // Частота дискретизации
                        '-ac', '2',          // Два канала
                    ],
                    executablePath: ffmpegPath
                }))
        );

        player.play(resource);

        connection.subscribe(player);

        player.on('error', (error) => {
            console.error('Ошибка воспроизведения:', error);
            if (connection && connection.state.status !== 'destroyed') {
                connection.destroy();
            }
            userAudioPlayers.delete(userId);
        });

        player.on(AudioPlayerStatus.Idle, () => {
            if (connection && connection.state.status !== 'destroyed') {
                connection.destroy();
            }
        });

    } catch (e) {
        console.log('ERROR', e)
        if (connection && connection.state.status !== 'destroyed') connection.destroy()
    }
}