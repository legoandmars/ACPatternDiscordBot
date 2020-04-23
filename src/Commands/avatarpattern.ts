import { Message } from "discord.js";
import { Canvas } from "canvas";
import { ParsedCommand } from "./command";
import { PatternBase } from "../Base/pattern_base";

export class ExportedCommand extends PatternBase {
    constructor() {
        super("avatarpattern");

        this.description =
            "Creates a pattern from a user's avatar.\n\nRunning this command with no arguments will make a pattern from the avatar of the user running the command.";

        this.usages = ["", `(user mention)`];

        this.aliases = [
            "patternavatar",
            "pfppattern",
            "patternpfp",
            "userpattern",
            "patternuser",
        ];
        // make it so you can do it without pinging, probably with id
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

    run(command: ParsedCommand) {
        const instructionsList: Canvas[] = [];
        this.urlsFromMessageMembers(command.message)
            .then((urlArray) => {
                this.sendURLs(urlArray, command);
            })
            .catch((reason) => {
                return command.message.reply(reason);
            });
    }
}
