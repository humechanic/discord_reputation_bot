
import { DiscordAPIError, Events } from 'discord.js';
import { discordClient } from '../../api/discordClient.js';


export const scanCommand = async () => {
    discordClient.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'scan') {
            const { guilds } = discordClient;
            const guild = await guilds.fetch(process.env.GUILD_ID);
            const members = await guild.members.fetch();

            const userNames = Array.from(members.entries()).map(([userId, userData]) => {
                return userData.displayName
            })
            try {
                await interaction.reply(JSON.stringify(userNames));
            } catch (e) {
                if (e) {
                    console.log((e.rawError).errors)
                    await interaction.reply('Opss')
                } else {
                    console.log(e)
                    await interaction.reply('Unhandled error')
                }

            }
        }
    });
}