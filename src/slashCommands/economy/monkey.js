const { ApplicationCommandType, EmbedBuilder, CommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
	name: 'monkey',
	description: "Check your monkey balance.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 3000,
    /**
     * @param {DiscordClient} client 
     * @param {CommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        var monkey = Util.formatNumber(profileData.monkey);
        var embed = new EmbedBuilder()
            .setColor('#2200ff')
            .setAuthor({
                name: `${interaction.member && interaction.member.nickname ? `${interaction.member.nickname} / ${interaction.user.tag}` : `${interaction.user.tag}`}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`:monkey: You have **${monkey} Monkey**!`);

		return interaction.reply({ embeds: [embed] });
	}
};