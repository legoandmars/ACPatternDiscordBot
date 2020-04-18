import { Command, ParsedCommand } from "./command";

export class ExportedCommand extends Command {

    constructor(){
        super("pong");

        this.description = "Sends back a 'Ping!'";

        this.visible = false;
    }

    run(command: ParsedCommand){
        command.message.reply("Ping!");
    }

}