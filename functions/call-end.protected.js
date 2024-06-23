const jbmasterkey = process.env.JSONBIN_MASTER_KEY;
const jbaccesskey = process.env.JSONBIN_ACCESS_KEY;
const axios = require("axios");

exports.handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say("Thank you for your time. We will get back to you soon.");
    twiml.hangup();

    const callId = event.cid;
    const response = await axios.get(
        `https://api.jsonbin.io/v3/b/${callId}?meta=false`,
        {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": jbmasterkey,
                "X-Access-Key": jbaccesskey,
            },
        }
    );

    const record = response.data;
    record.status = "completed";

    await axios.put(`https://api.jsonbin.io/v3/b/${callId}`, record, {
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": jbmasterkey,
            "X-Access-Key": jbaccesskey,
        },
    });

    return callback(null, twiml);
};
