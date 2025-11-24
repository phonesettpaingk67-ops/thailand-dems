import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Dashboard API
export const dashboardAPI = {
  getStats: () => axios.get(`${API_BASE_URL}/dashboard`)
};

// Disasters API
export const disasterAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/disasters`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/disasters/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/disasters`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/disasters/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/disasters/${id}`),
  getStats: () => axios.get(`${API_BASE_URL}/disasters/stats`)
};

// Shelters API
export const shelterAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/shelters`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/shelters/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/shelters`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/shelters/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/shelters/${id}`),
  getStats: () => axios.get(`${API_BASE_URL}/shelters/stats`),
  activate: (shelterId, disasterId) => axios.post(`${API_BASE_URL}/shelters/activate`, { shelterId, disasterId })
};

// Relief Supplies API
export const supplyAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/supplies`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/supplies/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/supplies`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/supplies/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/supplies/${id}`),
  getStats: () => axios.get(`${API_BASE_URL}/supplies/stats`),
  distribute: (data) => axios.post(`${API_BASE_URL}/supplies/distribute`, data)
};

// Volunteers API
export const volunteerAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/volunteers`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/volunteers/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/volunteers`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/volunteers/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/volunteers/${id}`),
  getStats: () => axios.get(`${API_BASE_URL}/volunteers/stats`),
  assign: (data) => axios.post(`${API_BASE_URL}/volunteers/assign`, data)
};
