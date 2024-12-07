import { Events } from "discord.js";
import { discordClient } from "../../api/discordClient";
import { getRoles } from "../../api/users/index";
import { playSound } from "./adminRoleSound";


const userAudioPlayers = new Map(); // map of active players

export const onJoinUsersEvents = async () => {

    const roles = await getRoles();
    const { id: targetRoleId = '' } = roles.find(r => r.name === 'admin') || {}

    discordClient.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const userId = newState.member?.user.id;
        const member = newState.member;

        if (member?.roles.cache.has(targetRoleId)) {
            // on switch channels
            if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                handleUserChannelSwitch(oldState, newState);
            }
            // on leave channel
            else if (oldState.channelId && !newState.channelId) {
                stopAudioForUser(userId);
            }
            // on first entry
            else if (!oldState.channelId && newState.channelId) {
                playAudioForUser(newState);
            }
        }
    });
}


function handleUserChannelSwitch(oldState, newState) {
    const userId = newState.member.user.id;
    stopAudioForUser(userId); // stop old playing
    playAudioForUser(newState); // start playing in new channel
}

function playAudioForUser(newState) {
    playSound(newState, userAudioPlayers);
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