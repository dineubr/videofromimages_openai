const express = require('express')
const ejs = require('ejs')
const app = express()
var dbfunc = require("./dbfunctions.js")
var openai = require("./openaifunctions.js")
var bodyParser = require("body-parser");
let openai_key

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))

const port = 3000

app.set('view engine', 'ejs');



/****************************
 * ROUTING FUNCTIONS
 */

app.get('/', async function (req, res,next) {

  let asyncCalls = 0
  //Get OpenAI Key
  let textPromptAssistant, textPromptInput, textPromptResult,audioObjs,videoObjs

  openai_key = await dbfunc.getSettingVal(res,'openai_key')
  textPromptAssistant = await dbfunc.getPipelineVal('textPromptAssistant')
  textPromptInput = await dbfunc.getPipelineVal('textPromptInput')
  textPromptResult = await dbfunc.getPipelineVal('textPromptResult')
  audioObjs = await dbfunc.getPipelineVal('audio')
  imageObjs = await dbfunc.getPipelineVal('image')
  videoObjs = await dbfunc.getPipelineVal('video')
  
  return res.render('index',{openai_key:openai_key,
        textPromptAssistant: textPromptAssistant,
        textPromptInput:textPromptInput,
        textPromptResult:textPromptResult,
        audioObjs:JSON.parse(audioObjs),
        imageObjs:JSON.parse(imageObjs),
        videoObjs:JSON.parse(videoObjs),
    }); // Where index.ejs is your ejs template
    
});

app.post('/changeSettings',async function (req, res, next) {
    await dbfunc.setSettingVal(req.body.openai_key)
    res.redirect('/')
  });
app.get("/listSettings", async function(req, res, next) {
    await dbfunc.getSettingVal(res,'openai_key')
 });

 app.post('/chatCompletionRequest',async function (req, res, next) {
    openai_key = await dbfunc.getSettingVal(res,'openai_key')
    let openaihandle = await openai.initialize(openai_key)

    try
    {
        let result = await openai.chatCompletionRequest(openaihandle,
            req.body.textPromptAssistant,
            req.body.textPromptInput,dbfunc,'textPrompt')

        await dbfunc.setPipelineVal('textPromptAssistant',req.body.textPromptAssistant.trim())
        await dbfunc.setPipelineVal('textPromptInput',req.body.textPromptInput.trim())
        await dbfunc.setPipelineVal('textPromptResult',result)
        
        res.json({textPromptAssistant:req.body.textPromptAssistant.trim(),
                        textPromptInput:req.body.textPromptInput.trim(),
                        textPromptResult:result})

    }
    catch(err)
    {
        dbfunc.writeLog('textPrompt','An error occurred: '+JSON.stringify(err.message))
        res.json({textPromptAssistant:req.body.textPromptAssistant.trim(),
            textPromptInput:req.body.textPromptInput.trim(),
            textPromptResult:'An error occurred.'})
    }

});
app.post('/resetFormInfo',async function (req, res, next) {

    let data = req.body.formInfo

    await dbfunc.resetLogs()
    if(data == 'data')
    {
        //reset data
        await dbfunc.setPipelineVal('textPromptAssistant','')
        await dbfunc.setPipelineVal('textPromptInput','')
        await dbfunc.setPipelineVal('textPromptResult','')
        await dbfunc.setPipelineVal('image','[]')
        await dbfunc.setPipelineVal('video','[]')
        await dbfunc.setPipelineVal('audio','[]')
    }
    res.redirect('/')
})

app.post('/chatGenerateAudio',async function (req, res, next) {
    openai_key = await dbfunc.getSettingVal(res,'openai_key')
    let openaihandle = await openai.initialize(openai_key)
    let curAudioObj
    try
    {
    //Delete Previous Audios
    await dbfunc.setPipelineVal('audio','[]')
    //Stores new TextPromptResult (in case the user changed it dynamically)
    await dbfunc.setPipelineVal('textPromptResult',req.body.audioInput)
    //Loop into the sentences generating Audio Outputs
    let sentences = req.body.audioInput.trim().split("\n")
    let curAudioObj = JSON.parse(await dbfunc.getPipelineVal('audio'))
 
    for(let cSentence=0;cSentence<sentences.length;cSentence++)
    {
        //Current Audio
        if(sentences[cSentence].trim().length >= 1)
        {
        dbfunc.writeLog('audio','Generating Audio for the sentence:'+sentences[cSentence].trim())
        let result = await openai.generateAudio(openaihandle,sentences[cSentence].trim(),dbfunc)
        curAudioObj.push(result)
        await dbfunc.setPipelineVal('audio',JSON.stringify(curAudioObj))
        }
    }
    dbfunc.writeLog('audio','Final Result:'+JSON.stringify(curAudioObj))

    //Redirect
    res.json(curAudioObj)
    }
    catch(err)
    {
        dbfunc.writeLog('audio','An error occurred: '+JSON.stringify(err.message))
        res.json({message:err.message})
    }
});

