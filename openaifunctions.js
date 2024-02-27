
let OpenAI = require('openai')
var openai



async function getAudioDuration(mp3FilePath) {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        
        try{
            let path = require("path");
            let filepath = path.resolve(mp3FilePath);
            const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filepath}"`;
            console.log(command)
            exec(command, (error, stdout, stderr) => {
                console.log(stdout)
                if (error) {
                    console.log(`Error: ${error.message}`)
                    reject({message:error.message});
                    return;
                }
                const durationInSeconds = parseFloat(stdout);
                resolve(durationInSeconds);
            });
        }
        catch(error)
        {
            reject({message:error.message})
        }
        
    });
}

async function makeVideoFromImage(imageObj,duration) {
    const { exec } = require('child_process');

    return new Promise((resolve, reject) => {

        try
        {
            let path = require("path");
            let filepath = path.resolve("./public/images/"+imageObj.imageFile);
            let destinationpath = path.resolve("./public/videos/"+imageObj.imageFile.replace('.png','.mp4'))
            const command = `ffmpeg -y -loop 1 -i "${filepath}" -c:v libx264 -t ${duration} -pix_fmt yuv420p "${destinationpath}"`;
            console.log(command)
    
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error: ${error.message}`)
                    reject({message:error.message});
                    return;
                }
                console.log(stdout)
                resolve(imageObj.imageFile.replace('.png','.mp4'));
            });
    
        }
        catch(error)
        {
            reject({message:error.message})
        }
    });
}

async function concatenateAudioFiles(audioObj) {
    const { exec } = require('child_process');

    return new Promise(async (resolve, reject) => {

        try
        {
            const fs = require('fs');
            let fileListPath = './public/audios/joinaudio.txt';
            let joinedAudioPath = './public/audios/joined_audio.mp3';
            let path = require("path");
            let filepath = path.resolve(fileListPath);
            let audiopath = path.resolve(joinedAudioPath)
            await fs.writeFileSync(filepath,"#List of files to be joined\n")
            for(var cItem=0; cItem < audioObj.length;cItem++)
            {
                let content = "file "+path.resolve("./public"+audioObj[cItem].audio).replaceAll("\\","\\\\")+"\n"
                await fs.appendFileSync(filepath,content)
            }
    
            const command = `ffmpeg -y -f concat -safe 0 -i "${filepath}" -c copy "${audiopath}"`;
            console.log(command)
    
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`Error: ${error.message}`)
                        reject({message:error.message});
                        return;
                    }
                    resolve(joinedAudioPath);
                });
        }
        catch(error)
        {
            reject({message:error.message})
        }
        });
}

async function concatenateVideoFiles(videoObj) {
    const { exec } = require('child_process');

    return new Promise(async (resolve, reject) => {
        try
        {

        const fs = require('fs');
        let fileListPath = './public/videos/joinvideo.txt';
        let joinedVideoPath = './public/videos/joined_video.mp4';
        let path = require("path");
        let filepath = path.resolve(fileListPath);
        let videopath = path.resolve(joinedVideoPath)
        await fs.writeFileSync(filepath,"#List of files to be joined\n")
        for(var cItem=0; cItem < videoObj.length;cItem++)
        {
            let content = "file "+path.resolve("./public/videos/"+videoObj[cItem].video).replaceAll("\\","\\\\")+"\n"
            await fs.appendFileSync(filepath,content)
        }

        const command = `ffmpeg -y -f concat -safe 0 -i "${filepath}" -c copy "${videopath}"`;
        console.log(command)

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error: ${error.message}`)
                    reject({message:error.message});
                    return;
                }
                resolve(joinedVideoPath);
            });
        }
        catch(error)
        {
            reject({message:error.message})
        }

        });
}

