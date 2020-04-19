import { Command, ParsedCommand } from "./command";
import { config } from "../Config/config";

export class ExportedCommand extends Command {
    constructor() {
        super("github");

        this.description = "Gives a link to the bots's github page.";

        this.aliases = ["botinfo", "source", "sourcecode"];
    }

    run(command: ParsedCommand) {
        command.message.channel.send(`Github link:\n${config.github}`);
    }
}
