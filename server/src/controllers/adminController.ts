import { Request, Response } from 'express';
import { parse } from 'csv-parse';
import { Team } from '../models/Team';
import fs from 'fs';

interface PlayerCSV {
    team_name: string;
    first_name: string;
    last_name: string;
    nickname: string;
    number: string;
    position: string;
    bio: string;
    captain: string;
}

export const importPlayers = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const results: any[] = [];
    const teamsData: { [key: string]: any[] } = {};
    const teamIdMap: { [key: string]: number } = {};
    let nextTeamId = 1;
    let nextMemberId = 100;

    try {
        // Parse CSV
        const parser = fs
            .createReadStream(req.file.path)
            .pipe(parse({
                columns: ['team_name', 'first_name', 'last_name', 'nickname', 'number', 'position', 'bio', 'captain'],
                from_line: 2, // Skip header
                trim: true,
                skip_empty_lines: true
            }));

        for await (const row of parser) {
            const { team_name, first_name, last_name, nickname, number, position, bio, captain } = row as PlayerCSV;

            if (!team_name) continue;
            if (!first_name && !last_name && !nickname) continue;

            if (!teamsData[team_name]) {
                teamsData[team_name] = [];
                // Assign team ID if not exists
                if (!teamIdMap[team_name]) {
                    teamIdMap[team_name] = nextTeamId++;
                }
            }

            const fullName = `${first_name} ${last_name}`.trim() || nickname;
            const displayNickname = nickname || (first_name || last_name);

            const teamId = teamIdMap[team_name];

            // Logic from import_players.py: member_id = team_id * 100 + number
            // If number is not provided, we need a fallback, but the Python script implies number is expected or calculated.
            // Python script: member_id = team_id * 100 + player_num

            let playerNumber = 0;
            if (number) {
                playerNumber = parseInt(number);
            } else {
                // Fallback if no number in CSV (though current CSV seems to have them)
                // We need to track used numbers for this team if dynamic assignment is needed.
                // For now, let's assume number is present or use a simple counter per team.
                playerNumber = (teamsData[team_name].length + 1);
            }

            const memberId = (teamId * 100) + playerNumber;

            teamsData[team_name].push({
                memberId: memberId,
                firstName: first_name,
                lastName: last_name,
                nickname: displayNickname,
                number: playerNumber,
                position: position || 'Player',
                isCaptain: captain === '1',
                bio: bio || `Player for ${team_name}`
            });
        }

        // Update Database
        await Team.deleteMany({}); // Clear existing teams

        const teamsToInsert = Object.entries(teamsData).map(([name, players]) => ({
            id: teamIdMap[name],
            name,
            players,
            logo: `assets/images/teams/${name.toLowerCase().replace(/ /g, '_')}.png`,
            coach: 'Coach' // Default coach
        }));

        if (teamsToInsert.length > 0) {
            await Team.insertMany(teamsToInsert);
        }

        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Import successful',
            teamsCount: teamsToInsert.length,
            playersCount: teamsToInsert.reduce((acc, t) => acc + t.players.length, 0)
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Failed to process CSV' });
        // Cleanup on error
        if (req.file) fs.unlinkSync(req.file.path);
    }
};
