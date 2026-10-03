import api from './api';

export const chatService = {
  getMessages: (matchId, params) => api.get(`/chat/${matchId}/messages`, { params }),
  sendImage: (matchId, formData) => api.post(`/chat/${matchId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getIcebreakers: (count = 3) => api.get('/chat/icebreakers', { params: { count } }),
};
