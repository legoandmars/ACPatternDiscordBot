import { Command, ParsedCommand } from "./command";

export class ExportedCommand extends Command {

    constructor(){
        super("ping");

        this.description = "Sends back a 'Pong!'";
    }

    run(command: ParsedCommand){
        command.message.reply("Pong!");
    }

}
