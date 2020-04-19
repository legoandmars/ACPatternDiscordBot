import { Message } from "discord.js";
import { Command, ParsedCommand } from "./command";
import { PatternUtils } from "../Utils/utils";

export class ExportedCommand extends Command {
    constructor() {
        super("avatarpattern");

        this.description = "Creates a pattern from a user's avatar.";

        this.usage = `(user)`;

        this.aliases = [
            "patternavatar",
            "pfppattern",
            "patternpfp",
            "userpattern",
            "patternuser",
        ];

        // add making able to cut it down to a circle
        // make usage a string
        // make it so you can do it without pinging, probably with id
    }

    run(command: ParsedCommand) {
        this.urlsFromMessageMembers(command.message)
            .then((urlArray) => {
                PatternUtils.urlsToPatternMessage(urlArray, command.message);
            })
            .catch((reason) => {
                return command.message.reply(reason);
            });
    }

    avatarLimit: number = 5;

    ErrorCodes = {
        TooManyUsers: `Too many users! Please limit your message to ${this.avatarLimit.toString()}.`,
    };

    private urlsFromMessageMembers(message: Message): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const userArray = message.mentions.users.array();
            let urlArray: string[] = [];
            for (let i = 0; i < userArray.length; i++) {
                urlArray[i] = userArray[i].avatarURL({ format: "png" });
            }
            urlArray = urlArray.filter((a, b) => urlArray.indexOf(a) === b);
            if (urlArray.length === 0) {
                urlArray[0] = message.author.avatarURL({ format: "png" });
            }
            if (urlArray.length > this.avatarLimit)
                reject(this.ErrorCodes.TooManyUsers);

            resolve(urlArray);
        });
    }
}