app.post('/chatGenerateImage',async function (req, res, next) {

    console.log("Generating Images")
    console.log("----------------------------------")

    openai_key = await dbfunc.getSettingVal(res,'openai_key')
    let openaihandle
    let curImageObj
    try
    {
        openaihandle = await openai.initialize(openai_key)
        //Delete Images
        await dbfunc.setPipelineVal('image','[]')

        let curAudioObj = JSON.parse(await dbfunc.getPipelineVal('audio'))
        let sentences = ""
        //Join all the sentences and ask Chat GPT to generate one image prompt per each sentence.
        for(let cSentence=0;cSentence<curAudioObj.length;cSentence++)
            sentences = sentences + (cSentence+1)+")"+ curAudioObj[cSentence].sentence.trim()+"\n"

        let assistantRequest = "This is your previous context: \n"+sentences
        let userRequest = "For each sentence listed on your previous context, please generate an image prompt to be used on Dall-E. The result should be only a table in CSV - semi-colon as split element - format where the first column is the sentence number, and the second column is the image prompt created by you"

        dbfunc.writeLog('image','Generating Prompts - Assistant Request:'+JSON.stringify(assistantRequest))
        dbfunc.writeLog('image','Generating Prompts - User Request:'+JSON.stringify(userRequest))

        let result = await openai.chatCompletionRequest(openaihandle,
            assistantRequest,
            userRequest,
            dbfunc,
            'image')
        
        dbfunc.writeLog('image','Generating Prompts - Result:'+JSON.stringify(result))
        

        let imagePrompts = result.trim().split("\n")
        curImageObj = []

        for(let cSentence=0;cSentence<imagePrompts.length;cSentence++)
        {
            let promptSplit = imagePrompts[cSentence].trim().split(";")
            let newImageObj = {sentence:curAudioObj[cSentence].sentence,
                                prompt:promptSplit[1].trim(),
                                revisedPrompt:'',
                                imageUrl:'',
                                imageFile:'',
                                selection:1}
            
            dbfunc.writeLog('image','Generating Image - Prompt:'+newImageObj.prompt)
            let result = await openai.generateImage(openaihandle,newImageObj.prompt,dbfunc);

            let imgFile = await openai.saveImageFromUrl(result.data[0].url)
            dbfunc.writeLog('image','Generating Image - Result:'+JSON.stringify(imgFile))

            newImageObj.imageUrl = result.data[0].url
            newImageObj.imageFile = imgFile   
            newImageObj.revisedPrompt = result.data[0].revisedPrompt   
            curImageObj.push(newImageObj)
            await dbfunc.setPipelineVal('image',JSON.stringify(curImageObj))
        }
            
        res.json(curImageObj)
    }
    catch(err)
    {
        dbfunc.writeLog('image','An error occurred: '+JSON.stringify(err.message))
        res.json({message:err.message})
    }
});

app.post('/chatGenerateVideo',async function (req, res, next) {

    console.log("Generating Video")
    console.log("----------------------------------")

    openai_key = await dbfunc.getSettingVal(res,'openai_key')
    let openaihandle = await openai.initialize(openai_key)
    let videoObj

    try
    {
    //Delete previous videos
    await dbfunc.setPipelineVal('video','[]')

    videoObj = await dbfunc.getPipelineVal('video')
    
    let imageObj = await dbfunc.getPipelineVal('image')
    let audioObj = await dbfunc.getPipelineVal('audio')

    videoObj = JSON.parse(videoObj)
    imageObj = JSON.parse(imageObj)
    audioObj = JSON.parse(audioObj)
    videoList = []

    for(var cItem=0;cItem<imageObj.length;cItem++)
    {
        //Get audio duration
        dbfunc.writeLog('video','Checking duration for the file - Begin: '+audioObj[cItem].audio)
        let duration = await openai.getAudioDuration("./public"+audioObj[cItem].audio)
        dbfunc.writeLog('video','Checking duration for the file - End: Duration is:'+duration)

        //Make a mp4 video file with audio length
        dbfunc.writeLog('video','Making video with '+audioObj[cItem].audio+' and '+imageObj[cItem].imageFile)
       
        let newVideoName = await openai.makeVideoFromImage(imageObj[cItem],duration)
        let newVideoObj = {video:newVideoName,type:'prevideo'}
        dbfunc.writeLog('video','Finished: '+newVideoObj.video)

        videoObj.push(newVideoObj)
        await dbfunc.setPipelineVal('video',JSON.stringify(videoObj))
       
    }

    //Merge audio files
    dbfunc.writeLog('video','Concatenating Audio Files - Begin')
    let finalAudio = await openai.concatenateAudioFiles(audioObj)
    dbfunc.writeLog('video','Concatenating Audio Files - End: '+finalAudio)
    dbfunc.writeLog('video','Concatenating Video Files - Begin')
    let finalVideo = await openai.concatenateVideoFiles(videoObj)
    dbfunc.writeLog('video','Concatenating Video Files - End: '+finalVideo)
    
    await dbfunc.setPipelineVal('video','[]')
    videoObj = JSON.parse("[]")
    dbfunc.writeLog('video','Mergin Concatenated Files - Begin')
    let finalVideoName = await openai.mergeAudioAndVideo(finalAudio,finalVideo)
    dbfunc.writeLog('video','Mergin Concatenated Files - End: '+finalVideoName.replace("./public",""))
    videoObj.push({video:finalVideoName.replace("./public",""),type:'finalvideo'})
    await dbfunc.setPipelineVal('video',JSON.stringify(videoObj))
    res.json(videoObj)
    }
    catch(err)
    {
        dbfunc.writeLog('video','An error occurred: '+JSON.stringify(err.message))
        res.json({message:err.message})
    }

    


});

app.get('/getLogs/:categoryName',async function (req, res, next) {
    let logs = await dbfunc.getLogs(req.params.categoryName)
    res.json(logs)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})