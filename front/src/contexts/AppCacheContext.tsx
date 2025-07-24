/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Dish, DishesStats } from '../services/dishesApi';
import type { Tip, TipsStats } from '../services/tipsApi';
import type { StarSystem, StarSystemStats } from '../services/starSystemApi';

// 缓存条目接口
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

// 应用缓存接口
interface AppCache {
  // 菜品相关缓存
  dishes: Map<string, CacheEntry<Dish[]>>;
  dishesStats: CacheEntry<DishesStats> | null;
  dishesPages: Map<string, number>; // 记录每个分类的当前页数

  // 技巧相关缓存
  tips: Map<string, CacheEntry<Tip[]>>;
  tipsStats: CacheEntry<TipsStats> | null;
  tipsCategories: CacheEntry<string[]> | null;
  tipsPages: Map<string, number>;

  // 星级菜谱相关缓存
  starSystems: CacheEntry<StarSystem[]> | null;
  starSystemStats: CacheEntry<StarSystemStats> | null;

  // 收藏状态
  favoritesMap: Map<string, boolean>;
}

// 缓存上下文接口
export interface AppCacheContextType {
  // 缓存操作方法
  getCache: <T, >(category: 'dishes' | 'tips' | 'starSystems', key: string) => CacheEntry<T> | null;
  setCache: <T, >(category: 'dishes' | 'tips' | 'starSystems', key: string, data: T) => void;

  // 统计数据缓存
  getStatsCache: (type: 'dishes' | 'tips' | 'starSystems') => any | null;
  setStatsCache: (type: 'dishes' | 'tips' | 'starSystems', data: any) => void;

  // 分类数据缓存 
  getCategoriesCache: () => string[] | null;
  setCategoriesCache: (categories: string[]) => void;

  // 页面状态缓存
  getPageState: (pageType: 'dishes' | 'tips', key: string) => number;
  setPageState: (pageType: 'dishes' | 'tips', key: string, page: number) => void;

  // 收藏状态
  getFavoritesMap: () => Map<string, boolean>;
  updateFavoritesMap: (dishId: string, isFavorite: boolean) => void;

  // 缓存清理
  clearCache: (category?: 'dishes' | 'tips' | 'starSystems') => void;

  // 缓存状态
  isCacheValid: (timestamp: number) => boolean;
}

const AppCacheContext = createContext<AppCacheContextType | null>(null);

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

