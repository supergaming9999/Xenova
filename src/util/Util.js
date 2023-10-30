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
     * Format milliseconds into a time string
     * @param {Number} time The time to format in milliseconds
     * @returns {String} The formatted time
     */
    static formatTime(time) {
        const hrs = Math.floor(time / 1000 / 60 / 60);
		const min = Math.floor((time / 1000 / 60) - (hrs * 60));
		const sec = Math.floor((time / 1000) - (min * 60));
		return `${hrs}h ${min.toString().padStart(2, '0')}m ${sec.toFixed(0).padStart(2, '0')}s`;
	}

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