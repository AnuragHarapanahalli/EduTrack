/**
 * EduTrack REST API Client
 * Pure API Interface to Spring Boot Backend
 */
const API_BASE_URL = 'http://localhost:8080/api';

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

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
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

    // Auth API
    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(fullName, email, password, role, batchId) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password, role, batchId })
        });
    }

    // Subject & Milestone APIs
    static async getSubjectsForStudent(studentId) {
        return this.request(`/subjects/student/${studentId}`);
    }

    static async getSubjectsForInstructor(instructorId) {
        return this.request(`/subjects/instructor/${instructorId}`);
    }

    static async getMilestonesBySubject(subjectId) {
        return this.request(`/milestones/subject/${subjectId}`);
    }

    static async createMilestone(data) {
        return this.request('/milestones', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Submission APIs
    static async uploadSubmission(formData) {
        return this.request('/submissions/upload', {
            method: 'POST',
            body: formData
        });
    }

    static async getSubmissionsByStudent(studentId) {
        return this.request(`/submissions/student/${studentId}`);
    }

    static async getSubmissionsByMilestone(milestoneId) {
        return this.request(`/submissions/milestone/${milestoneId}`);
    }

    static async reviewSubmission(submissionId, reviewData) {
        return this.request(`/submissions/${submissionId}/review`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    }

    // Leaderboard API
    static async getLeaderboard(subjectId) {
        return this.request(`/leaderboard/subject/${subjectId}`);
    }
}
