import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesAPI, newsAPI, authAPI } from '../../api/client';
import { Match, News } from '../../types';
import './AdminPanel.css';

const AdminPanel = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'matches' | 'news'>('matches');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        const fetchData = async () => {
            try {
                await authAPI.getCurrentUser();
                const [matchesRes, newsRes] = await Promise.all([
                    matchesAPI.getAll(),
                    newsAPI.getAll()
                ]);
                setMatches(matchesRes.data);
                setNews(newsRes.data);
            } catch (err) {
                console.error(err);
                localStorage.removeItem('token');
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    const deleteMatch = async (id: number) => {
        if (!confirm('האם אתה בטוח שברצונך למחוק משחק זה?')) return;
        try {
            await matchesAPI.delete(id);
            setMatches(matches.filter(m => m.id !== id));
        } catch (err) {
            alert('שגיאה במחיקת משחק');
        }
    };

    const deleteNews = async (id: number) => {
        if (!confirm('האם אתה בטוח שברצונך למחוק חדשה זו?')) return;
        try {
            await newsAPI.delete(id);
            setNews(news.filter(n => n.id !== id));
        } catch (err) {
            alert('שגיאה במחיקת חדשה');
        }
    };

    if (loading) return <div className="loading">טוען...</div>;

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>פאנל ניהול</h1>
                <button onClick={handleLogout} className="btn btn-danger">
                    התנתק
                </button>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
                    onClick={() => setActiveTab('matches')}
                >
                    ניהול משחקים ({matches.length})
                </button>
                <button
                    className={`tab ${activeTab === 'news' ? 'active' : ''}`}
                    onClick={() => setActiveTab('news')}
                >
                    ניהול חדשות ({news.length})
                </button>
            </div>

            {activeTab === 'matches' && (
                <div className="tab-content">
                    <div className="card">
                        <h2>משחקים</h2>
                        <div className="items-list">
                            {matches.map(match => (
                                <div key={match._id} className="item">
                                    <div className="item-info">
                                        <strong>
                                            קבוצה {match.team1Id} vs קבוצה {match.team2Id}
                                        </strong>
                                        <span>{new Date(match.date).toLocaleDateString('he-IL')}</span>
                                        <span>תוצאה: {match.score1} - {match.score2}</span>
                                    </div>
                                    <button
                                        onClick={() => deleteMatch(match.id)}
                                        className="btn btn-danger"
                                    >
                                        מחק
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'news' && (
                <div className="tab-content">
                    <div className="card">
                        <h2>חדשות</h2>
                        <div className="items-list">
                            {news.map(item => (
                                <div key={item._id} className="item">
                                    <div className="item-info">
                                        <strong>{item.title}</strong>
                                        <span>{item.message}</span>
                                        <span className={`priority ${item.priority}`}>
                                            {item.priority === 'high' ? 'עדיפות גבוהה' : 'רגיל'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteNews(item.id)}
                                        className="btn btn-danger"
                                    >
                                        מחק
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
