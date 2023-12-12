const { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

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
	name: 'coinflip',
	description: "Gamble monkey on a coinflip.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 5,
    options: [
        {
            name: "amount",
            description: "Your monkey bet amount number",
            type: ApplicationCommandOptionType.Integer,
            required: true
        },
        {
            name: "bet",
            description: "Your bet on heads or tails",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Heads",
                    value: "heads"
                },
                {
                    name: "Tails",
                    value: "tails"
                }
            ]
        }
    ],
    /**
     * @param {DiscordClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        var amount = interaction.options.getInteger("amount");
        if (amount > profileData.monkey) {
            return interaction.reply({ ...client.simpleEmbed(`You don't have that much! Try betting less.`), ephemeral: true });
        }
        if (Math.sign(amount) < 1) {
            return interaction.reply({ ...client.simpleEmbed(`You can't bet less than 1 Monkey! Try betting more.`), ephemeral: true });
        }
        var choice = interaction.options.get("bet").value;
        var id = evaluate(choice);
        var { emojis } = config;

        var bet = Util.formatNumber(amount);
        var embed = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({
                name: "Coinflip",
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`:monkey: You bet **${bet} Monkey** on **${choice}**!`)
            .setFields({
                name: "The coin spins - " + emojis.coinflip,
                value: "You flip the coin..."
            });

        await interaction.reply({ embeds: [embed] });

        var resultId = Math.round(Math.random());
        var result = resultId ? "heads" : "tails";
        var winner = resultId === id;

        DB.addMonkey(interaction.user, winner ? amount : -amount);
        
        setTimeout(async () => {
            embed.setFields({
                name: "The coin lands - " + emojis[result],
                value: winner ? `:monkey_face: You won **${Util.formatNumber(amount)} Monkey**!` : "You lost it all :("
            });
            await interaction.editReply({ embeds: [embed] })
        }, 3000);
	}
};