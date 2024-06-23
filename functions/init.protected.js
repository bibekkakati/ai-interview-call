exports.handler = function (context, event, callback) {
    const { name, company, cid } = event;

    const twiml = new Twilio.twiml.VoiceResponse();

    twiml.say(
        `Hello ${name.split(" ")[0]}! Welcome to ${company} screening call.`
    );
    twiml.say(
        "Following the question, you may proceed with your answers. To signify you are ready for the next question, press 0 after each answer."
    );

    const gather = twiml.gather({
        numDigits: 1,
        action: `./start-interview?cid=${cid}`,
        loop: 2,
    });
    gather.say("If you are ready, press 0.");

    twiml.say(`Sorry, we couldn't understand you.`);
    twiml.hangup();

    callback(null, twiml);
};
