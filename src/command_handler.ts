import { Message } from "discord.js";
import fs from "fs";
import { ParsedCommand, Command } from "./Commands/command";

export class CommandHandler {
    readonly prefix: string;

    public commands: Command[];

    constructor(prefix: string) {
        this.prefix = prefix;

        this.getAllCommands().then((allCommands) => {
            this.commands = allCommands;
        });
    }

    public HandleCommand(message: Message): void {
        const parsedCommand = new ParsedCommand(message, this.prefix);
        const command = this.commands.find((_command) => {
            if (_command.aliases) {
                return (
                    _command.name === parsedCommand.name ||
                    _command.aliases.find((subCommand) => {
                        return subCommand === parsedCommand.name;
                    })
                );
            }
            return _command.name === parsedCommand.name;
        });
        if (command) command.execute(parsedCommand);
    }

    public getAllCommands(): Promise<Command[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(`${__dirname}/Commands`, (err, files) => {
                const allCommands: Command[] = [];
                files.forEach((file) => {
                    console.log(file);
                    if (file !== "command.js") {
                        import(`./Commands/${file}`).then((module) => {
                            const exportedCommand = new module.ExportedCommand();
                            allCommands.push(exportedCommand);
                            if (allCommands.length === files.length - 1) {
                                resolve(allCommands);
                            }
                        });
                    }
                });
            });
        });
    }
}
