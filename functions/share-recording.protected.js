const jbmasterkey = process.env.JSONBIN_MASTER_KEY;
const jbaccesskey = process.env.JSONBIN_ACCESS_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (context, event, callback) {
    const {
        cid,
        qn,
        RecordingUrl,
        RecordingSid,
        RecordingDuration,
        TranscriptionText,
        TranscriptionSid,
        CallSid,
    } = event;

    if (!cid || !RecordingUrl || !qn) {
        return callback("Missing parameters.");
    }

    // Evaluate recordings
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };

    const parts = [
        {
            text: "input: I am seeking a job change to explore new challenges and growth opportunities, further develop my skills, and contribute to a dynamic team in a new environment.",
        },
        {
            text: "output: * Growth opportunities.\n* Want to up-skill\n* New environment",
        },
        {
            text: "input: Hi, I'm Kiara, a software engineer with three years of experience in a SAAS-based logistics startup. I specialize in full-stack development using the MERN stack.",
        },
        {
            text: "output: * Full-stack developer\n* MERN stack\n* SaaS\n* Logistics-domain\n* 3 years of experience.",
        },
        {
            text: "input: In my current role as a software engineer at a SAAS-based logistics startup, I develop and maintain full-stack applications using the MERN stack. I collaborate with cross-functional teams to design, implement, and optimize features, ensuring the delivery of high-quality software solutions. Additionally, I troubleshoot and resolve technical issues, and contribute to improving the overall user experience.",
        },
        {
            text: "output: * MERN stack\n* Application development & maintenance\n* Collaborative\n* Problem solving skill\n* User-focus work\n* Curious - seeking new challenges\n* Positive and motivated",
        },
        {
            text: "input: I'm aiming for a salary in the range of 15 to 25 lakhs per annum, depending on the role, responsibilities, and opportunities for growth within the company.",
        },
        { text: "output: * 15 - 25 Lakhs per annum" },
        {
            text: "input: Hi, I am Alia, an Operations Manager with three years of experience at an HR startup. My expertise includes end-to-end recruitment and payroll management skills.",
        },
        {
            text: "output: * 3 years of experience\n* Operations Management\n* HR \n* Recruitment\n* Payroll Management",
        },
        {
            text: "input: I am looking forward to change my domain from Operations to Marketing and Advertisement sector I find it more interesting and rewarding",
        },
        {
            text: "output: * Looking for a new domain: Marketing and Advertisement\n* Interested and rewarding",
        },
        {
            text: "input: In my current role as a operations manager, I post jobs in my job boards look for candidates, screen them, schedule their interviews and keep the hiring pipeline in progress. I also manage the internal team member's monthly  pay roll.",
        },
        {
            text: "output: * Recruitment process management\n* Payroll Management",
        },
        {
            text: "input: I am aiming for a salary of 7-8 LPA but I am open for negotiation as well.",
        },
        { text: "output: * 7 - 8 LPA\n* Open to negotiate" },
        {
            text: "input: Hello, I'm guy that a software engineer and we'd uh, 3 years of experience in a says based logitech of them logistics start up. I specialize in food stamp development using the months deck.",
        },
        {
            text: "output: * 3 years of experience\n* Full-stack developer\n* MERN stack\n* SaaS\n* Logistics-domain.",
        },
        { text: "input: " + TranscriptionText },
    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
    });
    const output_context = result.response.text();

    // Fetch call record data
    const response = await axios.get(
        `https://api.jsonbin.io/v3/b/${cid}?meta=false`,
        {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": jbmasterkey,
                "X-Access-Key": jbaccesskey,
            },
        }
    );

    const record = response.data;
    record.callsid = CallSid;

    record.recordings = record.recordings || {};
    record.recordings[qn] = {
        url: RecordingUrl,
        recordingid: RecordingSid,
        duration_seconds: RecordingDuration,
        transcription: TranscriptionText,
        transcriptionid: TranscriptionSid,
        output_context,
    };

    // Update call record data
    await axios.put(`https://api.jsonbin.io/v3/b/${cid}`, record, {
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": jbmasterkey,
            "X-Access-Key": jbaccesskey,
        },
    });

    return callback();
};
