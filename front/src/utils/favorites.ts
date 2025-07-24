import type { Dish } from "../services/dishesApi";

// localStorage相关工具函数
export const FAVORITES_KEY = 'favorites_dishes';

export const getFavorites = (): Dish[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('获取收藏数据失败:', error);
    return [];
  }
};

export const removeFavorite = (dishId: string): Dish[] => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(dish => dish._id !== dishId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('删除收藏失败:', error);
    return getFavorites();
  }
};

// 带缓存同步的添加收藏函数
export const addFavorite = (dish: Dish, updateCacheCallback?: (dishId: string, isFavorite: boolean) => void): Dish[] => {
  try {
    const favorites = getFavorites();
    // 检查是否已存在
    if (favorites.some(fav => fav._id === dish._id)) {
      return favorites;
    }
    const updated = [...favorites, dish];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

    // 如果提供了缓存更新回调，调用它
    if (updateCacheCallback) {
      updateCacheCallback(dish._id, true);
    }

    return updated;
  } catch (error) {
    console.error('添加收藏失败:', error);
    return getFavorites();
  }
};

// 带缓存同步的移除收藏函数（全局使用）
export const removeFavoriteWithCache = (dishId: string, updateCacheCallback?: (dishId: string, isFavorite: boolean) => void): Dish[] => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(dish => dish._id !== dishId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

    // 如果提供了缓存更新回调，调用它
    if (updateCacheCallback) {
      updateCacheCallback(dishId, false);
    }

    return updated;
  } catch (error) {
    console.error('删除收藏失败:', error);
    return getFavorites();
  }
};

export const isFavorite = (dishId: string): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.some(dish => dish._id === dishId);
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
}; 