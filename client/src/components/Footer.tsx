const Footer = () => {
    return (
        <footer className="tournament-footer">
            <div className="container">
                <div className="row py-4">
                    {/* Tournament Info */}
                    <div className="col-md-4 mb-3">
                        <h5 className="footer-heading">טורניר נצ'מאז 1447/2026</h5>
                        <p className="footer-text">
                            טורניר בנות בחסות מרכז צעירים
                        </p>
                    </div>

                    {/* Links */}
                    <div className="col-md-4 mb-3">
                        <h5 className="footer-heading">קישורים</h5>
                        <ul className="footer-list">
                            <li><a href="/" className="footer-link">דף הבית</a></li>
                            <li><a href="/teams" className="footer-link">קבוצות</a></li>
                            <li><a href="/schedule" className="footer-link">לוח משחקים</a></li>
                            <li><a href="/stats" className="footer-link">סטטיסטיקות</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p className="mb-0">
                        Amir Labai
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
