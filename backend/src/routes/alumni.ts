import express from 'express';
import { mockDb } from '../config/mock-database';
import { ALUMNI_DATA } from '../data/alumni';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // 1. Get mock alumni data
        const mockAlumni = ALUMNI_DATA.map(a => ({ ...a, id: String(a.id), isReal: false }));

        // 2. Fetch real graduated students who have a profile
        const realProfiles = mockDb.getAllProfiles();
        const realAlumni = realProfiles.map(p => ({
            id: `real-${p.wallet.slice(0, 8)}`, // Generate a unique ID
            name: p.name || 'Verified Graduate',
            wallet: p.wallet,
            degree: 'Verified Alumni',
            year: new Date().getFullYear(), // Fallback to current year
            expertise: p.expertise && p.expertise.length > 0 ? p.expertise : ['AlgoVault Verified'],
            status: p.status || 'Alumni Member',
            offering: p.offering || 'Available for Connection',
            isReal: true
        }));

        // 3. Merge and return
        res.json(realAlumni.concat(mockAlumni));
    } catch (error: any) {
        console.error('Alumni fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch alumni' });
    }
});

export default router;
