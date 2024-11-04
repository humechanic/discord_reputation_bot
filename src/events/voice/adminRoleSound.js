import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { adminFilePath } from "./constants/index.js";
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
            fs.createReadStream(adminFilePath)
                .pipe(new prism.FFmpeg({
                    args: [
                        '-i', 'pipe:0',      // Read from stream
                        '-f', 'opus',        // Format Opus
                        '-ar', '48000',      // Hz
                        '-ac', '2',          // Stereo
                    ],
                    executablePath: ffmpegPath
                }))
        );

        player.play(resource);

        connection.subscribe(player);

        player.on('error', (error) => {
            console.error('Playing faield:', error);
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