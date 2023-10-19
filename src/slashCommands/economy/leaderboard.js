const { ApplicationCommandType, EmbedBuilder, CommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
	name: 'leaderboard',
	description: "See the monkey leaderboard.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 3000,
    /**
     * @param {DiscordClient} client 
     * @param {CommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        var embed = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({
                name: "Monkey Leaderboard",
                iconURL: client.user.displayAvatarURL()
            });
        
        var users = await DB.getAll();
        var list = [];
        users.forEach(v => {
            list.push(v);
        });

        var board = list.map((v, i) => {
            return `**${i+1}**. \`@\`**${v.username}** - **${Util.formatNumber(v.monkey)} Monkey**`;
        });

        embed.setDescription(board.join("\n"));

        return interaction.reply({ embeds: [embed] }).catch(console.error);
	}
};