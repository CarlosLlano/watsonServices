require('dotenv').config({silent: true});
var watson = require('watson-developer-cloud'); // watson sdk

var language_translator = new watson.LanguageTranslatorV2({
    username: process.env.LANGUAGE_TRANSLATOR_USERNAME,
    password: process.env.LANGUAGE_TRANSLATOR_PASSWORD
})

var parameters = {
    text: 'whats going on?',
    model_id: 'en-es'
};
  
language_translator.translate(parameters,
    function(error, response) {
        if (error){
            console.log(error)
        }
        else{
            resp = JSON.stringify(response, null, 2)
            traduction = JSON.parse(resp).translations[0].translation
            console.log(traduction)
        }
    }
);