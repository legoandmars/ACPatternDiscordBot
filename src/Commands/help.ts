import { MessageEmbed } from "discord.js";
import { Command, ParsedCommand } from "./command";
import { BotUtils } from "../Utils/utils";

export class ExportedCommand extends Command {
    constructor() {
        super("help");

        this.description =
            "Gives information about commands and how to use them.";

        this.usage = "<command>";

        this.aliases = ["info"];

        this.visible = false;
    }

    run(command: ParsedCommand) {
        // command.message.reply("Pong!");
        const allCommands: Command[] = BotUtils.commandHandler.commands;
        if (command.args.length !== 0) {
            // looking for help with a specific command.
            let commandString = command.args[0];
            if (commandString.split(command.prefix).length > 1) {
                commandString = commandString.split(command.prefix)[1];
            }
            const singleCommand = allCommands.find((singlecommand) => {
                if (singlecommand.aliases) {
                    return (
                        singlecommand.name === commandString ||
                        singlecommand.aliases.find((subCommand) => {
                            return subCommand === commandString;
                        })
                    );
                }
                return singlecommand.name === commandString;
            });
            if (singleCommand) {
                singleCommand.help(command);
            } else
                command.message.reply(
                    `${commandString} is not a valid command. Try using \`${command.prefix}help\` for a list of commands.`
                );
        } else {
            // looking for help with all commands.
            let allCommandString = "`";
            allCommands.forEach((element) => {
                if (element.visible === true) {
                    allCommandString += `${command.prefix + element.name}\n`;
                }
            });
            allCommandString += "`";
            const helpEmbed: MessageEmbed = new MessageEmbed()
                .setColor("#f98386")
                .setTitle(command.prefix + this.name)
                .setDescription(
                    `Type \`${command.prefix}help <command_name>\` for a more detailed explanation of a command.`
                )
                .setFooter(
                    "Animal Crossing Pattern Bot",
                    BotUtils.client.user.avatarURL()
                )
                .addField("Commands", allCommandString);

            command.message.channel.send(helpEmbed);
        }
    }
}
