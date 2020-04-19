import { Canvas, Image } from "canvas";
import { Message } from "discord.js";
import { ColorUtils, ImageUtils, BotUtils } from "../utils";

export namespace PatternUtils {
    let images: ImageUtils.NamedImage;

    export function loadPatternImages() {
        ImageUtils.loadImages([
            `${__dirname}/../../../Images/background.png`,
            `${__dirname}/../../../Images/bird.png`,
            `${__dirname}/../../../Images/background_overlay.png`,
            `${__dirname}/../../../Images/background_mask.png`,
        ]).then((tempImages) => {
            images = tempImages;
        });
    }

    export function correctAndIsolateImageColors(
        canvas: Canvas,
        colorScheme: ColorUtils.RGB[]
    ): [Canvas, Canvas[]] {
        const imageCanvas = new Canvas(32, 32);
        const imagectx = imageCanvas.getContext("2d");
        imagectx.drawImage(canvas, 0, 0);
        const imageData = imagectx.getImageData(0, 0, 32, 32);

        const tempImageColors: ColorUtils.RGB[] = ColorUtils.colorSchemeFromImage(
            canvas
        );
        // note: figure out a way to convert imagedata to RGBA arrays to make working with them much easier
        let newImageColors: ColorUtils.RGB[] = [];
        const eachColorCount = [];
        const isolatedCanvses: Canvas[] = [];

        for (let i = 0; i < tempImageColors.length; i++) {
            const currentColor = tempImageColors[i];
            const newColor = ColorUtils.nearestColor(currentColor, colorScheme);
            newImageColors[i] = newColor;
        }
        newImageColors = newImageColors.filter(
            (a, b) => newImageColors.indexOf(a) === b
        );
        // we have a list of converted image colors. now we need to re-color the image appropriately, and then isolate the colors.
        for (let i = 0; i < tempImageColors.length; i++) {
            const currentRGB = tempImageColors[i];

            // find which new matches the temp
            const newColor = ColorUtils.nearestColor(currentRGB, colorScheme);
            let newImageColorsNumber = 0;
            for (let j = 0; j < newImageColors.length; j++) {
                if (
                    ColorUtils.RGBValuesIdentical(newColor, newImageColors[j])
                ) {
                    // found it
                    newImageColorsNumber = j;
                    break;
                }
            }
            const colorCanvas = new Canvas(32, 32);
            const colorCtx = colorCanvas.getContext("2d");
            colorCtx.drawImage(imageCanvas, 0, 0);
            const colorImageData = colorCtx.getImageData(0, 0, 32, 32);

            for (let j = 0; j < imageData.data.length; j += 4) {
                const pixelColor = {
                    r: imageData.data[j],
                    g: imageData.data[j + 1],
                    b: imageData.data[j + 2],
                };

                if (ColorUtils.RGBValuesIdentical(currentRGB, pixelColor)) {
                    colorImageData.data[j] = newColor.r;
                    colorImageData.data[j + 1] = newColor.g;
                    colorImageData.data[j + 2] = newColor.b;
                    if (!(colorImageData.data[j + 3] <= 2)) {
                        colorImageData.data[j + 3] = 255;
                    }
                    if (eachColorCount[i]) {
                        eachColorCount[i] += 1;
                    } else {
                        eachColorCount[i] = 1;
                    }
                    // everFound = true;
                } else {
                    colorImageData.data[j + 3] = 0;
                }
            }

            const brandNewCanvas = new Canvas(32, 32);
            const brandNewCtx = brandNewCanvas.getContext("2d");
            brandNewCtx.putImageData(colorImageData, 0, 0);
            // let hsvArray = ColorUtils.RGBtoHSV(currentRGB);
            // createPicture(imageCanvas,brandNewCanvas,[hsvArray.h,hsvArray.s,hsvArray.v],(i+1))
            ImageUtils.saveCanvasToFile(
                brandNewCanvas,
                `${__dirname}/../../../Images/Debug/export_${i + 1}.png`
            );
            isolatedCanvses[i] = brandNewCanvas;
        }
        // console.log(eachColorCount);
        return [imageCanvas, isolatedCanvses];
    }

    function calcPosX(segments: number, x: number, image: Image) {
        // x should be 0-1;
        let segmentNumber = Math.round(x * segments);
        if (segmentNumber > segments - 1) {
            segmentNumber = segments - 1;
        }
        return (
            295 +
            (500 / segments) * segmentNumber +
            Math.floor(500 / segments / 2) -
            image.width / 2
        );
    }

    function calcPosY(y: number, image: Image) {
        return y + 8 - image.height;
    }

