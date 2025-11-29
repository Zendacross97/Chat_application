const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});

exports.generateSmartReplies = async (latestMessage) => {
    const systemInstruction = 
        "You are an AI assistant generating quick replies for a chat application. " +
        "Provide EXACTLY 3 extremely short, common, and appropriate replies to the user message. " +
        "Respond ONLY with a JSON array of strings: [\"Reply 1\", \"Reply 2\", \"Reply 3\"].";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User received this message: "${latestMessage}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.4, 
            },
        });
        return JSON.parse(response.text.trim());

    } catch (error) {
        console.error("Gemini Smart Replies Error:", error);
        return [];
    }
}

exports.generatePredictiveTyping = async (partialInput) => {
    const fullPrompt = 
        `The user is currently typing: "${partialInput}" ` +
        "Provide only 3 possible, short (1-3 words), and relevant continuations for the user's sentence. " +
        "Separate the suggestions with a single pipe character (|). Do not include the starting phrase.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                maxOutputTokens: 2000,
                temperature: 0.8,
            },
        });

        // if (!response || !response.text) {
        //     console.error("Gemini Predictive Typing Error: Response text is null or undefined after retrying with increased tokens. Check safety filters.");
        //     return [];
        // }

        // console.log("Full Gemini Response:", JSON.stringify(response, null, 2));

        const suggestions = response.text
            .split('|')
            .map(s => s.trim())
            .filter(s => s.length > 0); 
            
        return suggestions.slice(0, 3);
    } catch (error) {
        console.error("Gemini Predictive Typing Error:", error);
        return [];
    }
};