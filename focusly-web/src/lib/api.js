import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true,
})

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('focusly_token') || localStorage.getItem('taskpilot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('focusly_token')
      localStorage.removeItem('focusly_user')
      localStorage.removeItem('taskpilot_token')
      localStorage.removeItem('taskpilot_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
