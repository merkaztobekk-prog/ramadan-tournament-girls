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
        const [standings, topScorers, latestNews, recentMatches] = await Promise.all([
            StatsService.calculateStandings(),
            StatsService.calculateTopScorers(),
            News.findOne().sort({ priority: -1, date: -1 }),
            Match.find({ score1: { $ne: null } })
                .sort({ date: -1 })
                .limit(5)
        ]);

        // Find the date of the next upcoming match
        const nextMatchDate = await Match.findOne({ date: { $gte: new Date() } })
            .sort({ date: 1 })
            .select('date');

        // Fetch all matches for that specific date (start to end of day)
        let nextMatches: any[] = [];
        if (nextMatchDate) {
            const date = new Date(nextMatchDate.date);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const rawNextMatches = await Match.find({
                date: { $gte: startOfDay, $lte: endOfDay }
            }).sort({ date: 1 }).lean();

            // Create a map of team ID to name from the standings we already fetched
            const teamMap = new Map<number, string>();
            standings.forEach(entry => {
                teamMap.set(entry.teamId, entry.teamName);
            });

            // Add team names to matches
            nextMatches = rawNextMatches.map(match => ({
                ...match,
                team1Name: teamMap.get(match.team1Id) || `קבוצה ${match.team1Id}`,
                team2Name: teamMap.get(match.team2Id) || `קבוצה ${match.team2Id}`
            }));
        }

        res.json({
            standings: standings.slice(0, 5),
            topScorer: topScorers[0] || null,
            latestNews,
            nextMatches,
            recentMatches
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
