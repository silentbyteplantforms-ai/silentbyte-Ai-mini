const axios = require('axios');
const { 
    fetchAIResponseFromAPI 
} = require('./data.js');
const { 
    buildMasterPrompt 
} = require('./promptBuilder.js');
const { 
    transcribeAudio 
} = require('./transcriptionService.js');
const { 
    uploadImage,
    generateImages,
    analyzeImage 
} = require('./imageService.js');
const { 
    TEXT_API_ENDPOINTS 
} = require('./apis.js');

/**
 * Cycles through backup APIs for text generation
 */
async function fetchAIResponse(query, chatHistory = []) {
    try {
        console.log('🤖 Processing AI response...');
        console.log('📝 Query:', query);
        console.log('💾 Memory length:', chatHistory.length);

        if (chatHistory.length > 0) {
            console.log('🔍 Memory sample:', JSON.stringify(chatHistory.slice(-3), null, 2));
        }

        // ── Format conversation history ──────────────────────────────────────
        let formattedHistory = '';

        if (chatHistory && chatHistory.length > 0) {
            const recentHistory = chatHistory.slice(-15);

            recentHistory.forEach((item) => {
                if (item.user && item.bot) {
                    formattedHistory += `User: ${item.user}\n`;
                    formattedHistory += `AI: ${item.bot}\n`;
                } else if (item.role && item.text) {
                    const role = item.role === 'user' ? 'User' : 'AI';
                    formattedHistory += `${role}: ${item.text}\n`;
                } else if (typeof item === 'string') {
                    formattedHistory += `${item}\n`;
                }
            });
        }

        // ── Build full prompt with all modules ───────────────────────────────
        const masterPrompt = buildMasterPrompt();

        const fullPrompt = `${masterPrompt}

Previous conversation:
${formattedHistory}

Current query:
User: ${query}

AI:`;

        console.log('📤 Full prompt length:', fullPrompt.length);

        // ── Try each API in sequence ─────────────────────────────────────────
        for (const url of TEXT_API_ENDPOINTS) {
            console.log(`🔄 Trying API: ${url}`);
            const result = await fetchAIResponseFromAPI(url, fullPrompt);
            if (result) {
                console.log('✅ AI Response generated');
                return result;
            }
        }

        console.log('❌ All APIs failed');
        return "I apologize, but I'm having trouble responding right now. Please try again.";

    } catch (error) {
        console.error('❌ fetchAIResponse Error:', error.message);
        return "I encountered an error while processing your request.";
    }
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    uploadImage,
    fetchAIResponse,
    generateImages,
    analyzeImage,
    transcribeAudio
};