const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Temporary memory for chat messages
let chatLogs = {}; // { chatId: [ {sender: 'user'|'bot', text: '...'} ] }

// Simple rule/AI logic for Language Detection & Reply
function getAIReply(text) {
    const lower = text.toLowerCase();
    
    // Hinglish / Hindi greetings
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('kaise ho')) {
        return "Hello! Main badhiya hoon. Aap bataiye main aapki kya help kar sakta hoon?";
    }
    if (lower.includes('kya karte ho') || lower.includes('kya chal raha hai')) {
        return "Sab badhiya! Main ek AI automated bot hoon. Aapka message receive ho gaya hai.";
    }
    if (lower.includes('price') || lower.includes('rate') || lower.includes('cost')) {
        return "Details ke liye humari team aapko jald hi reply karegi. Kripya thoda wait karein.";
    }
    
    // Default smart Hinglish AI reply
    return "Aapka message mil gaya hai! Humari team/AI aapko assistant offer kar rahi hai. Kripya apna query clearly bataiye.";
}

// Webhook / Polling endpoint for Telegram messages
app.post('/api/telegram-webhook', async (req, res) => {
    const update = req.body;
    
    if (update && update.message) {
        const chatId = update.message.chat.id;
        const userText = update.message.text;

        if (!chatLogs[chatId]) chatLogs[chatId] = [];
        
        // Save user message to history
        chatLogs[chatId].push({ sender: 'User', text: userText, time: new Date().toLocaleTimeString() });

        // Generate AI Reply
        const aiResponse = getAIReply(userText);

        // Send AI Reply to Telegram
        try {
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: aiResponse
            });

            // Save Bot message to history
            chatLogs[chatId].push({ sender: 'Bot (AI)', text: aiResponse, time: new Date().toLocaleTimeString() });
        } catch (err) {
            console.error("Telegram send error:", err.message);
        }
    }
    res.sendStatus(200);
});

// Endpoint for UI Panel to fetch all chats
app.get('/api/chats', (req, res) => {
    res.json({ success: true, chats: chatLogs });
});

// Endpoint for Manual Reply from Panel
app.post('/api/send-message', async (req, res) => {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
        return res.status(400).json({ success: false, error: 'Chat ID aur Message dono zaroori hain.' });
    }

    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: message
        });

        if (!chatLogs[chatId]) chatLogs[chatId] = [];
        chatLogs[chatId].push({ sender: 'Admin (Manual)', text: message, time: new Date().toLocaleTimeString() });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data?.description || error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
                
