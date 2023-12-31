const { ActivityType } = require('discord.js');
const DiscordClient = require('../structures/DiscordClient');

/**
 * @param {DiscordClient} client 
 */
exports.run = (client) => {
    client.Ready = true;
    client.log(`[${new Date().toLocaleString()}] {${client.user.tag}} ${client.user.username} is ready!`, 'FgBlue');
    client.user.setActivity('Making Monkey Money', {
        type: ActivityType.Custom
    });
}