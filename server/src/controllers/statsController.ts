import { Request, Response } from 'express';
import { StatsService } from '../services/StatsService';
import { News } from '../models/News';
import { Match } from '../models/Match';

export const getStandings = async (req: Request, res: Response): Promise<void> => {
    try {
        const standings = await StatsService.calculateStandings();
        res.json(standings);
    } catch (error) {
        console.error('Get standings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getTopScorers = async (req: Request, res: Response): Promise<void> => {
    try {
        const topScorers = await StatsService.calculateTopScorers();
        res.json(topScorers);
    } catch (error) {
        console.error('Get top scorers error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getPlayerStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const playerStats = await StatsService.calculatePlayerStats();
        res.json(playerStats);
    } catch (error) {
        console.error('Get player stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const [standings, topScorers, latestNews, nextMatch, recentMatches] = await Promise.all([
            StatsService.calculateStandings(),
            StatsService.calculateTopScorers(),
            News.findOne().sort({ priority: -1, date: -1 }),
            Match.findOne({ date: { $gte: new Date() } }).sort({ date: 1 }),
            Match.find({ score1: { $ne: null } })
                .sort({ date: -1 })
                .limit(5)
        ]);

        res.json({
            standings: standings.slice(0, 5),
            topScorer: topScorers[0] || null,
            latestNews,
            nextMatch,
            recentMatches
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
