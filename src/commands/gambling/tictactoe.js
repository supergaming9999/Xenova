const { EmbedBuilder, Message, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');

const { TicTacToe } = require("../../util/Games");

const { blank: empty, x, o } = require("../../../config.json").emojis;

const defaultGame = [
    [empty, empty, empty],
    [empty, empty, empty],
    [empty, empty, empty],
];

module.exports = {
    show: true,
    name: "tictactoe",
    aliases: ["ttt", "tic", "tac", "toe"],
    description: "Gamble monkey on a game of Tic Tac Toe.",
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
        if (TicTacToe.has(message.author.id)) {
            return message.reply(client.simpleEmbed(`You are already in a tic tac toe game! [[Click Me To Go There]](${Util.createUrl(TicTacToe.get(message.author.id).msg)})`));
        }
        if (!args.length || !args[0].replace(/[<>]/g, "")) {
            return message.reply(client.simpleEmbed(`You need to enter a bet amount!\n**${config.prefix}${message.label} <Your Monkey Bet>**`));
        }
        var input = args[0].replace(/[<>]/g, "");
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

        var tttGame = structuredClone(defaultGame);

        var player = ["X", "O"][Math.round(Math.random())];

        if (player == "O") {
            var ranSplitID = getRandomSlot(tttGame).split(',');
            tttGame[ranSplitID[0]][ranSplitID[1]] = x;
        }

        const row1 = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId('0,0').setEmoji(tttGame[0][0]).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('0,1').setEmoji(tttGame[0][1]).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('0,2').setEmoji(tttGame[0][2]).setStyle(ButtonStyle.Secondary),
        ]);

        const row2 = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId('1,0').setEmoji(tttGame[1][0]).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('1,1').setEmoji(tttGame[1][1]).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('1,2').setEmoji(tttGame[1][2]).setStyle(ButtonStyle.Secondary),
        ]);

        const row3 = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId('2,0').setEmoji(tttGame[2][0]).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('2,1').setEmoji(tttGame[2][1]).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('2,2').setEmoji(tttGame[2][2]).setStyle(ButtonStyle.Secondary),
        ]);

        const embed = new EmbedBuilder()
            .setColor("Purple")
            .setAuthor({
                name: "Tic Tac Toe"
            })
            .setDescription(
                `:monkey: You bet **${Util.formatNumber(bet)} Monkey**` + "\n" +
                `${player == "X" ? x : o} You are **${player}**!`
                )
            .setFooter({
                text: `Click a button below!`,
                iconURL: message.author.displayAvatarURL()
            });

        var msg = await message.reply({ embeds: [embed], components: [row1, row2, row3], content: message.author.toString() });
        
        TicTacToe.set(message.author.id, {
            board: tttGame,
            player,
            bet,
            msg
        });
    }
}


/**
 * @param {String[][]} game 
 */
function getRandomSlot(game) {
    var rowI = 0;
    var emptySlots = [];
    for (var row of game) {
        var slotI = 0;
        for (var slot of row) {
            if (slot == empty) emptySlots.push(`${rowI},${slotI}`);
            slotI++;
        }
        rowI++;
    }
    return emptySlots[Math.floor(Math.random() * emptySlots.length)];
}