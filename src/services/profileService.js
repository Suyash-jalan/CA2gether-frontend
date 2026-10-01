import api from './api';

export const profileService = {
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (data) => api.put('/users/me', data),
  uploadPhotos: (formData) =>
    api.post('/users/me/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePhoto: (photoUrl) => api.delete('/users/me/photos', { data: { photoUrl } }),
  uploadVerification: (formData) =>
    api.post('/users/me/verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUserProfile: (id) => api.get(`/users/${id}`),
  deactivateAccount: () => api.post('/users/me/deactivate'),
  reactivateAccount: () => api.post('/users/me/reactivate'),
};
