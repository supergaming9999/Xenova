const { ApplicationCommandType, EmbedBuilder, CommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
	name: 'daily',
	description: "Get some daily monkeys.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 3000,
    /**
     * @param {DiscordClient} client 
     * @param {CommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        if (profileData.dailyTime) {
            var cooldown = profileData.dailyTime - Date.now();
            if ((cooldown / 1000 / 60 / 60) > 0) {
                return interaction.reply(client.simpleEmbed(`⏲ Your daily is still on cooldown until **${Util.formatTime(cooldown)}**`))
            }
        }
        var daily = await DB.applyRewards(profileData);
        var monkey = Util.formatNumber(daily);
        var embed = new EmbedBuilder()
            .setColor('#b7ff00')
            .setAuthor({
                name: "Daily",
                iconURL: interaction.user.displayAvatarURL()
            })
            .addFields(
                {
                    name: ":monkey_face: Reward",
                    value: `**${monkey} Monkey**`,
                    inline: true
                },
                {
                    name: "Streak",
                    value: `:fire: **${profileData.dailyStreak}**`,
                    inline: true
                },
                {
                    name: "⏲ Next Daily",
                    value: Util.formatTime(nextTime - Date.now()),
                    inline: true
                }
            );

        return interaction.reply({ embeds: [embed] }).catch(console.error);
	}
};