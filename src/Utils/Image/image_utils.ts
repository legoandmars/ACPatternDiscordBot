import { loadImage, Canvas, ImageData, Image } from "canvas";
import {
    buildPaletteSync,
    utils,
    applyPaletteSync,
    PaletteQuantization,
    ColorDistanceFormula,
    ImageQuantization,
} from "image-q";
import path from "path";
import fs from "fs";
import { advancedArg } from "src/Commands/command";

export namespace ImageUtils {
    export interface NamedImage {
        [name: string]: Image;
    }

    export function loadImages(imagePaths: string[]): Promise<NamedImage> {
        return new Promise((resolve, reject) => {
            const allImages: NamedImage = {};
            for (let i = 0; i < imagePaths.length; i++) {
                loadImage(imagePaths[i]).then((loadedImage) => {
                    allImages[path.parse(imagePaths[i]).name] = loadedImage;
                    if (i === imagePaths.length - 1) {
                        resolve(allImages);
                    }
                });
            }
        });
    }

    export function saveCanvasToFile(
        canvas: Canvas,
        imagePath: string
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const buffer = canvas.toBuffer();
                fs.writeFileSync(imagePath, buffer);
                resolve();
            } catch (error) {
                throw new Error(error);
            }
        });
    }

    export function imageToCanvas(image: Image): Canvas {
        const canvas = new Canvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        return canvas;
    }

    export interface QuantizationOptions {
        paletteQuantization: string;
        colorDistanceFormula: string;
        imageQuantization: string;
        colors: number;
    }

    export function quantizeImage(
        image: Canvas,
        options: advancedArg[]
    ): Canvas {
        // TODO: add multiple configurable options
        const quantizationOptions: QuantizationOptions = {
            colors: options.find((element) => element.name === "colors").value,
            imageQuantization: options.find(
                (element) => element.name === "imagequantization"
            ).value,
            colorDistanceFormula: options.find(
                (element) => element.name === "colordistanceformula"
            ).value,
            paletteQuantization: options.find(
                (element) => element.name === "palettequantization"
            ).value,
        };

        const quantCanvas: unknown = new Canvas(32, 32);
        const quantCtx = (quantCanvas as Canvas).getContext("2d");
        quantCtx.imageSmoothingQuality = "high";
        quantCtx.drawImage(image, 0, 0, 32, 32);

        const inPointContainer = utils.PointContainer.fromHTMLCanvasElement(
            quantCanvas as HTMLCanvasElement
        );
        let palette;
        let outPointContainer;
        if (
            quantizationOptions.paletteQuantization !== "default" &&
            quantizationOptions.colorDistanceFormula !== "default"
        ) {
            palette = buildPaletteSync([inPointContainer], {
                colors: quantizationOptions.colors,
                paletteQuantization: quantizationOptions.paletteQuantization as PaletteQuantization,
                colorDistanceFormula: quantizationOptions.colorDistanceFormula as ColorDistanceFormula,
            });
        } else if (quantizationOptions.paletteQuantization !== "default") {
            palette = buildPaletteSync([inPointContainer], {
                colors: quantizationOptions.colors,
                paletteQuantization: quantizationOptions.paletteQuantization as PaletteQuantization,
            });
        } else if (quantizationOptions.colorDistanceFormula !== "default") {
            palette = buildPaletteSync([inPointContainer], {
                colors: quantizationOptions.colors,
                colorDistanceFormula: quantizationOptions.colorDistanceFormula as ColorDistanceFormula,
            });
        } else {
            palette = buildPaletteSync([inPointContainer], {
                colors: quantizationOptions.colors,
            });
        }

        if (quantizationOptions.imageQuantization !== "default") {
            outPointContainer = applyPaletteSync(inPointContainer, palette, {
                imageQuantization: quantizationOptions.imageQuantization as ImageQuantization,
            });
        } else {
            outPointContainer = applyPaletteSync(inPointContainer, palette);
        }
        // palette = buildPaletteSync([inPointContainer], { colors: 15 });
        // outPointContainer = applyPaletteSync(inPointContainer, palette);

        const clampedArray = new Uint8ClampedArray(
            outPointContainer.toUint8Array(),
            32,
            32
        );
        const imageData = new ImageData(clampedArray, 32, 32);
        quantCtx.putImageData(imageData, 0, 0);

        return quantCanvas as Canvas;
    }
}
