import { Command, ParsedCommand } from "./command";
import { PatternUtils } from "../Utils/utils";
import { MessageAttachment } from "discord.js";

export class ExportedCommand extends Command {

    constructor(){

        super("pattern");

        this.description = "Creates a pattern from an image";

    }

    run(command: ParsedCommand){

        let image: MessageAttachment = command.message.attachments.array()[0];
        if(image){
            PatternUtils.urlToPatternMessage(image.url, command.message);
        }else command.message.reply("No attached image!");

    }

}