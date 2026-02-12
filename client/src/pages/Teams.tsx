import { useEffect, useState } from 'react';
import { teamsAPI } from '../api/client';
import type { Team } from '../types';
import './Teams.css';

const Teams = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await teamsAPI.getAll();
                setTeams(response.data);
            } catch (err) {
                setError('שגיאה בטעינת קבוצות');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    if (loading) return <div className="loading">טוען...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="teams-page">
            <h1 className="page-title">קבוצות</h1>
            <div className="teams-grid">
                {teams.map((team) => (
                    <div key={team._id} className="team-card card">
                        <div
                            className="team-header"
                            onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                        >
                            <h2>{team.name}</h2>
                            <span className="player-count">{team.players.length} שחקנים</span>
                            <button className="expand-btn">
                                {expandedTeam === team.id ? '▲' : '▼'}
                            </button>
                        </div>

                        {expandedTeam === team.id && (
                            <div className="players-list">
                                {team.players.map((player) => (
                                    <div key={player.memberId} className="player-item">
                                        <div className="player-number">#{player.number}</div>
                                        <div className="player-info">
                                            <div className="player-name">
                                                {player.firstName} {player.lastName}
                                                {player.isCaptain && ' ⭐'}
                                            </div>
                                            <div className="player-nickname">{player.nickname}</div>
                                            <div className="player-position">{player.position}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Teams;
