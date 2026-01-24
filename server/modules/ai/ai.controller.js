const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;

// Initialize function to safely handle API key availability
const initAI = () => {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Gemini AI Initialized");
    } else {
        console.warn("GEMINI_API_KEY is not set. AI features will not work.");
    }
};

initAI();

exports.chatWithPet = async (req, res) => {
    try {
        if (!model) {
            // Try initializing again in case env was loaded late
            initAI();
            if (!model) {
                return res.status(503).json({
                    success: false,
                    message: "My brain is offline right now! (API Key missing)"
                });
            }
        }

        const { message, history } = req.body;
        const user = req.user; // From auth middleware

        const userInterests = user.interests ? user.interests.join(", ") : "general tech";
        const userName = user.name || "friend";

        // Construct the prompt
        const systemPrompt = `
You are a friendly, motivational Robot Pet Dog named "Sparky".
Your goal is to help the user grow in their tech career, provide motivation, and suggest learning paths using the platform "EduHackTech".

User Context:
- Name: ${userName}
- Interests: ${userInterests}

Personality:
- Enthusiastic, supportive, slightly playful ("Woof!", "Paw-some!").
- Concise but helpful.
- If the user asks about courses/hackathons, encourage them to check the platform's listings.
- When they mention burnout, be empathetic and suggest taking a break.

Constraint:
- Keep responses under 500 characters when possible.
- Do not hallucinate links.
- Uses emojis sparingly but effectively.
`;

        // Format history for Gemini
        let chatHistory = history ? history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        })) : [];

        // Keep last 10 turns to manage context window
        chatHistory = chatHistory.slice(-10);

        // Gemini requires history to start with a 'user' message
        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.shift();
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 300,
            },
        });

        const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
        const response = result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            response: text
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({
            success: false,
            message: "Woof... I got confused. Try again?",
            error: error.message,
            stack: error.stack
        });
    }
};
