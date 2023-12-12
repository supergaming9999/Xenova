const { Message } = require('discord.js');

module.exports = class Util {
    static dbModel = {
        userID: new String,
        username: new String,
        bank: new Number,
        interestTime: new Date || undefined,
        monkey: new Number,
        dailyTime: new Date || undefined,
        dailyStreak: new Number
    };

    static configModel = {
        prefix: new String,
        owner: new String,
        ...require('../../config.json')
    }

    /**
     * Formats a large number with commas
     * @param {Number} number Number to format
     * @param {Number} minimumFractionDigits Numbers inbetween commas
     * @returns {String} The formatted number
     */
    static formatNumber(number, minimumFractionDigits = 0) {
        return Number.parseFloat(number).toLocaleString(undefined, {
            minimumFractionDigits,
            maximumFractionDigits: 2
        });
    }

    /**
     * Format milliseconds into a readable time string
     * @param {Number} time The time to format in milliseconds
     * @returns {String} The readable formatted time
     */
    static formatTime(time) {
        var seconds = time / 1000;
        var hours = parseInt(seconds / 3600);
        seconds = seconds % 3600;
        var minutes = parseInt(seconds / 60);
        seconds = seconds % 60;
        return `${hours}h ${minutes}m ${Math.floor(seconds)}s`;
	}

    /**
     * Get a random number between a min and a max
     * @param {Number} min inclusive
     * @param {Number} max exclusive
     * @returns {Number}
     */
    static random = (min, max) => Math.floor(Math.random() * (max - min) + min);

    /**
     * @param {Message} message 
     * @returns {String}
     */
    static createUrl(message) {
        if (message.interaction) message = message.interaction;
        var url = message.url;
        if (!url) {
            if (message.guild?.id && message.channel?.id && message?.id) {
                url = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
            } else if (message?.guildId && message?.channelId && message?.id) {
                url = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;
            }
        }
        return url;
    }
}