import { Command, ParsedCommand } from "./command";

export class ExportedCommand extends Command {

    constructor(){
        super("pong");

        this.description = "Sends back a 'Ping!'";
    }

    run(command: ParsedCommand){
        command.message.reply("Ping!");
    }

}