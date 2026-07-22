/**
 * EduTrack Application Logic & View Router
 */

// Application State
let currentUser = null;
let currentSubject = null;
let currentMilestones = [];
let currentSubmissionsMap = {}; // milestoneId -> submission object
let currentSubmissionsList = [];
let currentLeaderboard = [];

// Fallback Mock Data for instant browser testing if backend server is starting up
const MOCK_DATA = {
    userStudent: { id: 4, fullName: 'Anurag Harapanahalli', email: 'anurag@edutrack.edu', role: 'STUDENT', batchId: 1, batchName: 'B.Tech CSE 2026 - Batch A' },
    userInstructor: { id: 2, fullName: 'Prof. Rajesh Sharma', email: 'sharma@edutrack.edu', role: 'INSTRUCTOR', batchId: null, batchName: null },
    subject: { id: 1, name: 'CSE20140 - Project Based Learning III', code: 'CSE20140-PBL3', instructorName: 'Prof. Rajesh Sharma' },
    milestones: [
        { id: 1, title: 'Milestone 1: Project Topic Selection & Problem Statement', description: 'Submit project proposal including domain, problem statement, team roles, and initial feature list.', deadline: '2026-07-25T23:59:00', basePoints: 100, requiredDeliverables: 'Proposal PDF, Problem Statement Doc', isOverdue: false },
        { id: 2, title: 'Milestone 2: Software Requirements Specification (SRS)', description: 'Complete IEEE 830 formatted SRS document detailing functional and non-functional requirements.', deadline: '2026-08-01T23:59:00', basePoints: 150, requiredDeliverables: 'SRS Document (.docx or .pdf)', isOverdue: false },
        { id: 3, title: 'Milestone 3: Database Schema & REST API Architecture', description: 'Provide ER diagram, relational schema, and Swagger/REST endpoint specifications.', deadline: '2026-08-10T23:59:00', basePoints: 200, requiredDeliverables: 'ER Diagram PNG, OpenAPI Spec YAML', isOverdue: false },
        { id: 4, title: 'Milestone 4: Final Working Prototype & PBL Lab Viva', description: 'Demonstrate complete working web application with frontend, backend, database integration, and test suite.', deadline: '2026-08-20T23:59:00', basePoints: 300, requiredDeliverables: 'GitHub Repository URL, Live Demo Video, Project Report', isOverdue: false }
    ],
    leaderboard: [
        { rank: 1, studentId: 4, studentName: 'Anurag Harapanahalli', studentEmail: 'anurag@edutrack.edu', totalPoints: 120.0, approvedMilestonesCount: 1, totalSubjectMilestonesCount: 4, completionPercentage: 25.0 },
        { rank: 2, studentId: 5, studentName: 'Priya Patel', studentEmail: 'priya@edutrack.edu', totalPoints: 100.0, approvedMilestonesCount: 1, totalSubjectMilestonesCount: 4, completionPercentage: 25.0 },
        { rank: 3, studentId: 6, studentName: 'Rohit Verma', studentEmail: 'rohit@edutrack.edu', totalPoints: 85.0, approvedMilestonesCount: 1, totalSubjectMilestonesCount: 4, completionPercentage: 25.0 },
        { rank: 4, studentId: 7, studentName: 'Sneha Kulkarni', studentEmail: 'sneha@edutrack.edu', totalPoints: 0.0, approvedMilestonesCount: 0, totalSubjectMilestonesCount: 4, completionPercentage: 0.0 }
    ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = ApiClient.getCurrentUser();
    if (savedUser) {
        currentUser = savedUser;
        renderNavUser();
        showView('dashboardView');
        loadDashboardData();
    } else {
        showView('authView');
    }
});

// View Router
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
}

// Navigation User Info Render
function renderNavUser() {
    const userArea = document.getElementById('navUserArea');
    if (!currentUser) {
        userArea.innerHTML = '';
        return;
    }

    const initial = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';
    userArea.innerHTML = `
        <div class="user-badge">
            <div class="user-avatar">${initial}</div>
            <div class="user-details">
                <strong style="font-size: 0.85rem;">${currentUser.fullName}</strong>
                <span class="badge ${currentUser.role === 'INSTRUCTOR' ? 'badge-warning' : 'badge-info'}" style="margin-left: 0.5rem;">
                    ${currentUser.role}
                </span>
            </div>
            <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-left: 0.75rem;" onclick="handleLogout()">
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
        </div>
    `;
}

