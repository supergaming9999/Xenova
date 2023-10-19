const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');
const DB = require('../../util/DB');
const { NumberGuess } = require('../../util/Games');

module.exports = {
    show: true,
    name: "numberguess",
    aliases: ["guessnumber", "guessnum", "numguess", "guessmynumber", "ng"],
    description: "Gamble monkey on a game of guess my number.",
    usage: "<Monkey Bet Number>",
    cooldown: 3,
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        if (NumberGuess.has(message.author.id)) {
            return message.reply(client.simpleEmbed(`You are already in a number guess game! [[Click Me To Go There]](${Util.createUrl(NumberGuess.get(message.author.id))})`));
        }
        var usageError = client.simpleEmbed(`Usage: **${config.prefix}${message.label} ${this.usage}**`);
        if (!args.length) {
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

        var min = random(1, 26);
        var max = random(75, 101);
        var attempts = 3;

        var number = random(min, max);

        var embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: "Guess The Number",
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`**Guess my number between ${min} and ${max}**.\nSend a message with your number guess!\n_You get 3 attempts!_`)
            .setFooter({
                text: `You bet ${Util.formatNumber(betNum)} Monkey`,
                iconURL: message.author.displayAvatarURL()
            });
        
        var begin = await message.reply({ embeds: [embed] });

        NumberGuess.set(message.author.id, begin);

        var game = message.channel.createMessageCollector({
            filter: m => m.author.id == message.author.id && !isNaN(m.content),
            time: 30_000
        });

        var ranges = getRangesOfRanges(number, min, max);

        game.on('collect', msg => {
            var guess = parseInt(msg.content);
            if (guess == number) {
                var embedWin = new EmbedBuilder()
                    .setColor('Green')
                    .setAuthor({
                        name: "You guessed the number!"
                    })
                    .setFooter({
                        text: `You won ${Util.formatNumber(betNum)} Monkey!`,
                        iconURL: msg.author.displayAvatarURL()
                    });
                
                DB.addMonkey(message.author, betNum);
                NumberGuess.delete(message.author.id);
                msg.reply({ embeds: [embedWin] });
            } else {
                if (attempts > 1) {
                    if (attempts < 3) {
                        ranges = getRangesOfRanges(number, ranges[0], ranges[1]);
                    }
                    attempts--;
                    var embedAttempt = new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription(`**Wrong! ${attempts} Attempt${attempts > 1 ? "s" : ""} Left!**\n_Random Hint: The number is between ${ranges[0]} and ${ranges[1]}_`);
                    msg.reply({ embeds: [embedAttempt] });
                } else {
                    var embedLose = new EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({
                            name: "You ran out of attempts!"
                        })
                        .setDescription(`The number was **${number}**`)
                        .setFooter({
                            text: `You lost ${Util.formatNumber(betNum)} Monkey :(`,
                            iconURL: msg.author.displayAvatarURL()
                        });
                    
                    DB.addMonkey(message.author, -betNum);
                    NumberGuess.delete(message.author.id);
                    game.stop();
                    msg.reply({ embeds: [embedLose] });
                }
            }
        });

        game.on('end', () => {
            if (NumberGuess.has(message.author.id)) {
                var embedLose = new EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({
                        name: "You didn't guess the number in time!"
                    })
                    .setDescription(`The number was **${number}**`)
                    .setFooter({
                        text: `You lost ${Util.formatNumber(betNum)} Monkey :(`,
                        iconURL: message.author.displayAvatarURL()
                    });
                
                DB.addMonkey(message.author, -betNum);
                NumberGuess.delete(message.author.id);
                begin.reply({ embeds: [embedLose] });
            }
        });
    }
}

function getRangesOfRanges(num, min, max) {
    return [random(min, num), random(num, max)];
}

// min(inclusive), max(exclusive)
/**
 * Get a random number between a min and a max
 * @param {Number} min inclusive
 * @param {Number} max exclusive
 * @returns {Number}
 */
var random = (min, max) => Math.floor(Math.random() * (max - min) + min);