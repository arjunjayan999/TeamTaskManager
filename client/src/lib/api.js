import axios from 'axios';

const api = axios.create({ baseURL: 'https://backend-production-4ccb7.up.railway.app' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getProjects = () => api.get('/projects').then(r => r.data);
export const getProject = (id) => api.get(`/projects/${id}`).then(r => r.data);
export const createProject = (data) => api.post('/projects', data).then(r => r.data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data);
export const getAllUsers = () => api.get('/projects/users/all').then(r => r.data);
export const getTasks = (projectId) =>
  api.get(`/projects/${projectId}/tasks`).then(r => r.data);

export const createTask = (projectId, data) =>
  api.post(`/projects/${projectId}/tasks`, data).then(r => r.data);

export const updateTask = (projectId, taskId, data) =>
  api.patch(`/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data);

export const deleteTask = (projectId, taskId) =>
  api.delete(`/projects/${projectId}/tasks/${taskId}`).then(r => r.data);

export const getDashboardStats = () =>
  api.get('/projects/dashboard/stats').then(r => r.data);

export default api;