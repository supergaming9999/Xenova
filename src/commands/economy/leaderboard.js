const { EmbedBuilder, Message } = require('discord.js');
const Util = require('../../util/Util');
const DB = require('../../util/DB');
const DiscordClient = require('../../structures/DiscordClient');

module.exports = {
    show: true,
    name: "leaderboard",
    aliases: ["lb", "top"],
    description: "See the monkey leaderboard.",
    leaderboard: 5,
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
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

        return message.sreply({ embeds: [embed] }).catch(console.error);
    }
}