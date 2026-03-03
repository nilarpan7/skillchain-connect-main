import { Router } from 'express';
import multer from 'multer';
const pdfParse = require('pdf-parse');
import { matchResumeToAlumni } from '../services/aiMatcher';
import { ALUMNI_DATA } from '../data/alumni';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        console.log('[Match] Received file:', req.file.originalname, 'size:', req.file.size, 'type:', req.file.mimetype);

        let resumeText = '';

        // Try PDF parsing first
        try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } catch (pdfError: any) {
            console.error('[Match] PDF parse failed:', pdfError.message);
            // Fallback: try to extract raw text from the buffer
            const rawText = req.file.buffer.toString('utf-8');
            // Extract readable text fragments (words of 3+ chars)
            const textFragments = rawText.match(/[a-zA-Z]{3,}[a-zA-Z\s,.\-@\/]+/g);
            if (textFragments && textFragments.length > 5) {
                resumeText = textFragments.join(' ');
                console.log('[Match] Fallback text extraction succeeded, length:', resumeText.length);
            } else {
                return res.status(400).json({ error: 'Could not extract text from the PDF. Please ensure it is a valid text-based PDF (not a scanned image).' });
            }
        }

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from the PDF. It may be an image-based scan.' });
        }

        console.log('[Match] Resume text extracted, length:', resumeText.length);

        // Call Gemini AI matcher
        const matches = await matchResumeToAlumni(resumeText);

        // Hydrate the matches with full alumni data
        const hydratedMatches = matches.map((match: any) => {
            const alumnus = ALUMNI_DATA.find((a) => a.id === match.alumnusId);
            return {
                ...match,
                alumnus
            };
        }).filter((m: any) => m.alumnus); // Filter out any invalid IDs

        console.log('[Match] Successfully matched', hydratedMatches.length, 'alumni');
        res.json({ matches: hydratedMatches });
    } catch (error: any) {
        console.error('[Match] Error:', error.message);
        console.error('[Match] Stack:', error.stack);

        // Check if it's a rate limit error from Gemini
        const isRateLimited = error.message?.includes('429') || error.message?.includes('Too Many Requests') || error.message?.includes('quota');

        if (isRateLimited) {
            res.status(429).json({
                error: 'AI service is temporarily rate limited. Please wait 30 seconds and try again.',
                retryAfter: 30
            });
        } else {
            res.status(500).json({ error: error.message || 'An error occurred during matching' });
        }
    }
});

export default router;

