// tone analyzer solo reconoce los lenguajes Ingles y Frances
// Para utilizarlo en español, es necesario traducir el texto
require('dotenv').config({silent: true});
var watson = require('watson-developer-cloud'); // watson sdk

var language_translator = new watson.LanguageTranslatorV2({
    username: process.env.LANGUAGE_TRANSLATOR_USERNAME,
    password: process.env.LANGUAGE_TRANSLATOR_PASSWORD
})
//tone analyzer
var tone_analyzer = new watson.ToneAnalyzerV3({
    username: process.env.TONE_ANALYZER_USERNAME,
    password: process.env.TONE_ANALYZER_PASSWORD,
    version: '2017-09-21'
})

input = 'creo que no me has entendido y no voy a perder mas tiempo contigo'
// Que perdida de tiempo, 
// que servicio tan malo, 
// creo que no me has entendido y no voy a perder mas tiempo contigo

function toneAnalyzerSpanish(input)
{
    //traducir
    var parameters = {
        text: input,
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
                resp = JSON.stringify(response, null, 2)
                traduction = JSON.parse(resp).translations[0].translation
                console.log(traduction)
        
                var params = {
                        'tone_input': { "text": traduction },
                        'content_type': 'application/json'
                        };
                tone_analyzer.tone(params, 
                    function(error, response){
                        let toneAngerScore = '';
                        let toneSadnessScore = ''
                        if (error){
                            console.log(error);
                        }
                        else{
                            var tone = JSON.stringify(response, null, 2)
                            console.log(tone)
                        }
                        
                        
                    });
            }
        }
    );
}

toneAnalyzerSpanish(input)

