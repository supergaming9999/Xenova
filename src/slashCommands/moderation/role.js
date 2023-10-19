const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, CommandInteraction } = require('discord.js');
const DiscordClient = require('../../structures/DiscordClient');
const Util = require('../../util/Util');

module.exports = {
	name: 'role',
	description: "Manage roles of the server or members.",
	cooldown: 3000,
	type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'ManageRoles', // permission required
	options: [
        {
            name: 'add',
            description: 'Add role to a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'role',
                    description: 'The role you want to add to the user.',
                    type: ApplicationCommandOptionType.Role,
                    required: true
                },
                {
                    name: 'user',
                    description: 'The user you want to add the role to.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'remove',
            description: 'Remove role from a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'role',
                    description: 'The role you want to remove from the user.',
                    type: 8,
                    required: true
                },
                {
                    name: 'user',
                    description: 'The user you want to remove the role from.',
                    type: 6,
                    required: true
                }
            ]
        }
    ],
    /**
     * @param {DiscordClient} client 
     * @param {CommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        switch (interaction.options._subcommand) {
	        case 'add': {
                try {
                    const member = interaction.guild.members.cache.get(interaction.options.get('user').value);
                    const role = interaction.options.get('role').role;
        
                    await member.roles.add(role.id);
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: 'Role Added', iconURL: member.user.displayAvatarURL() })
                        .setDescription(`Successfully added the role: ${role} to ${member}`)
                        .setColor('Green')
                        .setTimestamp()
                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
            
                    return interaction.reply({ embeds: [embed] });
                } catch {
                    return interaction.reply({ content: `Sorry, I failed to add that role!`, ephemeral: true });
                }
            }
            case 'remove': {
                try {
                    const member = interaction.guild.members.cache.get(interaction.options.get('user').value);
                    const role = interaction.options.get('role').role;
        
                    await member.roles.remove(role.id);
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: 'Role Removed', iconURL: member.user.displayAvatarURL() })
                        .setDescription(`Successfully removed the role: ${role} from ${member}`)
                        .setColor('Orange')
                        .setTimestamp()
                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
            
                    return interaction.reply({ embeds: [embed] });
                } catch {
                    return interaction.reply({ content: `Sorry, I failed to remove that role!`, ephemeral: true });
                }
            }
            default: break;
        }
    }
};