const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
    show: true,
    name: "bank",
    description: "Deposit or withdraw monkey from your bank.",
    usage: "<Deposit|Withdraw> <Amount>",
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    execute(client, message, args, config, profileData) {
        var usageError = client.simpleEmbed(`Usage: **${config.prefix}${message.label} ${this.usage}**`);
        var embed = new EmbedBuilder()
            .setColor('Aqua')
            .setAuthor({
                name: "Monkey Bank",
                iconURL: client.user.displayAvatarURL()
            })
            .setFooter({
                text: `${message.author.displayName == message.author.username ? message.author.username : `${message.author.displayName} / ${message.author.username}`}`,
                iconURL: message.author.displayAvatarURL()
            });
        if (args.length > 1) {
            var type = args[0].replace(/[<>]/g, '').toLowerCase();
            if (!["deposit", "d", "add", "withdraw", "w", "take"].includes(type)) {
                usageError.embeds[0].setFooter({
                    text: "Enter either 'deposit' or 'withdraw'."
                });
                return message.reply(usageError);
            }
            var input = args[1].replace(/[<>]/g, '');
            if (isNaN(input) && input.toLowerCase() != "all") {
                return message.reply(usageError);
            }
            var amount = isNaN(input) ? profileData.monkey : parseInt(input);
            if (amount < 1) {
                usageError.embeds[0].setFooter({
                    text: "You cannot " + type + " less than 1 monkey!"
                });
                return message.reply(usageError);
            }
            switch (type) {
                case "d":
                case "add":
                case "deposit":
                    if (amount > profileData.monkey) {
                        return message.reply(client.simpleEmbed("You cannot deposit more than you have!"));
                    }
                    if (profileData.bank == 0) {
                        profileData.interestTime = Date.now() + (1000 * 60 * 60 * 24);
                        profileData.save();
                    }

                    DB.addMonkey(message.author, -amount);
                    DB.addBank(message.author, amount);
                    embed.setDescription(`Deposited **${Util.formatNumber(amount)} Monkey**.`);
                    break;
                case "w":
                case "take":
                case "withdraw":
                    if (amount > profileData.bank) {
                        return message.reply(client.simpleEmbed("You do not have that much in your bank!"));
                    }

                    DB.addBank(message.author, -amount);
                    DB.addMonkey(message.author, amount);
                    embed.setDescription(`Withdrew **${Util.formatNumber(amount)} Monkey**`);
                    break;
            }
            return message.reply({ embeds: [embed] });
        }
        var monkey = profileData.bank;
        embed.addFields(
            {
                name: "Monkey",
                value: ":monkey: **" + Util.formatNumber(monkey) + "**",
                inline: true
            },
            {
                name: ":chart_with_upwards_trend: Interest Rate",
                value: `5% - ${monkey > 0 ? Util.formatNumber(Math.round(monkey * 0.05)) : '0'}/day`,
                inline: true
            },
            {
                name: "⏲ Next Interest Deposit",
                value: monkey > 0 ? Util.formatTime(profileData.interestTime - Date.now()) : "Deposit monkey to earn daily interest",
                inline: true
            }
        );

        var msg = { embeds: [embed] };

        if (profileData.bank == 0) {
            var tip = new EmbedBuilder()
                .setColor('DarkGold')
                .setDescription(`You can deposit monkey with **${config.prefix}${message.label} deposit <Amount>**\n_Your due interest will be automatically added._`);
            msg.embeds.push(tip);
        }

        return message.reply(msg).catch(console.error);
    }
}