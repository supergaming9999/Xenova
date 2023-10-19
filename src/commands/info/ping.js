const { EmbedBuilder, Message } = require('discord.js');
const DiscordClient = require('../../structures/DiscordClient');
const Util = require('../../util/Util');

module.exports = {
    show: true,
    name: "ping",
    description: "Ping Pong! See if I'm lagging.",
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData
     */
    execute(client, message, args, config, profileData) {
        var embed = new EmbedBuilder()
            .setColor('#2200ff')
            .setAuthor({
                name: `Average ping to API: ${Math.round(client.ws.ping)} ms`,
                iconURL: client.user.displayAvatarURL()
            });

        return message.sreply({ embeds: [embed] }).catch(console.error);
    }
}