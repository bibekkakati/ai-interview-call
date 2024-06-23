const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const myphone = process.env.PHONE_NUMBER;
const mydomain = process.env.MY_DOMAIN;
const jbmasterkey = process.env.JSONBIN_MASTER_KEY;
const jbaccesskey = process.env.JSONBIN_ACCESS_KEY;

const client = require("twilio")(accountSid, authToken);
const axios = require("axios");

exports.handler = async function (context, event, callback) {
    const { name, job_id, company, phone, email } = event;
    if (!name || !job_id || !company || !phone || !email) {
        return callback("Required fields are missing!");
    }

    // Validate phone
    const number_details = await client.lookups.v1.phoneNumbers(phone).fetch();
    if (!number_details) {
        return callback("Phone number could not be validated.");
    }

    // Storage of the details
    const jsonbin = {
        name,
        job_id,
        company,
        phone: number_details.phoneNumber,
        email,
        status: "pending",
    };

    const response = await axios.post("https://api.jsonbin.io/v3/b", jsonbin, {
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": jbmasterkey,
            "X-Access-Key": jbaccesskey,
            "X-Bin-Private": true,
            "X-Bin-Name": `${name} #${job_id}`,
        },
    });

    if (!response?.data?.metadata) {
        return callback("Something went wrong.");
    }

    const callId = response.data.metadata.id;

    const first_name = name.split(" ")[0];
    const call_link = `${mydomain}/dial?cid=${callId}`;

    // Trigger SMS
    const message = await client.messages
        .create({
            body: `Hello ${first_name}, a screening call has been scheduled. Visit ${call_link} to start the call.`,
            from: myphone,
            to: number_details.phoneNumber,
        })
        .catch((e) => {
            console.log("Add candidate SMS error: ", e);
        });
    console.log(message.body);

    // TODO: Trigger email notification

    return callback(null, callId);
};
