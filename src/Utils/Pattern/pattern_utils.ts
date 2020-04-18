import { Canvas, Image } from  "canvas";
import { ColorUtils, ImageUtils, BotUtils } from "../utils";
import { Message } from "discord.js";

export namespace PatternUtils {
    
    export function correctAndIsolateImageColors(canvas: Canvas, colorScheme: ColorUtils.RGB[]): [Canvas, Canvas[]]{
        let imageCanvas = new Canvas(32,32);
        let imagectx = imageCanvas.getContext("2d");
        imagectx.drawImage(canvas,0,0);
        let imageData = imagectx.getImageData(0, 0, 32, 32);

        let tempImageColors: ColorUtils.RGB[] = ColorUtils.colorSchemeFromImage(canvas);
        // note: figure out a way to convert imagedata to RGBA arrays to make working with them much easier
        let newImageColors: ColorUtils.RGB[] = [];
        let eachColorCount = [];
        let isolatedCanvses: Canvas[] = [];
    
        for(let i = 0; i<tempImageColors.length; i++){
            let currentColor = tempImageColors[i];
            let newColor = ColorUtils.nearestColor(currentColor,colorScheme);
            newImageColors[i] = newColor;
        }
        newImageColors = newImageColors.filter((a, b) => newImageColors.indexOf(a) === b);
        //we have a list of converted image colors. now we need to re-color the image appropriately, and then isolate the colors.
        for (let i=0;i<tempImageColors.length;i++){
            let currentRGB = tempImageColors[i];
    
            //find which new matches the temp 
            let newColor = ColorUtils.nearestColor(currentRGB,colorScheme);
            let newImageColorsNumber = 0;
            for (let i=0;i<newImageColors.length;i++){
                if(ColorUtils.RGBValuesIdentical(newColor,newImageColors[i])){
                    //found it
                    newImageColorsNumber = i;
                    break
                }
            }
            let colorCanvas = new Canvas(32,32);
            let colorCtx = colorCanvas.getContext("2d");
            colorCtx.drawImage(imageCanvas,0,0);
            let colorImageData = colorCtx.getImageData(0, 0, 32, 32);  
    
            for (let j=0;j<imageData.data.length;j+=4){
                let pixelColor = {r: imageData.data[j], g: imageData.data[j+1], b: imageData.data[j+2]};
    
                if(ColorUtils.RGBValuesIdentical(currentRGB, pixelColor)){
                    colorImageData.data[j]= newColor.r;
                    colorImageData.data[j+1]= newColor.g;
                    colorImageData.data[j+2]= newColor.b; 
                    if(!(colorImageData.data[j+3] <= 2)){
                        colorImageData.data[j+3] = 255;
                    }
                    if(eachColorCount[i]){
                        eachColorCount[i]++;
                    }else{
                        eachColorCount[i]=1;
                    }
                    //everFound = true;
                }else{
                    colorImageData.data[j+3] = 0;
                }
            }

            let brandNewCanvas = new Canvas(32,32);
            let brandNewCtx = brandNewCanvas.getContext("2d");
            brandNewCtx.putImageData(colorImageData,0,0);
            //let hsvArray = ColorUtils.RGBtoHSV(currentRGB);
            //createPicture(imageCanvas,brandNewCanvas,[hsvArray.h,hsvArray.s,hsvArray.v],(i+1))
            ImageUtils.saveCanvasToFile(brandNewCanvas, __dirname+'/../../../Images/Debug/export_'+(i+1)+'.png')
            isolatedCanvses[i] = brandNewCanvas;
        }
        //console.log(eachColorCount);
        return [imageCanvas,isolatedCanvses];
    }

    function calcPosX(segments: number, x: number, image: Image){
        //x should be 0-1;
        let segmentNumber = Math.round(x*segments)
        if(segmentNumber>segments-1){
            segmentNumber = segments-1;
        }
        return ((295+((500/(segments)) * segmentNumber))+Math.floor((500/segments)/2))-(image.width/2);
    }

    function calcPosY(y: number, image: Image){
        return y+8-image.height;
    }
    
