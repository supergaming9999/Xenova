const { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');
const { NumberGuess } = require('../../util/Games');

module.exports = {
	name: 'numberguess',
	description: "Gamble monkey on a game of guess my number.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 3000,
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
        if (NumberGuess.has(interaction.user.id)) {
            return interaction.reply(client.simpleEmbed(`You are already in a number guess game! [[Click Me To Go There]](${Util.createUrl(NumberGuess.get(interaction.user.id))})`));
        }
        var betNum = interaction.options.getInteger("amount");
        if (Math.sign(betNum) < 1) {
            return interaction.reply(client.simpleEmbed("You can't bet less than 1 monkey!"));
        }
        if (betNum > profileData.monkey) {
            return interaction.reply(client.simpleEmbed(`You don't have that much! Try betting less.`));
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
                iconURL: interaction.user.displayAvatarURL()
            });
        
        var begin = await interaction.reply({ embeds: [embed] });
        
        NumberGuess.set(interaction.user.id, begin);

        var game = interaction.channel.createMessageCollector({
            filter: m => m.author.id == interaction.user.id && !isNaN(m.content),
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
                
                DB.addMonkey(interaction.user, betNum);
                NumberGuess.delete(interaction.user.id);
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
                    
                    DB.addMonkey(interaction.user, -betNum);
                    NumberGuess.delete(interaction.user.id);
                    game.stop();
                    msg.reply({ embeds: [embedLose] });
                }
            }
        });

        game.on('end', () => {
            if (NumberGuess.has(interaction.user.id)) {
                var embedLose = new EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({
                        name: "You didn't guess the number in time!"
                    })
                    .setDescription(`The number was **${number}**`)
                    .setFooter({
                        text: `You lost ${Util.formatNumber(betNum)} Monkey :(`,
                        iconURL: interaction.user.displayAvatarURL()
                    });
                
                DB.addMonkey(interaction.user, -betNum);
                NumberGuess.delete(interaction.user.id);
                begin.reply({ embeds: [embedLose] });
            }
        });
	}
};

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