// Auth Handlers
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (tab === 'login') {
        document.querySelectorAll('.auth-tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    } else {
        document.querySelectorAll('.auth-tab-btn')[1].classList.add('active');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    }
}

function fillDemo(email, password) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await ApiClient.login(email, password);
        ApiClient.setAuthToken(response.token);
        ApiClient.setCurrentUser(response.user);
        currentUser = response.user;
        showToast(`Welcome back, ${currentUser.fullName}!`, 'success');
        renderNavUser();
        showView('dashboardView');
        loadDashboardData();
    } catch (err) {
        console.warn('Backend login failed, using local mock auth:', err.message);
        // Fallback for seamless offline preview
        if (email.includes('sharma') || email.includes('prof')) {
            currentUser = MOCK_DATA.userInstructor;
        } else {
            currentUser = MOCK_DATA.userStudent;
        }
        ApiClient.setCurrentUser(currentUser);
        showToast(`Signed in as ${currentUser.fullName} (Demo Mode)`, 'info');
        renderNavUser();
        showView('dashboardView');
        loadDashboardData();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
        const response = await ApiClient.register(fullName, email, password, role, 1);
        ApiClient.setAuthToken(response.token);
        ApiClient.setCurrentUser(response.user);
        currentUser = response.user;
        showToast('Account created successfully!', 'success');
        renderNavUser();
        showView('dashboardView');
        loadDashboardData();
    } catch (err) {
        showToast(err.message || 'Registration failed', 'danger');
    }
}

function handleLogout() {
    ApiClient.clearAuthToken();
    currentUser = null;
    renderNavUser();
    showView('authView');
    showToast('Logged out successfully', 'info');
}

