# Generating Video from Text Prompts 
This project aims to demonstrate how can we generate images, audio and with them build a video, all using OpenAI API.
All we need is a good text prompt!

## How this works?
- **Generate Video Script:** We will first use AI to create a video script
- **Generate Audio files:** Then we will use AI to generate audio files (Speech from text) using the previous script as input
- **Generate Image Prompts:** Then for each sentence in our Video Script, we will use AI to generate image prompts.
- **Generate Image Files:** Then we use AI will generate the images
- **Concatenate/Merge Results:** Finally, we then concatenate the images and merge the previous audio files. 

# Requirements
In order to use this project the following software will be required:

1. Install Git - (https://git-scm.com/downloads).
2. Install NodeJS -  (https://nodejs.org/en/download)
3. Install FFMpeg -  [Official Website](https://ffmpeg.org/download.html#build-windows), Alternatively you can download [FFMpeg Windows Builds](https://www.gyan.dev/ffmpeg/builds/#release-builds)

# Configure

## Windows
Once the tools are installed, you will need to Clone this repository, Run NPM install, and configure your PATH environment variable to include FFMPEG binary folder.

- Add FFMPEG binary path to your PATH environment (in this example, we installed FFMPEG on c:\ffmpeg):
```
setx /m PATH "C:\ffmpeg\bin;%PATH%"
``` 

- In a *new command-prompt window*, Cloning this repository:
```
git clone https://github.com/dineubr/videofromimages_openai.git
``` 

- Access the folder where the repository was cloned and run npm install
```
cd videofromimages_openai
npm i
``` 

- Start the server:
```
node index.js
```

# Get Started!

Once the server is started, open your browser and access the URL:
```
http://localhost:3000
```

- Enter your OpenAI Key on top of the page and press submit. Don't have a key yet? You can create it here: [OpenAI - API Keys](https://platform.openai.com/account/api-keys)

![Screenshot of header of the webpage. Input of OpenAI Key and buttons to reset data/logs.](https://raw.githubusercontent.com/dineubr/videofromimages_openai/main/docs/000_openaikey.png)

- Next, you will need to fill the inputs *Assistant Data* and *Main Input*. Be creative! Don't know how to start? Check out the example in the image below:

![Screenshot of Text Prompts input. In the example we ask AI to briefly explain how to replace a flat tire.](https://raw.githubusercontent.com/dineubr/videofromimages_openai/main/docs/010_generatingtextsentences.png)

- Once you have the result on the third text-box *"Main Result"*, feel free to change the text box directly and get ready to create the audios for each sentence by pressing *"Generate Audio Files from Latest Text Prompt"*

![The screenshot shows the results of the audio files generated once the user pressed the button "Generate Audio Files from Latest Text Prompt" .](https://raw.githubusercontent.com/dineubr/videofromimages_openai/main/docs/020_generatingaudiofiles.png)

- Once the audio files are ready, you can now move one more step and click on *"Generate Images from latest Audios"*. This step will take a bit longer than the previous ones. You can follow the processing info checking the tab **"Logs"**

![The screenshot shows the section where we generate images as a result from latest audios generated on previous steps.](https://raw.githubusercontent.com/dineubr/videofromimages_openai/main/docs/030_generatingimages.png)

- Finally, once all the images are generated, its time to click on *"Generate Video"*. This step may also require a bit of waiting. Again, feel free to follow the process info checking the tab **"Logs"**

![The screenshot shows the very last part where we can generate the video as a result from previous steps.](https://raw.githubusercontent.com/dineubr/videofromimages_openai/main/docs/040_generatingvideo.png)

## Sample Result

Here is the result based on the previous screenshots:

[Sample Video - Replacing a Flat Tire](https://raw.githubusercontent.com/dineubr/videofromimages_openai/main/docs/sample_video.mp4)

# Contribute
Feel free to reach out if you have any questions and/or suggestions regarding this project.
