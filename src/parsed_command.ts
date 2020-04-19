import { Message } from "discord.js";

export class ParsedCommand {
    readonly args: string[];

    readonly prefix: string;

    readonly message: Message;

    readonly name: string;

    constructor(message: Message, prefix: string) {
        const args: string[] = message.content.slice(prefix.length).split(" ");

        this.args = args;
        this.prefix = prefix;
        this.message = message;
        this.name = args.shift().toLowerCase();
    }
}
