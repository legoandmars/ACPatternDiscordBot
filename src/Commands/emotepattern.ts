import { ParsedCommand } from "./command";
import { EmoteUtils } from "../Utils/utils";
import { PatternBase } from "../Base/pattern_base";

export class ExportedCommand extends PatternBase {
    constructor() {
        super("emotepattern");

        this.description =
            "Creates a pattern from an emote.\n\nAccepts the default discord emotes, server emotes, and the first frame of animated emotes.";

        this.usages = [`(up to ${EmoteUtils.emoteLimit} emotes)`];

        this.aliases = ["emojipattern", "patternemoji", "patternemote"];
    }

    run(command: ParsedCommand) {
        console.log(command.message.content);
        EmoteUtils.urlsFromEmojiString(command.message.content)
            .then((emoteUrlArray) => {
                this.sendURLs(emoteUrlArray, command);
            })
            .catch((reason) => {
                return command.message.reply(reason);
            });
    }
}
