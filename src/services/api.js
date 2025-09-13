import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: {'Content-Type': 'application/json'},
});

// attach token from localStorage if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jobspring_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