    export function createPicture(fullImage: Canvas, inputImage: Canvas, colorNumber: number): Promise<Canvas>{
        return new Promise((resolve, reject) => {
            ImageUtils.loadImages([
                __dirname+'/../../../Images/background.png',
                __dirname+'/../../../Images/bird.png',
                __dirname+'/../../../Images/background_overlay.png',
                __dirname+'/../../../Images/background_mask.png'
            ]).then((images) => {
                let hsvToConvertArray = ColorUtils.colorSchemeFromImage(inputImage);
                //console.log(hsvToConvertArray);
                let hsvToConvert: ColorUtils.HSV;// = hsvToConvertArray[0];
                if(hsvToConvertArray.length >= 2){
                    hsvToConvert = ColorUtils.RGBtoHSV(hsvToConvertArray[1]);
                }else hsvToConvert = ColorUtils.RGBtoHSV(hsvToConvertArray[0]);

                console.log("Generating image #"+colorNumber);
                ///
                let outlineEnabled = true;
                let outlineThickness = 2;
                let backgroundImageOpacity = 60
                ///
                let tempCanvas = new Canvas(images["background"].width, images["background"].height, "png");
                let tempCtx = tempCanvas.getContext("2d");
                let isolatedRedPixelCanvas = new Canvas(images["background"].width, images["background"].height, "png");
                let isolatedRedPixelCtx = isolatedRedPixelCanvas.getContext("2d");

                tempCtx.imageSmoothingEnabled = false;
                tempCtx.drawImage(inputImage,129,408,639,639);
                tempCtx.imageSmoothingEnabled = true;
                tempCtx.drawImage(images["background_mask"],0,0);
                let maskImageData = tempCtx.getImageData(0,0,tempCanvas.width,tempCanvas.height);
                for (let i=0;i<maskImageData.data.length;i+=4)
                {
                    if(maskImageData.data[i+1]==255){
                        maskImageData.data[i+3]=0;
                    }
                }
                tempCtx.putImageData(maskImageData,0,0);
                let imageMaskBackupCanvas = new Canvas(images["background"].width, images["background"].height, "png");
                let imageMaskBackupCtx = imageMaskBackupCanvas.getContext("2d");
                imageMaskBackupCtx.drawImage(tempCanvas,0,0);

                if(outlineEnabled == true){
                    var imageData = tempCtx.getImageData(0,0,tempCanvas.width,tempCanvas.height);
                    for (var i=0;i<imageData.data.length;i+=4)
                    {
                        imageData.data[i]=255;
                        imageData.data[i+1]=0;
                        imageData.data[i+2]=0;     
                    }
                    let tempRedCanvas = new Canvas(images["background"].width, images["background"].height, "png");
                    let tempRedCtx = tempRedCanvas.getContext("2d");
                    tempRedCtx.putImageData(imageData,0,0);
                    tempCtx.drawImage(tempRedCanvas,-outlineThickness,0);
                    tempCtx.drawImage(tempRedCanvas,outlineThickness,0);
                    tempCtx.drawImage(tempRedCanvas,0,-outlineThickness);
                    tempCtx.drawImage(tempRedCanvas,0,outlineThickness);
                    tempCtx.drawImage(tempRedCanvas,outlineThickness,outlineThickness);
                    tempCtx.drawImage(tempRedCanvas,outlineThickness,-outlineThickness);
                    tempCtx.drawImage(tempRedCanvas,-outlineThickness,outlineThickness);
                    tempCtx.drawImage(tempRedCanvas,-outlineThickness,-outlineThickness);

                    //draw image again on top of red pixels
                    tempCtx.imageSmoothingEnabled = false;
                    tempCtx.drawImage(imageMaskBackupCanvas,0,0);
                    tempCtx.imageSmoothingEnabled = true;
                    //isolate red pixels
                    imageData = tempCtx.getImageData(0,0,tempCanvas.width,tempCanvas.height);
                    for (var i=0;i<imageData.data.length;i+=4)
                    {
                        if( (imageData.data[i] == 255 && imageData.data[i+1] == 0 && imageData.data[i+2] == 0) == false){
                            imageData.data[i+3] = 0;
                        }
                        imageData.data[i]=255;
                        imageData.data[i+1]=0;
                        imageData.data[i+2]=0;     
                    }
                    isolatedRedPixelCtx.imageSmoothingEnabled = false;
                    isolatedRedPixelCtx.putImageData(imageData,0,0);
                }
                //ctx.putImageData(imageData,50,0);
                let canvas = new Canvas(images["background"].width, images["background"].height, "png");
                let ctx = canvas.getContext("2d");
                // before background image, we need to calculate the sat and val sliders.
                let satSliderCanvas =  new Canvas(15, 1, "png");
                let satSliderCtx = satSliderCanvas.getContext("2d");
                satSliderCtx.imageSmoothingEnabled = false;
                //295, 134
                for (let i=0;i<15;i++){
                    let sliderHSV = {h: hsvToConvert.h, s: (i/15), v: hsvToConvert.v}
                    let sliderRGB = ColorUtils.HSVtoRGB(sliderHSV);
                    satSliderCtx.fillStyle = 'rgba('+ sliderRGB.r +','+ sliderRGB.g +','+ sliderRGB.b +',1)';
                    satSliderCtx.fillRect(i, 0, 1, 1);    
                }

                let valSliderCanvas =  new Canvas(15, 1, "png");
                let valSliderCtx = valSliderCanvas.getContext("2d");
                valSliderCtx.imageSmoothingEnabled = false;
                //295, 134
                for (let i=0;i<15;i++){
                    let sliderHSV = {h: hsvToConvert.h, s: hsvToConvert.s, v: (i/15)}
                    let sliderRGB = ColorUtils.HSVtoRGB(sliderHSV);
                    valSliderCtx.fillStyle = 'rgba('+ sliderRGB.r +','+ sliderRGB.g +','+ sliderRGB.b +',1)';
                    valSliderCtx.fillRect(i, 0, 1, 1);
                }

                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(satSliderCanvas,295,134,500,36)
                ctx.drawImage(valSliderCanvas,295,214,500,37)
                tempCtx.imageSmoothingEnabled = true;
                ctx.drawImage(images["background"], 0, 0)
                let birdX = calcPosX(30,hsvToConvert.h, images["bird"]);
                let birdY = calcPosY(53,images["bird"]);
                ctx.drawImage(images["bird"], birdX, birdY)
                let birdSatX = calcPosX(15,hsvToConvert.s, images["bird"]);
                let birdSatY = calcPosY(134,images["bird"]);
                ctx.drawImage(images["bird"], birdSatX, birdSatY)
                let birdValX = calcPosX(15,hsvToConvert.v, images["bird"]);
                let birdValY = calcPosY(214,images["bird"]);
                ctx.drawImage(images["bird"], birdValX, birdValY)
                //now draw the actual image
                //before drawing the full image, make it slightly more transparent
                let fullImageData = fullImage.getContext("2d").getImageData(0,0,tempCanvas.width,tempCanvas.height);
                let rgbToConvert = ColorUtils.HSVtoRGB(hsvToConvert);
                for (var i=0;i<fullImageData.data.length;i+=4)
                {
                    if(rgbToConvert.r == 0 && rgbToConvert.g == 0 && rgbToConvert.b == 0 && colorNumber == 1){
                        //transparency, display image as full
                        fullImageData.data[i+3]=255;     
                    }else{
                        fullImageData.data[i+3]=(backgroundImageOpacity/100)*255;     
                    }
                }
                fullImage.getContext("2d").putImageData(fullImageData,0,0);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(fullImage,129,408,639,639);
                ctx.drawImage(images["background_overlay"],0,0);
                ctx.drawImage(tempCanvas,0,0);
                ctx.imageSmoothingEnabled = true;
                //ctx.drawImage(isolatedRedPixelCanvas,0,0);
                resolve(canvas);
                //saveCanvasToFile(canvas, __dirname+'/../../../Images/Debug/Exported_Step_'+colorNumber+'.png')
            });
        });
    }

