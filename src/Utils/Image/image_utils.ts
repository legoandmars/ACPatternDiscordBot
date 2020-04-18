import { loadImage, Canvas, ImageData, Image } from  "canvas";
import { buildPaletteSync, utils, applyPaletteSync, PaletteQuantization, ColorDistanceFormula, ImageQuantization } from "image-q";
import path from "path";
import fs from "fs";

export namespace ImageUtils {

    export interface NamedImage{
        [name: string]: Image
    }

    export function loadImages(imagePaths: string[]): Promise<NamedImage>{
        return new Promise((resolve, reject) => {
        let allImages: NamedImage = {};
        for(let i = 0; i < imagePaths.length; i ++){
            loadImage(imagePaths[i]).then((loadedImage) => {
                allImages[path.parse(imagePaths[i]).name] = loadedImage;
                if (i == imagePaths.length-1){
                    resolve(allImages);
                }
            });
        }
        });
    }

    export function saveCanvasToFile(canvas: Canvas, path: string): Promise<void>{
        return new Promise((resolve, reject) => {
            try{
                let buffer = canvas.toBuffer();
                fs.writeFileSync(path, buffer);   
                resolve();    
            }catch(error){
                throw new Error(error);
                reject();
            }
        });
    }

    export function imageToCanvas(image: Image): Canvas{
        let canvas = new Canvas(image.width, image.height, "png");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image,0,0);
        return canvas;
    }

    export interface QuantizationOptions{
        paletteQuantization: PaletteQuantization;
        colorDistanceFormula: ColorDistanceFormula;
        imageQuantization: ImageQuantization;
    } 
    
    export function quantizeImage(image: Image, quantizationOptions?: QuantizationOptions): Canvas {

        //TODO: add multiple configurable options

        let quantCanvas = new Canvas(32, 32, "png");
        let quantCtx = quantCanvas.getContext("2d");
        quantCtx.imageSmoothingQuality = "high";
        quantCtx.drawImage(image, 0, 0, 32, 32);

        let inPointContainer = utils.PointContainer.fromHTMLCanvasElement(quantCanvas);
        let palette;
        let outPointContainer;

        if(quantizationOptions){
            palette = buildPaletteSync([inPointContainer], { 
                colors: 15,
                paletteQuantization: quantizationOptions.paletteQuantization,
                colorDistanceFormula: quantizationOptions.colorDistanceFormula
            })
            outPointContainer = applyPaletteSync(inPointContainer, palette,{imageQuantization: quantizationOptions.imageQuantization})
        }else{
            palette = buildPaletteSync([inPointContainer], {colors: 15});
            outPointContainer = applyPaletteSync(inPointContainer, palette);
        }   
        
        let clampedArray = new Uint8ClampedArray(outPointContainer.toUint8Array(),32,32);
        let imageData = new ImageData(clampedArray, 32, 32);   
        quantCtx.putImageData(imageData, 0, 0);  

        return quantCanvas;    
        
    }
}