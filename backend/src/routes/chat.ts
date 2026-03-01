import express from 'express';
import { mockDb } from '../config/mock-database';

const router = express.Router();

// GET /api/chat/:wallet1/:wallet2
// Fetch all messages between two given wallets
router.get('/:wallet1/:wallet2', (req, res) => {
    try {
        const { wallet1, wallet2 } = req.params;
        if (!wallet1 || !wallet2) {
            return res.status(400).json({ error: 'Both wallets are required' });
        }

        const messages = mockDb.getChatMessages(wallet1, wallet2);
        res.json(messages);
    } catch (error: any) {
        console.error('Chat fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// POST /api/chat/:wallet1/:wallet2
// Send a message between two given wallets
router.post('/:sender/:receiver', (req, res) => {
    try {
        const { sender, receiver } = req.params;
        const { message } = req.body;

        if (!sender || !receiver || !message) {
            return res.status(400).json({ error: 'Sender, receiver, and message are required' });
        }

        const newMsg = mockDb.insertChatMessage({
            sender_wallet: sender,
            receiver_wallet: receiver,
            message
        });

        res.json(newMsg);
    } catch (error: any) {
        console.error('Chat send error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
