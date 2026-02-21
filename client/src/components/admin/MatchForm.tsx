import { useState, useEffect } from 'react';
import { teamsAPI } from '../../api/client';
import type { Match, Team } from '../../types';
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
        phase: 'group'
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

    // Helper: Convert UTC Date to Jerusalem "Wall Clock" ISO string for input
    const toJerusalemIsoString = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Jerusalem',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value;

        return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
    };

    const jerusalemStringToDate = (dateString: string): string => {
        if (!dateString) return '';
        const [datePart, timePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);

        const targetTime = Date.UTC(year, month - 1, day, hour, minute);
        let estimated = new Date(targetTime);

        for (let i = 0; i < 3; i++) {
            const jerusalemStr = toJerusalemIsoString(estimated);
            const [jDate, jTime] = jerusalemStr.split('T');
            const [jY, jM, jD] = jDate.split('-').map(Number);
            const [jH, jMin] = jTime.split(':').map(Number);

            const actualInJerusalem = Date.UTC(jY, jM - 1, jD, jH, jMin);
            const diff = actualInJerusalem - targetTime;
            if (diff === 0) break;
            estimated = new Date(estimated.getTime() - diff);
        }
        return estimated.toISOString();
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                team1Id: initialData.team1Id.toString(),
                team2Id: initialData.team2Id.toString(),
                score1: initialData.score1?.toString() ?? '',
                score2: initialData.score2?.toString() ?? '',
                date: toJerusalemIsoString(new Date(initialData.date)),
                location: initialData.location,
                phase: initialData.phase
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
                date: jerusalemStringToDate(formData.date) // Convert JLM time to UTC ISO
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
                    <label htmlFor="score1" className="form-label">ניקוד קבוצה 1</label>
                    <input type="number" className="form-control" id="score1" value={formData.score1} onChange={handleChange} min="0" />
                </div>
                <div className="col-md-6">
                    <label htmlFor="score2" className="form-label">ניקוד קבוצה 2</label>
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
