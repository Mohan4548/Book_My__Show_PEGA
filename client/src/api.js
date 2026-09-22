import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const movieApi = {
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
};

export const showApi = {
  getAll: () => api.get('/shows'),
  getById: (id) => api.get(`/shows/${id}`),
  getSeats: (id) => api.get(`/shows/${id}/seats`),
  create: (data) => api.post('/shows', data),
  update: (id, data) => api.put(`/shows/${id}`, data),
  delete: (id) => api.delete(`/shows/${id}`),
};

export const bookingApi = {
  getAll: (params = {}) => api.get('/bookings', { params }),
  getById: (id, params = {}) => api.get(`/bookings/${id}`, { params }),
  verifyTicket: (id) => api.get(`/bookings/verify/${id}`),
  create: (data) => api.post('/bookings', data),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  approve: (id, data = {}) => api.put(`/bookings/${id}/approve`, data),
  reject: (id, data = {}) => api.put(`/bookings/${id}/reject`, data),
};

export const statsApi = {
  get: (params = {}) => api.get('/stats', { params }),
};

export default api;
