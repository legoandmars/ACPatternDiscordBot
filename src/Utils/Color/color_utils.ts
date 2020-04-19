import { Canvas, loadImage } from "canvas";
import { ImageUtils } from "../utils";

export namespace ColorUtils {
    export const HSVArray: RGB[] = [];

    export function getHSVArray() {
        console.log("Generating HSV Array....");
        loadImage(`${__dirname}/../../../Images/all_hsv_colors.png`).then(
            (allHsvImage) => {
                const tempHSVArray = ColorUtils.colorSchemeFromImage(
                    ImageUtils.imageToCanvas(allHsvImage)
                );
                for (let i = 0; i < tempHSVArray.length; i++) {
                    HSVArray[i] = tempHSVArray[i];
                }
                // return HSVArray;
            }
        );
    }

    export interface HSV {
        h: number;
        s: number;
        v: number;
    }

    export interface RGB {
        r: number;
        g: number;
        b: number;
    }

    export function HSVtoRGB({ h, s, v }: HSV): RGB {
        let r;
        let g;
        let b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
            default:
            // do nothing
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }

    export function RGBtoHSV({ r, g, b }: RGB): HSV {
        /*
        sometimes, b glitched out and gave b[0]. this might break shit in the future. keep a close eye on this.
        if(b[0]){
            b = b[0];
        } */

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h;
        const s = max === 0 ? 0 : d / max;
        const v = max / 255;
        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = g - b + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = b - r + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = r - g + d * 4;
                h /= 6 * d;
                break;
            default:
            // do nothing
        }
        return {
            h,
            s,
            v,
        };
    }

    export function RGBValuesIdentical(value1: RGB, value2: RGB): boolean {
        if (
            value1.r === value2.r &&
            value1.g === value2.g &&
            value1.b === value2.b
        ) {
            return true;
        }
        return false;
    }

    export function nearestColor(needle: RGB, colors: RGB[]) {
        // needle = parseColor(needle);

        if (!needle) {
            return null;
        }

        let distanceSq;
        let minDistanceSq = Infinity;
        let rgb;
        let value;

        for (let i = 0; i < colors.length; i++) {
            rgb = colors[i];

            distanceSq =
                needle.r -
                rgb.r ** 2 +
                needle.g -
                rgb.g ** 2 +
                needle.b -
                rgb.b ** 2;

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                value = colors[i];
                // console.log("Changing");
                // console.log(colors[i]);
                /* if(colors[i].r == needle.r && colors[i].g == needle.g && colors[i].b == needle.b){
                console.log("EXACT MATCH");
            } */
            }
        }
        // console.log("CLOSEST TO "+needle+" IS "+value);
        return value;
    }

    export function colorSchemeFromImage(
        canvas: Canvas,
        allowDuplicates: boolean = false
    ): RGB[] {
        const allPossibleColors: RGB[] = []; // all colors that are contained within image

        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (allowDuplicates === false) {
            for (let i = 0; i < imageData.data.length; i += 4) {
                const pixelColor: ColorUtils.RGB = {
                    r: imageData.data[i],
                    g: imageData.data[i + 1],
                    b: imageData.data[i + 2],
                };
                let everFound = false;
                for (let j = 0; j < allPossibleColors.length; j++) {
                    const currentRGB = allPossibleColors[j];
                    if (RGBValuesIdentical(currentRGB, pixelColor)) {
                        everFound = true;
                    }
                }
                if (everFound === false) {
                    allPossibleColors.push(pixelColor);
                }
            }
        } else if (allowDuplicates === true) {
            for (let i = 0; i < imageData.data.length; i += 4) {
                allPossibleColors.push({
                    r: imageData.data[i],
                    g: imageData.data[i + 1],
                    b: imageData.data[i + 2],
                });
            }
        }
        // console.log(allPossibleColors.length)

        return allPossibleColors;
    }
}
