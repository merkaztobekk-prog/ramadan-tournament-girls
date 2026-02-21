import { Team, IPlayer } from '../models/Team';
import { Match, IMatch } from '../models/Match';

export interface StandingsEntry {
    teamId: number;
    teamName: string;
    played: number;
    points: number;
}

export interface TopScorer {
    memberId: number;
    playerName: string;
    teamName: string;
    position: string;
    goals: number;
}

export interface PlayerStats {
    memberId: number;
    goals: number;
    gamesPlayed: number;
}

export class StatsService {
    /**
     * Calculate team standings from group stage matches
     * Teams are ranked by total points accumulated
     */
    static async calculateStandings(): Promise<StandingsEntry[]> {
        const teams = await Team.find();
        const matches = await Match.find({ phase: 'group' });

        // Initialize standings
        const standings: { [key: number]: StandingsEntry } = {};

        teams.forEach((team) => {
            standings[team.id] = {
                teamId: team.id,
                teamName: team.name,
                played: 0,
                points: 0,
            };
        });

        // Process matches
        for (const match of matches) {
            if (match.score1 == null || match.score2 == null) continue;

            const team1 = standings[match.team1Id];
            const team2 = standings[match.team2Id];

            if (!team1 || !team2) continue;

            // Update matches played
            team1.played += 1;
            team2.played += 1;

            // Update points (running sum)
            team1.points += match.score1;
            team2.points += match.score2;
        }

        // Sort by total points
        const standingsList = Object.values(standings);
        standingsList.sort((a, b) => b.points - a.points);

        return standingsList;
    }

    /**
     * Calculate top scorers from all matches
     * Returns empty array as individual scoring is no longer tracked
     */
    static async calculateTopScorers(): Promise<TopScorer[]> {
        return [];
    }

    /**
     * Calculate player statistics
     * Returns empty array as individual stats are no longer tracked
     */
    static async calculatePlayerStats(): Promise<PlayerStats[]> {
        return [];
    }
}
