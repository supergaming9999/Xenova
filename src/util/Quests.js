const { EmbedBuilder, Message, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { random } = require('./Util');
const { ActiveQuests } = require('./Games');
const { symbols, sentences, colorLabels, emojis, words } = require('./QuestData');
const DB = require('./DB');
String.prototype.put = function(string, index, replace = false) {
    return this.slice(0, index) + string + this.slice(index + (replace ? 1 : 0));
}
var getEmbed = (msg) => new EmbedBuilder()
    .setColor("#543cff")
    .setAuthor({
        name: msg.author.username + "'s Quest",
        iconURL: msg.author.displayAvatarURL()
    });

module.exports = class Quests {
    static list = ["FindNumbers", "Buttons", "Emojis", "WordType"];

    /**
     * @param {Message} message 
     */
    static async FindNumbers(message) {
        var string = ``;
        var numbers = [];

        for (var c = 0; c < 170; c++) {
            string += symbols[random(0, symbols.length)]
        }
        for (var i = 0; i < random(4, 8); i++) {
            var number = random(0, 10);
            numbers.push(number.toString());
            string = string.put(number, random(0, string.length), true);
        }
        
        for (var i = 0; i < string.length; i++) {
            if (i % 35 == 0) string = string.put("\n", i);
        }

        var embed = getEmbed(message)
            .setTitle("Find the numbers")
            .setDescription("```" + string + "```")
            .setFooter({
                text: "Send a message with the numbers in 10 seconds."
            });
        
        var begin = await message.reply({ embeds: [embed], fetchReply: true });

        ActiveQuests.set(message.author.id, {
            type: "FindNumbers",
            message: begin
        });
        
        var quest = message.channel.createMessageCollector({
            filter: m =>
                m.author.id == message.author.id &&
                !m.content.split('').filter(v => !"1234567890 ,-|".includes(v)).length,
            time: 10_000
        });

        quest.on('collect', msg => {
            var input = msg.content.split('').filter(c => c.trim() && !isNaN(c));
            var result = numbers.filter(n => {
                var i = input.indexOf(n);
                if (i > -1) {
                    input.splice(i, 1);
                    return true;
                }
            });
            if (!result.length) return;
            var reward = result.length * 50;
            var missed = numbers.length - result.length;

            var attempt = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({
                    name: `You found${missed > 0 ? '' : ' all'} ${result.length} number${result.length > 1 ? 's' : ''}!`
                })
                .setFooter({
                    text: `You won ${reward} Monkey!`,
                    iconURL: msg.author.displayAvatarURL()
                });
            
            var missing = numbers;
            result.forEach(n => missing.splice(missing.indexOf(n), 1));
            if (missed) {
                attempt.setDescription(`You missed ${missed > 1 ? `these ${missed}`: 'this'} number${missed > 1 ? 's' : ''}: ${missing.join(' ')}`);
            }
            
            DB.addMonkey(message.author, reward);
            ActiveQuests.delete(message.author.id);
            quest.stop();
            msg.reply({ embeds: [attempt] });
        });

        quest.on('end', () => {
            begin.edit({ embeds: [embed.setFooter({ text: "This quest has ended!" })] });
            if (ActiveQuests.has(message.author.id)) {
                var noAttempt = new EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({
                        name: "You didn't find any numbers in time!",
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`The numbers were ${numbers.join(' ')}`);
                ActiveQuests.delete(message.author.id);
                begin.reply({ embeds: [noAttempt] });
            }
        });
    }

    /**
     * @param {Message} message 
     */
    static async Buttons(message) {
        var colors = [
            { name: "Primary", color: "blue" },
            { name: "Secondary", color: "grey" },
            { name: "Success", color: "green" },
            { name: "Danger", color: "red" }
        ];
        var currentColors = [];
        var embed = getEmbed(message);
        var row = new ActionRowBuilder();
        var reward = 0;
        var quest;
        for (var i = 0; i < random(6, 9); i++) {
            if (colors.length) {
                var transfer = colors.splice(random(0, colors.length), 1)[0];
                currentColors.push(transfer);
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId("qb" + transfer.color)
                        .setStyle(ButtonStyle[transfer.name])
                        .setLabel(colorLabels[random(0, colorLabels.length)])
                    );
            }
            var chosen = currentColors[random(0, currentColors.length)];
            if (quest) {
                embed.setTitle(sentences[random(0, sentences.length)].replace("{}", chosen.color));
                await quest.edit({ embeds: [embed], components: [row] });
            } else {
                embed.setTitle(`Press the ${chosen.color} button`);
                quest = await message.reply({ embeds: [embed], components: [row] });
                ActiveQuests.set(message.author.id, {
                    type: "Buttons",
                    message: quest
                });
            }
            var button = await quest.awaitMessageComponent({
                filter: c => c.user.id == message.author.id,
                time: 6_000
            }).catch(() => {});
            if (button) {
                button.deferUpdate();
                if (button.customId == ("qb" + chosen.color)) {
                    reward += 50;
                    continue;
                }
            }
            break;
        }
        embed.setTitle("Press the button");
        var presses = reward / 50;
        if (presses) {
            embed.setColor('Green')
                .setDescription(`You correctly pressed ${presses} button${presses > 1 ? 's' : ''}!`)
                .setFooter({ text: `You won ${reward} monkey!` });
            DB.addMonkey(message.author, reward);
        } else {
            embed.setColor("Red")
                .setDescription("You didn't press any buttons in time!");
        }
        row.components.forEach(c => c.setDisabled(true));
        ActiveQuests.delete(message.author.id);
        quest.edit({ embeds: [embed], components: [row] });
    }

    /**
     * @param {Message} message 
     */
    static async Emojis(message) {
        var tempEmojis = structuredClone(emojis);
        var embed = getEmbed(message);
        var reward = 0;
        var rows = [];
        var quest;
        for (var i = 0; i < random(6, 9); i++) {
            if (rows.length < 5) {
                var row = new ActionRowBuilder();
                for (var c = 0; c < 5; c++) {
                    var emoji = tempEmojis.splice(random(0, tempEmojis.length), 1)[0];
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId("qe" + emoji)
                            .setEmoji(emoji)
                            .setStyle(ButtonStyle.Secondary)
                    );
                }
                rows.push(row);
            }
            var choices = rows.flatMap(r => r.components.map(c => c.data.emoji.name));
            var chosen = choices[random(0, choices.length)];
            embed.setTitle(`Find this emoji: ${chosen}`);
            if (quest) {
                await quest.edit({ embeds: [embed], components: rows });
            } else {
                quest = await message.reply({ embeds: [embed], components: rows });
                ActiveQuests.set(message.author.id, {
                    type: "Emojis",
                    message: quest
                });
            }
            var button = await quest.awaitMessageComponent({
                filter: c => c.user.id == message.author.id,
                time: 8_000
            }).catch(() => {});
            if (button) {
                button.deferUpdate();
                if (button.customId == ("qe" + chosen)) {
                    reward += 60;
                    continue;
                }
            }
            break;
        }
        embed.setTitle("Find the emoji");
        var presses = reward / 60;
        if (presses) {
            embed.setColor('Green')
                .setDescription(`You found ${presses} emoji${presses > 1 ? 's' : ''}!`)
                .setFooter({ text: `You won ${reward} Monkey!` });
            DB.addMonkey(message.author, reward);
        } else {
            embed.setColor('Red')
                .setDescription("You didn't find any correct emojis in time!");
        }
        rows.forEach(r => r.components.forEach(c => c.setDisabled(true)));
        ActiveQuests.delete(message.author.id);
        quest.edit({ embeds: [embed], components: rows });
    }
    
    /**
     * @param {Message} message 
     */
    static async WordType(message) {
        var embed = getEmbed(message)
            .setTitle("Type what the button says below but in lower case")
            .setFooter({ text: "Send a message for each word" });
        var compare = (str1, str2) => str1.split('').filter((v, i) => v == str2[i]);
        var reward = 0;
        var quest;
        for (var i = 0; i < random(3, 5); i++) {
            var word = words[random(0, words.length)];
            var row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
                    .setCustomId('qw')
                    .setLabel(word.toUpperCase())
            );
            if (quest) {
                embed.setColor('Random')
                    .setDescription("Keep typing! Keep typing!")
                    .setFooter({ text: `You've earned ${reward} Monkey so far` });
                await quest.edit({ embeds: [embed], components: [row] });
            } else {
                quest = await message.reply({ embeds: [embed], components: [row] });
                ActiveQuests.set(message.author.id, {
                    type: "WordType",
                    message: quest
                });
            }

            var attempt = await message.channel.awaitMessages({
                filter: m => m.author.id == message.author.id && compare(word, m.content).length,
                time: (word.length * 1_000 + 4_000) / 2, max: 1
            }).catch(() => {});

            if (attempt.size) {
                reward += compare(word, attempt.first().content).length * 10;
            }
        }
        embed.setTitle("Type the word");
        var correct = reward / 10;
        if (correct) {
            embed.setColor('Green')
                .setDescription(`You got ${correct} letters correct!`)
                .setFooter({ text: `You won a total of ${reward} Monkey!` });
            DB.addMonkey(message.author, reward);
        } else {
            embed.setColor('Red')
                .setDescription("You didn't type any correct letters?")
                .setFooter(null);
        }
        ActiveQuests.delete(message.author.id);
        quest.edit({ embeds: [embed], components: [] });
    }
}