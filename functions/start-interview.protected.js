exports.handler = function (context, event, callback) {
    const userInput = event.Digits || event.SpeechResult;
    const twiml = new Twilio.twiml.VoiceResponse();

    if (!userInput) {
        return callback(null, twiml);
    }

    // Proceed with questions
    if (userInput == "0") {
        twiml.redirect(`./ask?cid=${event.cid}`);
    }

    return callback(null, twiml);
};
