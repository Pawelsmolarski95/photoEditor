const Jimp = require('jimp');
const inquirer = require('inquirer');

const addTextWatermarkToImage = async function(inputFile, outputFile,text) {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
    image.print(font,0,0,textData,image.getWidth(),image.getHeight());
    await image.quality(100).writeAsync(outputFile);
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;
    
    
  
    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
  };
  
  
const startApp = async () => {
   
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to Watermark menager. Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type: 'confirm'
    }]);
    
    if(!answer.start) process.exit();
    
    const options = await inquirer.prompt([{
        name: 'inputImage',
        type: 'input',
        message:'What file do you want to mark?',
        default: 'test.jpg'
    },{
        name: 'watermarkType',
        type:'list',
        choices: ['Text watermark', 'Image watermark']
    }]);
    
    const prepareOutputFileName = name => {
        
        return name.replace('.jpg', '-with-watermark')
    }
    console.log(prepareOutputFileName('abc.jpg'));
    if(options.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
            name: 'value',
            type: 'input',
            message: 'Type your watermark text:' ,
        }]);
        options.watermarkText = text.value;
        addTextWatermarkToImage('./img/' + options.inputImage, prepareOutputFileName(options.inputImage), options.watermarkText);
    }
    else {
        const image = await inquirer.prompt([{
            name:'filename',
            type:'input',
            message:'Type your watermark name:',
            default:'Logo.png',
        }]);
        options.watermarkImage = image.filename;
        addImageWatermarkToImage('./img/' + options.inputImage,prepareOutputFileName(options.inputImage), './img/' + options.watermarkImage)
    }
}
 
startApp();