import { useState, useEffect } from 'react';
import { teamsAPI } from '../../api/client';
import type { Match, Team, Goal } from '../../types';
import './MatchForm.css';

interface MatchFormProps {
    initialData?: Match | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

const MatchForm = ({ initialData, onSubmit, onCancel }: MatchFormProps) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [formData, setFormData] = useState({
        team1Id: '',
        team2Id: '',
        score1: '',
        score2: '',
        date: '',
        location: '',
        phase: 'group',
        goals: [] as Goal[]
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await teamsAPI.getAll();
                setTeams(res.data);
            } catch (err) {
                console.error('Failed to load teams', err);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        if (initialData) {
            // Format for datetime-local: YYYY-MM-DDTHH:mm
            const dateObj = new Date(initialData.date);
            // Adjust to Jerusalem time for editing
            const offset = dateObj.getTimezoneOffset() * 60000; // Offset in milliseconds
            const localISOTime = new Date(dateObj.getTime() - offset).toISOString().slice(0, 16);

            setFormData({
                team1Id: initialData.team1Id.toString(),
                team2Id: initialData.team2Id.toString(),
                score1: initialData.score1?.toString() ?? '',
                score2: initialData.score2?.toString() ?? '',
                date: localISOTime,
                location: initialData.location,
                phase: initialData.phase,
                goals: initialData.goals || []
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset states
        setErrors({});
        setSuccess(false);

        // Validation
        const newErrors: Record<string, string> = {};
        if (formData.team1Id === formData.team2Id && formData.team1Id !== '') {
            newErrors.teams = 'לא ניתן לבחור את אותה קבוצה פעמיים';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                team1Id: parseInt(formData.team1Id),
                team2Id: parseInt(formData.team2Id),
                score1: formData.score1 === '' ? undefined : parseInt(formData.score1),
                score2: formData.score2 === '' ? undefined : parseInt(formData.score2),
            };
            await onSubmit(payload);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setErrors({ submit: err.response?.data?.error || 'שגיאה בשמירת המשחק' });
        } finally {
            setLoading(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const form = document.querySelector<HTMLFormElement>('form');
                form?.requestSubmit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    return (
        <form onSubmit={handleSubmit} className="match-form card p-4 shadow-sm">
            <h4 className="mb-3">{initialData ? 'עריכת משחק' : 'הוספת משחק חדש'}</h4>

            {success && (
                <div className="alert alert-success" role="alert">
                    ✓ המשחק נשמר בהצלחה!
                </div>
            )}

            {errors.submit && (
                <div className="alert alert-danger" role="alert">
                    {errors.submit}
                </div>
            )}

            {errors.teams && (
                <div className="alert alert-warning" role="alert">
                    {errors.teams}
                </div>
            )}

            <div className="row g-3">
                <div className="col-md-6">
                    <label htmlFor="team1Id" className="form-label">קבוצה 1</label>
                    <select id="team1Id" className="form-select" value={formData.team1Id} onChange={handleChange} required>
                        <option value="">בחר קבוצה...</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="col-md-6">
                    <label htmlFor="team2Id" className="form-label">קבוצה 2</label>
                    <select id="team2Id" className="form-select" value={formData.team2Id} onChange={handleChange} required>
                        <option value="">בחר קבוצה...</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="col-md-6">
                    <label htmlFor="score1" className="form-label">תוצאה קבוצה 1</label>
                    <input type="number" className="form-control" id="score1" value={formData.score1} onChange={handleChange} min="0" />
                </div>
                <div className="col-md-6">
                    <label htmlFor="score2" className="form-label">תוצאה קבוצה 2</label>
                    <input type="number" className="form-control" id="score2" value={formData.score2} onChange={handleChange} min="0" />
                </div>

                <div className="col-12">
                    <label htmlFor="date" className="form-label">תאריך ושעה (זמן ירושלים)</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        id="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                    <small className="form-text text-muted">
                        כל התאריכים והשעות מוצגים באופן אוטומטי בזמן ירושלים
                    </small>
                </div>

                <div className="col-12">
                    <label htmlFor="location" className="form-label">מיקום</label>
                    <input type="text" className="form-control" id="location" value={formData.location} onChange={handleChange} required />
                </div>

                <div className="col-12">
                    <label htmlFor="phase" className="form-label">שלב</label>
                    <select id="phase" className="form-select" value={formData.phase} onChange={handleChange}>
                        <option value="group">שלב הבתים</option>
                        <option value="knockout">נוקאאוט</option>
                    </select>
                </div>
            </div>

            <div className="card mt-4 p-3 bg-light">
                <h5>ניהול כובשים</h5>
                <div className="row g-3 align-items-end">
                    <div className="col-md-8">
                        <label className="form-label">בחר מבקיע</label>
                        <select
                            className="form-select"
                            id="goalPlayer"
                            onChange={(e) => {
                                if (e.target.value) {
                                    const memberId = parseInt(e.target.value);
                                    setFormData(prev => ({
                                        ...prev,
                                        goals: [...prev.goals, { memberId, minute: 0 }]
                                    }));
                                    e.target.value = ""; // Reset select
                                }
                            }}
                        >
                            <option value="">בחר שחקן...</option>
                            <optgroup label="קבוצה 1">
                                {teams.find(t => t.id === parseInt(formData.team1Id))?.players.map(p => (
                                    <option key={p.memberId} value={p.memberId}>
                                        {p.nickname || `${p.firstName} ${p.lastName}`} (#{p.number})
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="קבוצה 2">
                                {teams.find(t => t.id === parseInt(formData.team2Id))?.players.map(p => (
                                    <option key={p.memberId} value={p.memberId}>
                                        {p.nickname || `${p.firstName} ${p.lastName}`} (#{p.number})
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                </div>

                {formData.goals.length > 0 && (
                    <div className="mt-3">
                        <h6>רשימת כובשים:</h6>
                        <ul className="list-group">
                            {formData.goals.map((goal, idx) => {
                                const team1 = teams.find(t => t.id === parseInt(formData.team1Id));
                                const team2 = teams.find(t => t.id === parseInt(formData.team2Id));
                                const player = team1?.players.find(p => p.memberId === goal.memberId) ||
                                    team2?.players.find(p => p.memberId === goal.memberId);

                                return (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>
                                            ⚽ {player ? (player.nickname || `${player.firstName} ${player.lastName}`) : `שחקן ${goal.memberId}`}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    goals: prev.goals.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                        >
                                            מחק
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-success flex-grow-1" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            שומר...
                        </>
                    ) : 'שמור (Ctrl+S)'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                    ביטול (Esc)
                </button>
            </div>

            <div className="keyboard-shortcuts-hint mt-2">
                <small className="text-muted">קיצורי מקלדת: Ctrl+S לשמירה | Esc לביטול</small>
            </div>
        </form>
    );
};

export default MatchForm;
