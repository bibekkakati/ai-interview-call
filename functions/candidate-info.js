const jbmasterkey = process.env.JSONBIN_MASTER_KEY;
const jbaccesskey = process.env.JSONBIN_ACCESS_KEY;
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

    return callback(null, response.data);
};
