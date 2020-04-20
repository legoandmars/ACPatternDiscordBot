import { Command, ParsedCommand } from "./command";
import { PatternUtils, EmoteUtils } from "../Utils/utils";

export class ExportedCommand extends Command {
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
                PatternUtils.urlsToPatternMessage(
                    emoteUrlArray,
                    command.message
                );
            })
            .catch((reason) => {
                return command.message.reply(reason);
            });
    }
}
