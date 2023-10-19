const { Collection, Message } = require('discord.js');
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const DB = require('../util/DB');
const DiscordClient = require('../structures/DiscordClient');

/**
 * @param {DiscordClient} client 
 * @param {Message} message 
 */
exports.run = async (client, message) => {
    message.sreply = (content) => {
        return message.reply({
            files: content.files ? content.files : [],
            content: content.message ? content.message : typeof content == 'string' ? content : "",
            embeds: content.embeds ? content.embeds : [],
            allowedMentions: { repliedUser: false }
        });
    };

    if (!message.guild || message.author.bot) return;

    const { prefix } = client.config;

    var profileData = await DB.checkInterest(message.author);

    // If mentioned we'll output the bot's Wprefix
    if (new RegExp('<@' + client.user.id + '>', 'g').test(message.content))
        return message.sreply("My Prefix is **>**");

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    message.label = commandName;

    const command =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.sreply(
                client.simpleEmbed(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
            );
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        client.CommandsRan++;
        command.execute(client, message, args, client.config, profileData);
    } catch (error) {
        console.error(error);
        message.sreply("There was an error executing that command.").catch(console.error);
    }
}