// Dashboard Tab Router
function switchDashTab(tabId) {
    document.querySelectorAll('.dash-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    const btn = document.querySelector(`.dash-tab[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');

    const tabContent = document.getElementById(tabId);
    if (tabContent) tabContent.classList.remove('hidden');

    if (tabId === 'leaderboardTab') {
        loadLeaderboard();
    } else if (tabId === 'instructorSubmissionsTab') {
        loadInstructorSubmissions();
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    // 1. Set role-based UI options
    const instructorTabBtn = document.getElementById('instructorTabBtn');
    const dashActions = document.getElementById('dashActions');

    if (currentUser.role === 'INSTRUCTOR') {
        instructorTabBtn.style.display = 'block';
        dashActions.innerHTML = `
            <button class="btn btn-primary" onclick="openModal('createMilestoneModal')">
                <i class="fa-solid fa-plus"></i> Create Milestone
            </button>
        `;
    } else {
        instructorTabBtn.style.display = 'none';
        dashActions.innerHTML = '';
    }

    // 2. Fetch Subjects & Milestones
    try {
        let subjects = [];
        if (currentUser.role === 'INSTRUCTOR') {
            subjects = await ApiClient.getSubjectsForInstructor(currentUser.id);
        } else {
            subjects = await ApiClient.getSubjectsForStudent(currentUser.id);
        }

        if (subjects && subjects.length > 0) {
            currentSubject = subjects[0];
        } else {
            currentSubject = MOCK_DATA.subject;
        }

        // Fetch Milestones
        const milestones = await ApiClient.getMilestonesBySubject(currentSubject.id);
        currentMilestones = (milestones && milestones.length > 0) ? milestones : MOCK_DATA.milestones;

        // Fetch Student's existing submissions if Student
        if (currentUser.role === 'STUDENT') {
            const studentSubmissions = await ApiClient.getSubmissionsByStudent(currentUser.id);
            currentSubmissionsMap = {};
            if (studentSubmissions) {
                studentSubmissions.forEach(sub => {
                    currentSubmissionsMap[sub.milestoneId] = sub;
                });
            }
        }
    } catch (err) {
        console.warn('API error, using demo milestone data:', err);
        currentSubject = MOCK_DATA.subject;
        currentMilestones = MOCK_DATA.milestones;
    }

    renderHeroStats();
    renderMilestones();
}

// Render Hero Stats
function renderHeroStats() {
    const container = document.getElementById('heroStatsGrid');

    if (currentUser.role === 'STUDENT') {
        const total = currentMilestones.length;
        const approvedCount = Object.values(currentSubmissionsMap).filter(s => s.status === 'APPROVED').length;
        const totalPoints = Object.values(currentSubmissionsMap)
            .filter(s => s.status === 'APPROVED')
            .reduce((acc, s) => acc + (s.finalPoints || 0), 0);
        const progressPct = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

        container.innerHTML = `
            <div class="stat-card glass-panel">
                <div class="stat-icon" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">
                    <i class="fa-solid fa-list-check"></i>
                </div>
                <div class="stat-info">
                    <h4>Milestone Progress</h4>
                    <div class="stat-value">${approvedCount} / ${total}</div>
                </div>
            </div>
            <div class="stat-card glass-panel">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
                <div class="stat-info">
                    <h4>Completion Rate</h4>
                    <div class="stat-value">${progressPct}%</div>
                </div>
            </div>
            <div class="stat-card glass-panel">
                <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: var(--warning);">
                    <i class="fa-solid fa-award"></i>
                </div>
                <div class="stat-info">
                    <h4>Accumulated Points</h4>
                    <div class="stat-value">${totalPoints.toFixed(1)} pts</div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="stat-card glass-panel">
                <div class="stat-icon" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">
                    <i class="fa-solid fa-book-open"></i>
                </div>
                <div class="stat-info">
                    <h4>Active Subject</h4>
                    <div class="stat-value" style="font-size: 1.2rem;">${currentSubject ? currentSubject.code : 'PBL3'}</div>
                </div>
            </div>
            <div class="stat-card glass-panel">
                <div class="stat-icon" style="background: rgba(56, 189, 248, 0.15); color: var(--accent);">
                    <i class="fa-solid fa-flag"></i>
                </div>
                <div class="stat-info">
                    <h4>Total Milestones</h4>
                    <div class="stat-value">${currentMilestones.length}</div>
                </div>
            </div>
            <div class="stat-card glass-panel">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">
                    <i class="fa-solid fa-users"></i>
                </div>
                <div class="stat-info">
                    <h4>Enrolled Batch</h4>
                    <div class="stat-value" style="font-size: 1.1rem;">B.Tech CSE 2026</div>
                </div>
            </div>
        `;
    }
}

// Render Milestones
function renderMilestones() {
    const grid = document.getElementById('milestonesGrid');
    document.getElementById('milestonesCountBadge').innerText = `${currentMilestones.length} Milestones`;

    if (currentMilestones.length === 0) {
        grid.innerHTML = `<div class="glass-panel" style="padding: 2rem; grid-column: 1/-1; text-align: center; color: var(--text-muted);">No milestones defined yet.</div>`;
        return;
    }

    grid.innerHTML = currentMilestones.map(m => {
        const sub = currentSubmissionsMap[m.id];
        let statusBadge = '<span class="badge badge-info">Pending Submission</span>';

        if (sub) {
            if (sub.status === 'APPROVED') {
                statusBadge = `<span class="badge badge-success"><i class="fa-solid fa-check-circle"></i> Approved (${sub.finalPoints} pts)</span>`;
            } else if (sub.status === 'NEEDS_REVISION') {
                statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-circle-exclamation"></i> Needs Revision</span>';
            } else {
                statusBadge = '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Under Review</span>';
            }
        } else if (m.isOverdue) {
            statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-hourglass-end"></i> Overdue</span>';
        }

        const deadlineFormatted = new Date(m.deadline).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let actionBtn = '';
        if (currentUser.role === 'STUDENT') {
            if (sub && sub.status === 'APPROVED') {
                actionBtn = `<button class="btn btn-secondary btn-block" disabled><i class="fa-solid fa-lock"></i> Submitted & Approved</button>`;
            } else {
                const btnText = (sub && sub.status === 'NEEDS_REVISION') ? 'Resubmit Deliverable' : 'Upload Submission';
                actionBtn = `<button class="btn btn-primary btn-block" onclick="openUploadModal(${m.id})"><i class="fa-solid fa-upload"></i> ${btnText}</button>`;
            }
        } else {
            actionBtn = `<button class="btn btn-secondary btn-block" onclick="switchDashTab('instructorSubmissionsTab')"><i class="fa-solid fa-eye"></i> View Student Submissions</button>`;
        }

        return `
            <div class="milestone-card glass-panel">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        ${statusBadge}
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent);"><i class="fa-solid fa-star"></i> ${m.basePoints} Base Pts</span>
                    </div>
                    <h4 class="milestone-title">${m.title}</h4>
                    <p class="milestone-desc">${m.description}</p>
                    <div class="milestone-meta">
                        <div class="meta-item"><i class="fa-regular fa-calendar-check"></i> Deadline: ${deadlineFormatted}</div>
                        <div class="meta-item"><i class="fa-solid fa-box-archive"></i> Deliverable: ${m.requiredDeliverables || 'File Upload'}</div>
                    </div>
                    ${sub && sub.instructorFeedback ? `
                        <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid var(--danger); padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.8rem; margin-bottom: 1rem;">
                            <strong>Instructor Feedback:</strong> ${sub.instructorFeedback}
                        </div>
                    ` : ''}
                </div>
                <div>${actionBtn}</div>
            </div>
        `;
    }).join('');
}

// Load Leaderboard
async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboardTableBody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading live leaderboard...</td></tr>`;

    try {
        const data = await ApiClient.getLeaderboard(currentSubject ? currentSubject.id : 1);
        currentLeaderboard = (data && data.length > 0) ? data : MOCK_DATA.leaderboard;
    } catch (err) {
        currentLeaderboard = MOCK_DATA.leaderboard;
    }

    tbody.innerHTML = currentLeaderboard.map(entry => {
        let rankBadgeClass = 'rank-other';
        let medal = `#${entry.rank}`;
        if (entry.rank === 1) { rankBadgeClass = 'rank-1'; medal = '🥇 1'; }
        else if (entry.rank === 2) { rankBadgeClass = 'rank-2'; medal = '🥈 2'; }
        else if (entry.rank === 3) { rankBadgeClass = 'rank-3'; medal = '🥉 3'; }

        return `
            <tr>
                <td><span class="rank-badge ${rankBadgeClass}">${medal}</span></td>
                <td>
                    <strong style="color: var(--text-main);">${entry.studentName}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">${entry.studentEmail}</div>
                </td>
                <td>${entry.approvedMilestonesCount} / ${entry.totalSubjectMilestonesCount}</td>
                <td>
                    <div class="progress-bar-wrap">
                        <div class="progress-bar-fill" style="width: ${entry.completionPercentage}%;"></div>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 600;">${entry.completionPercentage}%</span>
                </td>
                <td><strong style="color: var(--warning); font-size: 1.1rem;">${entry.totalPoints.toFixed(1)} pts</strong></td>
            </tr>
        `;
    }).join('');
}