    export function createPicture(
        fullImage: Canvas,
        inputImage: Canvas,
        colorNumber: number
    ): Promise<Canvas> {
        return new Promise((resolve, reject) => {
            const hsvToConvertArray = ColorUtils.colorSchemeFromImage(
                inputImage
            );
            // console.log(hsvToConvertArray);
            let hsvToConvert: ColorUtils.HSV; // = hsvToConvertArray[0];
            if (hsvToConvertArray.length >= 2) {
                hsvToConvert = ColorUtils.RGBtoHSV(hsvToConvertArray[1]);
            } else hsvToConvert = ColorUtils.RGBtoHSV(hsvToConvertArray[0]);
            console.log(`Generating image #${colorNumber}`);
            // /
            const outlineEnabled = true;
            const outlineThickness = 2;
            const backgroundImageOpacity = 60;
            // /
            const tempCanvas = new Canvas(
                images.background.width,
                images.background.height
            );
            const tempCtx = tempCanvas.getContext("2d");
            const isolatedRedPixelCanvas = new Canvas(
                images.background.width,
                images.background.height
            );
            const isolatedRedPixelCtx = isolatedRedPixelCanvas.getContext("2d");

            tempCtx.imageSmoothingEnabled = false;
            tempCtx.drawImage(inputImage, 129, 408, 639, 639);
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.drawImage(images.background_mask, 0, 0);
            const maskImageData = tempCtx.getImageData(
                0,
                0,
                tempCanvas.width,
                tempCanvas.height
            );
            for (let i = 0; i < maskImageData.data.length; i += 4) {
                if (maskImageData.data[i + 1] === 255) {
                    maskImageData.data[i + 3] = 0;
                }
            }
            tempCtx.putImageData(maskImageData, 0, 0);
            const imageMaskBackupCanvas = new Canvas(
                images.background.width,
                images.background.height
            );
            const imageMaskBackupCtx = imageMaskBackupCanvas.getContext("2d");
            imageMaskBackupCtx.drawImage(tempCanvas, 0, 0);

            if (outlineEnabled === true) {
                let imageData = tempCtx.getImageData(
                    0,
                    0,
                    tempCanvas.width,
                    tempCanvas.height
                );
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] = 255;
                    imageData.data[i + 1] = 0;
                    imageData.data[i + 2] = 0;
                }
                const tempRedCanvas = new Canvas(
                    images.background.width,
                    images.background.height
                );
                const tempRedCtx = tempRedCanvas.getContext("2d");
                tempRedCtx.putImageData(imageData, 0, 0);
                tempCtx.drawImage(tempRedCanvas, -outlineThickness, 0);
                tempCtx.drawImage(tempRedCanvas, outlineThickness, 0);
                tempCtx.drawImage(tempRedCanvas, 0, -outlineThickness);
                tempCtx.drawImage(tempRedCanvas, 0, outlineThickness);
                tempCtx.drawImage(
                    tempRedCanvas,
                    outlineThickness,
                    outlineThickness
                );
                tempCtx.drawImage(
                    tempRedCanvas,
                    outlineThickness,
                    -outlineThickness
                );
                tempCtx.drawImage(
                    tempRedCanvas,
                    -outlineThickness,
                    outlineThickness
                );
                tempCtx.drawImage(
                    tempRedCanvas,
                    -outlineThickness,
                    -outlineThickness
                );

                // draw image again on top of red pixels
                tempCtx.imageSmoothingEnabled = false;
                tempCtx.drawImage(imageMaskBackupCanvas, 0, 0);
                tempCtx.imageSmoothingEnabled = true;
                // isolate red pixels
                imageData = tempCtx.getImageData(
                    0,
                    0,
                    tempCanvas.width,
                    tempCanvas.height
                );
                for (let i = 0; i < imageData.data.length; i += 4) {
                    if (
                        (imageData.data[i] === 255 &&
                            imageData.data[i + 1] === 0 &&
                            imageData.data[i + 2] === 0) === false
                    ) {
                        imageData.data[i + 3] = 0;
                    }
                    imageData.data[i] = 255;
                    imageData.data[i + 1] = 0;
                    imageData.data[i + 2] = 0;
                }
                isolatedRedPixelCtx.imageSmoothingEnabled = false;
                isolatedRedPixelCtx.putImageData(imageData, 0, 0);
            }
            // ctx.putImageData(imageData,50,0);
            const canvas = new Canvas(
                images.background.width,
                images.background.height
            );
            const ctx = canvas.getContext("2d");
            // before background image, we need to calculate the sat and val sliders.
            const satSliderCanvas = new Canvas(15, 1);
            const satSliderCtx = satSliderCanvas.getContext("2d");
            satSliderCtx.imageSmoothingEnabled = false;
            // 295, 134
            for (let i = 0; i < 15; i++) {
                const sliderHSV = {
                    h: hsvToConvert.h,
                    s: i / 15,
                    v: hsvToConvert.v,
                };
                const sliderRGB = ColorUtils.HSVtoRGB(sliderHSV);
                satSliderCtx.fillStyle = `rgba(${sliderRGB.r},${sliderRGB.g},${sliderRGB.b},1)`;
                satSliderCtx.fillRect(i, 0, 1, 1);
            }

            const valSliderCanvas = new Canvas(15, 1);
            const valSliderCtx = valSliderCanvas.getContext("2d");
            valSliderCtx.imageSmoothingEnabled = false;
            // 295, 134
            for (let i = 0; i < 15; i++) {
                const sliderHSV = {
                    h: hsvToConvert.h,
                    s: hsvToConvert.s,
                    v: i / 15,
                };
                const sliderRGB = ColorUtils.HSVtoRGB(sliderHSV);
                valSliderCtx.fillStyle = `rgba(${sliderRGB.r},${sliderRGB.g},${sliderRGB.b},1)`;
                valSliderCtx.fillRect(i, 0, 1, 1);
            }

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(satSliderCanvas, 295, 134, 500, 36);
            ctx.drawImage(valSliderCanvas, 295, 214, 500, 37);
            tempCtx.imageSmoothingEnabled = true;
            ctx.drawImage(images.background, 0, 0);
            const birdX = calcPosX(30, hsvToConvert.h, images.bird);
            const birdY = calcPosY(53, images.bird);
            ctx.drawImage(images.bird, birdX, birdY);
            const birdSatX = calcPosX(15, hsvToConvert.s, images.bird);
            const birdSatY = calcPosY(134, images.bird);
            ctx.drawImage(images.bird, birdSatX, birdSatY);
            const birdValX = calcPosX(15, hsvToConvert.v, images.bird);
            const birdValY = calcPosY(214, images.bird);
            ctx.drawImage(images.bird, birdValX, birdValY);
            // now draw the actual image
            // before drawing the full image, make it slightly more transparent
            const fullImageData = fullImage
                .getContext("2d")
                .getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const rgbToConvert = ColorUtils.HSVtoRGB(hsvToConvert);
            for (let i = 0; i < fullImageData.data.length; i += 4) {
                if (
                    rgbToConvert.r === 0 &&
                    rgbToConvert.g === 0 &&
                    rgbToConvert.b === 0 &&
                    colorNumber === 1
                ) {
                    // transparency, display image as full
                    fullImageData.data[i + 3] = 255;
                } else {
                    fullImageData.data[i + 3] =
                        (backgroundImageOpacity / 100) * 255;
                }
            }
            fullImage.getContext("2d").putImageData(fullImageData, 0, 0);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(fullImage, 129, 408, 639, 639);
            ctx.drawImage(images.background_overlay, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.imageSmoothingEnabled = true;
            // ctx.drawImage(isolatedRedPixelCanvas,0,0);
            resolve(canvas);
            // saveCanvasToFile(canvas, __dirname+'/../../../Images/Debug/Exported_Step_'+colorNumber+'.png')
        });
    }

    export function patternFromImage(
        attachmentImage: Image,
        hsvColorArray: ColorUtils.RGB[]
    ): Promise<Canvas> {
        return new Promise((resolve, reject) => {
            const quantizedCanvas = ImageUtils.quantizeImage(attachmentImage);
            const correctedCanvas: [
                Canvas,
                Canvas[]
            ] = PatternUtils.correctAndIsolateImageColors(
                quantizedCanvas,
                hsvColorArray
            );
            const instructionsList: Canvas[] = [];
            const addedPictures: number = 0;
            const imageHeight: number =
                Math.ceil(correctedCanvas[1].length / 5) * 1175;
            let imageWidth: number;
            if (correctedCanvas[1].length > 5) {
                imageWidth = 5 * 896;
            } else {
                imageWidth = correctedCanvas[1].length * 896;
            }

            const mainInstructionCanvas = new Canvas(imageWidth, imageHeight);
            const mainInstructionCtx = mainInstructionCanvas.getContext("2d");

            for (let i = 0; i < correctedCanvas[1].length; i++) {
                const canvas = correctedCanvas[1][i];
                PatternUtils.createPicture(
                    correctedCanvas[0],
                    canvas,
                    i + 1
                ).then((instructionCanvas) => {
                    // console.log(i);
                    mainInstructionCtx.drawImage(
                        instructionCanvas,
                        (i % 5) * 896,
                        Math.floor(i / 5) * 1175
                    );
                    // addedPictures++;
                    if (i + 1 === correctedCanvas[1].length) {
                        resolve(mainInstructionCanvas);
                    }
                });
            }
        });
    }

    export function urlToPatternMessage(url: string, message: Message) {
        const attachmentImage = new Image();
        attachmentImage.src = url;

        attachmentImage.onload = () => {
            PatternUtils.patternFromImage(
                attachmentImage,
                ColorUtils.HSVArray
            ).then((mainInstructionCanvas) => {
                // all done. send image.
                BotUtils.sendImages([mainInstructionCanvas], message);
            });
        };
    }

    export function urlsToPatternMessage(urls: string[], message: Message) {
        const imagesArray: Canvas[] = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];

            console.log(url);
            const attachmentImage = new Image();
            attachmentImage.src = url;

            attachmentImage.onload = () => {
                PatternUtils.patternFromImage(
                    attachmentImage,
                    ColorUtils.HSVArray
                ).then((mainInstructionCanvas) => {
                    // all done. send image.
                    imagesArray[i] = mainInstructionCanvas;
                    let totalLoadedImages = 0;
                    for (let j = 0; j < urls.length - 1; j++) {
                        if (imagesArray[j]) {
                            totalLoadedImages += 1;
                        }
                    }
                    if (totalLoadedImages === urls.length - 1) {
                        BotUtils.sendImages(imagesArray, message);
                    }
                });
            };
        }
    }
}
