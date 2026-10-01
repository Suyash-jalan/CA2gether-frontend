import api from './api';

export const chatService = {
  getMessages: (matchId, params) => api.get(`/chat/${matchId}/messages`, { params }),
  getIcebreakers: (count = 3) => api.get('/chat/icebreakers', { params: { count } }),
};
