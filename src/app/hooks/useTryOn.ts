import { useState } from 'react';
import {
  savePersonPhoto as apiSavePersonPhoto,
  tryOnItem      as apiTryOnItem,
  fetchPersonPhoto as apiFetchPersonPhoto,
} from '../../api/api';

export interface TryOnResult {
  resultImage: string;
  resultUrl?: string;
  item: { name: string; color: string; category: string };
}

export interface TryOnHistoryEntry {
  id: string;
  date: string;
  itemName: string;
  itemCategory: string;
  clothingImage: string | null;
  resultImage: string;
}

export interface ItemMeta {
  name: string;
  category: string;
  image?: string | null;
}

const MAX_HISTORY = 5;

function historyKey(userId: string)  { return `clarity_tryon_history_${userId}`; }
function photoFlagKey(userId: string) { return `clarity_has_model_photo_${userId}`; }

function loadHistory(userId: string): TryOnHistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(historyKey(userId)) ?? '[]'); }
  catch { return []; }
}

interface TryOnReturn {
  loading: boolean;
  result: TryOnResult | null;
  error: string | null;
  progress: string;
  hasPersonPhoto: boolean;
  personPhotoUrl: string | null;
  photoLoading: boolean;
  history: TryOnHistoryEntry[];
  loadPersonPhoto: () => Promise<void>;
  uploadPersonPhoto: (file: File) => Promise<{ success: boolean }>;
  tryOn: (itemId: string, meta?: ItemMeta) => Promise<{ success: boolean; needsPhoto?: boolean }>;
  reset: () => void;
  clearHistory: () => void;
  deleteHistoryEntry: (id: string) => void;
}

export default function useTryOn(userId: string): TryOnReturn {
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState<TryOnResult | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [progress,       setProgress]       = useState('');
  const [hasPersonPhoto, setHasPersonPhoto] = useState(
    () => localStorage.getItem(photoFlagKey(userId)) === 'true',
  );
  const [personPhotoUrl, setPersonPhotoUrl] = useState<string | null>(null);
  const [photoLoading,   setPhotoLoading]   = useState(false);
  const [history, setHistory] = useState<TryOnHistoryEntry[]>(() => loadHistory(userId));

  const loadPersonPhoto = async () => {
    setPhotoLoading(true);
    try {
      const res = await apiFetchPersonPhoto();
      if (res.data.success) {
        setPersonPhotoUrl(res.data.data.photo ?? null);
        if (res.data.data.photo) {
          localStorage.setItem(photoFlagKey(userId), 'true');
          setHasPersonPhoto(true);
        }
      }
    } catch {}
    finally { setPhotoLoading(false); }
  };

  const uploadPersonPhoto = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await apiSavePersonPhoto(formData);
      localStorage.setItem(photoFlagKey(userId), 'true');
      setHasPersonPhoto(true);
      // Show preview immediately from the local file
      const reader = new FileReader();
      reader.onload = (e) => setPersonPhotoUrl(e.target?.result as string ?? null);
      reader.readAsDataURL(file);
      return { success: true };
    } catch {
      setError('Không thể lưu ảnh mẫu. Vui lòng thử lại.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const tryOn = async (itemId: string, meta?: ItemMeta) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Đang tải ảnh lên...',
      'AI đang phân tích trang phục...',
      'IDM-VTON đang ghép đồ lên ảnh của bạn...',
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
        const data = res.data.data as TryOnResult;
        setResult(data);

        // Save to localStorage history
        const entry: TryOnHistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          itemName:     data.item?.name     ?? meta?.name     ?? '',
          itemCategory: data.item?.category ?? meta?.category ?? '',
          clothingImage: meta?.image ?? null,
          resultImage: data.resultImage,
        };
        setHistory(prev => {
          const updated = [entry, ...prev].slice(0, MAX_HISTORY);
          try { localStorage.setItem(historyKey(userId), JSON.stringify(updated)); } catch {}
          return updated;
        });

        return { success: true };
      }
      throw new Error(res.data.error || 'Lỗi không xác định');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const serverError = axiosErr.response?.data?.error;
      const msg = serverError || 'Lỗi thử đồ, vui lòng thử lại';
      setError(msg);
      if (serverError === 'NO_PERSON_PHOTO') {
        setHasPersonPhoto(false);
        localStorage.removeItem(photoFlagKey(userId));
        return { success: false, needsPhoto: true };
      }
      return { success: false };
    } finally {
      clearInterval(timer);
      setLoading(false);
      setProgress('');
    }
  };

  const reset = () => { setResult(null); setError(null); };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(historyKey(userId));
  };

  const deleteHistoryEntry = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== id);
      try { localStorage.setItem(historyKey(userId), JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  return {
    loading, result, error, progress,
    hasPersonPhoto, personPhotoUrl, photoLoading,
    history, loadPersonPhoto, uploadPersonPhoto, tryOn, reset, clearHistory, deleteHistoryEntry,
  };
}
