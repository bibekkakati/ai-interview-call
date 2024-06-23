exports.handler = function (context, event, callback) {
    const questions = [
        "Please introduce yourself.",
        "Why are you looking for a job change?",
        "Describe your recent job role and responsibilities.",
        "What is your salary expectation?",
    ];
    const question_num = Number(event.qn || 0);
    const isLastQuestion = question_num == questions.length - 1;

    const twiml = new Twilio.twiml.VoiceResponse();

    twiml.say(`${questions[question_num]}`);
    twiml.record({
        action: isLastQuestion
            ? `./call-end?cid=${event.cid}`
            : `./ask?qn=${question_num + 1}&cid=${event.cid}`,
        transcribe: true,
        finishOnKey: "0",
        playBeep: true,
        transcribeCallback: `./share-recording?cid=${event.cid}&qn=${question_num}`,
    });

    return callback(null, twiml);
};
