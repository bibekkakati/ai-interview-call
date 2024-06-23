exports.handler = function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();

    twiml.say("Hello candidate! Welcome to Twilio screening call.");
    twiml.say(
        "I hope you are doing well! Let me provide you the instructions for the call."
    );
    twiml.say(
        "I will ask few questions and you need to answer the questions after the beep."
    );

    const gather = twiml.gather({
        numDigits: 1,
        action: "./start-interview",
        loop: 2,
    });
    gather.say("If you are ready, press 1.");

    twiml.say(`Sorry, we couldn't understand you.`);
    twiml.hangup();

    callback(null, twiml);
};
