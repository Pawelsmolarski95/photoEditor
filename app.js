
const { existsSync } = require('fs');
const Jimp = require('jimp');
const inquirer = require('inquirer');




const addTextWatermarkToImage = async function(inputFile, outputFile, text, bright, contrast, greyscale, invert) {
    try {
        const image = await Jimp.read(inputFile);
        image.brightness(Number(bright));
        image.contrast(Number(contrast));
        greyscale && image.greyscale();
        invert && image.invert();
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const textData = {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        };
        image.print(font,0,0,textData,image.getWidth(),image.getHeight());
        await image.quality(100).writeAsync(outputFile);
        
        console.log('Great!')
        startApp();
    }
    catch(error) {
        console.log('Something went wrong... Try again!');
    }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile,bright,contrast,greyscale,invert) {
    try {
        const image = await Jimp.read(inputFile);
        image.brightness(Number(bright));
        image.contrast(Number(contrast));
        greyscale && image.greyscale();
        invert && image.invert();
        const watermark = await Jimp.read(watermarkFile);
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;
 
        image.composite(watermark, x, y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.5,
        });
        await image.quality(100).writeAsync(outputFile);
        console.log('Great!')
        startApp(); 
    }
    catch(error) {
        console.log('Something went wrong... Try again!');
    }   
};
  
const startApp = async () => {
    
    const prepareOutputFileName = name => {
        let nameSplit = name.split('.');
        nameSplit.splice(1,0,'-with-watermark.');
        return nameSplit.join('')
    }
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to Watermark menager. Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type: 'confirm'
    }]);
    
    if(!answer.start) process.exit();
    
    const options = await inquirer.prompt([
    {
        name: 'inputImage',
        type: 'input',
        message:'What file do you want to mark?',
        default: 'test.jpg'
    },{
        name:'watermarkType',
        type:'list', 
        choices:['Text watermark', 'Image watermark']  
    },{
        name:'editPhoto',
        message:'Do you want edit photo?',
        type:'confirm'
    },{
        name: 'brightness',
        type: 'input',
        message:'Change brightness your photo(-1,1)'
    },{
        name: 'contrast',
        type: 'input',
        message:'Change contrast your photo(-1,1)'
    },{
        name: 'invert',
        type: 'confirm',
        message:'Do you want invert your photo?'
    },{
        name: 'greyscale',
        type: 'confirm',
        message:'Do you want greyscalce your photo?',
    }]);
    
    let brightnesValue = options.brightness;
    let contrastValue = options.contrast;
    let invertValue = options.invert;
    let greyscaleValue = options.greyscale;
    
    if(options.watermarkType === 'Text watermark'){

        const text = await inquirer.prompt([{
            name: 'value',
            type: 'input',
            message: 'Type your watermark text:' ,
        }]);
        options.watermarkText = text.value;
        
        if(existsSync('./img/' + options.inputImage)) {
            addTextWatermarkToImage('./img/' + options.inputImage, prepareOutputFileName(options.inputImage), options.watermarkText,brightnesValue,contrastValue,invertValue,greyscaleValue);
        } else {
            console.log('Check your photo file name')
        }
    }
    else {
        const image = await inquirer.prompt([{
            name:'filename',
            type:'input',
            message:'Type your watermark name:',
            default:'Logo.png',
        }]);
        options.watermarkImage = image.filename;
        if(existsSync('./img/' + options.inputImage && './img/' + options.watermarkImage)) {
           addImageWatermarkToImage('./img/' + options.inputImage,prepareOutputFileName(options.inputImage), './img/' + options.watermarkImage,brightnesValue,contrastValue,invertValue,greyscaleValue)
        } else {
            console.log('Check the name of the file with the photo and the watermark image');
        }
    }
}
 
startApp();