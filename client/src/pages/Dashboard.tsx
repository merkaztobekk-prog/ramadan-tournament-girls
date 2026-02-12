import { useEffect, useState } from 'react';
import { statsAPI } from '../api/client';
import type { DashboardData } from '../types';
import './Dashboard.css';

const Dashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await statsAPI.getDashboard();
                setData(response.data);
            } catch (err) {
                setError('שגיאה בטעינת נתונים');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="loading">טוען...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!data) return <div className="error">אין נתונים</div>;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('he-IL');
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-grid">
                    {data.nextMatches && data.nextMatches.length > 0 && (
                        <div className="dashboard-card next-matches-card">
                            <h2>המשחקים הבאים</h2>
                            <div className="next-matches-list">
                                {data.nextMatches.map((match) => (
                                    <div key={match._id} className="upcoming-match-item">
                                        <div className="team-right">
                                            <span className="team-name">{match.team1Name || `קבוצה ${match.team1Id}`}</span>
                                        </div>
                                        <div className="match-vs">
                                            <span className="vs-badge">נגד</span>
                                        </div>
                                        <div className="team-left">
                                            <span className="team-name">{match.team2Name || `קבוצה ${match.team2Id}`}</span>
                                        </div>
                                        <div className="match-meta">
                                            <div className="match-date">{formatDate(match.date)}</div>
                                            <div className="match-location">מיקום: {match.location}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.topScorer && (
                        <div className="dashboard-card top-scorer">
                            <h2>מלך השערים</h2>
                            <div className="scorer-info">
                                <div className="scorer-name">{data.topScorer.playerName}</div>
                                <div className="scorer-team">{data.topScorer.teamName}</div>
                                <div className="scorer-goals">
                                    ⚽ {data.topScorer.goals} שערים
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {data.recentMatches && data.recentMatches.length > 0 && (
                    <div className="dashboard-card recent-matches mt-4">
                        <h2>משחקים אחרונים</h2>
                        <div className="matches-list">
                            {data.recentMatches.slice(0, 5).map((match) => (
                                <div key={match._id} className="match-item">
                                    <span className="match-date">{formatDate(match.date)}</span>
                                    <div className="match-score">
                                        <span>קבוצה {match.team1Id}</span>
                                        <span className="score">{match.score1} - {match.score2}</span>
                                        <span>קבוצה {match.team2Id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
