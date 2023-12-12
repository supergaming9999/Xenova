const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
    show: false,
    name: "addmonkey",
    description: "Add monkey to another player.",
    usage: "<@User> <Number>",
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    execute(client, message, args, config, profileData) {
        if (message.author.id !== config.owner) {
            return;
        }
        var usageError = client.simpleEmbed(`Usage: **${config.prefix}${message.label} ${this.usage}**`);
        if (args.length < 2) {
            return message.reply(usageError);
        }
        var target = message.mentions.users.first();
        if (!target) {
            return message.reply(usageError);
        }
        var input = args[1].replace(/[<>]/g, '');
        if (isNaN(input)) {
            return message.reply(usageError);
        }
        var rawMonkey = Number.parseFloat(input);
        DB.addMonkey(target, rawMonkey);
        var monkey = Util.formatNumber(rawMonkey);
        var embed = new EmbedBuilder()
            .setColor('#2200ff')
            .setAuthor({
                name: `${target.tag.includes("#") ? `${target.tag} / ${target.username}` : `${target.username}`}`,
                iconURL: target.displayAvatarURL()
            })
            .setDescription(`:monkey: **${monkey} Monkey** has been added to ${target.toString()}!`)
            .setFooter({
                text: `${message.member && message.member.nickname ? `${message.member.nickname} / ${message.author.tag}` : `${message.author.tag}`}`,
                iconURL: message.author.displayAvatarURL()
            });

        return message.sreply({ embeds: [embed] }).catch(console.error);
    }
}