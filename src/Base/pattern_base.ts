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
                description: "Crops the pattern into a circle.",
                arguments: {
                    required: false,
                },
            },
            {
                name: "fullbackgroundimage",
                description:
                    "Whether or not the full image should appear behind the current layer in the instructions.",
                arguments: {
                    required: true,
                    values: [true, false],
                    defaultValue: true,
                },
            },
            {
                name: "colors",
                description: "The amount of colors the image is reduced to.",
                arguments: {
                    required: true,
                    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    defaultValue: 15,
                },
            },
            {
                name: "imagequantization",
                description: "The image quantization method used.",
                arguments: {
                    required: true,
                    values: [
                        "default",
                        "nearest",
                        "riemersma",
                        "floyd-steinberg",
                        "false-floyd-steinberg",
                        "stucki",
                        "atkinson",
                        "jarvis",
                        "burkes",
                        "sierra",
                        "two-sierra",
                        "sierra-lite",
                    ],
                    defaultValue: "default",
                },
            },
            {
                name: "colordistanceformula",
                description: "The color distance formula used.",
                arguments: {
                    required: true,
                    values: [
                        "default",
                        "cie94-textiles",
                        "cie94-graphic-arts",
                        "ciede2000",
                        "color-metric",
                        "euclidean",
                        "euclidean-bt709-noalpha",
                        "euclidean-bt709",
                        "manhattan",
                        "manhattan-bt709",
                        "manhattan-nommyde",
                        "pngquant",
                    ],
                    defaultValue: "default",
                },
            },
            {
                name: "palettequantization",
                description: "The palette quantization method used.",
                arguments: {
                    required: true,
                    values: [
                        "default",
                        "neuquant",
                        "neuquant-float",
                        "rgbquant",
                        "wuquant",
                    ],
                    defaultValue: "default",
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
