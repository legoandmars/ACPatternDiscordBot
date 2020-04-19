import { MessageEmbed } from "discord.js";
import { BotUtils } from "../Utils/utils";
import { ParsedCommand } from "../parsed_command";

export interface CommandInterface {
    readonly name: string;

    execute(parsedCommand: ParsedCommand): void;
}

export class Command implements CommandInterface {
    name: string; // main name of the command.

    description: string; // a basic description of what the command does, shown in !help

    usage: string; // an example of how to use the command. Example: `<args> <args2> (optionalarg)`

    aliases: string[]; // all possible names by which you can call the command

    visible: boolean = true; // is the command visible in the list of !help commands?

    helpable: boolean = true; // is it possible to do `!<thiscommand> help` or `!help <thiscommand>`?

    execute(parsedCommand: ParsedCommand): void {
        if (parsedCommand.name !== this.name) {
            console.log(`Executing ${this.name} (alias ${parsedCommand.name})`);
        } else console.log(`Executing ${parsedCommand.name}`);
        if (parsedCommand.args[0] === "help") {
            // run help function
            this.help(parsedCommand);
        } else this.run(parsedCommand);
    }

    run(parsedCommand: ParsedCommand): void {}

    help(parsedCommand: ParsedCommand): void {
        const helpEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#f98386")
            .setTitle(parsedCommand.prefix + this.name)
            .setDescription(this.description)
            .setFooter(
                "Animal Crossing Pattern Bot",
                BotUtils.client.user.avatarURL()
            );

        if (this.usage) {
            helpEmbed.addField(
                "**Usage**",
                `${parsedCommand.prefix + this.name} ${this.usage}`
            );
        } else
            helpEmbed.addField(
                "**Usage**",
                `${parsedCommand.prefix + this.name}`
            );

        const aliasesWithPrefixes: string[] = [];
        if (this.aliases) {
            console.log(this.aliases);
            for (let i = 0; i < this.aliases.length; i++) {
                console.log(parsedCommand.prefix + this.aliases[i]);
                aliasesWithPrefixes.push(
                    parsedCommand.prefix + this.aliases[i]
                );
            }
        }
        aliasesWithPrefixes.unshift(parsedCommand.prefix + this.name);
        helpEmbed.addField(
            "**Aliases**",
            `\`${aliasesWithPrefixes.join(", ")}\``
        );

        parsedCommand.message.channel.send(helpEmbed);
    }

    constructor(name: string) {
        this.name = name;
        if (this.helpable === false) this.visible = false;
    }
}

export { ParsedCommand };
