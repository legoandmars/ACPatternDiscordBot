import { MessageAttachment } from "discord.js";
import { Command, ParsedCommand } from "./command";
import { PatternUtils } from "../Utils/utils";

export class ExportedCommand extends Command {
    constructor() {
        super("pattern");

        this.description = "Creates a pattern from an image.";

        this.usages = ["(attached image)"];
    }

    run(command: ParsedCommand) {
        const image: MessageAttachment = command.message.attachments.array()[0];
        if (image) {
            PatternUtils.urlToPatternMessage(image.url, command.message);
        } else command.message.reply("No attached image!");
    }
}
