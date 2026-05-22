import { useState } from 'react';
import {
  savePersonPhoto as apiSavePersonPhoto,
  tryOnItem as apiTryOnItem,
} from '../../api/api';

export interface TryOnResult {
  resultImage: string;
  assessment: string | null;
  item: { name: string; color: string; category: string };
}

interface TryOnReturn {
  loading: boolean;
  result: TryOnResult | null;
  error: string | null;
  progress: string;
  hasPersonPhoto: boolean;
  uploadPersonPhoto: (file: File) => Promise<{ success: boolean }>;
  tryOn: (itemId: string) => Promise<{ success: boolean; needsPhoto?: boolean }>;
  reset: () => void;
}

export default function useTryOn(): TryOnReturn {
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState<TryOnResult | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [progress,       setProgress]       = useState('');
  const [hasPersonPhoto, setHasPersonPhoto] = useState(
    () => localStorage.getItem('clarity_has_model_photo') === 'true',
  );

  const uploadPersonPhoto = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await apiSavePersonPhoto(formData);
      localStorage.setItem('clarity_has_model_photo', 'true');
      setHasPersonPhoto(true);
      return { success: true };
    } catch {
      setError('Không thể lưu ảnh mẫu. Vui lòng thử lại.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const tryOn = async (itemId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Đang tải ảnh lên...',
      'Gemini đang phân tích trang phục...',
      'Đang thử đồ lên ảnh của bạn...',
      'Đang hoàn thiện hình ảnh...',
    ];
    let idx = 0;
    setProgress(steps[0]);
    const timer = setInterval(() => {
      idx = Math.min(idx + 1, steps.length - 1);
      setProgress(steps[idx]);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('itemId', itemId);
      const res = await apiTryOnItem(formData);
      if (res.data.success) {
        setResult(res.data.data);
        return { success: true };
      }
      throw new Error(res.data.error || 'Lỗi không xác định');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const serverError = axiosErr.response?.data?.error;
      const msg = serverError || 'Lỗi thử đồ, vui lòng thử lại';
      setError(msg);
      if (serverError === 'NO_PERSON_PHOTO') {
        return { success: false, needsPhoto: true };
      }
      return { success: false };
    } finally {
      clearInterval(timer);
      setLoading(false);
      setProgress('');
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { loading, result, error, progress, hasPersonPhoto, uploadPersonPhoto, tryOn, reset };
}
