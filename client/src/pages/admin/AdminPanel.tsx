import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesAPI, newsAPI, authAPI, teamsAPI } from '../../api/client';
import type { Match, News, Team } from '../../types';
import MatchForm from '../../components/admin/MatchForm';
import NewsForm from '../../components/admin/NewsForm';
import './AdminPanel.css';

const AdminPanel = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'matches' | 'news' | 'import'>('matches');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleFileUpload = async () => {
        if (!file) return;
        if (!confirm('פעולה זו תמחק ותחליף את כל נתוני הקבוצות. להמשיך?')) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await import('../../api/client').then(m => m.adminAPI.uploadPlayers(formData));
            alert('ייבוא בוצע בהצלחה!');
            setFile(null);
            // Refresh logic if needed
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.details || err.response?.data?.error || 'שגיאה בייבוא הקובץ';
            alert(message);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        const fetchData = async () => {
            try {
                await authAPI.getCurrentUser();
                const [matchesRes, newsRes, teamsRes] = await Promise.all([
                    matchesAPI.getAll(),
                    newsAPI.getAll(),
                    teamsAPI.getAll()
                ]);
                const matchesSorted = matchesRes.data.sort((a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setMatches(matchesSorted);
                setNews(newsRes.data);
                setTeams(teamsRes.data);
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

    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [showMatchForm, setShowMatchForm] = useState(false);
    const [showNewsForm, setShowNewsForm] = useState(false);

    const handleSaveMatch = async (data: any) => {
        try {
            if (editingMatch) {
                await matchesAPI.update(editingMatch.id, data);
                setMatches(matches.map(m => m.id === editingMatch.id ? { ...m, ...data } : m).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            } else {
                const res = await matchesAPI.create(data);
                setMatches([...matches, res.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            }
            setShowMatchForm(false);
            setEditingMatch(null);
        } catch (err) {
            alert('שגיאה בשמירת משחק');
            console.error(err);
        }
    };

    const handleSaveNews = async (data: any) => {
        try {
            if (editingNews) {
                await newsAPI.update(editingNews.id, data);
                setNews(news.map(n => n.id === editingNews.id ? { ...n, ...data } : n));
            } else {
                const res = await newsAPI.create(data);
                setNews([res.data, ...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
            setShowNewsForm(false);
            setEditingNews(null);
        } catch (err) {
            alert('שגיאה בשמירת חדשות');
            console.error(err);
        }
    };

    const startEditMatch = (match: Match) => {
        setEditingMatch(match);
        setShowMatchForm(true);
    };

    const startEditNews = (item: News) => {
        setEditingNews(item);
        setShowNewsForm(true);
    };

    const getTeamName = (teamId: number) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : `קבוצה ${teamId}`;
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
                <button
                    className={`tab ${activeTab === 'import' ? 'active' : ''}`}
                    onClick={() => setActiveTab('import')}
                >
                    ייבוא שחקנים
                </button>
            </div>

            {activeTab === 'matches' && (
                <div className="tab-content">
                    {!showMatchForm ? (
                        <div className="card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2>משחקים</h2>
                                <button className="btn btn-primary" onClick={() => { setEditingMatch(null); setShowMatchForm(true); }}>
                                    + הוסף משחק חדש
                                </button>
                            </div>
                            <div className="items-list">
                                {matches.map(match => (
                                    <div key={match._id} className="item">
                                        <div className="item-info">
                                            <strong>
                                                {getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}
                                            </strong>
                                            <span>{new Date(match.date).toLocaleDateString('he-IL')}</span>
                                            <span>תוצאה: {match.score1 ?? '-'} : {match.score2 ?? '-'}</span>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => startEditMatch(match)} className="btn btn-warning ms-2">ערוך</button>
                                            <button onClick={() => deleteMatch(match.id)} className="btn btn-danger">מחק</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <MatchForm
                            initialData={editingMatch}
                            onSubmit={handleSaveMatch}
                            onCancel={() => { setShowMatchForm(false); setEditingMatch(null); }}
                        />
                    )}
                </div>
            )}

            {activeTab === 'news' && (
                <div className="tab-content">
                    {!showNewsForm ? (
                        <div className="card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2>חדשות</h2>
                                <button className="btn btn-primary" onClick={() => { setEditingNews(null); setShowNewsForm(true); }}>
                                    + הוסף חדשה
                                </button>
                            </div>
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
                                        <div className="item-actions">
                                            <button onClick={() => startEditNews(item)} className="btn btn-warning ms-2">ערוך</button>
                                            <button onClick={() => deleteNews(item.id)} className="btn btn-danger">מחק</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <NewsForm
                            initialData={editingNews}
                            onSubmit={handleSaveNews}
                            onCancel={() => { setShowNewsForm(false); setEditingNews(null); }}
                        />
                    )}
                </div>
            )}

            {activeTab === 'import' && (
                <div className="tab-content">
                    <div className="card">
                        <h2>ייבוא שחקנים</h2>
                        <div className="p-4 text-center">
                            <p className="mb-4">
                                העלה קובץ CSV עם נתוני שחקנים לעדכון מהיר של כל הקבוצות.<br />
                                <strong>שים לב: פעולה זו תמחק את כל הקבוצות והשחקנים הקיימים ותחליף אותם בנתונים החדשים!</strong>
                            </p>

                            <div className="mb-3">
                                <label htmlFor="csvFile" className="form-label">קובץ CSV (players-data.csv)</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    id="csvFile"
                                    accept=".csv"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </div>

                            <button
                                onClick={handleFileUpload}
                                className="btn btn-success btn-lg mt-3"
                                disabled={!file || uploading}
                            >
                                {uploading ? 'מעלה...' : 'ייבא שחקנים'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
