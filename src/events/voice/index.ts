import { Events } from "discord.js";
import { discordClient } from "../../api/discordClient.js";
import { playSound } from "./adminRoleSound.js";
import { getAudioFileByRole } from "./utils/getAudioFileByRole.js";


const userAudioPlayers = new Map(); // map of active players

export const onJoinUsersEvents = async () => {

    discordClient.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const member = newState.member
        const userId = member?.user.id;
        const roles = member?.roles.cache;

        const audioFileByRole = getAudioFileByRole(roles);


        if (audioFileByRole) {
            // on switch channels
            if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                handleUserChannelSwitch(oldState, newState, audioFileByRole);
            }
            // on leave channel
            else if (oldState.channelId && !newState.channelId) {
                stopAudioForUser(userId);
            }
            // on first entry
            else if (!oldState.channelId && newState.channelId) {
                playAudioForUser(newState, audioFileByRole);
            }
        }
    });
}


function handleUserChannelSwitch(oldState, newState, audioFile) {
    const userId = newState.member.user.id;
    stopAudioForUser(userId); // stop old playing
    playAudioForUser(newState, audioFile); // start playing in new channel
}

function playAudioForUser(newState, audioFile) {
    playSound(newState, userAudioPlayers, audioFile);
}


function stopAudioForUser(userId) {
    const audioData = userAudioPlayers.get(userId);
    if (audioData) {
        audioData.player.stop();


        if (audioData.connection && audioData.connection.state.status !== 'destroyed') {
            audioData.connection.destroy();
        }

        userAudioPlayers.delete(userId);
    }
}