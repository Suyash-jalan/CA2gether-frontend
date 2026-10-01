import api from './api';

export const forumService = {
  getPosts: (params) => api.get('/community/posts', { params }),
  getPost: (id) => api.get(`/community/posts/${id}`),
  createPost: (data) => api.post('/community/posts', data),
  updatePost: (id, data) => api.put(`/community/posts/${id}`, data),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
  getProfilePosts: (userId, params = {}) => api.get('/community/profile-posts', { params: { ...params, userId } }),
  createProfilePost: (formData) => api.post('/community/profile-posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  togglePostLike: (id) => api.post(`/community/posts/${id}/like`),
  getComments: (postId, params) => api.get(`/community/posts/${postId}/comments`, { params }),
  createComment: (postId, data) => api.post(`/community/posts/${postId}/comments`, data),
  updateComment: (id, data) => api.put(`/community/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/community/comments/${id}`),
  getEvents: (params) => api.get('/community/events', { params }),
  getEvent: (id) => api.get(`/community/events/${id}`),
  toggleRsvp: (id) => api.post(`/community/events/${id}/rsvp`),
  createEvent: (data) => api.post('/community/events', data),
  updateEvent: (id, data) => api.put(`/community/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/community/events/${id}`),
};
