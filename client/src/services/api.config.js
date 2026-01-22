/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

const API_CONFIG = {
    // Base URL - can be changed via environment variable
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

    // Timeout for requests (in ms)
    timeout: 10000,

    // Endpoints
    endpoints: {
        // Auth
        auth: {
            checkEmail: '/auth/check-email',
            sendOtp: '/auth/send-otp',
            login: '/auth/login-otp',
            register: '/auth/register',
        },
        // Courses
        courses: {
            list: '/courses',
            single: (id) => `/courses/${id}`,
            adminList: '/courses/admin/all',
            adminCreate: '/courses/admin',
            adminUpdate: (id) => `/courses/admin/${id}`,
            adminDelete: (id) => `/courses/admin/${id}`,
            // Content
            getContent: (id) => `/courses/${id}/content`,
            updateContent: (id) => `/courses/admin/${id}/content`,
        },
        // Events
        events: {
            list: '/events',
            single: (id) => `/events/${id}`,
            adminList: '/events/admin/all',
            adminCreate: '/events/admin',
            adminUpdate: (id) => `/events/admin/${id}`,
            adminDelete: (id) => `/events/admin/${id}`,
        },
    },
};

export default API_CONFIG;
