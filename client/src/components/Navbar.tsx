import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    🏆 טורניר רמדאן
                </Link>
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    >
                        דשבורד
                    </Link>
                    <Link
                        to="/teams"
                        className={`nav-link ${isActive('/teams') ? 'active' : ''}`}
                    >
                        קבוצות
                    </Link>
                    <Link
                        to="/schedule"
                        className={`nav-link ${isActive('/schedule') ? 'active' : ''}`}
                    >
                        לוח משחקים
                    </Link>
                    <Link
                        to="/stats"
                        className={`nav-link ${isActive('/stats') ? 'active' : ''}`}
                    >
                        סטטיסטיקות
                    </Link>
                    <Link
                        to="/admin"
                        className={`nav-link admin-link ${isActive('/admin') || isActive('/admin/login') ? 'active' : ''}`}
                    >
                        ניהול
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
