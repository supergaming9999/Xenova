const { Message } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');
const DB = require('../../util/DB');
const blackjack = require("../../util/Blackjack");

module.exports = {
    show: true,
    name: "blackjack",
    aliases: ["bj", "21"],
    description: "Gamble monkey in the classic card game blackjack.",
    usage: "<Monkey Bet Number>",
    cooldown: 10,
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        var input = args.length ? args[0].replace(/[<>]/g, "") : null;
        if (!input) {
            return message.reply(client.simpleEmbed(`You need to enter a bet amount!\n**${config.prefix}${message.label} <Your Monkey Bet>**`));
        }
        if (isNaN(input)) {
            return message.reply(client.simpleEmbed(`You need to enter a bet **number** amount\n**${config.prefix}${message.label} <Your Monkey Number Bet>**`));
        }

        var bet = parseInt(input);
        if (bet > profileData.monkey) {
            return message.reply(client.simpleEmbed(`You don't have that much! Try betting less.`));
        }
        if (bet < 1) {
            return message.reply(client.simpleEmbed(`You can't bet less than 1 Monkey! Try betting more.`));
        }

        var game = await blackjack(message, { transition: "edit", insurance: false, split: false, doubledown: false, bet });

        switch (game.result) {
            case "WIN":
                DB.addMonkey(message.author, bet);
                break;
            case "LOSE":
                DB.addMonkey(message.author, -bet);
                break;
        }
    }
}