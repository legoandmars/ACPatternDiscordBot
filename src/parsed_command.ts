import { Message } from "discord.js";

interface advancedArg {
    name: string;
    value: any;
    type: string;
}

export class ParsedCommand {
    readonly args: string[];

    advancedArgs: advancedArg[];

    readonly prefix: string;

    readonly message: Message;

    readonly name: string;

    constructor(message: Message, prefix: string) {
        if (message.content.charAt(0) !== prefix) return;
        const args: string[] = message.content.slice(prefix.length).split(" ");
        const tempAdvancedArgs = [];
        const advancedArgs = message.content.slice(prefix.length).split("--");
        advancedArgs.shift();
        for (let i = 0; i < advancedArgs.length; i++) {
            const advArgSplit: string[] = advancedArgs[i].split(" ");
            let argValue;
            if (!advArgSplit[1]) {
                argValue = undefined;
            } else if (advArgSplit[1] === "") {
                argValue = undefined;
            } else if (advArgSplit[1].toLowerCase() === "true") {
                argValue = true;
            } else if (advArgSplit[1].toLowerCase() === "false") {
                argValue = false;
            } else if (
                advArgSplit[1].match("^[\\$]?[-+]?[\\d\\.,]*[\\.,]?\\d+$")
            ) {
                argValue = Number(advArgSplit[1]);
            } else {
                argValue = advArgSplit[1];
            }
            tempAdvancedArgs[i] = {
                name: advArgSplit[0],
                value: argValue,
                type: typeof argValue,
            };
        }
        this.advancedArgs = tempAdvancedArgs;
        console.log(this.advancedArgs);
        this.args = args;
        this.prefix = prefix;
        this.message = message;
        this.name = args.shift().toLowerCase();
    }
}
