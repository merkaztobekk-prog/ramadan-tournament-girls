// Admin Panel JavaScript
(function () {
    'use strict';

    // Data storage
    let teams = [];
    let matches = [];
    let players = [];
    let news = [];
    let nextMatchId = 1;
    let nextNewsId = 1;

    // Initialize
    document.addEventListener('DOMContentLoaded', function () {
        loadData();
        setupEventListeners();
    });

    // Load data from global variables (loaded via script tags)
    function loadData() {
        // Data is loaded from data/teams.js and data/matches.js
        if (typeof window.TEAMS_DATA === 'undefined' || typeof window.MATCHES_DATA === 'undefined') {
            alert('שגיאה: קבצי הנתונים לא נטעו. ודא שקבצי teams.js ו-matches.js נטענים.');
            return;
        }

        teams = window.TEAMS_DATA;
        matches = window.MATCHES_DATA;
        news = window.NEWS_DATA || [];

        // Extract all players
        players = teams.flatMap(team =>
            team.members.map(member => ({
                ...member,
                team_id: team.id,
                team_name: team.name
            }))
        );

        // Determine next match ID
        if (matches.length > 0) {
            nextMatchId = Math.max(...matches.map(m => m.id)) + 1;
        }

        // Determine next news ID
        if (news.length > 0) {
            nextNewsId = Math.max(...news.map(n => n.id)) + 1;
        }

        populateTeamDropdowns();
        renderMatchesList();
        renderNewsList();
        updateDataPreview();
    }

    // Populate team dropdowns
    function populateTeamDropdowns() {
        const team1Select = document.getElementById('team1');
        const team2Select = document.getElementById('team2');

        const options = teams.map(team =>
            `<option value="${team.id}">${team.name}</option>`
        ).join('');

        team1Select.innerHTML = '<option value="">בחר קבוצה...</option>' + options;
        team2Select.innerHTML = '<option value="">בחר קבוצה...</option>' + options;
    }

    // Setup event listeners
    function setupEventListeners() {
        const matchForm = document.getElementById('matchForm');
        matchForm.addEventListener('submit', handleMatchSubmit);

        const newsForm = document.getElementById('newsForm');
        newsForm.addEventListener('submit', handleNewsSubmit);

        // Show goals section when scores are entered
        const score1 = document.getElementById('score1');
        const score2 = document.getElementById('score2');

        score1.addEventListener('input', updateGoalsSection);
        score2.addEventListener('input', updateGoalsSection);
    }

    // Update goals section based on total goals
    function updateGoalsSection() {
        const score1 = parseInt(document.getElementById('score1').value) || 0;
        const score2 = parseInt(document.getElementById('score2').value) || 0;
        const totalGoals = score1 + score2;

        const goalsSection = document.getElementById('goalsSection');
        const goalsList = document.getElementById('goalsList');

        if (totalGoals > 0) {
            goalsSection.style.display = 'block';
            goalsList.innerHTML = '';

            for (let i = 0; i < totalGoals; i++) {
                addGoalInput(i);
            }
        } else {
            goalsSection.style.display = 'none';
        }
    }

    // Add goal input
    window.addGoalInput = function (index) {
        const goalsList = document.getElementById('goalsList');
        const team1Id = parseInt(document.getElementById('team1').value);
        const team2Id = parseInt(document.getElementById('team2').value);

        if (!team1Id || !team2Id) return;

        const team1Players = players.filter(p => p.team_id === team1Id);
        const team2Players = players.filter(p => p.team_id === team2Id);

        const goalDiv = document.createElement('div');
        goalDiv.className = 'goal-input-group';
        goalDiv.innerHTML = `
            <label class="form-label">שער ${index !== undefined ? index + 1 : ''}</label>
            <select class="form-select goal-player" required>
                <option value="">בחר שחקן...</option>
                <optgroup label="${teams.find(t => t.id === team1Id)?.name}">
                    ${team1Players.map(p => `<option value="${p.id}">${p.nickname || p.name}</option>`).join('')}
                </optgroup>
                <optgroup label="${teams.find(t => t.id === team2Id)?.name}">
                    ${team2Players.map(p => `<option value="${p.id}">${p.nickname || p.name}</option>`).join('')}
                </optgroup>
            </select>
        `;

        goalsList.appendChild(goalDiv);
    };

    // Handle match form submission
    function handleMatchSubmit(e) {
        e.preventDefault();

        const matchId = document.getElementById('matchId').value;
        const team1 = parseInt(document.getElementById('team1').value);
        const team2 = parseInt(document.getElementById('team2').value);
        const score1 = parseInt(document.getElementById('score1').value);
        const score2 = parseInt(document.getElementById('score2').value);
        const date = document.getElementById('matchDate').value;
        const location = document.getElementById('location').value;
        const phase = document.getElementById('phase').value;

        // Collect goals
        const goalPlayers = Array.from(document.querySelectorAll('.goal-player'))
            .map(select => parseInt(select.value))
            .filter(id => !isNaN(id));

        const goals = goalPlayers.map(member_id => ({
            member_id: member_id
        }));

        const matchData = {
            id: matchId ? parseInt(matchId) : nextMatchId++,
            date: date,
            location: location,
            team1_id: team1,
            team2_id: team2,
            score1: isNaN(score1) ? null : score1,
            score2: isNaN(score2) ? null : score2,
            phase: phase,
            goals: goals
        };

        if (matchId) {
            // Edit existing match
            const index = matches.findIndex(m => m.id === matchData.id);
            if (index !== -1) {
                matches[index] = matchData;
            }
        } else {
            // Add new match
            matches.push(matchData);
        }

        renderMatchesList();
        updateDataPreview();
        resetForm();

        alert('המשחק נשמר בהצלחה!');
    }

    // Render matches list
    function renderMatchesList() {
        const tbody = document.getElementById('matchesList');

        if (matches.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">אין משחקים</td></tr>';
            return;
        }

        tbody.innerHTML = matches.map(match => {
            const team1 = teams.find(t => t.id === match.team1_id);
            const team2 = teams.find(t => t.id === match.team2_id);
            const hasScore = match.score1 !== null && match.score2 !== null;

            return `
                <tr>
                    <td>${match.date}</td>
                    <td>${team1?.name || 'N/A'} vs ${team2?.name || 'N/A'}</td>
                    <td>${hasScore ? `${match.score1} - ${match.score2}` : 'טרם נקבע'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editMatch(${match.id})">עריכה</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMatch(${match.id})">מחק</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Edit match
    window.editMatch = function (matchId) {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        document.getElementById('matchId').value = match.id;
        document.getElementById('team1').value = match.team1_id;
        document.getElementById('team2').value = match.team2_id;
        document.getElementById('score1').value = match.score1 !== null ? match.score1 : '';
        document.getElementById('score2').value = match.score2 !== null ? match.score2 : '';
        document.getElementById('matchDate').value = match.date;
        document.getElementById('location').value = match.location;
        document.getElementById('phase').value = match.phase || 'group';

        updateGoalsSection();

        // Wait for DOM update, then populate goal selections
        setTimeout(() => {
            if (match.goals && match.goals.length > 0) {
                const goalSelects = document.querySelectorAll('.goal-player');
                match.goals.forEach((goal, index) => {
                    if (goalSelects[index]) {
                        goalSelects[index].value = goal.member_id;
                    }
                });
            }
        }, 50);

        // Scroll to form
        document.getElementById('matchForm').scrollIntoView({ behavior: 'smooth' });
    };

    // Delete match
    window.deleteMatch = function (matchId) {
        if (!confirm('האם אתה בטוח שברצונך למחוק משחק זה?')) return;

        matches = matches.filter(m => m.id !== matchId);
        renderMatchesList();
        updateDataPreview();

        alert('המשחק נמחק בהצלחה!');
    };

    // Reset form
    window.resetForm = function () {
        document.getElementById('matchForm').reset();
        document.getElementById('matchId').value = '';
        document.getElementById('goalsSection').style.display = 'none';
    };

    // Update data preview
    function updateDataPreview() {
        const preview = document.getElementById('dataPreview');
        preview.textContent = JSON.stringify(matches, null, 2);
    }

    // Export matches
    window.exportMatches = function () {
        // Export JSON file
        const jsonStr = JSON.stringify(matches, null, 2);
        const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);

        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = 'matches.json';
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);

        // Export JS file
        const jsStr = `// Auto-generated from matches.json\nwindow.MATCHES_DATA = ${JSON.stringify(matches, null, 2)};\n`;
        const jsBlob = new Blob([jsStr], { type: 'text/javascript' });
        const jsUrl = URL.createObjectURL(jsBlob);

        const jsLink = document.createElement('a');
        jsLink.href = jsUrl;
        jsLink.download = 'matches.js';
        document.body.appendChild(jsLink);
        jsLink.click();
        document.body.removeChild(jsLink);
        URL.revokeObjectURL(jsUrl);

        alert('קבצים יוצאו בהצלחה!\nmatches.json\nmatches.js');
    };

    // Run stats update (local only)
    window.runStatsUpdate = function () {
        alert('כדי להריץ עדכון סטטיסטיקות:\n1. שמור את matches.json\n2. פתח terminal\n3. הרץ: python update_stats.py');
    };

    // ===== NEWS MANAGEMENT =====

    // Render news list
    function renderNewsList() {
        const tbody = document.getElementById('newsList');

        if (news.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">אין חדשות</td></tr>';
            return;
        }

        tbody.innerHTML = news.map(item => {
            const priorityBadge = item.priority === 'high'
                ? '<span class="badge bg-danger">גבוה</span>'
                : '<span class="badge bg-secondary">רגיל</span>';

            return `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.title}</td>
                    <td>${priorityBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editNews(${item.id})">עריכה</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteNews(${item.id})">מחק</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Handle news form submission
    function handleNewsSubmit(e) {
        e.preventDefault();

        const newsId = document.getElementById('newsId').value;
        const title = document.getElementById('newsTitle').value;
        const message = document.getElementById('newsMessage').value;
        const date = document.getElementById('newsDate').value;
        const priority = document.getElementById('newsPriority').value;

        const newsData = {
            id: newsId ? parseInt(newsId) : nextNewsId++,
            title: title,
            message: message,
            date: date,
            priority: priority
        };

        if (newsId) {
            // Edit existing news
            const index = news.findIndex(n => n.id === newsData.id);
            if (index !== -1) {
                news[index] = newsData;
            }
        } else {
            // Add new news
            news.push(newsData);
        }

        renderNewsList();
        resetNewsForm();

        alert('החדשה נשמרה בהצלחה!\n\nלא לשכוח לייצא את הקובץ news.json ולעדכן את המאגר.');
    }

    // Edit news
    window.editNews = function (newsId) {
        const item = news.find(n => n.id === newsId);
        if (!item) return;

        document.getElementById('newsId').value = item.id;
        document.getElementById('newsTitle').value = item.title;
        document.getElementById('newsMessage').value = item.message;
        document.getElementById('newsDate').value = item.date;
        document.getElementById('newsPriority').value = item.priority;

        // Scroll to form
        document.getElementById('newsForm').scrollIntoView({ behavior: 'smooth' });
    };

    // Delete news
    window.deleteNews = function (newsId) {
        if (!confirm('האם אתה בטוח שברצונך למחוק חדשה זו?')) return;

        news = news.filter(n => n.id !== newsId);
        renderNewsList();

        alert('החדשה נמחקה בהצלחה!');
    };

    // Reset news form
    window.resetNewsForm = function () {
        document.getElementById('newsForm').reset();
        document.getElementById('newsId').value = '';
    };

    // Export news
    window.exportNews = function () {
        // Export JSON file
        const jsonStr = JSON.stringify(news, null, 2);
        const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);

        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = 'news.json';
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);

        // Export JS file
        const jsStr = `// Auto-generated from news.json\nwindow.NEWS_DATA = ${JSON.stringify(news, null, 2)};\n`;
        const jsBlob = new Blob([jsStr], { type: 'text/javascript' });
        const jsUrl = URL.createObjectURL(jsBlob);

        const jsLink = document.createElement('a');
        jsLink.href = jsUrl;
        jsLink.download = 'news.js';
        document.body.appendChild(jsLink);
        jsLink.click();
        document.body.removeChild(jsLink);
        URL.revokeObjectURL(jsUrl);

        alert('קבצים יוצאו בהצלחה!\nnews.json\nnews.js\n\nהעלה את הקבצים לתיקיית data/');
    };

})();
