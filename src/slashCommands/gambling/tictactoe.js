const { EmbedBuilder, MessageComponentInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction } = require("discord.js");
const Util = require("../../util/Util");
const DiscordClient = require("../../structures/DiscordClient");
const DB = require("../../util/DB");
const { formatNumber } = require("../../util/Util");

const { TicTacToe } = require("../../util/Games");

const { blank, x, o } = require("../../../config.json").emojis;

const defaultGame = [
    [blank, blank, blank],
    [blank, blank, blank],
    [blank, blank, blank],
];

module.exports = {
	name: 'tictactoe',
	description: "Gamble monkey on a game of Tic Tac Toe.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 10,
    options: [
        {
            name: "amount",
            description: "Your monkey bet amount number",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    /**
     * @param {DiscordClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        if (TicTacToe.has(interaction.user.id)) {
            return interaction.reply({ ...client.simpleEmbed(`You are already in a tic tac toe game! [[Click Me To Go There]](${Util.createUrl(TicTacToe.get(interaction.user.id).msg)})`), ephemeral: true });
        }

        var bet = interaction.options.getInteger("amount");
        if (bet > profileData.monkey) {
            return interaction.reply({ ...client.simpleEmbed(`You don't have that much! Try betting less.`), ephemeral: true });
        }
        if (Math.sign(bet) < 1) {
            return interaction.reply({ ...client.simpleEmbed(`You can't bet less than 1 Monkey! Try betting more.`), ephemeral: true });
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
                `:monkey: You bet **${formatNumber(bet)} Monkey**` + "\n" +
                `${player == "X" ? x : o} You are **${player}**!`
                )
            .setFooter({
                text: `Click a button below!`,
                iconURL: interaction.user.displayAvatarURL()
            });
        
        var msg = await interaction.reply({ embeds: [embed], components: [row1, row2, row3], content: interaction.user.toString() });

        TicTacToe.set(interaction.user.id, {
            board: tttGame,
            player,
            bet,
            msg
        });
    },
    /**
     * @param {DiscordClient} client
     * @param {MessageComponentInteraction} interaction 
     * @returns 
     */
    buttonEvent: async (client, interaction) => {
        if (interaction.message.embeds[0].description.match(/(win|lose)!/i)) {
            return;
        }
        if (interaction.user.id != interaction.message.mentions.users.first().id) {
            return interaction.reply({ ...client.simpleEmbed("This is someone elses game!"), ephemeral: true });
        }
        if (!TicTacToe.has(interaction.user.id)) {
            return interaction.reply({ ...client.simpleEmbed("You are not in a game!"), ephemeral: true });
        }

        var {
            board: tttGame,
            player,
            bet
        } = TicTacToe.get(interaction.user.id);

        var playerEmoji = player == "X" ? x : o;
        var botEmoji = player == "X" ? o : x;

        let splitID = interaction.customId.split(',');
        if (tttGame[splitID[0]][splitID[1]] != blank) {
            return interaction.reply({ ...client.simpleEmbed("Press an empty button!"), ephemeral: true });
        }

        tttGame[splitID[0]][splitID[1]] = playerEmoji;

        let ranID = getRandomSlot(tttGame);
        if (ranID) {
            if (calcWinner(tttGame, playerEmoji, botEmoji).match(/turn/)) {
                var ranSplitID = ranID.split(',');
                tttGame[ranSplitID[0]][ranSplitID[1]] = botEmoji;
            }
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
                name: `Tic Tac Toe`
            })
            .setDescription(
                `:monkey: You bet **${formatNumber(bet)} Monkey**` + "\n" +
                `${playerEmoji} You are **${player}**!`
                )
            .setFooter({
                text: `Place an ${player}!`,
                iconURL: interaction.user.displayAvatarURL()
            });
        
        var winner = calcWinner(tttGame, playerEmoji, botEmoji);

        if (winner.match(/(win|lose|tied)/i)) {
            if (winner.match(/win/i)) {
                DB.addMonkey(interaction.user, bet);
                embed.setFooter({
                    text: `You won ${formatNumber(bet)} Monkey!`,
                    iconURL: interaction.user.displayAvatarURL()
                }).setColor("DarkGreen");
            } else if (winner.match(/lose/i)) {
                DB.addMonkey(interaction.user, -bet);
                embed.setFooter({
                    text: `You lost ${formatNumber(bet)} Monkey :(`,
                    iconURL: interaction.user.displayAvatarURL()
                }).setColor("DarkRed");
            } else {
                embed.setFooter({
                    text: `You got your monkey back.`,
                    iconURL: interaction.user.displayAvatarURL()
                }).setColor("DarkPurple");
            }
            TicTacToe.delete(interaction.user.id);
            [row1, row2, row3].forEach(r => r.components.forEach(c => c.setDisabled(true)));
        }

        embed.setDescription((winner.match(/turn/i) ? `:monkey: You bet **${formatNumber(bet)} Monkey**` + "\n" : "") + `You${winner}!`);
        await interaction.update({ embeds: [embed], components: [row1, row2, row3] });
    }
}

function calcWinner(tttGame, playerEmoji, botEmoji) {
    var winner = "r turn";
    var winConditions = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[2, 0], [1, 1], [0, 2]],
        [[0, 0], [1, 1], [2, 2]]
    ];

    var win = null;
    for (var condition of winConditions) {
        var user = 0;
        var bot = 0;
        for (var combination of condition) {
            var [cx, cy] = combination;
            switch (tttGame[cx][cy]) {
                case playerEmoji: user++; break;
                case botEmoji: bot++; break;
            }
        }
        if (user == 3) {
            win = playerEmoji;
            break;
        } else if (bot == 3) {
            win = botEmoji;
            break;
        }
    }

    if (win) {
        winner = playerEmoji == win ? " **Win**" : " **Lose**";
    } else if (!getRandomSlot(tttGame)) {
        winner = " **Tied**";
    }

    return winner;
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
            if (slot == blank) emptySlots.push(`${rowI},${slotI}`);
            slotI++;
        }
        rowI++;
    }
    return emptySlots[Math.floor(Math.random() * emptySlots.length)];
}