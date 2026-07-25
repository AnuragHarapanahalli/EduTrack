/**
 * EduTrack REST API Client
 * Uses centralized ApiEndpoints registry from endpoints.js
 */
class ApiClient {
    static getAuthToken() {
        return localStorage.getItem('edutrack_jwt');
    }

    static setAuthToken(token) {
        localStorage.setItem('edutrack_jwt', token);
    }

    static clearAuthToken() {
        localStorage.removeItem('edutrack_jwt');
        localStorage.removeItem('edutrack_user');
    }

    static getCurrentUser() {
        const userStr = localStorage.getItem('edutrack_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static setCurrentUser(user) {
        localStorage.setItem('edutrack_user', JSON.stringify(user));
    }

    static async request(endpoint, options = {}) {
        const token = this.getAuthToken();
        const headers = options.headers || {};

        if (token && !headers['Authorization']) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers
        };

        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, config);
        
        if (!response.ok) {
            let errorMsg = `Server error (${response.status})`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        if (response.status === 204) return null;
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    // Auth APIs
    static async login(email, password) {
        return this.request(ApiEndpoints.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(fullName, email, password, role, batchId) {
        return this.request(ApiEndpoints.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password, role, batchId })
        });
    }

    // Subject & Milestone APIs
    static async createSubject(data, instructorId) {
        return this.request(ApiEndpoints.SUBJECTS.CREATE(instructorId), {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async getSubjectsForStudent(studentId) {
        return this.request(ApiEndpoints.SUBJECTS.GET_BY_STUDENT(studentId));
    }

    static async getSubjectsForInstructor(instructorId) {
        return this.request(ApiEndpoints.SUBJECTS.GET_BY_INSTRUCTOR(instructorId));
    }

    static async addStudentToSubjectManual(subjectId, fullName, email) {
        return this.request(ApiEndpoints.SUBJECTS.ADD_STUDENT_MANUAL(subjectId, fullName, email), {
            method: 'POST'
        });
    }

    static async getStudentsBySubject(subjectId) {
        return this.request(ApiEndpoints.SUBJECTS.GET_STUDENTS(subjectId));
    }

    static async getMilestonesBySubject(subjectId) {
        return this.request(ApiEndpoints.MILESTONES.GET_BY_SUBJECT(subjectId));
    }

    static async createMilestone(data) {
        return this.request(ApiEndpoints.MILESTONES.CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Submission APIs
    static async uploadSubmission(formData) {
        return this.request(ApiEndpoints.SUBMISSIONS.UPLOAD, {
            method: 'POST',
            body: formData
        });
    }

    static async getSubmissionsByStudent(studentId) {
        return this.request(ApiEndpoints.SUBMISSIONS.GET_BY_STUDENT(studentId));
    }

    static async getSubmissionsByMilestone(milestoneId) {
        return this.request(ApiEndpoints.SUBMISSIONS.GET_BY_MILESTONE(milestoneId));
    }

    static async getMilestoneRoster(milestoneId) {
        return this.request(ApiEndpoints.SUBMISSIONS.GET_MILESTONE_ROSTER(milestoneId));
    }

    static async reviewSubmission(submissionId, reviewData) {
        return this.request(ApiEndpoints.SUBMISSIONS.REVIEW(submissionId), {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    }

    // Leaderboard API
    static async getLeaderboard(subjectId) {
        return this.request(ApiEndpoints.LEADERBOARD.GET_BY_SUBJECT(subjectId));
    }
}
