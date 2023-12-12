const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
    show: true,
    name: "daily",
    description: "Get some daily monkeys.",
    cooldown: 3,
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        if (profileData.dailyTime) {
            var cooldown = profileData.dailyTime - Date.now();
            if ((cooldown / 1000 / 60 / 60) > 0) {
                return message.reply(client.simpleEmbed(`⏲ Your daily is still on cooldown until **${Util.formatTime(cooldown)}**`))
            }
        }
        var { daily, nextTime } = await DB.applyRewards(profileData);
        var monkey = Util.formatNumber(daily);
        var embed = new EmbedBuilder()
            .setColor('#b7ff00')
            .setAuthor({
                name: "Daily",
                iconURL: message.author.displayAvatarURL()
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

        return message.sreply({ embeds: [embed] }).catch(console.error);
    }
}