const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');
const DB = require('../../util/DB');

// 1 is heads, 0 is tails

function evaluate(choice) {
    var side = choice.toLowerCase();
    if (side.startsWith("h")) {
        return 1;
    } else if (side.startsWith("t")) {
        return 0;
    }
    return null;
}

module.exports = {
    show: true,
    name: "coinflip",
    aliases: ["cf", "coin", "flip"],
    description: "Gamble monkey on a coinflip.",
    usage: "<Number> <heads|tails>",
    cooldown: 5,
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        var usageError = client.simpleEmbed(`Usage: **${config.prefix}${message.label} ${this.usage}**`);
        if (!args || args.length < 2) {
            return message.reply(usageError);
        }
        var amount = args[0].replace(/[<>]/g, '');
        if (isNaN(amount) || (Math.sign(amount) < 0)) {
            return message.reply(usageError);
        }
        var betNum = parseFloat(amount);
        if (betNum > profileData.monkey) {
            return message.reply(client.simpleEmbed(`You don't have that much! Try betting less.`));
        }
        if (betNum < 1) {
            return message.reply(client.simpleEmbed(`You can't bet nothing!`));
        }
        var id = evaluate(args[1].replace(/[<>]/g, ''));
        if (id === null) {
            return message.reply(usageError);
        }
        var { emojis } = config;
        var choice = id ? "heads" : "tails";

        var bet = Util.formatNumber(betNum);
        var embed = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({
                name: "Coinflip",
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(`:monkey: You bet **${bet} Monkey** on **${choice}**!`)
            .setFields({
                name: "The coin spins - " + emojis.coinflip,
                value: "You flip the coin..."
            });

        var flip = await message.reply({ embeds: [embed] });

        var resultId = Math.round(Math.random());
        var result = resultId ? "heads" : "tails";
        var winner = resultId === id;

        DB.addMonkey(message.author, winner ? betNum : -betNum);
        
        setTimeout(async () => {
            embed.setFields({
                name: "The coin lands - " + emojis[result],
                value: winner ? `:monkey_face: You won **${Util.formatNumber(betNum)} Monkey**!` : `You lost it all :(`
            });
            flip.fetch().then((msg) => msg.edit({ embeds: [embed] })).catch(() => {});
        }, 3000);
    }
}