import { useState } from 'react';
import { analyzeFace, getResult } from '../api/api';

export function useColorAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async (imageFile, measurements) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);
      if (measurements) {
        const { bust, waist, hips } = measurements;
        if (bust)  formData.append('bust',  String(bust));
        if (waist) formData.append('waist', String(waist));
        if (hips)  formData.append('hips',  String(hips));
      }
      const res = await analyzeFace(formData);
      setResult(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Phân tích thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchResult = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResult(userId);
      setResult(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được kết quả');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, error, analyze, fetchResult };
}
