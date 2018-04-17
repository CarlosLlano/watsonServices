require('dotenv').config({silent: true});
var watson = require('watson-developer-cloud'); // watson sdk


// The text that we want to analyze the tone of.
var text = "I love you, you are the";

// Turn our text into valid json.
var input = { "text": text };

// The format that the tone analyzer needs. 
var params = 
        {
        'tone_input': input,
        'content_type': 'application/json'
        };

//tone analyzer
var tone_analyzer = new watson.ToneAnalyzerV3({
    username: process.env.TONE_ANALYZER_USERNAME,
    password: process.env.TONE_ANALYZER_PASSWORD,
    version: '2017-09-21'
})

// Use our Tone Analyzer variable to analyze the tone.
tone_analyzer.tone(params, 
    function(error, response){
        // There's an error.
        if (error){
            console.log('Error:', error);
        }
        // No error, we got our tone result.
        else{
            // The tone of the text, as determined by watson.
            var tone = JSON.stringify(response, null, 2)
            
            // Output Watson's tone analysis to the console.
            console.log("The tone analysis for \'" + text + "\' is:\n");
            console.log(tone);
        }
    });