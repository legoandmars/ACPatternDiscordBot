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
                name: "nobackgroundimage",
                description:
                    "Don't display the full image behind the current layer in the instructions.",
                arguments: {
                    required: false,
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
                name: "grid",
                description: "Image grid size.",
                arguments: {
                    required: true,
                    values: [],
                    defaultValue: "1x1",
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
            {
                name: "resizemode",
                description: "The mode used to resize non square sized images.",
                arguments: {
                    required: true,
                    values: ["stretch", "crop"],
                    defaultValue: "stretch",
                },
            },
        ];
    }

    run(command: ParsedCommand) {}

    sendURLs(urlArray: string[], command: ParsedCommand) {
        command.message.channel.startTyping();
        let gridWidth = 1;
        let gridHeight = 1;
        if (command.advancedArgs.find((element) => element.name === "grid")) {
            // grid. adjust the size accordingly.
            const gridValue = command.advancedArgs.find(
                (element) => element.name === "grid"
            ).value;
            if (
                Number.isInteger(parseInt(gridValue.split("x")[0], 10)) &&
                Number.isInteger(parseInt(gridValue.split("x")[1], 10))
            ) {
                gridWidth = parseInt(gridValue.split("x")[0], 10);
                gridHeight = parseInt(gridValue.split("x")[1], 10);
            }
        }

        const instructionsList: Canvas[] = [];
        for (let i = 0; i < urlArray.length; i++) {
            const url = urlArray[i];
            const pattern = new PatternUtils.Pattern(url, command.advancedArgs);
            pattern.preProcess().then(() => {
                console.log("loaded image and canvas.");
                console.log(url);
                pattern.toInstructions().then((instructions) => {
                    for (let j = 0; j < instructions.length; j++) {
                        instructionsList[instructions.length * i + j] =
                            instructions[j];
                        let totalLoadedImages = 0;
                        for (
                            let k = 0;
                            k < urlArray.length * gridWidth * gridHeight;
                            k++
                        ) {
                            if (instructionsList[k]) {
                                totalLoadedImages += 1;
                            }
                        }
                        if (
                            totalLoadedImages ===
                            urlArray.length * gridWidth * gridHeight
                        ) {
                            BotUtils.sendImages(
                                instructionsList,
                                command.message
                            );
                        }
                    }
                });
            });
        }
    }
}
