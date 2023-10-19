const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
    show: true,
    name: "give",
    aliases: ["send"],
    description: "Give some of your monkey to another person.",
    usage: "<@User> <Number>",
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        var usageError = client.simpleEmbed(`Usage: **${config.prefix}${message.label} ${this.usage}**`);
        if (!args || !args.length || args.length < 2) {
            return message.reply(usageError);
        }
        var target = message.mentions.users.first();
        if (!target || target.bot) {
            return message.reply(usageError);
        }
        var targetData = await DB.getProfile(target);
        if (!targetData) {
            console.log(targetData);
            return message.reply(client.simpleEmbed("An error occured getting the target's data!"));
        }
        var input = args[1].replace(/[<>]/g, '');
        if (isNaN(input)) {
            return message.reply(usageError);
        }
        if (input > profileData.monkey) {
            return message.reply(client.simpleEmbed("You cannot give more than you have!"));
        }
        var rawMonkey = Number.parseFloat(input);
        DB.addMonkey(message.author, -rawMonkey);
        targetData.monkey += rawMonkey;
        targetData.save();
        var monkey = Util.formatNumber(rawMonkey);
        var embed = new EmbedBuilder()
            .setColor('#2200ff')
            .setAuthor({
                name: "Monkey Send",
                iconURL: target.displayAvatarURL()
            })
            .setDescription(`:monkey: ${message.author.toString()} has sent **${monkey} Monkey** to ${target.toString()}!`)
            .setFooter({
                text: `${message.member && message.member.nickname ? `${message.member.nickname} / ${message.author.tag}` : `${message.author.tag}`}`,
                iconURL: message.author.displayAvatarURL()
            });

        return message.sreply({ embeds: [embed] }).catch(console.error);
    }
}