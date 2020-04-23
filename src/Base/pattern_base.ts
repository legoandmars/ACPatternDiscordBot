import { Canvas } from "canvas";
import { Command, ParsedCommand } from "../Commands/command";
import { PatternUtils, BotUtils } from "../Utils/utils";

export class PatternBase extends Command {
    constructor(name: string) {
        super(name);
        // all pattern advanced options below
        this.advancedOptions = [
            {
                name: "circle",
                description: "Crops the pattern into a circle",
                arguments: {
                    required: false,
                },
            },
        ];
    }

    run(command: ParsedCommand) {}

    sendURLs(urlArray: string[], command: ParsedCommand) {
        const instructionsList: Canvas[] = [];
        for (let i = 0; i < urlArray.length; i++) {
            const url = urlArray[i];
            const pattern = new PatternUtils.Pattern(url, command.advancedArgs);
            pattern.preProcess().then(() => {
                console.log("loaded image and canvas.");
                console.log(url);
                pattern.toInstructions().then((instructions) => {
                    instructionsList[i] = instructions;
                    let totalLoadedImages = 0;
                    for (let j = 0; j < urlArray.length; j++) {
                        if (instructionsList[j]) {
                            totalLoadedImages += 1;
                        }
                    }
                    if (totalLoadedImages === urlArray.length) {
                        BotUtils.sendImages(instructionsList, command.message);
                    }
                });
            });
        }
    }
}
