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

# Contribute
Feel free to reach out if you have any questions and/or suggestions regarding this project.
