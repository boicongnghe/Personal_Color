import { useState } from 'react';
import { tryOnReplicate as apiTryOn } from '../api/api';

export default function useTryOnReplicate() {
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [progress, setProgress] = useState('');

  const [personFile,      setPersonFile]      = useState(null);
  const [personPreview,   setPersonPreview]   = useState(null);
  const [clothingFile,    setClothingFile]    = useState(null);
  const [clothingPreview, setClothingPreview] = useState(null);

  const selectPerson = (file) => {
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const selectClothing = (file) => {
    setClothingFile(file);
    setClothingPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const runTryOn = async () => {
    if (!personFile || !clothingFile) {
      setError('Vui lòng chọn cả ảnh người và ảnh quần áo');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Đang tải ảnh lên...',
      'AI đang phân tích trang phục...',
      'Đang thử đồ lên người...',
      'Đang render hình ảnh...',
      'Sắp xong rồi... (~30 giây)',
    ];
    let i = 0;
    setProgress(steps[0]);
    const timer = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setProgress(steps[i]);
    }, 8000);

    try {
      const res = await apiTryOn(personFile, clothingFile);
      if (res.data?.success) {
        setResult(res.data.data.resultImage);
        return { success: true };
      }
      throw new Error(res.data?.error ?? 'Unknown error');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Lỗi thử đồ, vui lòng thử lại');
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
    setPersonFile(null);
    setPersonPreview(null);
    setClothingFile(null);
    setClothingPreview(null);
  };

  return {
    loading, result, error, progress,
    personFile, clothingFile,
    personPreview, clothingPreview,
    selectPerson, selectClothing,
    runTryOn, reset,
  };
}
