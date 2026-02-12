import { useEffect, useState } from 'react';
import { matchesAPI, teamsAPI } from '../api/client';
import type { Match, Team } from '../types';
import './Schedule.css';

const Schedule = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, teamsRes] = await Promise.all([
                    matchesAPI.getAll(),
                    teamsAPI.getAll()
                ]);
                setMatches(matchesRes.data);
                setTeams(teamsRes.data);
            } catch (err) {
                setError('שגיאה בטעינת נתונים');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">טוען...</div>;
    if (error) return <div className="error">{error}</div>;

    const getTeamName = (teamId: number) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : `קבוצה ${teamId}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMatchStatus = (match: Match) => {
        if (match.score1 != null && match.score2 != null) return 'finished';

        const matchDate = new Date(match.date);
        const now = new Date();

        // Get current time in Jerusalem
        const jerusalemNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));

        // Check if it's the same day
        const isSameDay = matchDate.getDate() === jerusalemNow.getDate() &&
            matchDate.getMonth() === jerusalemNow.getMonth() &&
            matchDate.getFullYear() === jerusalemNow.getFullYear();

        if (isSameDay) {
            // Live if it's 20:00 or later
            if (jerusalemNow.getHours() >= 20) return 'live';
            return 'upcoming';
        }

        // If match date is in the past, consider it finished (or pending, but 'finished' styles it gray usually)
        if (matchDate < jerusalemNow) return 'finished';

        return 'upcoming';
    };

    const sortedMatches = [...matches].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div className="schedule-page container py-4">
            <h1 className="page-title">לוח משחקים</h1>
            <div className="matches-list">
                {sortedMatches.map((match) => {
                    const status = getMatchStatus(match);
                    return (
                        <div key={match._id} className={`match-card card ${status}`}>
                            <div className="match-meta">
                                <span className="match-date">{formatDate(match.date)}</span>
                                <span className="match-location">{match.location}</span>
                                <span className={`match-status ${status}`}>
                                    {status === 'upcoming' ? 'עתיד' : status === 'live' ? 'בהתקדמות' : 'הסתיים'}
                                </span>
                            </div>

                            <div className="match-teams-score">
                                <div className="team-side">
                                    <span className="team-name">{getTeamName(match.team1Id)}</span>
                                    {status !== 'upcoming' && (
                                        <span className="team-score">{match.score1}</span>
                                    )}
                                </div>

                                <div className="vs-divider">VS</div>

                                <div className="team-side">
                                    <span className="team-name">{getTeamName(match.team2Id)}</span>
                                    {status !== 'upcoming' && (
                                        <span className="team-score">{match.score2}</span>
                                    )}
                                </div>
                            </div>

                            {match.goals && match.goals.length > 0 && (
                                <div className="match-goals">
                                    <h4>שמים:</h4>
                                    <div className="goals-list">
                                        {match.goals.map((goal, idx) => (
                                            <span key={idx} className="goal-item">
                                                ⚽ שחקן #{goal.memberId} ({goal.minute}')
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Schedule;
