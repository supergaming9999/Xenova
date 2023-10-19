const { Message } = require("discord.js");

/**
 * @type {Map<String, { board: String[][], player: String, bet: Number, msg: Message }>}
 */
var TicTacToe = new Map();

/**
 * @type {Map<String, Message>}
 */
var NumberGuess = new Map();

module.exports = {
    TicTacToe,
    NumberGuess
};