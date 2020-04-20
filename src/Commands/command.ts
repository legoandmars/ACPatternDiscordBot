import { MessageEmbed } from "discord.js";
import { BotUtils } from "../Utils/utils";
import { ParsedCommand } from "../parsed_command";

export interface CommandInterface {
    readonly name: string;

    execute(parsedCommand: ParsedCommand): void;
}

export interface AdvancedOptions {
    name: string;
    values: any;
    description: string;
    defaultValue: any;
}

export class Command implements CommandInterface {
    name: string; // main name of the command.

    description: string; // a basic description of what the command does, shown in !help

    usages: string[]; // an example of how to use the command. Example: `<args> <args2> (optionalarg)`

    aliases: string[]; // all possible names by which you can call the command

    visible: boolean = true; // is the command visible in the list of !help commands?

    helpable: boolean = true; // is it possible to do `!<thiscommand> help` or `!help <thiscommand>`?

    advancedOptions: AdvancedOptions[];

    execute(parsedCommand: ParsedCommand): void {
        if (parsedCommand.name !== this.name) {
            console.log(`Executing ${this.name} (alias ${parsedCommand.name})`);
        } else console.log(`Executing ${parsedCommand.name}`);
        // validate advanced args
        for (let i = 0; i < parsedCommand.advancedArgs.length; i++) {
            const advancedArg = parsedCommand.advancedArgs[i];
            let argFound = false;
            for (let j = 0; j < this.advancedOptions.length; j++) {
                const advancedCommandArg = this.advancedOptions[j];
                if (advancedArg.name === advancedCommandArg.name) {
                    argFound = true;
                    let foundProperValue = false;
                    if (Array.isArray(advancedCommandArg.values)) {
                        for (
                            let k = 0;
                            k < advancedCommandArg.values.length;
                            k++
                        ) {
                            if (
                                advancedArg.value ===
                                advancedCommandArg.values[k]
                            ) {
                                foundProperValue = true;
                            }
                        }
                    }
                    if (
                        foundProperValue === false &&
                        advancedArg.value !== advancedCommandArg.values
                    ) {
                        // throw error
                        parsedCommand.message.reply(
                            `\`${advancedArg.value}\` is not a valid value for --${advancedArg.name}. A list of valid values are: \`${advancedCommandArg.values}\``
                        );
                        return;
                    }
                }
            }
            if (argFound === false) {
                parsedCommand.message.reply(
                    `${
                        parsedCommand.prefix + this.name
                    } does not have advanced option --${
                        advancedArg.name
                    }. Please do ${parsedCommand.prefix}help ${
                        this.name
                    } for a list of advanced options.`
                );
                return;
            }
        }
        // make sure any args that don't exist are created with default values
        if (this.advancedOptions) {
            for (let i = 0; i < this.advancedOptions.length; i++) {
                const advancedCommandArg = this.advancedOptions[i];
                const findArg = parsedCommand.advancedArgs.find((arg) => {
                    return arg.name === advancedCommandArg.name;
                });
                if (!findArg) {
                    console.log("CREATING ARG");
                    parsedCommand.advancedArgs.push({
                        name: advancedCommandArg.name,
                        value: advancedCommandArg.defaultValue,
                        type: typeof advancedCommandArg.defaultValue,
                    });
                }
            }
        }

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

        if (this.usages) {
            const usagesWithPrefixes: string[] = [];
            for (let i = 0; i < this.usages.length; i++) {
                usagesWithPrefixes.push(
                    `${parsedCommand.prefix + this.name} ${this.usages[i]}`
                );
            }
            let fieldName: string = "";
            if (this.usages.length > 1) {
                fieldName = "**Usages**";
            } else {
                fieldName = "**Usage**";
            }
            helpEmbed.addField(fieldName, `${usagesWithPrefixes.join("\n")}`);
        } else
            helpEmbed.addField(
                "**Usage**",
                `${parsedCommand.prefix + this.name}`
            );

        const aliasesWithPrefixes: string[] = [];
        if (this.aliases) {
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
