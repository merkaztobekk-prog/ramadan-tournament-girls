import { useEffect, useState } from 'react';
import { statsAPI } from '../api/client';
import type { Standing } from '../types';
import './Stats.css';

const Stats = () => {
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statsAPI.getStandings();
                setStandings(response.data);
            } catch (err) {
                setError('שגיאה בטעינת סטטיסטיקות');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading">טוען...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="stats-page container py-4">
            <h2 className="mb-4 fw-bold border-bottom pb-2" style={{ color: 'var(--primary)' }}>סטטיסטיקות</h2>

            <div className="stats-grid single-column">
                <div className="card standings-table">
                    <h2>טבלת ליגה</h2>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>מיקום</th>
                                    <th>קבוצה</th>
                                    <th>משחקים</th>
                                    <th>סך הכל נקודות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((team, index) => (
                                    <tr key={team.teamId} className={index < 4 ? 'qualified' : ''}>
                                        <td className="position">{index + 1}</td>
                                        <td className="team-name">{team.teamName}</td>
                                        <td>{team.played}</td>
                                        <td className="points">{team.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
