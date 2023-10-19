const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');
const DB = require('../../util/DB');

module.exports = {
    show: true,
    name: "monkey",
    aliases: ["balance", "cash", "currency", "mk"],
    description: "Check your monkey balance.",
    /**
     * 
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Document && Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        if (args && args.length && message.author.id === config.owner) {
            var target = message.mentions.users.first();
            if (!target) {
                return message.reply(client.simpleEmbed("User not found!"));
            }
            var targetData = await DB.getProfile(target);
            var monkey = Util.formatNumber(targetData.monkey);
            var embed = new EmbedBuilder()
                .setColor('#2200ff')
                .setAuthor({
                    name: `${message.member && message.member.nickname ? `${message.member.nickname} / ${message.author.tag}` : `${message.author.tag}`}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`:monkey: ${target.toString()} has **${monkey} Monkey**!`);
    
            return message.sreply({ embeds: [embed] }).catch(console.error);
        }
        var monkey = Util.formatNumber(profileData.monkey);
        var embed = new EmbedBuilder()
            .setColor('#2200ff')
            .setAuthor({
                name: `${message.member && message.member.nickname ? `${message.member.nickname} / ${message.author.tag}` : `${message.author.tag}`}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(`:monkey: You have **${monkey} Monkey**!`);

        return message.sreply({ embeds: [embed] }).catch(console.error);
    }
}