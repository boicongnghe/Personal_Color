import { useState } from 'react';
import { addWardrobeItem, getWardrobe, deleteWardrobeItem } from '../api/api';

export function useWardrobe() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchWardrobe = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWardrobe(userId);
      setItems(res.data.data?.items || []);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được tủ đồ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await addWardrobeItem(data);
      setItems((prev) => [...prev, res.data.data]);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Thêm trang phục thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteWardrobeItem(itemId);
      setItems((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      setError(err.response?.data?.error || 'Xóa trang phục thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, items, error, fetchWardrobe, addItem, removeItem };
}
