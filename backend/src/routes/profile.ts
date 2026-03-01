import express from 'express';
import multer from 'multer';
import { mockDb } from '../config/mock-database';
import { generateProfileFromResume } from '../services/aiProfileGenerator';
import { authenticateWallet, AuthRequest } from '../middleware/auth';

const pdfParse = require('pdf-parse');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get a profile by wallet
router.get('/:wallet', async (req, res) => {
    try {
        const wallet = req.params.wallet;
        const profile = mockDb.getProfile(wallet);
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error: any) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Create or update a profile
router.post('/', async (req, res) => {
    try {
        const { wallet, name, expertise, status, offering } = req.body;
        if (!wallet || !name) {
            return res.status(400).json({ error: 'Wallet and Name are required fields.' });
        }

        const profile = mockDb.upsertProfile({
            wallet,
            name,
            expertise: expertise || [],
            status: status || '',
            offering: offering || ''
        });

        res.json({ success: true, profile });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Auto-generate profile from PDF upload
router.post('/auto-generate', authenticateWallet, upload.single('document'), async (req: AuthRequest, res) => {
    try {
        const wallet = req.wallet;
        if (!wallet) {
            return res.status(401).json({ error: 'Unauthorized: No wallet found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Only PDF files are supported' });
        }

        // Parse the PDF
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from the PDF' });
        }

        // Call Gemini AI
        const profileData = await generateProfileFromResume(resumeText);

        // Save to DB
        const profile = mockDb.upsertProfile({
            wallet,
            name: profileData.name || 'Unknown User',
            expertise: profileData.expertise || [],
            status: profileData.status || 'Alumni',
            offering: profileData.offering || 'Available to chat'
        });

        res.json({ success: true, profile });

    } catch (error: any) {
        console.error('Auto-generate error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during profile generation' });
    }
});

export default router;
