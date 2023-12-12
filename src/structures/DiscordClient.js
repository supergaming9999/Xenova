const { readdirSync } = require("fs");
const { join } = require("path");
const { Client, Collection, EmbedBuilder, PermissionsBitField, Routes } = require("discord.js");
const { REST } = require('@discordjs/rest');

const { TOKEN, CLIENT_ID } = process.env;
const rest = new REST({ version: '10' }).setToken(TOKEN);
const mongoose = require("mongoose");

class DiscordClient extends Client {
    constructor(props) {
        super(props);

        this.MongoSRV = process.env.MONGO_SRV;
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.commandsRan = 0;
        this.config = {
            prefix: process.env.PREFIX,
            owner: process.env.OWNER_ID,
            ...require("../../config.json")
        }

        if (process.env.TOKEN === "")
            return new TypeError("Please fill in the information in the env config variables.");

        this.loadEvents();
        this.loadCommands();
        this.loadSlashCommands();

        this.Ready = false;
    }

    loadEvents() {
        const eventFiles = readdirSync(join(__dirname, "..", "events")).filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            const event = require(join(__dirname, "..", "events", `${file}`));
            this.on(file.split(".")[0], (...args) => event.run(this, ...args));
        }
    }

    loadCommands() {
        readdirSync(join(__dirname, "..", "commands/")).forEach(async dir => {
            const commandFiles = readdirSync(join(__dirname, "..", "commands", dir)).filter((file) => file.endsWith(".js"));

            for (const file of commandFiles) {
                const command = require(`../commands/${dir}/${file}`);
                command.group = dir;
                this.commands.set(command.name, command);
            }
        });

    }

    loadSlashCommands() {
        const slashCommands = [];

        readdirSync(join(__dirname, "..", "slashCommands/")).forEach(async dir => {
            const files = readdirSync(join(__dirname, "..", "slashCommands", dir)).filter(file => file.endsWith('.js'));

            for (const file of files) {
                    const slashCommand = require(`../slashCommands/${dir}/${file}`);
                    slashCommands.push({
                        name: slashCommand.name,
                        description: slashCommand.description,
                        type: slashCommand.type,
                        options: slashCommand.options ? slashCommand.options : null,
                        default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
                        default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve(slashCommand.default_member_permissions).toString() : null
                    });
                
                    if (slashCommand.name) {
                            this.slashCommands.set(slashCommand.name, slashCommand);
                    }
            }
            
        });

        (async () => {
                try {
                    await rest.put(
                        process.env.GUILD_ID ?
                        Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID) :
                        Routes.applicationCommands(CLIENT_ID), 
                        { body: slashCommands }
                    );
                } catch (error) {
                    console.log(error);
                }
        })();
    }

    colors = {
        Reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Reverse: "\x1b[7m",
        Hidden: "\x1b[8m",
        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m"
    }

    /**
     * Log into the console with color
     * @param {string} string
     * @param {string} color
     */
    log(string, color = "Reset") {
        console.log(this.colors[color], string + this.colors.Reset);
    }

    simpleEmbed(description = "Unknown", color = "Red") {
        var embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(description);
        return { embeds: [embed] }
    }

    start() {
        try {
            
            this.login(TOKEN);
            
            mongoose.set('strictQuery', true);
            mongoose.connect(this.MongoSRV)
            .then(() => {
                console.log("Successfully connected to the Mongo database!");
            })
            .catch((err) => {
                console.error(err);
            });


        } catch(error) {
            console.error(error);
        }
    }
}

module.exports = DiscordClient;
