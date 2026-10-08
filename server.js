const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Aapka Telegram Bot Token
const TELEGRAM_BOT_TOKEN = "8695603326:AAGYKmaE23KvarVyARMQJkmYcBYnn0hC7SY";

app.get('/', (req, res) => {
    res.send("Tele Auto Bot Server Is Live!");
});

app.post('/api/send-message', async (req, res) => {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
        return res.status(400).json({ success: false, error: "Chat ID aur Message dono zaroori hain!" });
    }

    try {
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data?.description || error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
