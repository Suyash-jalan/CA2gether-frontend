import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.getMe();
      setUser(data.user);
      try {
        const profileRes = await profileService.getMyProfile();
        setProfile(profileRes.data.user);
      } catch {
        /* profile not yet created */
      }
    } catch {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials, remember = true) => {
    const { data } = await authService.login(credentials);
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    (remember ? localStorage : sessionStorage).setItem('accessToken', data.accessToken);
    setUser(data.user);
    try {
      const profileRes = await profileService.getMyProfile();
      setProfile(profileRes.data.user);
    } catch {
      /* profile not yet set up */
    }
    return data;
  };

  const signup = async (credentials) => {
    const { data } = await authService.signup(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await profileService.getMyProfile();
      setProfile(data.user);
    } catch {
      /* ignore */
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    signup,
    logout,
    refreshProfile,
    setUser,
    setProfile,
    isAdmin: user?.role === 'admin',
    isVerified: user?.isEmailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
