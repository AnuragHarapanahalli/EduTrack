/**
 * EduTrack API Endpoints Registry
 * Centralized endpoint constants for frontend-backend communication
 */
const API_BASE_URL = 'http://localhost:8080/api';

const ApiEndpoints = {
    // Auth Endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        USER_PROFILE: (id) => `/auth/users/${id}`
    },

    // Subject Endpoints
    SUBJECTS: {
        CREATE: (instructorId) => `/subjects?instructorId=${instructorId}`,
        GET_ALL: '/subjects',
        GET_BY_INSTRUCTOR: (instructorId) => `/subjects/instructor/${instructorId}`,
        GET_BY_STUDENT: (studentId) => `/subjects/student/${studentId}`,
        GET_BY_ID: (id) => `/subjects/${id}`,
        ADD_STUDENT_MANUAL: (subjectId, fullName, email) => `/subjects/${subjectId}/students/manual?fullName=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`,
        GET_STUDENTS: (subjectId) => `/subjects/${subjectId}/students`
    },

    // Milestone Endpoints
    MILESTONES: {
        CREATE: '/milestones',
        GET_BY_SUBJECT: (subjectId) => `/milestones/subject/${subjectId}`,
        GET_BY_ID: (id) => `/milestones/${id}`,
        DELETE: (id) => `/milestones/${id}`
    },

    // Submission Endpoints
    SUBMISSIONS: {
        UPLOAD: '/submissions/upload',
        REVIEW: (id) => `/submissions/${id}/review`,
        GET_BY_MILESTONE: (milestoneId) => `/submissions/milestone/${milestoneId}`,
        GET_MILESTONE_ROSTER: (milestoneId) => `/submissions/milestone/${milestoneId}/roster`,
        GET_BY_STUDENT: (studentId) => `/submissions/student/${studentId}`,
        GET_BY_MILESTONE_AND_STUDENT: (milestoneId, studentId) => `/submissions/milestone/${milestoneId}/student/${studentId}`
    },

    // Leaderboard Endpoint
    LEADERBOARD: {
        GET_BY_SUBJECT: (subjectId) => `/leaderboard/subject/${subjectId}`
    },

    // File Access
    UPLOADS: (fileName) => `http://localhost:8080${fileName}`
};
