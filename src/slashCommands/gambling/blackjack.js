const { ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');
const blackjack = require("../../util/Blackjack");

module.exports = {
	name: 'blackjack',
	description: "Gamble monkey on a game of blackjack.",
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
        var bet = interaction.options.getInteger("amount");
        if (bet > profileData.monkey) {
            return interaction.reply({ ...client.simpleEmbed(`You don't have that much! Try betting less.`), ephemeral: true });
        }
        if (Math.sign(bet) < 1) {
            return interaction.reply({ ...client.simpleEmbed(`You can't bet less than 1 Monkey! Try betting more.`), ephemeral: true });
        }

        var game = await blackjack(interaction, { transition: "edit", insurance: false, split: false, doubledown: false, bet });

        switch (game.result) {
            case "WIN":
                DB.addMonkey(interaction.user, bet);
                break;
            case "LOSE":
                DB.addMonkey(interaction.user, -bet);
                break;
        }
	}
};