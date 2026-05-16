import { useState } from 'react';
import { register, login, getMe } from '../api/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const signUp = async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await register(email, password, displayName);
      const { token, user: userData } = res.data.data;
      localStorage.setItem('clarity_token', token);
      setUser(userData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      const { token, user: userData } = res.data.data;
      localStorage.setItem('clarity_token', token);
      setUser(userData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMe();
      setUser(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được thông tin người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('clarity_token');
    setUser(null);
  };

  return { loading, user, error, signUp, signIn, fetchMe, signOut };
}
