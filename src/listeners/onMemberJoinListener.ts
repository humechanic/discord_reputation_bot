import { discordClient } from "@api/discordClient.js";
import { Events, EmbedBuilder, Colors, TextChannel } from "discord.js";
import { ROLE_HIERARCHY } from "../shared/config/roles.js";
import { getUsersDB } from "@shared/utils/dbAccess.js";

export const onMemberJoinListener = () => {
    discordClient.on(Events.GuildMemberAdd, async (member) => {
        try {
            // Get the base role (Newcomer)
            const baseRole = member.guild.roles.cache.find(role => role.name === ROLE_HIERARCHY[0].name);
            if (baseRole) {
                await member.roles.add(baseRole);
            }

            // Initialize user in database if not exists
            const usersDB = getUsersDB();
            if (!usersDB[member.id]) {
                usersDB[member.id] = {
                    reputationScore: 0,
                    lastReputationGiven: null
                };
            }

            // Create welcome embed
            const welcomeEmbed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('👋 Welcome to the Lounge zone discord server, wanderer!')
                .setDescription(`Welcome ${member.nickname} (aka. ${member.displayName})! We're glad to have you here.`)
                .addFields(
                    {
                        name: '🎭 Role System',
                        value: 'Our server uses a reputation-based role system. As you participate and contribute, you\'ll earn reputation points and unlock new roles!'
                    },
                    {
                        name: '⭐ How to Earn Reputation',
                        value: '• Be helpful and contribute to discussions\n• Participate in community events\n• Follow server rules and guidelines'
                    },
                    {
                        name: '📊 Available Roles',
                        value: ROLE_HIERARCHY.map(role =>
                            `**${role.name}** - ${role.requiredReputation} ⭐`
                        ).join('\n')
                    },
                    {
                        name: '🔍 Check Your Status',
                        value: 'Use `/merank` to check your reputation score and role progress!'
                    }
                )
                .setFooter({ text: 'Enjoy your stay!' })
                .setTimestamp();

            // Send welcome message
            const welcomeChannel = member.guild.channels.cache.get('517421257243754496') as TextChannel;
            if (welcomeChannel) {
                await welcomeChannel.send({ embeds: [welcomeEmbed] });
            }


        } catch (error) {
            console.error('Error in member join event:', error);
        }
    });
}