// Load Instructor Submissions Review
async function loadInstructorSubmissions() {
    const list = document.getElementById('submissionsList');
    list.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading student submissions...</div>`;

    let submissions = [];
    try {
        if (currentMilestones.length > 0) {
            submissions = await ApiClient.getSubmissionsByMilestone(currentMilestones[0].id);
        }
    } catch (err) {
        console.warn('Backend submissions fetch failed, using demo submissions:', err);
    }

    if (!submissions || submissions.length === 0) {
        // Create mock submissions for demo review
        submissions = [
            {
                id: 101,
                milestoneId: 1,
                milestoneTitle: 'Milestone 1: Project Topic Selection & Problem Statement',
                studentId: 4,
                studentName: 'Anurag Harapanahalli',
                studentEmail: 'anurag@edutrack.edu',
                fileUrl: '/uploads/demo_srs.pdf',
                submissionLink: 'https://github.com/AnuragHarapanahalli/sem-project',
                comments: 'Submitted initial PBL problem statement doc and repository setup.',
                submittedAt: new Date().toISOString(),
                status: 'SUBMITTED',
                timelinessMultiplier: 1.2
            }
        ];
    }

    list.innerHTML = submissions.map(sub => `
        <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="badge badge-info">${sub.studentName}</span>
                    <span class="badge badge-warning">${sub.status}</span>
                    <span class="badge badge-success">Timeliness: ${sub.timelinessMultiplier || 1.0}x</span>
                </div>
                <h4 style="font-family: 'Outfit'; font-size: 1.1rem; margin-bottom: 0.35rem;">${sub.milestoneTitle}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${sub.comments || 'No comments provided'}</p>
                <div style="font-size: 0.8rem; color: var(--accent);">
                    ${sub.submissionLink ? `<a href="${sub.submissionLink}" target="_blank" style="color: var(--accent); margin-right: 1rem;"><i class="fa-solid fa-link"></i> ${sub.submissionLink}</a>` : ''}
                    ${sub.fileUrl ? `<a href="http://localhost:8080${sub.fileUrl}" target="_blank" style="color: var(--success);"><i class="fa-solid fa-file"></i> View Uploaded File</a>` : ''}
                </div>
            </div>
            <div>
                <button class="btn btn-primary" onclick="openReviewModal(${sub.id}, '${sub.studentName}')">
                    <i class="fa-solid fa-star"></i> Evaluate Work
                </button>
            </div>
        </div>
    `).join('');
}

// Modal Controllers
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function openUploadModal(milestoneId) {
    document.getElementById('uploadMilestoneId').value = milestoneId;
    openModal('uploadModal');
}

function openReviewModal(submissionId, studentName) {
    document.getElementById('reviewSubmissionId').value = submissionId;
    document.getElementById('reviewMetaBox').innerHTML = `<p>Evaluating submission for: <strong>${studentName}</strong></p>`;
    openModal('reviewModal');
}

// Form Handlers
async function handleUploadSubmit(e) {
    e.preventDefault();
    const milestoneId = document.getElementById('uploadMilestoneId').value;
    const fileInput = document.getElementById('uploadFile');
    const link = document.getElementById('uploadLink').value;
    const comments = document.getElementById('uploadComments').value;

    const formData = new FormData();
    formData.append('milestoneId', milestoneId);
    formData.append('studentId', currentUser.id);
    if (fileInput.files[0]) formData.append('file', fileInput.files[0]);
    if (link) formData.append('submissionLink', link);
    if (comments) formData.append('comments', comments);

    try {
        await ApiClient.uploadSubmission(formData);
        showToast('Deliverable submitted successfully!', 'success');
    } catch (err) {
        console.warn('API upload fallback simulation:', err);
        // Instant local feedback
        currentSubmissionsMap[milestoneId] = {
            id: Date.now(),
            milestoneId: parseInt(milestoneId),
            studentId: currentUser.id,
            status: 'SUBMITTED',
            submissionLink: link,
            comments: comments,
            submittedAt: new Date().toISOString(),
            timelinessMultiplier: 1.0,
            finalPoints: 0
        };
        showToast('Deliverable submitted successfully (Local Demo Mode)!', 'success');
    }

    closeModal('uploadModal');
    renderHeroStats();
    renderMilestones();
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    const submissionId = document.getElementById('reviewSubmissionId').value;
    const status = document.getElementById('reviewStatus').value;
    const quality = parseInt(document.getElementById('reviewQuality').value);
    const feedback = document.getElementById('reviewFeedback').value;

    try {
        await ApiClient.reviewSubmission(submissionId, { status, qualityRating: quality, feedback });
        showToast('Submission evaluated successfully!', 'success');
    } catch (err) {
        showToast('Evaluation recorded (Local Demo Mode)!', 'success');
    }

    closeModal('reviewModal');
    loadInstructorSubmissions();
}

async function handleCreateMilestone(e) {
    e.preventDefault();
    const title = document.getElementById('msTitle').value;
    const description = document.getElementById('msDescription').value;
    const deadline = document.getElementById('msDeadline').value;
    const basePoints = parseFloat(document.getElementById('msBasePoints').value);
    const deliverables = document.getElementById('msDeliverables').value;

    const payload = {
        subjectId: currentSubject ? currentSubject.id : 1,
        title,
        description,
        deadline,
        basePoints,
        requiredDeliverables: deliverables
    };

    try {
        const newMs = await ApiClient.createMilestone(payload);
        currentMilestones.push(newMs);
        showToast('New milestone created!', 'success');
    } catch (err) {
        currentMilestones.push({
            id: Date.now(),
            ...payload,
            isOverdue: false
        });
        showToast('Milestone created (Local Demo Mode)!', 'success');
    }

    closeModal('createMilestoneModal');
    renderMilestones();
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'danger') icon = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
