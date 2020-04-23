import { MessageEmbed } from "discord.js";
import { BotUtils } from "../Utils/utils";
import { ParsedCommand, advancedArg } from "../parsed_command";

export interface CommandInterface {
    readonly name: string;

    execute(parsedCommand: ParsedCommand): void;
}

export interface AdvancedOptionArguments {
    required: boolean; // if false, it's just a flag with no arguments.
    values?: any[];
    defaultValue?: any;
}

export interface AdvancedOptions {
    name: string;
    description: string;
    arguments: AdvancedOptionArguments;
}

function validateAdvancedArguments(
    advancedOptions: AdvancedOptions[],
    parsedCommand: ParsedCommand
): Promise<[string, ParsedCommand]> {
    return new Promise((resolve, reject) => {
        if (advancedOptions) {
            for (let i = 0; i < advancedOptions.length; i++) {
                const expectedOption = advancedOptions[i];
                let argWasPassed = false;
                for (let j = 0; j < parsedCommand.advancedArgs.length; j++) {
                    const passedOption = parsedCommand.advancedArgs[j];
                    if (passedOption.name === expectedOption.name) {
                        // found it.
                        argWasPassed = true;
                        if (expectedOption.arguments.required === true) {
                            let valueIsProper = false;
                            expectedOption.arguments.values.forEach((value) => {
                                if (value === passedOption.value) {
                                    valueIsProper = true;
                                }
                            });
                            if (valueIsProper === false) {
                                resolve([
                                    `\`${
                                        passedOption.value
                                    }\` is not a valid value for --${
                                        passedOption.name
                                    }. A list of valid values are: \`${expectedOption.arguments.values.join(
                                        ", "
                                    )}\``,
                                    parsedCommand,
                                ]);
                            }
                        } else if (
                            expectedOption.arguments.required === false
                        ) {
                            if (passedOption.value !== undefined) {
                                resolve([
                                    `\`${passedOption.value}\` is not a valid value for --${passedOption.name}. --${passedOption.name} does not accept any values.`,
                                    parsedCommand,
                                ]);
                            }
                        }
                    }
                    if (argWasPassed === false) {
                        // it wasn't passed, so create it with default values.
                        let commandValue;
                        if (expectedOption.arguments.required === true) {
                            commandValue =
                                expectedOption.arguments.defaultValue;
                            parsedCommand.advancedArgs.push({
                                name: expectedOption.name,
                                value: commandValue,
                                type: typeof commandValue,
                            });
                        }
                    }
                }
            }
            for (let i = 0; i < parsedCommand.advancedArgs.length; i++) {
                const passedOption = parsedCommand.advancedArgs[i];
                let optionNameValid = false;
                for (let j = 0; j < advancedOptions.length; j++) {
                    const expectedOption = advancedOptions[j];
                    if (expectedOption.name === passedOption.name) {
                        optionNameValid = true;
                    }
                }
                if (optionNameValid === false) {
                    resolve([
                        `\`${passedOption.name}\` is not a valid advanced option for --${parsedCommand.name}. Please do !help ${parsedCommand.name} for a list of advanced options.`,
                        parsedCommand,
                    ]);
                }
            }
        }
        // if it made it past all those checks, it's a proper flag.
        resolve(["", parsedCommand]);
    });
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
        if (parsedCommand.args[0] === "help") {
            // run help function
            this.help(parsedCommand);
        }
        validateAdvancedArguments(this.advancedOptions, parsedCommand).then(
            ([returnString, returnCommand]) => {
                if (returnString === "") {
                    console.log("Accepted");
                    this.run(returnCommand);
                } else {
                    returnCommand.message.reply(returnString);
                }
            }
        );
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

export { ParsedCommand, advancedArg };
