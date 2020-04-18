import { Message } from "discord.js";
import { ParsedCommand, Command } from "./Commands/command"
import fs from "fs";

export class CommandHandler {
    readonly prefix: string;
    public commands: Command[]
    constructor(prefix: string){
        this.prefix = prefix;

        this.getAllCommands().then((allCommands) => {
            this.commands = allCommands;
        });

    }

    public HandleCommand(message: Message): void {
        let parsedCommand = new ParsedCommand(message, this.prefix);
        let command = this.commands.find(function(command){
            if(command.aliases){
                return(command.name == parsedCommand.name) || (command.aliases.find(function(subCommand){return subCommand == parsedCommand.name}));
            } else return(command.name == parsedCommand.name);
        })
        if (command) command.execute(parsedCommand);
    }
    
    public getAllCommands(): Promise<Command[]>{
        return new Promise((resolve, reject) => {
            fs.readdir(__dirname+"/Commands", (err, files) => {
                let allCommands: Command[] = []
                files.forEach(file => {
                    console.log(file);
                    if(file != "command.js"){
                        import(`./Commands/${file}`).then((module => {
                            let exportedCommand = new module.ExportedCommand();
                            allCommands.push(exportedCommand);
                            if(allCommands.length == files.length-1){
                                resolve(allCommands);
                            }
                        }));
                    }
                });
            });          
        });          
    }
}