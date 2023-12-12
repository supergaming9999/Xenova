const { EmbedBuilder, Collection, PermissionsBitField, CommandInteraction, ButtonStyle, ButtonInteraction } = require('discord.js');
const ms = require('ms');
const DB = require('../util/DB');
const DiscordClient = require('../structures/DiscordClient');

const cooldown = new Collection();

/**
 * @param {DiscordClient} client 
 * @param {ButtonInteraction} interaction 
 */
exports.run = async (client, interaction) => {
    if (interaction.isMessageComponent()) {
        var { component } = interaction;
        if (
            component.customId?.startsWith("q") ||
            component.style != ButtonStyle.Secondary
            ) {
            return;
        }
        return client.slashCommands.get("tictactoe").buttonEvent(client, interaction);
    }

	const slashCommand = client.slashCommands.get(interaction.commandName);

    if (interaction.type == 4) {
        if (slashCommand.autocomplete) {
            const choices = [];
            await slashCommand.autocomplete(interaction, choices)
        }
    }

    if (!interaction.type == 2) return;

    if (!slashCommand) return client.slashCommands.delete(interaction.commandName);

    const { config } = client;
    var profileData = await DB.checkInterest(interaction.user);

    try {
        if (slashCommand.userPerms || slashCommand.botPerms) {
            if (!interaction.memberPermissions.has(PermissionsBitField.resolve(slashCommand.userPerms || []))) {
                const userPerms = new EmbedBuilder()
                    .setDescription(`🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`)
                    .setColor('Red');
                return interaction.reply({ embeds: [userPerms], ephemeral: true })
            }
            if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(slashCommand.botPerms || []))) {
                const botPerms = new EmbedBuilder()
                    .setDescription(`🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`)
                    .setColor('Red');
                return interaction.reply({ embeds: [botPerms], ephemeral: true })
            }
        }
        if (slashCommand.cooldown) {
            if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`))
                return interaction.reply(client.simpleEmbed(`Please wait ${ms(cooldown.get(`slash-${slashCommand.name}${interaction.user.id}`) - Date.now(), { long: true })} before reusing the \`${slashCommand.name}\` command.`));

            await slashCommand.run(client, interaction, config, profileData);
            cooldown.set(`slash-${slashCommand.name}${interaction.user.id}`, Date.now() + (slashCommand.cooldown * 1000))
            setTimeout(() => {
                    cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`)
            }, slashCommand.cooldown * 1000)
        } else {
            await slashCommand.run(client, interaction, config, profileData);
        }
    } catch (error) {
            console.log(error);
    }
};