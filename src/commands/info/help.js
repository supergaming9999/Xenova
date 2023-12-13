const { EmbedBuilder, Message } = require("discord.js");
const DiscordClient = require("../../structures/DiscordClient");
const Util = require("../../util/Util");

module.exports = {
  show: true,
  name: "help",
  aliases: ["h"],
  description: "Display all commands and descriptions.",
  usage: "<Command Name>",
  /**
   * @param {DiscordClient} client 
   * @param {Message} message 
   * @param {String[]} args 
   * @param {Util.configModel} config 
   * @param {Util.dbModel} profileData
   */
  async execute(client, message, args, config, profileData) {
	  const { prefix } = config;
    let commandName = args[0] ? args[0].replace(/[<>]/g, '') : args[0];
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (command) {
      if (!command.show && message.author.id !== config.owner) return;
      var info = "**Description**: ";
      info += command.description.replace(/(\{ClientUser\})/g, client.user.username);
      if (command.aliases) info += `\n**Alias${command.aliases.length > 1 ? "es" : ""}**: ${command.aliases.join(", ")}`;
      info += `\n**Cooldown**: ${command.cooldown ?? 1} Second${command.cooldown > 1 ? 's' : ''}`;
      if (command.usage) info += `\n**Usage**: ${prefix}${commandName} ${command.usage}`;
      var commandHelp = new EmbedBuilder()
        .setColor("#2200ff")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
          url: config.website
        })
        .setTitle(`${prefix}${command.name}`)
        .setDescription(info)
        .setTimestamp();
      return message.sreply({ embeds: [commandHelp] }).catch(console.error);
    }

    let commands = client.commands.map(i => i).filter(i => {
      if (!i.show && message.author.id !== config.owner) return false;
      if (args.length == 1 && args[0] == "--x") return true;
      if (i.show) return true;
      return false;
    });

    var helpEmbed = new EmbedBuilder()
      .setTitle(`${client.user.username} Help`)
      .setThumbnail(client.user.displayAvatarURL())
      .setColor("#2200ff")
      .setFooter({
        text: `Use ${prefix}${message.label} <command> for more information on a command`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();
    if (config.website) helpEmbed.setURL(config.website);

    let txt = ``;
    let index = 0;
    let mainIndex = 0;
    let fields = [];

    commands.forEach((cmd) => {
      index += 1;
      txt += `${prefix}**${cmd.name}** \n`;
      if(index % 5 == 0) {
        mainIndex += 1;
        fields.push({
          name: mainIndex == 1 ? `${commands.length} Commands` : "\u200B",
          value: txt,
          inline: true
        });
        txt = ``;
      }
    });
    
    helpEmbed.addFields(fields);

    return message.sreply({ embeds: [helpEmbed] }).catch(console.error);
  }
};