    export function patternFromImage(attachmentImage: Image, hsvColorArray: ColorUtils.RGB[]): Promise<Canvas>{
        return new Promise((resolve, reject) => {
            let quantizedCanvas = ImageUtils.quantizeImage(attachmentImage); 
            let correctedCanvas: [Canvas, Canvas[]] = PatternUtils.correctAndIsolateImageColors(quantizedCanvas, hsvColorArray);
            let instructionsList: Canvas[] = [];
            let addedPictures: number = 0;
            let imageHeight: number = Math.ceil(correctedCanvas[1].length/5)*1175;
            let imageWidth: number;
            if(correctedCanvas[1].length > 5){
                imageWidth = 5*896
            }else{
                imageWidth = correctedCanvas[1].length*896
            }

            let mainInstructionCanvas = new Canvas(imageWidth,imageHeight, "png");
            let mainInstructionCtx = mainInstructionCanvas.getContext("2d");
            for( let i = 0; i < correctedCanvas[1].length; i++){
                let canvas = correctedCanvas[1][i];
                PatternUtils.createPicture(correctedCanvas[0],canvas,i+1).then((instructionCanvas) => {
                    //console.log(i);
                    mainInstructionCtx.drawImage(instructionCanvas, ((i % 5)*896), ((Math.floor(i/5)) * 1175))
                    addedPictures++;
                    if(addedPictures==correctedCanvas[1].length){
                        resolve(mainInstructionCanvas)
                    }
                });
            }
        });
    }

    export function urlToPatternMessage(url: string, message: Message){
        let attachmentImage = new Image;
        attachmentImage.src = url;

        attachmentImage.onload = function(){
            PatternUtils.patternFromImage(attachmentImage, ColorUtils.HSVArray).then((mainInstructionCanvas) =>{
                //all done. send image.
                BotUtils.sendImages([mainInstructionCanvas], message);
            });
        };      
    }

    export function urlsToPatternMessage(urls: string[], message: Message){
        let imagesArray: Canvas[] = [];
        for(let i = 0; i< urls.length; i++){
            let url = urls[i];

            console.log(url);
            let attachmentImage = new Image;
            attachmentImage.src = url;

            attachmentImage.onload = function(){    
                PatternUtils.patternFromImage(attachmentImage, ColorUtils.HSVArray).then((mainInstructionCanvas) =>{
                    //all done. send image.
                    imagesArray[i] = mainInstructionCanvas;
                    if(i == urls.length-1){
                        BotUtils.sendImages(imagesArray, message);
                    }
                });
            };
            
        }
    }

}