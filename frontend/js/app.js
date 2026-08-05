/**
 * EduTrack Enterprise Controller
 * Multi-Deliverable Management, Sequential Milestone Progression & Dedicated Dashboard
 */

// Application State
let currentUser = null;
let userSubjects = [];
let currentSubject = null;
let currentMilestones = [];
let currentSubmissionsMap = {};
let currentRosterList = [];
let selectedRosterMilestoneId = null;
let selectedExcelFile = null;
let isSidebarOpen = true;

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

// Hamburger Sidebar Drawer Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar') || document.getElementById('gcSidebar');
    const wrapper = document.getElementById('mainWrapper') || document.getElementById('gcMainContainer');
    const backdrop = document.getElementById('sidebarBackdrop') || document.getElementById('gcSidebarBackdrop');

    if (window.innerWidth <= 900) {
        if (sidebar) sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('hidden');
    } else {
        isSidebarOpen = !isSidebarOpen;
        if (sidebar) {
            if (isSidebarOpen) {
                sidebar.classList.remove('collapsed');
                sidebar.classList.add('open');
            } else {
                sidebar.classList.add('collapsed');
                sidebar.classList.remove('open');
            }
        }
        if (wrapper) {
            if (isSidebarOpen) wrapper.classList.remove('expanded');
            else wrapper.classList.add('expanded');
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar') || document.getElementById('gcSidebar');
    const wrapper = document.getElementById('mainWrapper') || document.getElementById('gcMainContainer');
    const backdrop = document.getElementById('sidebarBackdrop') || document.getElementById('gcSidebarBackdrop');

    isSidebarOpen = false;
    if (sidebar) {
        sidebar.classList.remove('open');
        sidebar.classList.add('collapsed');
    }
    if (wrapper) wrapper.classList.add('expanded');
    if (backdrop) backdrop.classList.add('hidden');
}

// Sidebar Navigation Link Handler
function navToTab(tabId) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    const targetPane = document.getElementById(tabId);
    if (targetPane) targetPane.classList.remove('hidden');

    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarBackdrop').classList.add('hidden');
    }

    if (tabId === 'dashboardTab') {
        renderSubjectsGrid();
        renderMilestoneFlow();
    } else if (tabId === 'milestonesTab') {
        renderMilestoneFlow();
    } else if (tabId === 'leaderboardTab') {
        loadLeaderboard();
    } else if (tabId === 'instructorSubmissionsTab') {
        loadInstructorSubmissionsRoster();
    }
}

// View Router
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
        sec.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