export const AppCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const cacheRef = useRef<AppCache>({
    dishes: new Map(),
    dishesStats: null,
    dishesPages: new Map(),
    tips: new Map(),
    tipsStats: null,
    tipsCategories: null,
    tipsPages: new Map(),
    starSystems: null,
    starSystemStats: null,
    favoritesMap: new Map()
  });

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const getCache = <T,>(category: 'dishes' | 'tips' | 'starSystems', key: string): CacheEntry<T> | null => {
    const cache = cacheRef.current;

    switch (category) {
      case 'dishes':
        {
          const dishEntry = cache.dishes.get(key) as CacheEntry<T> | undefined;
          return dishEntry && isCacheValid(dishEntry.timestamp) ? dishEntry : null;
        }

      case 'tips':
        {
          const tipEntry = cache.tips.get(key) as CacheEntry<T> | undefined;
          return tipEntry && isCacheValid(tipEntry.timestamp) ? tipEntry : null;
        }

      case 'starSystems':
        {
          const starEntry = cache.starSystems as CacheEntry<T> | null;
          return starEntry && isCacheValid(starEntry.timestamp) ? starEntry : null;
        }

      default:
        return null;
    }
  };

  const setCache = <T,>(category: 'dishes' | 'tips' | 'starSystems', key: string, data: T): void => {
    const cache = cacheRef.current;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      key
    };

    switch (category) {
      case 'dishes':
        cache.dishes.set(key, entry as CacheEntry<Dish[]>);
        break;

      case 'tips':
        cache.tips.set(key, entry as CacheEntry<Tip[]>);
        break;

      case 'starSystems':
        cache.starSystems = entry as CacheEntry<StarSystem[]>;
        break;
    }
  };

  const getStatsCache = (type: 'dishes' | 'tips' | 'starSystems'): any | null => {
    const cache = cacheRef.current;

    switch (type) {
      case 'dishes':
        return cache.dishesStats && isCacheValid(cache.dishesStats.timestamp)
          ? cache.dishesStats.data : null;

      case 'tips':
        return cache.tipsStats && isCacheValid(cache.tipsStats.timestamp)
          ? cache.tipsStats.data : null;

      case 'starSystems':
        return cache.starSystemStats && isCacheValid(cache.starSystemStats.timestamp)
          ? cache.starSystemStats.data : null;

      default:
        return null;
    }
  };

  const setStatsCache = (type: 'dishes' | 'tips' | 'starSystems', data: any): void => {
    const cache = cacheRef.current;
    const entry = {
      data,
      timestamp: Date.now(),
      key: `${type}_stats`
    };

    switch (type) {
      case 'dishes':
        cache.dishesStats = entry;
        break;

      case 'tips':
        cache.tipsStats = entry;
        break;

      case 'starSystems':
        cache.starSystemStats = entry;
        break;
    }
  };

  const getCategoriesCache = (): string[] | null => {
    const cache = cacheRef.current;
    return cache.tipsCategories && isCacheValid(cache.tipsCategories.timestamp)
      ? cache.tipsCategories.data : null;
  };

  const setCategoriesCache = (categories: string[]): void => {
    const cache = cacheRef.current;
    cache.tipsCategories = {
      data: categories,
      timestamp: Date.now(),
      key: 'tips_categories'
    };
  };

  const getPageState = (pageType: 'dishes' | 'tips', key: string): number => {
    const cache = cacheRef.current;

    switch (pageType) {
      case 'dishes':
        return cache.dishesPages.get(key) || 1;
      case 'tips':
        return cache.tipsPages.get(key) || 1;
      default:
        return 1;
    }
  };

  const setPageState = (pageType: 'dishes' | 'tips', key: string, page: number): void => {
    const cache = cacheRef.current;

    switch (pageType) {
      case 'dishes':
        cache.dishesPages.set(key, page);
        break;
      case 'tips':
        cache.tipsPages.set(key, page);
        break;
    }
  };

  const getFavoritesMap = (): Map<string, boolean> => {
    return cacheRef.current.favoritesMap;
  };

  const updateFavoritesMap = (dishId: string, isFavorite: boolean): void => {
    cacheRef.current.favoritesMap.set(dishId, isFavorite);
  };

  const clearCache = (category?: 'dishes' | 'tips' | 'starSystems'): void => {
    const cache = cacheRef.current;

    if (!category) {
      // 清空所有缓存
      cache.dishes.clear();
      cache.dishesStats = null;
      cache.dishesPages.clear();
      cache.tips.clear();
      cache.tipsStats = null;
      cache.tipsCategories = null;
      cache.tipsPages.clear();
      cache.starSystems = null;
      cache.starSystemStats = null;
      cache.favoritesMap.clear();
    } else {
      // 清空指定分类缓存
      switch (category) {
        case 'dishes':
          cache.dishes.clear();
          cache.dishesStats = null;
          cache.dishesPages.clear();
          break;
        case 'tips':
          cache.tips.clear();
          cache.tipsStats = null;
          cache.tipsCategories = null;
          cache.tipsPages.clear();
          break;
        case 'starSystems':
          cache.starSystems = null;
          cache.starSystemStats = null;
          break;
      }
    }
  };

  const contextValue: AppCacheContextType = {
    getCache,
    setCache,
    getStatsCache,
    setStatsCache,
    getCategoriesCache,
    setCategoriesCache,
    getPageState,
    setPageState,
    getFavoritesMap,
    updateFavoritesMap,
    clearCache,
    isCacheValid
  };

  return (
    <AppCacheContext.Provider value={contextValue}>
      {children}
    </AppCacheContext.Provider>
  );
};

export default AppCacheContext; 