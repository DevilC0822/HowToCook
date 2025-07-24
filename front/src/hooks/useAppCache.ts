import { useContext } from 'react';
import AppCacheContext from '../contexts/AppCacheContext';

// 自定义Hook
export const useAppCache = () => {
  const context = useContext(AppCacheContext);
  if (!context) {
    throw new Error('useAppCache must be used within an AppCacheProvider');
  }
  return context;
}; 