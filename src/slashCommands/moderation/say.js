const { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');
const DiscordClient = require('../../structures/DiscordClient');
const Util = require('../../util/Util');

module.exports = {
	name: 'say',
	description: "Make me say something.",
	type: ApplicationCommandType.ChatInput,
    default_member_permissions: "ManageMessages",
	cooldown: 3,
    options: [
        {
            name: "text",
            description: "What do you want me to say?",
            type: ApplicationCommandOptionType.String,
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
        var text = interaction.options.getString("text");
        await interaction.channel.send({ content: text }).catch(console.error);
        var embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Successfully said \`${text}\``);
        return interaction.reply({ embeds: [embed], ephemeral: true });
	}
};