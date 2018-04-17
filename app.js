'use strict';

// CONFIGURACION
var express = require('express'); 
var bodyParser = require('body-parser'); 
var watson = require('watson-developer-cloud');
var app = express();

app.use(express.static('./public')); 
app.use(bodyParser.json());

var assistant = new watson.AssistantV1({
  username: process.env.ASSISTANT_USERNAME,
  password: process.env.ASSISTANT_PASSWORD,
  version: '2018-02-16'
});
var language_translator = new watson.LanguageTranslatorV2({
    username: process.env.LANGUAGE_TRANSLATOR_USERNAME,
    password: process.env.LANGUAGE_TRANSLATOR_PASSWORD
})
var tone_analyzer = new watson.ToneAnalyzerV3({
    username: process.env.TONE_ANALYZER_USERNAME,
    password: process.env.TONE_ANALYZER_PASSWORD,
    version: '2017-09-21'
})

// Endpoint 
app.post('/api/message', function(req, res) {
    var workspace = process.env.WORKSPACE_ID;
    if (!workspace) {
        return res.json({
        'output': {
            'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
        }
        });
    }
    var payload = {
        workspace_id: workspace,
        context: req.body.context || {},
        input: req.body.input || {}
    };
    
    if (req.body.input==null)
    {
        // Send the input to the assistant service
        assistant.message(payload, function(err, data) {
            if (err) {
            return res.status(err.code || 500).json(err);
            }
            return res.json(updateMessage(payload, data));
        });
    }
    else
    {
        // analisis previo
        var text = req.body.input.text
        var parameters = {
            text: text,
            model_id: 'es-en'
        };
        language_translator.translate(parameters,
            function(error, response) 
            {
                if (error){
                    console.log(error)
                }
                else
                {
                    let resp = JSON.stringify(response, null, 2)
                    let traduction = JSON.parse(resp).translations[0].translation
            
                    var params = {
                            'tone_input': { "text": traduction },
                            'content_type': 'application/json'
                            };
                    tone_analyzer.tone(params, 
                        function(error, response){
                            var toneAngerScore = '';
                            var toneSadnessScore = ''
                            if (error){
                                console.log(error);
                            }
                            else{
                                var tone = JSON.stringify(response, null, 2)
                                const emotionTones = response.document_tone.tones;
                                const len = emotionTones.length;
                                for (let i = 0; i < len; i++) {
                                    if (emotionTones[i].tone_id === 'anger') {
                                        toneAngerScore = emotionTones[i].score;
                                    }
                                    if(emotionTones[i].tone_id === 'sadness')
                                    {
                                        toneSadnessScore = emotionTones[i].score;
                                    }
                                }
                            }
                            
                            payload.context['tone_anger_score'] = toneAngerScore;
                            payload.context['tone_sadness_score'] = toneSadnessScore;

                            // ----
                            // Send the input to the assistant service
                            assistant.message(payload, function(err, data) {
                                if (err) {
                                return res.status(err.code || 500).json(err);
                                }
                                return res.json(updateMessage(payload, data));
                            });
                            // ---
                        });
                }
            }
        );
    }
});
  
/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Assistant service
 * @param  {Object} response The response from the Assistant service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
var responseText = null;
if (!response.output) {
    response.output = {};
} else {
    return response;
}
if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
    responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
    responseText = 'I think your intent was ' + intent.intent;
    } else {
    responseText = 'I did not understand your intent';
    }
}
response.output.text = responseText;
return response;
}
  
module.exports = app;