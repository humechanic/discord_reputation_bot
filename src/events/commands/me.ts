
import { DiscordAPIError, DiscordErrorData, Events } from 'discord.js';
import { discordClient } from '../../api/discordClient.js';


export const scanCommand = () => {
    discordClient.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'me') {
            const { guilds } = discordClient;
            const guild = await guilds.fetch(process.env.GUILD_ID as string);
            const members = await guild.members.fetch();

            const userNames = Array.from(members.entries()).map(([userId, userData]) => {
                return userData.displayName
            })
            try {
                await interaction.reply(JSON.stringify(userNames));
            } catch (e) {
                if (e instanceof DiscordAPIError) {
                    console.log((e.rawError as DiscordErrorData).errors)
                    await interaction.reply('Opss')
                } else {
                    console.log(e)
                    await interaction.reply('Unhandled error')
                }

            }
        }
    });
}