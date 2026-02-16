import { Request, Response } from 'express';
import { Iftar } from '../models/Iftar';

export const getNextIftar = async (req: Request, res: Response) => {
    try {
        // Get current time in Jerusalem
        const now = new Date();
        const jerusalemNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));

        // Format to YYYY-MM-DD
        const year = jerusalemNow.getFullYear();
        const month = String(jerusalemNow.getMonth() + 1).padStart(2, '0');
        const day = String(jerusalemNow.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        // Find today's Iftar
        let nextIftar = await Iftar.findOne({ date: { $gte: todayStr } }).sort({ date: 1 });

        if (!nextIftar) {
            return res.status(404).json({ message: 'No upcoming Iftar times found' });
        }

        // Check if today's Iftar has passed
        if (nextIftar.date === todayStr) {
            const [hours, minutes] = nextIftar.time.split(':').map(Number);
            const iftarTime = new Date(jerusalemNow);
            iftarTime.setHours(hours, minutes, 0, 0);

            if (jerusalemNow > iftarTime) {
                // If passed, get tomorrow's Iftar
                nextIftar = await Iftar.findOne({ date: { $gt: todayStr } }).sort({ date: 1 });
            }
        }

        if (!nextIftar) {
            return res.status(404).json({ message: 'No upcoming Iftar times found' });
        }

        res.json(nextIftar);
    } catch (error) {
        console.error('Error fetching next Iftar:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
