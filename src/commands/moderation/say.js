const { Message, PermissionFlagsBits } = require('discord.js');
const DiscordClient = require('../../structures/DiscordClient');
const Util = require('../../util/Util');

module.exports = {
    show: false,
    name: "say",
    description: "Make me say something",
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        await message.delete();
        return message.channel.send(
                message.member.permissions.has(PermissionFlagsBits.ManageMessages) ?
                { content: args.join(' ') } :
                client.simpleEmbed(`${message.author.toString()}, You don't have permisison!`)
            ).catch(console.error);
    }
}