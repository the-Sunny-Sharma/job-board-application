import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api'

// 🔖 import.meta.env — Vite's way of reading .env files
// VITE_API_URL in .env.local → use local backend
// VITE_API_URL in production → use Railway URL
// All Vite env vars MUST start with VITE_

const api = axios.create({ baseURL: BASE_URL })

// Attach JWT to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const jobApi = {
  // ── Auth ──
  register: data => api.post('/auth/register', data),
  login:    data => api.post('/auth/login', data),

  // ── Jobs (Public) ──
  getJobs: params => api.get('/jobs', { params }),
  getJobById: id  => api.get(`/jobs/${id}`),

  // ── Jobs (Admin) ──
  getMyJobs:    params => api.get('/jobs/my', { params }),
  createJob:    data   => api.post('/jobs', data),
  updateJob:    (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob:    id     => api.delete(`/jobs/${id}`),
  toggleStatus: id     => api.patch(`/jobs/${id}/toggle-status`),

  // ── Applications ──
  applyToJob: (jobId, formData) =>
    api.post(`/applications/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getMyApplications:     params  => api.get('/applications/my', { params }),
  getJobApplications:    (jobId, params) =>
    api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (id, data) =>
    api.patch(`/applications/${id}/status`, data),
  analyseResume: id => api.post(`/applications/${id}/analyse`),
}

export default api