// Render User Details in Header and Sidebar Footer
function renderNavUser() {
    const headerUserPod = document.getElementById('headerUserPod');
    const sidebarFooter = document.getElementById('sidebarFooter');

    if (!currentUser) {
        headerUserPod.innerHTML = '';
        sidebarFooter.innerHTML = '';
        return;
    }

    const initial = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';

    headerUserPod.innerHTML = `
        <div class="user-avatar-circle">${initial}</div>
        <div style="font-size: 0.85rem; font-weight: 700;">${currentUser.fullName}</div>
        <span class="badge ${currentUser.role === 'INSTRUCTOR' ? 'badge-warning' : 'badge-primary'}">${currentUser.role}</span>
    `;

    sidebarFooter.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
                <div class="user-avatar-circle">${initial}</div>
                <div>
                    <strong style="font-size: 0.82rem; color: var(--text-main); display: block;">${currentUser.fullName}</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${currentUser.email}</span>
                </div>
            </div>
            <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="handleLogout()" title="Sign Out">
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
        </div>
    `;
}

// Auth Tab Switcher
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
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
        showToast(err.message || 'Login failed. Ensure server is running.', 'danger');
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
    currentSubject = null;
    userSubjects = [];
    renderNavUser();
    showView('authView');
    showToast('Signed out successfully', 'info');
}

// Load Dashboard Data & Sidebar Subject Picker
async function loadDashboardData() {
    const sidebarInstructorLink = document.getElementById('sidebarInstructorLink');
    const sidebarFacultySection = document.getElementById('sidebarFacultySection');
    const roleSub = document.getElementById('dashboardRoleSubtitle');
    const gridTitle = document.getElementById('subjectsGridTitle');

    if (currentUser.role === 'INSTRUCTOR') {
        sidebarInstructorLink.classList.remove('hidden');
        sidebarFacultySection.classList.remove('hidden');
        if (roleSub) roleSub.innerText = "Faculty Portal & Managed Subjects Overview";
        if (gridTitle) gridTitle.innerHTML = `<i class="fa-solid fa-chalkboard-user"></i> Subjects Managed by You`;
    } else {
        sidebarInstructorLink.classList.add('hidden');
        sidebarFacultySection.classList.add('hidden');
        if (roleSub) roleSub.innerText = "Student Portal & Enrolled Subjects Overview";
        if (gridTitle) gridTitle.innerHTML = `<i class="fa-solid fa-book"></i> Enrolled Subjects`;
    }

    try {
        if (currentUser.role === 'INSTRUCTOR') {
            userSubjects = await ApiClient.getSubjectsForInstructor(currentUser.id);
        } else {
            userSubjects = await ApiClient.getSubjectsForStudent(currentUser.id);
        }

        renderSubjectSelector();

        if (userSubjects && userSubjects.length > 0) {
            currentSubject = userSubjects[0];
            const sidebarSelect = document.getElementById('sidebarSubjectSelect');
            if (sidebarSelect) sidebarSelect.value = currentSubject.id;
            await loadSelectedSubjectData();
        } else {
            currentSubject = null;
            currentMilestones = [];
            renderHeroStats();
            renderMilestoneFlow();
        }

        renderSubjectsGrid();
    } catch (err) {
        showToast(`Failed to load subject data: ${err.message}`, 'danger');
    }
}

// Render Sidebar Subject Selector Dropdown
function renderSubjectSelector() {
    const sidebarSelect = document.getElementById('sidebarSubjectSelect');
    const optionsHtml = (!userSubjects || userSubjects.length === 0)
        ? `<option value="">No enrolled subjects</option>`
        : userSubjects.map(s => `
            <option value="${s.id}" ${currentSubject && currentSubject.id === s.id ? 'selected' : ''}>
                ${s.code} &mdash; ${s.name}
            </option>
        `).join('');

    if (sidebarSelect) sidebarSelect.innerHTML = optionsHtml;
}

async function handleSubjectChange(subjectId) {
    const id = parseInt(subjectId);
    currentSubject = userSubjects.find(s => s.id === id);
    const sidebarSelect = document.getElementById('sidebarSubjectSelect');
    if (sidebarSelect) sidebarSelect.value = id;

    await loadSelectedSubjectData();
    closeSidebar();
}

async function loadSelectedSubjectData() {
    if (!currentSubject) return;

    try {
        currentMilestones = await ApiClient.getMilestonesBySubject(currentSubject.id);

        if (currentUser.role === 'STUDENT') {
            const studentSubmissions = await ApiClient.getSubmissionsByStudent(currentUser.id);
            currentSubmissionsMap = {};
            if (studentSubmissions) {
                studentSubmissions.forEach(sub => {
                    currentSubmissionsMap[sub.milestoneId] = sub;
                });
            }
            renderStudentUpcomingDeadlines();
        }
    } catch (err) {
        showToast(`Error fetching milestones: ${err.message}`, 'danger');
    }

    renderHeroStats();
    renderMilestoneFlow();

    const activeLink = document.querySelector('.sidebar-link.active');
    if (activeLink) {
        const tabId = activeLink.getAttribute('data-tab');
        if (tabId === 'leaderboardTab') loadLeaderboard();
        else if (tabId === 'instructorSubmissionsTab') loadInstructorSubmissionsRoster();
    }
}

// Render Subjects List Grid on Dedicated Overview Dashboard Tab
function renderSubjectsGrid() {
    const grid = document.getElementById('subjectsListGrid');
    if (!grid) return;

    if (!userSubjects || userSubjects.length === 0) {
        grid.innerHTML = `<div class="card" style="padding: 2rem; grid-column: 1/-1; text-align: center; color: var(--text-muted);">No subjects assigned to your account.</div>`;
        return;
    }

    grid.innerHTML = userSubjects.map(s => {
        const isCurrent = currentSubject && currentSubject.id === s.id;
        const buttonLabel = currentUser.role === 'INSTRUCTOR' ? 'Manage Subject' : 'Launch Subject';
        
        return `
            <div class="subject-card">
                <div>
                    <span class="subject-card-code">${s.code}</span>
                    <h4 class="subject-card-title">${s.name}</h4>
                    <p class="subject-card-desc">${s.description || 'No description provided.'}</p>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
                        <span><i class="fa-solid fa-chalkboard-user"></i> Faculty: ${s.instructorName}</span> | 
                        <span><i class="fa-solid fa-flag"></i> ${s.totalMilestones || 0} Milestones</span>
                    </div>
                </div>
                <div>
                    <button class="btn ${isCurrent ? 'btn-primary' : 'btn-outline'} btn-block" onclick="selectAndLaunchSubject(${s.id})">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> ${buttonLabel} ${isCurrent ? '(Active)' : ''}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function selectAndLaunchSubject(subjectId) {
    await handleSubjectChange(subjectId);
    navToTab('milestonesTab');
}

// Student Deadlines Widget
function renderStudentUpcomingDeadlines() {
    const panel = document.getElementById('studentDeadlinesPanel');
    const list = document.getElementById('upcomingDeadlinesList');
    const badge = document.getElementById('upcomingCountBadge');

    if (currentUser.role !== 'STUDENT') {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');

    if (!currentMilestones || currentMilestones.length === 0) {
        list.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No upcoming deadlines.</p>`;
        badge.innerText = '0 Pending';
        return;
    }

    const now = new Date();
    const upcoming = currentMilestones.filter(m => {
        const sub = currentSubmissionsMap[m.id];
        return !sub || sub.status !== 'APPROVED';
    });

    badge.innerText = `${upcoming.length} Pending`;

    list.innerHTML = upcoming.map(m => {
        const deadline = new Date(m.deadline);
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        let tagClass = 'badge-primary';
        let label = `Due in ${diffDays} days`;

        if (diffDays < 0) {
            tagClass = 'badge-danger';
            label = 'Overdue';
        } else if (diffDays === 0) {
            tagClass = 'badge-warning';
            label = 'Due Today';
        }

        const deadlineFormatted = deadline.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
            <div class="deadline-item-card">
                <div>
                    <h5 style="font-size: 0.88rem; font-weight: 700;">${m.title}</h5>
                    <p style="font-size: 0.78rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${deadlineFormatted}</p>
                </div>
                <span class="badge ${tagClass}">${label}</span>
            </div>
        `;
    }).join('');
}

// Stats Cards Grid
async function renderHeroStats() {
    const container = document.getElementById('heroStatsGrid');

    if (currentUser.role === 'STUDENT' && currentSubject) {
        try {
            const leaderboard = await ApiClient.getLeaderboard(currentSubject.id);
            const myEntry = leaderboard ? leaderboard.find(e => e.studentId === currentUser.id) : null;

            const approvedCount = myEntry ? myEntry.approvedMilestonesCount : 0;
            const total = myEntry ? myEntry.totalSubjectMilestonesCount : currentMilestones.length;
            const completionPct = myEntry ? myEntry.completionPercentage : 0;
            const totalPoints = myEntry ? myEntry.totalPoints : 0.0;

            container.innerHTML = `
                <div class="stat-card card">
                    <div class="stat-icon-pod" style="background: var(--primary-light); color: var(--primary);">
                        <i class="fa-solid fa-list-check"></i>
                    </div>
                    <div class="stat-info-box">
                        <h4>Milestones Approved</h4>
                        <div class="stat-num">${approvedCount} / ${total}</div>
                    </div>
                </div>
                <div class="stat-card card">
                    <div class="stat-icon-pod" style="background: var(--success-light); color: var(--success);">
                        <i class="fa-solid fa-chart-line"></i>
                    </div>
                    <div class="stat-info-box">
                        <h4>Completion Rate</h4>
                        <div class="stat-num">${completionPct}%</div>
                    </div>
                </div>
                <div class="stat-card card">
                    <div class="stat-icon-pod" style="background: var(--warning-light); color: var(--warning);">
                        <i class="fa-solid fa-award"></i>
                    </div>
                    <div class="stat-info-box">
                        <h4>Total Points</h4>
                        <div class="stat-num">${totalPoints.toFixed(1)} pts</div>
                    </div>
                </div>
            `;
            return;
        } catch (e) {
            console.warn("Could not fetch student stats:", e);
        }
    }

    container.innerHTML = `
        <div class="stat-card card">
            <div class="stat-icon-pod" style="background: var(--primary-light); color: var(--primary);">
                <i class="fa-solid fa-book-open"></i>
            </div>
            <div class="stat-info-box">
                <h4>Active Subject</h4>
                <div class="stat-num" style="font-size: 1.25rem;">${currentSubject ? currentSubject.code : 'No Subject'}</div>
            </div>
        </div>
        <div class="stat-card card">
            <div class="stat-icon-pod" style="background: var(--accent-light); color: var(--accent);">
                <i class="fa-solid fa-diagram-next"></i>
            </div>
            <div class="stat-info-box">
                <h4>Total Milestones</h4>
                <div class="stat-num">${currentMilestones.length}</div>
            </div>
        </div>
        <div class="stat-card card">
            <div class="stat-icon-pod" style="background: var(--success-light); color: var(--success);">
                <i class="fa-solid fa-users"></i>
            </div>
            <div class="stat-info-box">
                <h4>Enrolled Batch</h4>
                <div class="stat-num" style="font-size: 1.1rem;">${currentSubject ? currentSubject.batchName : 'Batch'}</div>
            </div>
        </div>
    `;
}

// Milestone Connected Flow Pathway with STRICT SEQUENTIAL PROGRESSION
function renderMilestoneFlow() {
    const wrapper = document.getElementById('milestonesFlowWrapper');
    const dashWrapper = document.getElementById('dashMilestonesFlowWrapper');
    const badge = document.getElementById('milestonesCountBadge');
    const dashBadge = document.getElementById('dashMilestonesCountBadge');

    const countText = `${currentMilestones ? currentMilestones.length : 0} Milestones`;
    if (badge) badge.innerText = countText;
    if (dashBadge) dashBadge.innerText = countText;

    if (!currentMilestones || currentMilestones.length === 0) {
        const emptyHtml = `<div class="card" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">No milestones defined for this subject yet.</div>`;
        if (wrapper) wrapper.innerHTML = emptyHtml;
        if (dashWrapper) dashWrapper.innerHTML = emptyHtml;
        return;
    }

    const flowHtml = currentMilestones.map((m, idx) => {
        const sub = currentSubmissionsMap[m.id];
        const isApproved = sub && sub.status === 'APPROVED';
        const isNeedsRevision = sub && sub.status === 'NEEDS_REVISION';
        const isSubmitted = sub && sub.status === 'SUBMITTED';

        // STRICT SEQUENTIAL PROGRESSION LOCK CHECK:
        // Milestone 0 is always unlocked. Milestone idx > 0 is unlocked ONLY if Milestone idx-1 is APPROVED.
        let isLocked = false;
        if (currentUser.role === 'STUDENT' && idx > 0) {
            const prevMilestone = currentMilestones[idx - 1];
            const prevSub = currentSubmissionsMap[prevMilestone.id];
            if (!prevSub || prevSub.status !== 'APPROVED') {
                isLocked = true;
            }
        }

        let cardClass = 'milestone-flow-card';
        let statusBadge = '<span class="badge badge-primary">Pending</span>';

        if (isLocked) {
            cardClass += ' locked';
            statusBadge = '<span class="badge badge-secondary"><i class="fa-solid fa-lock"></i> Locked</span>';
        } else if (isApproved) {
            cardClass += ' completed';
            statusBadge = `<span class="badge badge-success"><i class="fa-solid fa-check-circle"></i> Completed (${sub.finalPoints} pts)</span>`;
        } else if (isNeedsRevision) {
            statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Needs Revision</span>';
        } else if (isSubmitted) {
            statusBadge = '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Under Review</span>';
        } else if (m.isOverdue) {
            statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-hourglass-end"></i> Overdue</span>';
        }

        const deadlineFormatted = new Date(m.deadline).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Parse Deliverables List
        let deliverablesFormatted = m.requiredDeliverables || 'File Upload';
        try {
            const parsed = JSON.parse(m.requiredDeliverables);
            if (Array.isArray(parsed)) {
                deliverablesFormatted = parsed.map(d => `${d.title} ${d.isMandatory ? '(Mandatory)' : '(Optional)'}`).join(', ');
            }
        } catch(e) {}

        let actionButton = '';
        if (currentUser.role === 'STUDENT') {
            if (isLocked) {
                actionButton = `<button class="btn btn-secondary" disabled><i class="fa-solid fa-lock"></i> Complete Milestone ${idx} First</button>`;
            } else if (isApproved) {
                actionButton = `<button class="btn btn-secondary" disabled><i class="fa-solid fa-circle-check"></i> Approved</button>`;
            } else {
                const btnLabel = isNeedsRevision ? 'Resubmit Deliverables' : 'Upload Deliverables';
                actionButton = `<button class="btn btn-primary" onclick="openUploadModal(${m.id})"><i class="fa-solid fa-upload"></i> ${btnLabel}</button>`;
            }
        } else {
            actionButton = `<button class="btn btn-secondary" onclick="navToTab('instructorSubmissionsTab')"><i class="fa-solid fa-eye"></i> View Roster</button>`;
        }

        const arrowConnector = (idx < currentMilestones.length - 1)
            ? `<div class="flow-arrow-pod"><i class="fa-solid fa-down-long"></i></div>`
            : '';

        return `
            <div class="flow-step-block">
                <div class="${cardClass}">
                    <div class="card-left-group">
                        <div class="step-num-badge">
                            ${isLocked ? '<i class="fa-solid fa-lock"></i>' : (isApproved ? '<i class="fa-solid fa-check"></i>' : (idx + 1))}
                        </div>
                        <div>
                            <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.35rem;">
                                ${statusBadge}
                                <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary);"><i class="fa-solid fa-star"></i> ${m.basePoints} Base Pts</span>
                            </div>
                            <h4 class="milestone-card-title">${m.title}</h4>
                            <p class="milestone-card-desc">${m.description}</p>
                            <div class="milestone-meta-row">
                                <span><i class="fa-regular fa-calendar-check"></i> Deadline: ${deadlineFormatted}</span>
                                <span><i class="fa-solid fa-boxes-stacked"></i> Deliverables: ${deliverablesFormatted}</span>
                            </div>
                            ${sub && sub.instructorFeedback ? `
                                <div style="background: var(--danger-light); border-left: 3px solid var(--danger); padding: 0.45rem 0.75rem; border-radius: 4px; font-size: 0.8rem; margin-top: 0.65rem;">
                                    <strong>Instructor Feedback:</strong> ${sub.instructorFeedback}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div>${actionButton}</div>
                </div>
                ${arrowConnector}
            </div>
        `;
    }).join('');

    if (wrapper) wrapper.innerHTML = flowHtml;
    if (dashWrapper) dashWrapper.innerHTML = flowHtml;
}

// Leaderboard
async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboardTableBody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading leaderboard...</td></tr>`;

    try {
        const leaderboard = await ApiClient.getLeaderboard(currentSubject ? currentSubject.id : 1);

        if (!leaderboard || leaderboard.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No student rankings recorded yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = leaderboard.map(entry => {
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
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${entry.studentEmail}</div>
                    </td>
                    <td>${entry.approvedMilestonesCount} / ${entry.totalSubjectMilestonesCount}</td>
                    <td>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${entry.completionPercentage}%;"></div>
                        </div>
                        <span style="font-size: 0.84rem; font-weight: 700;">${entry.completionPercentage}%</span>
                    </td>
                    <td><strong style="color: var(--warning); font-size: 1.05rem;">${entry.totalPoints.toFixed(1)} pts</strong></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger);">Error loading leaderboard: ${err.message}</td></tr>`;
    }
}

// Submissions Roster
async function loadInstructorSubmissionsRoster() {
    const select = document.getElementById('rosterMilestoneSelect');
    const tbody = document.getElementById('rosterTableBody');

    if (!currentMilestones || currentMilestones.length === 0) {
        select.innerHTML = `<option value="">No milestones available</option>`;
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No milestones in this subject.</td></tr>`;
        return;
    }

    select.innerHTML = currentMilestones.map(m => `
        <option value="${m.id}" ${selectedRosterMilestoneId === m.id ? 'selected' : ''}>${m.title}</option>
    `).join('');

    if (!selectedRosterMilestoneId || !currentMilestones.find(m => m.id === selectedRosterMilestoneId)) {
        selectedRosterMilestoneId = currentMilestones[0].id;
        select.value = selectedRosterMilestoneId;
    }

    await fetchAndRenderRoster(selectedRosterMilestoneId);
}

async function handleRosterMilestoneChange(milestoneId) {
    selectedRosterMilestoneId = parseInt(milestoneId);
    await fetchAndRenderRoster(selectedRosterMilestoneId);
}

async function fetchAndRenderRoster(milestoneId) {
    const tbody = document.getElementById('rosterTableBody');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Fetching student roster...</td></tr>`;

    try {
        currentRosterList = await ApiClient.getMilestoneRoster(milestoneId);
        renderFilteredRoster();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">Error loading roster: ${err.message}</td></tr>`;
    }
}

function renderFilteredRoster() {
    const tbody = document.getElementById('rosterTableBody');
    const searchVal = document.getElementById('rosterSearchInput').value.toLowerCase().trim();
    const sortVal = document.getElementById('rosterSortSelect').value;

    if (!currentRosterList || currentRosterList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No enrolled students found.</td></tr>`;
        return;
    }

    let filtered = currentRosterList.filter(item => {
        return item.studentName.toLowerCase().includes(searchVal) ||
               item.studentEmail.toLowerCase().includes(searchVal) ||
               item.status.toLowerCase().includes(searchVal) ||
               (item.timelinessLabel && item.timelinessLabel.toLowerCase().includes(searchVal));
    });

    filtered.sort((a, b) => {
        if (sortVal === 'name') {
            return a.studentName.localeCompare(b.studentName);
        } else if (sortVal === 'submittedAt') {
            if (!a.submittedAt) return 1;
            if (!b.submittedAt) return -1;
            return new Date(b.submittedAt) - new Date(a.submittedAt);
        } else if (sortVal === 'status') {
            return a.status.localeCompare(b.status);
        } else if (sortVal === 'timeliness') {
            return (b.timelinessMultiplier || 0) - (a.timelinessMultiplier || 0);
        }
        return 0;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No matching students found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        let statusBadge = '<span class="badge badge-secondary">Not Submitted</span>';
        if (item.status === 'APPROVED') statusBadge = `<span class="badge badge-success">Approved (${item.finalPoints} pts)</span>`;
        else if (item.status === 'NEEDS_REVISION') statusBadge = '<span class="badge badge-danger">Needs Revision</span>';
        else if (item.status === 'SUBMITTED') statusBadge = '<span class="badge badge-warning">Submitted</span>';
        else if (item.status === 'OVERDUE') statusBadge = '<span class="badge badge-danger">Overdue</span>';

        let timeBadgeClass = 'badge-secondary';
        if (item.timelinessLabel.includes('Early')) timeBadgeClass = 'badge-success';
        else if (item.timelinessLabel.includes('On-Time')) timeBadgeClass = 'badge-primary';
        else if (item.timelinessLabel.includes('Delayed') || item.timelinessLabel.includes('Late')) timeBadgeClass = 'badge-warning';

        const submittedDateFormatted = item.submittedAt 
            ? new Date(item.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '&mdash;';

        const fileLink = item.fileUrl ? `<a href="http://localhost:8080${item.fileUrl}" target="_blank" class="btn btn-outline" style="padding:0.25rem 0.55rem; font-size:0.75rem;"><i class="fa-solid fa-download"></i> File</a>` : '';
        const repoLink = item.submissionLink ? `<a href="${item.submissionLink}" target="_blank" class="btn btn-outline" style="padding:0.25rem 0.55rem; font-size:0.75rem;"><i class="fa-solid fa-link"></i> Repo</a>` : '';

        const actionBtn = item.submissionId 
            ? `<button class="btn btn-primary" style="padding:0.3rem 0.65rem; font-size:0.78rem;" onclick="openReviewModal(${item.submissionId}, '${item.studentName}')"><i class="fa-solid fa-star"></i> Grade</button>`
            : `<span style="font-size:0.78rem; color:var(--text-muted);">No submission</span>`;

        return `
            <tr>
                <td>
                    <strong>${item.studentName}</strong>
                    <div style="font-size: 0.76rem; color: var(--text-muted);">${item.studentEmail}</div>
                </td>
                <td>${statusBadge}</td>
                <td>${submittedDateFormatted}</td>
                <td><span class="badge ${timeBadgeClass}">${item.timelinessLabel}</span></td>
                <td>${fileLink} ${repoLink}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

// Modals
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
    if (id === 'createMilestoneModal') {
        initDeliverableRows();
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

// Dynamic Multi-Deliverable Input Rows in Create Milestone Modal
function initDeliverableRows() {
    const container = document.getElementById('deliverablesInputContainer');
    if (container.children.length === 0) {
        container.innerHTML = '';
        addDeliverableInputRow('Project Report / Documentation PDF', true);
        addDeliverableInputRow('GitHub Repository URL', true);
    }
}

function addDeliverableInputRow(title = '', isMandatory = true) {
    const container = document.getElementById('deliverablesInputContainer');
    const row = document.createElement('div');
    row.className = 'deliverable-row-item';
    row.innerHTML = `
        <input type="text" class="deliverable-title-input" placeholder="e.g. SRS Document PDF" value="${title}" required>
        <label class="checkbox-label" style="font-size:0.78rem; white-space:nowrap;">
            <input type="checkbox" class="deliverable-mandatory-check" ${isMandatory ? 'checked' : ''}>
            <span>Mandatory</span>
        </label>
        <button type="button" class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    container.appendChild(row);
}

// Student Open Upload Modal with Separate Upload Section per Deliverable Item
function openUploadModal(milestoneId) {
    document.getElementById('uploadMilestoneId').value = milestoneId;
    const milestone = currentMilestones.find(m => m.id === milestoneId);
    
    const container = document.getElementById('deliverableSectionsContainer');
    let deliverables = [];

    if (milestone && milestone.requiredDeliverables) {
        try {
            const parsed = JSON.parse(milestone.requiredDeliverables);
            if (Array.isArray(parsed)) deliverables = parsed;
        } catch(e) {
            deliverables = [{ title: milestone.requiredDeliverables, isMandatory: true }];
        }
    } else {
        deliverables = [{ title: 'Main Project Deliverable File', isMandatory: true }];
    }

    container.innerHTML = deliverables.map((d, i) => `
        <div class="deliverable-upload-box">
            <div class="deliverable-upload-header">
                <span class="deliverable-upload-title">
                    <i class="fa-solid fa-box"></i> Deliverable ${i+1}: ${d.title}
                </span>
                ${d.isMandatory ? '<span class="mandatory-badge">Mandatory</span>' : '<span class="optional-badge">Optional</span>'}
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
                <label style="font-size:0.78rem;">Upload File</label>
                <div class="drop-zone" style="padding:0.85rem;">
                    <input type="file" class="drop-zone-input" name="file_${i}">
                    <i class="fa-solid fa-cloud-arrow-up drop-zone-icon" style="font-size:1.2rem;"></i>
                    <span style="font-size:0.8rem;">Click to select deliverable file</span>
                </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:0.78rem;">OR Repository / Video URL</label>
                <input type="url" name="link_${i}" placeholder="https://github.com/username/project" style="padding:0.45rem 0.75rem; font-size:0.82rem;">
            </div>
        </div>
    `).join('');

    openModal('uploadModal');
}

function openReviewModal(submissionId, studentName) {
    document.getElementById('reviewSubmissionId').value = submissionId;
    document.getElementById('reviewMetaBox').innerHTML = `Evaluating submission for: <strong>${studentName}</strong>`;
    openModal('reviewModal');
}

function switchImportTab(tab) {
    if (tab === 'manual') {
        document.getElementById('btnManualTab').classList.add('active');
        document.getElementById('btnExcelTab').classList.remove('active');
        document.getElementById('manualStudentForm').classList.remove('hidden');
        document.getElementById('excelImportSection').classList.add('hidden');
    } else {
        document.getElementById('btnManualTab').classList.remove('active');
        document.getElementById('btnExcelTab').classList.add('active');
        document.getElementById('manualStudentForm').classList.add('hidden');
        document.getElementById('excelImportSection').classList.remove('hidden');
    }
}

function downloadStudentTemplate() {
    const csvContent = "FullName,Email\nJohn Doe,johndoe@edutrack.edu\nJane Smith,janesmith@edutrack.edu\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "EduTrack_Student_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded CSV Template', 'info');
}

function handleExcelFileSelected(e) {
    if (e.target.files[0]) {
        selectedExcelFile = e.target.files[0];
        document.getElementById('excelFileLabel').innerText = selectedExcelFile.name;
    }
}

async function processExcelImport() {
    if (!selectedExcelFile) {
        showToast('Please select a CSV or Excel file first.', 'danger');
        return;
    }
    if (!currentSubject) {
        showToast('No active subject selected.', 'danger');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/);
        let addedCount = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const email = parts[1].trim();
                if (name && email) {
                    try {
                        await ApiClient.addStudentToSubjectManual(currentSubject.id, name, email);
                        addedCount++;
                    } catch (err) {}
                }
            }
        }

        showToast(`Imported ${addedCount} students to ${currentSubject.code}!`, 'success');
        closeModal('addStudentsModal');
        loadSelectedSubjectData();
    };
    reader.readAsText(selectedExcelFile);
}

// Form Handlers
async function handleCreateSubject(e) {
    e.preventDefault();
    const name = document.getElementById('subjName').value;
    const code = document.getElementById('subjCode').value;
    const description = document.getElementById('subjDescription').value;

    try {
        const newSubj = await ApiClient.createSubject({ name, code, batchId: 1, description }, currentUser.id);
        showToast(`Subject '${newSubj.code}' created!`, 'success');
        closeModal('createSubjectModal');
        currentSubject = newSubj;
        await loadDashboardData();
    } catch (err) {
        showToast(`Failed: ${err.message}`, 'danger');
    }
}

async function handleManualStudentSubmit(e) {
    e.preventDefault();
    if (!currentSubject) {
        showToast('No active subject selected.', 'danger');
        return;
    }

    const fullName = document.getElementById('stFullName').value;
    const email = document.getElementById('stEmail').value;

    try {
        await ApiClient.addStudentToSubjectManual(currentSubject.id, fullName, email);
        showToast(`Added ${fullName} to ${currentSubject.code}!`, 'success');
        closeModal('addStudentsModal');
        loadSelectedSubjectData();
    } catch (err) {
        showToast(`Failed: ${err.message}`, 'danger');
    }
}

async function handleCreateMilestone(e) {
    e.preventDefault();
    const title = document.getElementById('msTitle').value;
    const description = document.getElementById('msDescription').value;
    const deadline = document.getElementById('msDeadline').value;
    const basePoints = parseFloat(document.getElementById('msBasePoints').value);

    // Read Dynamic Multi-Deliverable Rows
    const rows = document.querySelectorAll('.deliverable-row-item');
    const deliverablesList = [];

    rows.forEach(r => {
        const titleVal = r.querySelector('.deliverable-title-input').value.trim();
        const mandatoryVal = r.querySelector('.deliverable-mandatory-check').checked;
        if (titleVal) {
            deliverablesList.push({ title: titleVal, isMandatory: mandatoryVal });
        }
    });

    if (deliverablesList.length === 0) {
        showToast('Please add at least one deliverable item.', 'danger');
        return;
    }

    if (!currentSubject) {
        showToast('Select or create a subject first.', 'danger');
        return;
    }

    try {
        await ApiClient.createMilestone({
            subjectId: currentSubject.id,
            title,
            description,
            deadline,
            basePoints,
            requiredDeliverables: JSON.stringify(deliverablesList),
            isMandatory: deliverablesList.some(d => d.isMandatory)
        });
        showToast('Milestone created with deliverables!', 'success');
        closeModal('createMilestoneModal');
        loadSelectedSubjectData();
    } catch (err) {
        showToast(`Failed: ${err.message}`, 'danger');
    }
}

async function handleUploadSubmit(e) {
    e.preventDefault();
    const milestoneId = document.getElementById('uploadMilestoneId').value;
    const comments = document.getElementById('uploadComments').value;

    const fileInputs = document.querySelectorAll('#deliverableSectionsContainer input[type="file"]');
    const linkInputs = document.querySelectorAll('#deliverableSectionsContainer input[type="url"]');

    const formData = new FormData();
    formData.append('milestoneId', milestoneId);
    formData.append('studentId', currentUser.id);

    let firstFile = null;
    let firstLink = '';

    fileInputs.forEach(fi => {
        if (fi.files[0] && !firstFile) firstFile = fi.files[0];
    });

    linkInputs.forEach(li => {
        if (li.value.trim() && !firstLink) firstLink = li.value.trim();
    });

    if (firstFile) formData.append('file', firstFile);
    if (firstLink) formData.append('submissionLink', firstLink);
    if (comments) formData.append('comments', comments);

    try {
        await ApiClient.uploadSubmission(formData);
        showToast('Deliverables submitted successfully!', 'success');
        closeModal('uploadModal');
        loadSelectedSubjectData();
    } catch (err) {
        showToast(`Upload failed: ${err.message}`, 'danger');
    }
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    const submissionId = document.getElementById('reviewSubmissionId').value;
    const status = document.getElementById('reviewStatus').value;
    const quality = parseInt(document.getElementById('reviewQuality').value);
    const feedback = document.getElementById('reviewFeedback').value;

    try {
        await ApiClient.reviewSubmission(submissionId, { status, qualityRating: quality, feedback });
        showToast('Grade recorded!', 'success');
        closeModal('reviewModal');
        fetchAndRenderRoster(selectedRosterMilestoneId);
    } catch (err) {
        showToast(`Failed: ${err.message}`, 'danger');
    }
}

// Toast System
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
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}
