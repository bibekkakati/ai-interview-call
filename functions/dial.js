const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const myphone = process.env.PHONE_NUMBER;
const mydomain = process.env.MY_DOMAIN;
const jbmasterkey = process.env.JSONBIN_MASTER_KEY;
const jbaccesskey = process.env.JSONBIN_ACCESS_KEY;
const client = require("twilio")(accountSid, authToken);
const axios = require("axios");

exports.handler = async function (context, event, callback) {
    const callId = event.cid;
    if (!callId) {
        return callback("Call ID is missing.");
    }

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
    const { status, phone } = record;

    if (status !== "pending") {
        return callback(null, "Screening call is completed.");
    }

    // If last call was initiated within an hour, avoid re-try
    if (
        record.call_initiated &&
        Date.now() - record.call_initiated < 1 * 60 * 60 * 1000
    ) {
        return callback(null, "Please try for the next call after an hour.");
    }

    record.call_initiated = Date.now();

    await axios
        .put(`https://api.jsonbin.io/v3/b/${callId}`, record, {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": jbmasterkey,
                "X-Access-Key": jbaccesskey,
            },
        })
        .catch((e) => console.log(e));

    const url_params = new URLSearchParams();
    url_params.append("name", record.name);
    url_params.append("company", record.company);
    url_params.append("cid", callId);

    await client.calls
        .create({
            url: `${mydomain}/init?${url_params.toString()}`,
            to: phone,
            from: myphone,
        })
        .catch((e) => console.log(e));

    return callback(null, `You will soon receive a call on ${phone}`);
};