async function mergeAudioAndVideo(audioFile,videoFile) {

    const { exec } = require('child_process');

    return new Promise(async (resolve, reject) => {

        try
        {
            const fs = require('fs');
            let path = require("path");
            let destPath = "./public/videos/final_video.mp4"
            let audioPath = path.resolve(audioFile);
            let videoPath = path.resolve(videoFile)
            let destinationPath = path.resolve(destPath)
            const command = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${destinationPath}"`;
            console.log(command)
    
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`Error: ${error.message}`)
                        reject({message:error.message});
                        return;
                    }
                    resolve(destPath);
                });    
        }
        catch(error)
        {
            reject({message:error.message})
        }
        });
    
    console.log('mergeAudioAndVideo')
}


async function initialize(openai_key)
{
    return new Promise((resolve, reject) => {
    
    openai = new OpenAI({
        apiKey: openai_key,
      })

    resolve(openai)
    });
}
async function chatCompletionRequest(openai,assistantRequest,userRequest,dbhandle,categoryName) {
  let completion
  let openaAIObj = ""

        if(assistantRequest.length > 0)
        {
            openaAIObj = {
                messages: [{ "role": "system", "content": assistantRequest },{ "role": "user", "content": userRequest }],
                model: "gpt-3.5-turbo",
            }
        }
        else
        {
            openaAIObj = {
                messages: [{ "role": "user", "content": userRequest}],
                model: "gpt-3.5-turbo",
            }
        }

        dbhandle.writeLog(categoryName,'OpenAI Message Object: '+JSON.stringify(openaAIObj))
        return new Promise(async function(resolve, reject) {
        
        try
        {
            completion = await openai.chat.completions.create(openaAIObj); 
            dbhandle.writeLog(categoryName,'Message Completion Object: '+JSON.stringify(completion))
            resolve(completion.choices[0].message.content)    
        }
        catch(error)
        {
            dbhandle.writeLog(categoryName,'Error: '+error.message)
            reject({message:error.message})
        }

        })

  
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

async function generateAudio(openai,psentence,dbhandle) {
    let fs = require("fs");
    let path = require("path");
    return new Promise(async function(resolve, reject) {

        let filename
        let speechFile

        try
        {
        filename = makeid(10)+".mp3"
        speechFile = path.resolve("./public/audios/"+filename);

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: psentence,
        });
        
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        newAudio = {sentence:psentence,audio:"/audios/"+filename}
        resolve(newAudio);
        }
        catch(error)
        {
            dbhandle.writeLog('audio','Error: '+error.message)
            reject({message:error.message})
        }
    })

  }

  async function generateImage(openai,imagePrompt,dbhandle) {
    let fs = require("fs");
    let path = require("path");
    return new Promise(async function(resolve, reject) {
        try
        {
        const image = await openai.images.generate({ model: "dall-e-3", prompt: imagePrompt });
        resolve(image);
        }
        catch(error)
        {
            dbhandle.writeLog('image','Error: '+error.message)
            reject({message:error.message})
        }
    })

  }

  async function saveImageFromUrl(pUrl)
  {
    const fs = require('fs');
    const axios = require('axios');
    let path = require("path");

    return new Promise(async function(resolve, reject) {

    // URL of the image you want to download
    console.log('Saving image from URL:'+pUrl)
    const imageUrl = pUrl;

    // Local file path where you want to save the image
    const localFileName = makeid(10)+".png";
    const localFilePath = path.resolve("./public/images/");
    
    // Download the image using Axios
    return await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
    })
        .then((response) => {
            // Create a write stream to save the image locally
            const writer = fs.createWriteStream(localFilePath+"/"+localFileName);

            // Pipe the image data from the response to the local file
            response.data.pipe(writer);

            // Handle successful download
            writer.on('finish', () => {
                console.log(`Image downloaded and saved as ${localFileName}`);
                resolve(localFileName)
            });

            // Handle errors during download
            writer.on('error', (err) => {
                console.error('Error downloading image:', err);
            });
        })
        .catch((err) => {
            console.error('Error fetching image:', err);
        });
    })
    
  }
module.exports = {initialize,chatCompletionRequest,generateAudio,generateImage,saveImageFromUrl,getAudioDuration,makeVideoFromImage,concatenateAudioFiles,concatenateVideoFiles,mergeAudioAndVideo}