import { MessageAttachment } from "discord.js";
import { ParsedCommand } from "./command";
import { PatternBase } from "../Base/pattern_base";

export class ExportedCommand extends PatternBase {
    constructor() {
        super("pattern");

        this.description = "Creates a pattern from an attached image.";

        this.usages = ["(attached image)"];
    }

    run(command: ParsedCommand) {
        const images: MessageAttachment[] = command.message.attachments.array();
        // if (image) {
        // PatternUtils.urlToPatternMessage(image.url, command);
        if (images.length > 0) {
            const urlArray: string[] = [];
            images.forEach((image) => {
                urlArray.push(image.url);
            });
            this.sendURLs(urlArray, command);
        } else command.message.reply("No attached image!");
    }
}
