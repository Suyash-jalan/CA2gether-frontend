import api from './api';

export const newsService = {
  list: (params) => api.get('/news', { params }),
  get: (id) => api.get(`/news/${id}`),
};
