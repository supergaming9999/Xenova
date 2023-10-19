const { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
	name: 'give',
	description: "Give some of your monkey to another person.",
	type: ApplicationCommandType.ChatInput,
    usage: "target:@User amount:Number",
    options: [
        {
            name: "target",
            description: "The person you want to give money",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "amount",
            description: "The monkey you want to give",
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
        var target = interaction.options.getUser("target");
        if (!target || target.bot) {
            return interaction.reply({ ...client.simpleEmbed(`Usage: **/${this.name} ${this.usage}**`), ephemeral: true });
        }
        var targetData = await DB.getProfile(target);
        if (!targetData) {
            return interaction.reply({ ...client.simpleEmbed("An error occured getting the target's data!"), ephemeral: true });
        }
        var input = interaction.options.getInteger("amount");
        if (input > profileData.monkey) {
            return interaction.reply({ ...client.simpleEmbed("You cannot give more than you have!"), ephemeral: true });
        }
        var rawMonkey = Number.parseFloat(input);
        DB.addMonkey(interaction.user, -rawMonkey);
        targetData.monkey += rawMonkey;
        targetData.save();
        var monkey = Util.formatNumber(rawMonkey);
        var embed = new EmbedBuilder()
            .setColor('#2200ff')
            .setAuthor({
                name: "Monkey Send",
                iconURL: target.displayAvatarURL()
            })
            .setDescription(`:monkey: ${interaction.user.toString()} has sent **${monkey} Monkey** to ${target.toString()}!`)
            .setFooter({
                text: `${interaction.member && interaction.member.nickname ? `${interaction.member.nickname} / ${interaction.user.tag}` : `${interaction.user.tag}`}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        return interaction.reply({ embeds: [embed] }).catch(console.error);
	}
};