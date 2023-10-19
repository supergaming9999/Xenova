const { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
	name: 'bank',
	description: "Deposit or withdraw monkey from your bank.",
	type: ApplicationCommandType.ChatInput,
    usage: "type:Deposit|Withdraw amount:Number|all",
    options: [
        {
            name: "type",
            description: "The transaction type",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Deposit",
                    value: "deposit"
                },
                {
                    name: "Withdraw",
                    value: "withdraw"
                }
            ]
        },
        {
            name: "amount",
            description: "The amount of monkey",
            type: ApplicationCommandOptionType.String
        }
    ],
    /**
     * @param {DiscordClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        var usageError = client.simpleEmbed(`Usage: **/${this.name} ${this.usage}**`);
        var embed = new EmbedBuilder()
            .setColor('Aqua')
            .setAuthor({
                name: "Monkey Bank",
                iconURL: client.user.displayAvatarURL()
            })
            .setFooter({
                text: `${interaction.user.displayName == interaction.user.username ? interaction.user.username : `${interaction.user.displayName} / ${interaction.user.username}`}`,
                iconURL: interaction.user.displayAvatarURL()
            });
        if (interaction.options.data.length > 1) {
            var type = interaction.options.get("type").value;
            var input = interaction.options.getString("amount");
            if (isNaN(input) && input.toLowerCase() != "all") {
                return interaction.reply({ ...usageError, ephemeral: true });
            }
            var amount = isNaN(input) ? profileData.monkey : parseInt(input);
            if (amount < 1) {
                usageError.embeds[0].setFooter({
                    text: "You cannot " + type + " less than 1 monkey!"
                });
                return interaction.reply({ ...usageError, ephemeral: true });
            }
            switch (type) {
                case "deposit":
                    if (amount > profileData.monkey) {
                        return interaction.reply({ ...client.simpleEmbed("You cannot deposit more than you have!"), ephemeral: true });
                    }
                    if (profileData.bank == 0) {
                        profileData.interestTime = Date.now() + (1000 * 60 * 60 * 24);
                        profileData.save();
                    }

                    DB.addMonkey(interaction.user, -amount);
                    DB.addBank(interaction.user, amount);
                    embed.setDescription(`Deposited **${Util.formatNumber(amount)} Monkey**.`);
                    break;
                case "withdraw":
                    if (amount > profileData.bank) {
                        return interaction.reply({ ...client.simpleEmbed("You do not have that much in your bank!"), ephemeral: true });
                    }

                    DB.addBank(interaction.user, -amount);
                    DB.addMonkey(interaction.user, amount);
                    embed.setDescription(`Withdrew **${Util.formatNumber(amount)} Monkey**`);
                    break;
            }
            return interaction.reply({ embeds: [embed] });
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
                .setDescription(`You can deposit monkey with **/${module.exports.name} deposit <Amount>**\n_Your due interest will be automatically added._`);
            msg.embeds.push(tip);
        }

        return interaction.reply(msg).catch(console.error);
	}
};