
const googleTranslate = require('../config/google-translate');


const service = {
    getAllSupportedLanguages: getAllSupportedLanguages,
    translateText: translateText,
    getSupportedLanguagesForLang: getSupportedLanguagesForLang,
    getAudiotoText : getAudiotoText
}

module.exports = service;

function getAllSupportedLanguages(req, res, next) {
    googleTranslate.getSupportedLanguages('en', (err, langCodes) => {
        if(err) res.status(500).json({success: false, msg: "Something went wrong", err});
        res.status(200).json({success: true, data: langCodes});
    })
}

function getSupportedLanguagesForLang(req, res, next) {
    googleTranslate.getSupportedLanguages(req.body.langId, (err, langCodes) => {
        if(err) res.status(500).json({success: false, msg: "Something went wrong", err});
        res.status(200).json({success: true, data: langCodes});
    })
}

function translateText(req, res, next) {
    googleTranslate.translate(req.body.text, req.body.sourceLang, req.body.targetLang, (err, translateText) => {
        if(err) res.status(500).json({success: false, msg: "Something went wrong", err});
        res.status(200).json({success: true, data: translateText}); 
    })
}




function getAudiotoText(req, res, next) {

    console.log(req.body);
    // googleTranslate.translate(req.body.text, req.body.sourceLang, req.body.targetLang, (err, translateText) => {
    //     if(err) res.status(500).json({success: false, msg: "Something went wrong", err});
    //     res.status(200).json({success: true, data: translateText}); 
    // })



}