import api from './api';

export const matchService = {
  swipe: (data) => api.post('/match/swipe', data),
  discover: (params) => api.get('/match/discover', { params }),
  getMatches: (params) => api.get('/match/matches', { params }),
  getIncomingLikes: (params) => api.get('/match/likes', { params }),
  unmatch: (matchId) => api.delete(`/match/matches/${matchId}`),
};
