import { Input, Button } from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dishesApi } from "../services/dishesApi";
import type { Dish, DishSearchOptions, DishesResponse } from "../services/dishesApi";
import { addFavorite, removeFavoriteWithCache, isFavorite } from "../utils/favorites";
import CacheIndicator from "../components/CacheIndicator";
import { useAppCache } from "../hooks/useAppCache";

export default function Dishes() {
  const navigate = useNavigate();
  const appCache = useAppCache();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [favoritesMap, setFavoritesMap] = useState<{ [key: string]: boolean }>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // 缓存指示器状态
  const [showCacheIndicator, setShowCacheIndicator] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // 生成缓存键
  const getCacheKey = (category: string) => {
    return category === 'all' ? 'dishes_all' : `dishes_${category}`;
  };

  // 加载收藏状态
  const loadFavoritesState = () => {
    const appFavoritesMap = appCache.getFavoritesMap();
    const newFavoritesMap: { [key: string]: boolean } = {};

    dishes.forEach(dish => {
      const isAppFavorite = appFavoritesMap.get(dish._id) ?? isFavorite(dish._id);
      newFavoritesMap[dish._id] = isAppFavorite;
      // 同步到应用级缓存
      appCache.updateFavoritesMap(dish._id, isAppFavorite);
    });

    setFavoritesMap(newFavoritesMap);
  };

  // 处理收藏/取消收藏
  const handleToggleFavorite = (dish: Dish) => {
    const isCurrentlyFavorite = favoritesMap[dish._id];

    if (isCurrentlyFavorite) {
      // 使用带缓存同步的移除收藏函数
      removeFavoriteWithCache(dish._id, (dishId, isFav) => {
        appCache.updateFavoritesMap(dishId, isFav);
      });
    } else {
      // 使用带缓存同步的添加收藏函数
      addFavorite(dish, (dishId, isFav) => {
        appCache.updateFavoritesMap(dishId, isFav);
      });
    }

    // 更新本地状态
    const newFavoriteState = !isCurrentlyFavorite;
    setFavoritesMap(prev => ({
      ...prev,
      [dish._id]: newFavoriteState
    }));

    console.log(`${newFavoriteState ? '❤️ 已添加收藏' : '💔 已取消收藏'}: ${dish.name}`);
  };

  // 分类图标映射 - 精致化设计
  const getCategoryIcon = (category: string): { icon: string; color: string; gradient: string } => {
    const iconMapping: Record<string, { icon: string; color: string; gradient: string }> = {
      // 主要分类
      '家常菜': { icon: '🏠', color: 'apple-blue', gradient: 'from-blue-500 to-blue-600' },
      '川菜': { icon: '🌶️', color: 'apple-red', gradient: 'from-red-500 to-red-600' },
      '凉菜': { icon: '🥗', color: 'apple-green', gradient: 'from-green-500 to-green-600' },
      '海鲜': { icon: '🦐', color: 'apple-teal', gradient: 'from-teal-500 to-teal-600' },
      '面食': { icon: '🍜', color: 'apple-orange', gradient: 'from-orange-500 to-orange-600' },
      '甜品': { icon: '🍰', color: 'apple-pink', gradient: 'from-pink-500 to-pink-600' },
      '汤类': { icon: '🍲', color: 'apple-blue', gradient: 'from-blue-500 to-cyan-500' },
      '主食': { icon: '🍚', color: 'apple-orange', gradient: 'from-amber-500 to-orange-500' },
      '甜点': { icon: '🧁', color: 'apple-pink', gradient: 'from-pink-500 to-rose-500' },
      '饮品': { icon: '🥤', color: 'apple-purple', gradient: 'from-purple-500 to-purple-600' },
      '炒菜': { icon: '🍳', color: 'apple-yellow', gradient: 'from-yellow-500 to-amber-500' },
      '炖菜': { icon: '🥘', color: 'apple-brown', gradient: 'from-amber-600 to-orange-700' },
      '早餐': { icon: '🥞', color: 'apple-yellow', gradient: 'from-yellow-400 to-orange-400' },
      // 其他常见分类
      '湘菜': { icon: '🌶️', color: 'apple-red', gradient: 'from-red-500 to-orange-500' },
      '饮料': { icon: '🧃', color: 'apple-purple', gradient: 'from-violet-500 to-purple-500' },
      '小吃': { icon: '🥟', color: 'apple-yellow', gradient: 'from-yellow-400 to-amber-400' },
      '酱料': { icon: '🍯', color: 'apple-orange', gradient: 'from-amber-500 to-yellow-600' },
      '中餐': { icon: '🥢', color: 'apple-red', gradient: 'from-red-500 to-rose-500' },
      '烘焙': { icon: '🍞', color: 'apple-brown', gradient: 'from-amber-600 to-orange-700' },
      '面点': { icon: '🥟', color: 'apple-pink', gradient: 'from-pink-400 to-rose-400' },
      '调味品': { icon: '🧂', color: 'apple-gray', gradient: 'from-slate-400 to-gray-500' },
      '汤': { icon: '🍜', color: 'apple-blue', gradient: 'from-blue-400 to-cyan-500' },
      '粥': { icon: '🥣', color: 'apple-yellow', gradient: 'from-yellow-400 to-amber-400' },
      '蒸菜': { icon: '🥟', color: 'apple-green', gradient: 'from-green-400 to-teal-400' },
      '烧烤': { icon: '🍖', color: 'apple-brown', gradient: 'from-amber-700 to-orange-800' },
      '火锅': { icon: '🍲', color: 'apple-red', gradient: 'from-red-500 to-orange-500' },
      '西餐': { icon: '🍽️', color: 'apple-gray', gradient: 'from-gray-500 to-slate-500' },
      '日料': { icon: '🍣', color: 'apple-teal', gradient: 'from-teal-500 to-cyan-500' },
      '韩料': { icon: '🥢', color: 'apple-orange', gradient: 'from-orange-500 to-red-500' },
      '粤菜': { icon: '🦐', color: 'apple-teal', gradient: 'from-teal-500 to-cyan-500' },
      '鲁菜': { icon: '🥢', color: 'apple-brown', gradient: 'from-amber-600 to-orange-700' },
      '闽菜': { icon: '🐟', color: 'apple-teal', gradient: 'from-teal-500 to-cyan-500' }
    };

    return iconMapping[category] || { icon: '🍽️', color: 'apple-gray', gradient: 'from-gray-400 to-gray-500' };
  };

  // 调试功能：清除缓存（临时）
  const clearCacheForDebug = () => {
    appCache.clearCache('dishes');
    console.log('🗑️ 已清除Dishes缓存，请刷新页面测试');
    window.location.reload();
  };

  // 页面状态恢复和保存
  useEffect(() => {
    // 重置关键状态，确保从其他页面进入时状态正确
    setCurrentPage(1);
    setLoadingMore(false);
    setError(null);

    // 恢复页面状态
    const savedCategory = localStorage.getItem('dishes_selectedCategory');
    const savedSearchTerm = localStorage.getItem('dishes_searchTerm');

    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
    }

    loadInitialData();

    // 添加全局调试函数
    (window as typeof window & { clearDishesCache?: () => void }).clearDishesCache = clearCacheForDebug;
    console.log('🔧 调试功能：在控制台输入 clearDishesCache() 可清除缓存');

    // 页面卸载时保存状态
    return () => {
      localStorage.setItem('dishes_selectedCategory', selectedCategory);
      localStorage.setItem('dishes_searchTerm', searchTerm);
      delete (window as typeof window & { clearDishesCache?: () => void }).clearDishesCache;
    };
  }, []);

  // 分类变化时的智能加载
  useEffect(() => {
    if (!loading) {
      handleCategoryChange();
    }
  }, [selectedCategory]);

  // 监听dishes变化，更新收藏状态
  useEffect(() => {
    if (dishes.length > 0) {
      loadFavoritesState();
    }
    // 调试：检查加载更多按钮显示条件
    console.log('🔍 加载更多按钮显示条件检查:', {
      dishesLength: dishes.length,
      currentPage,
      totalPages,
      shouldShowLoadMore: dishes.length > 0 && currentPage < totalPages
    });
  }, [dishes, currentPage, totalPages]);

  // 保存页面状态
  useEffect(() => {
    localStorage.setItem('dishes_selectedCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('dishes_searchTerm', searchTerm);
  }, [searchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 从应用级缓存获取数据
      const cacheKey = getCacheKey("all");
      const cachedDishesResponse = appCache.getCache<DishesResponse>('dishes', cacheKey);
      const cachedStats = appCache.getStatsCache('dishes');

      // 如果有完整的缓存数据，直接使用
      if (cachedDishesResponse && cachedStats) {
        setDishes(cachedDishesResponse.data.dishes.slice(0, 12));
        setAvailableCategories(cachedStats.categories?.map((cat: { _id: string; count: number }) => cat._id) || []);
        setCurrentPage(1);
        setTotalPages(cachedDishesResponse.data.totalPages);
        setLoading(false);
        setIsFromCache(true);
        setShowCacheIndicator(true);
        console.log('🎯 从应用级缓存加载Dishes页面数据', {
          dishes: cachedDishesResponse.data.dishes.length,
          currentPage: 1,
          totalPages: cachedDishesResponse.data.totalPages,
          total: cachedDishesResponse.data.total
        });
        return;
      }

      // 没有缓存，从API加载
      const [dishesData, statsData] = await Promise.all([
        dishesApi.getDishes({ page: 1, limit: 12 }),
        dishesApi.getStats().catch(() => null) // 如果统计API失败，不影响主功能
      ]);

      // 保存到应用级缓存 - 保存完整的响应信息
      appCache.setCache('dishes', cacheKey, dishesData);
      if (statsData) {
        appCache.setStatsCache('dishes', statsData);
        setAvailableCategories(statsData.categories?.map((cat: { _id: string; count: number }) => cat._id) || []);
      }

      setDishes(dishesData.dishes);
      setTotalPages(dishesData.totalPages);
      setCurrentPage(dishesData.page);
      setIsFromCache(false);
      setShowCacheIndicator(true);

      console.log('🌐 从API加载Dishes页面数据并缓存', {
        dishes: dishesData.dishes.length,
        currentPage: dishesData.page,
        totalPages: dishesData.totalPages,
        total: dishesData.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 智能处理分类切换
  const handleCategoryChange = async () => {
    try {
      setSearching(true);
      setError(null);

      // 从应用级缓存获取分类数据
      const cacheKey = getCacheKey(selectedCategory);
      const cachedData = appCache.getCache<DishesResponse>('dishes', cacheKey);

      if (cachedData) {
        setDishes(cachedData.data.dishes.slice(0, 12));
        setTotalPages(cachedData.data.totalPages);
        setCurrentPage(1);
        setSearching(false);
        setIsFromCache(true);
        setShowCacheIndicator(true);
        console.log(`🎯 从应用级缓存加载分类: ${selectedCategory}`);
        return;
      }

      console.log(`🌐 从API加载分类: ${selectedCategory}`);

      // 缓存中没有数据，从API加载
      const options: DishSearchOptions = {
        page: 1,
        limit: 12
      };

      if (selectedCategory !== 'all') {
        options.category = selectedCategory;
      }

      const dishesData = await dishesApi.getDishes(options);

      // 保存到应用级缓存 - 保存完整的响应信息
      appCache.setCache('dishes', cacheKey, dishesData);

      setDishes(dishesData.dishes);
      setTotalPages(dishesData.totalPages);
      setCurrentPage(1);
      setIsFromCache(false);
      setShowCacheIndicator(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('Error loading dishes:', err);
    } finally {
      setSearching(false);
    }
  };



  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // 搜索词为空时，恢复到当前分类的缓存数据
      const cacheKey = getCacheKey(selectedCategory);
      const cachedData = appCache.getCache<DishesResponse>('dishes', cacheKey);
      if (cachedData) {
        setDishes(cachedData.data.dishes.slice(0, 12));
        setTotalPages(cachedData.data.totalPages);
        setCurrentPage(1);
        setIsFromCache(true);
        setShowCacheIndicator(true);
        return;
      }
      // 如果没有缓存，重新加载
      handleCategoryChange();
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const options: DishSearchOptions = {
        keyword: searchTerm,
        page: 1,
        limit: 12
      };

      if (selectedCategory !== 'all') {
        options.category = selectedCategory;
      }

      const dishesData = await dishesApi.searchDishes(options);
      setDishes(dishesData.dishes);
      setTotalPages(dishesData.totalPages);
      setCurrentPage(1);
      setIsFromCache(false);
      setShowCacheIndicator(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
      console.error('Error searching dishes:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const loadMoreDishes = async () => {
    if (currentPage >= totalPages || loadingMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    // 直接从API加载更多数据
    try {
      setLoadingMore(true);
      setError(null);

      const options: DishSearchOptions = {
        page: nextPage,
        limit: 12
      };

      if (selectedCategory !== 'all') {
        options.category = selectedCategory;
      }

      const dishesData = await dishesApi.getDishes(options);

      // 追加数据
      setDishes(prev => [...prev, ...dishesData.dishes]);
      setTotalPages(dishesData.totalPages);

      // 更新应用级缓存
      const cacheKey = getCacheKey(selectedCategory);
      const existingData = appCache.getCache<DishesResponse>('dishes', cacheKey);
      if (existingData) {
        const mergedDishes = [...existingData.data.dishes, ...dishesData.dishes];
        const updatedResponse: DishesResponse = {
          ...existingData.data,
          dishes: mergedDishes,
          page: nextPage
        };
        appCache.setCache('dishes', cacheKey, updatedResponse);
      }

      setIsFromCache(false);
      setShowCacheIndicator(true);

      console.log(`🌐 从API加载更多数据: ${selectedCategory}, 页面: ${nextPage}`, {
        newDishes: dishesData.dishes.length,
        totalDishes: dishes.length + dishesData.dishes.length,
        currentPage: nextPage,
        totalPages: dishesData.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('Error loading dishes:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      '初级': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      '中级': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      '高级': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
      '专家级': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    };
    return colors[difficulty as keyof typeof colors] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const getStarLevelIcon = (starLevel: number) => {
    const stars = '★'.repeat(Math.min(starLevel, 5));
    return stars || '☆';
  };

  // 动态分类列表生成
  const getCategories = () => {
    // 基础分类（总是显示）
    const baseCategories = [
      { id: 'all', name: '全部', icon: '🍽️', color: 'apple-gray', gradient: 'from-gray-400 to-gray-500' }
    ];

    // 如果有从API获取的分类数据，使用它们
    if (availableCategories.length > 0) {
      const dynamicCategories = availableCategories
        .slice(0, 15) // 只显示前15个最热门的分类
        .map(categoryId => {
          const iconInfo = getCategoryIcon(categoryId);
          return {
            id: categoryId,
            name: categoryId,
            icon: iconInfo.icon,
            color: iconInfo.color,
            gradient: iconInfo.gradient
          };
        });

      return [...baseCategories, ...dynamicCategories];
    }

    // 备选静态分类列表（当API数据不可用时）
    const staticCategories = [
      { id: '家常菜', name: '家常菜', icon: '🏠', color: 'apple-blue', gradient: 'from-blue-500 to-blue-600' },
      { id: '川菜', name: '川菜', icon: '🌶️', color: 'apple-red', gradient: 'from-red-500 to-red-600' },
      { id: '凉菜', name: '凉菜', icon: '🥗', color: 'apple-green', gradient: 'from-green-500 to-green-600' },
      { id: '海鲜', name: '海鲜', icon: '🦐', color: 'apple-teal', gradient: 'from-teal-500 to-teal-600' },
      { id: '面食', name: '面食', icon: '🍜', color: 'apple-orange', gradient: 'from-orange-500 to-orange-600' },
      { id: '甜品', name: '甜品', icon: '🍰', color: 'apple-pink', gradient: 'from-pink-500 to-pink-600' },
      { id: '汤类', name: '汤类', icon: '🍲', color: 'apple-blue', gradient: 'from-blue-500 to-cyan-500' },
      { id: '主食', name: '主食', icon: '🍚', color: 'apple-orange', gradient: 'from-amber-500 to-orange-500' },
      { id: '甜点', name: '甜点', icon: '🧁', color: 'apple-pink', gradient: 'from-pink-500 to-rose-500' },
      { id: '饮品', name: '饮品', icon: '🥤', color: 'apple-purple', gradient: 'from-purple-500 to-purple-600' },
      { id: '炒菜', name: '炒菜', icon: '🍳', color: 'apple-yellow', gradient: 'from-yellow-500 to-amber-500' },
      { id: '炖菜', name: '炖菜', icon: '🥘', color: 'apple-brown', gradient: 'from-amber-600 to-orange-700' },
      { id: '早餐', name: '早餐', icon: '🥞', color: 'apple-yellow', gradient: 'from-yellow-400 to-orange-400' }
    ];

    return [...baseCategories, ...staticCategories];
  };

  const categories = getCategories();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            {/* 精致的加载动画 */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin">
                  <div className="absolute inset-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">正在加载菜品大全</h3>
              <p className="text-slate-600">为您精心准备丰富的美食菜谱...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-xl font-semibold text-slate-800">加载失败</h3>
            <p className="text-slate-600">{error}</p>
            <Button
              onClick={loadInitialData}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
            >
              重新加载
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 scrollbar-premium">
      {/* 缓存状态指示器 */}
      <CacheIndicator
        isFromCache={isFromCache}
        visible={showCacheIndicator}
        onHide={() => setShowCacheIndicator(false)}
        position="top-right"
      />

      {/* 顶部装饰性渐变 */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/5 via-purple-500/3 to-transparent pointer-events-none"></div>

      {/* 浮动装饰元素 */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float pointer-events-none opacity-50"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-float pointer-events-none opacity-50" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* 页面标题 - 重新设计 */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-[1.01] transition-transform duration-300 animate-pulse-glow">
                <span className="text-3xl animate-float">🍽️</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              菜品大全
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              精选家常美食菜谱，包含详细制作步骤与营养搭配建议
            </p>
          </div>

          {/* 搜索和筛选 - 精致化重设计 */}
          <div className="mb-12 animate-slide-in">
            <div className="max-w-4xl mx-auto">
              <div className="apple-card-elevated rounded-3xl p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center">
                  <div className="flex-1 w-full">
                    <div className="relative group">
                      <Input
                        placeholder="搜索菜品名称、食材、做法..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-lg input-premium"
                        size="lg"
                        classNames={{
                          input: "text-slate-700 placeholder:text-slate-400 text-sm md:text-base",
                          inputWrapper: "bg-slate-50/50 border-slate-200/50 hover:border-blue-300/50 focus-within:border-blue-500/50 rounded-2xl h-12 md:h-14 px-4 md:px-6 transition-all duration-300"
                        }}
                        startContent={
                          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-300">
                            <span className="text-white text-xs">🔍</span>
                          </div>
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {/* 搜索建议提示 */}
                      <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 apple-icon-shadow text-xs text-slate-600">
                          💡 试试搜索：鸡蛋、家常菜、川菜、简单
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full lg:w-auto">
                    <Button
                      onClick={handleSearch}
                      disabled={searching}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 md:px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] btn-premium flex-1 lg:flex-none"
                      size="lg"
                    >
                      {searching ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="hidden md:inline">搜索中</span>
                          <span className="md:hidden">搜索</span>
                        </div>
                      ) : (
                        <>🔍 搜索</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 分类导航 - 完全重新设计 */}
          <div className="mb-16 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="apple-card-elevated rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 md:mb-8 text-center">🎯 精选分类</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {categories.slice(0, 12).map((category, index) => {
                  const isSelected = selectedCategory === category.id;
                  const iconInfo = getCategoryIcon(category.id);

                  return (
                    <div
                      key={category.id}
                      className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.01] animate-scale-in active:scale-95`}
                      style={{ animationDelay: `${0.05 * index}s` }}
                      onClick={() => handleCategorySelect(category.id)}
                      onTouchStart={() => { }} // 添加触摸支持
                    >
                      <div className={`
                        relative overflow-hidden rounded-2xl p-4 md:p-6 text-center card-premium
                        ${isSelected
                          ? `bg-gradient-to-br ${iconInfo.gradient} text-white shadow-2xl scale-105 selected-premium`
                          : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white apple-icon-shadow hover:shadow-xl'
                        }
                        transition-all duration-300
                      `}>
                        {/* 背景装饰 */}
                        <div className="absolute top-0 right-0 w-12 md:w-16 h-12 md:h-16 bg-white/10 rounded-full -mr-6 md:-mr-8 -mt-6 md:-mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-8 md:w-12 h-8 md:h-12 bg-white/10 rounded-full -ml-4 md:-ml-6 -mb-4 md:-mb-6"></div>

                        {/* 选中状态光晕 */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl animate-pulse-glow"></div>
                        )}

                        <div className="relative z-10">
                          <div className="text-2xl md:text-3xl mb-2 md:mb-3 transform group-hover:scale-[1.02] group-active:scale-95 transition-transform duration-300">
                            {category.icon}
                          </div>
                          <div className={`text-xs md:text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                            {category.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 菜品网格 - 完全重新设计 */}
          <div className="mb-16">
            {searching && (
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl apple-icon-shadow">
                  <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-slate-700 font-medium">正在搜索美味菜品...</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
              {dishes.map((dish, index) => {
                const difficultyStyle = getDifficultyColor(dish.difficulty);
                const isFav = favoritesMap[dish._id];

                return (
                  <div
                    key={dish._id}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${0.05 * (index % 20)}s` }}
                  >
                    {/* 设置统一高度：h-[420px] */}
                    <div className="h-[420px] apple-glass rounded-3xl overflow-hidden flex flex-col">
                      {/* 卡片头部 - flex-1 让内容区域自动填充 */}
                      <div className="relative p-6 pb-4 flex-1 flex flex-col">
                        {/* 背景装饰 */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-12 -mt-12"></div>

                        <div className="relative z-10 flex-1 flex flex-col">
                          {/* 标题区域 - 固定高度 */}
                          <div className="flex items-start justify-between mb-4 min-h-[80px]">
                            <div className="flex-1 pr-4">
                              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight">
                                {dish.name}
                              </h3>
                              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                                {dish.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="text-2xl mb-1 transform group-hover:scale-[1.02] transition-transform duration-300">
                                {dish.starLevel <= 2 ? '🌟' : dish.starLevel <= 4 ? '⭐' : '✨'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {getStarLevelIcon(dish.starLevel)}
                              </div>
                            </div>
                          </div>

                          {/* 菜品信息 - 固定高度 */}
                          <div className="flex items-center gap-6 mb-4 text-sm min-h-[32px]">
                            <div className="flex items-center gap-2 text-slate-600">
                              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">⏰</span>
                              </div>
                              <span className="font-medium">{dish.estimatedTime}分钟</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">👥</span>
                              </div>
                              <span className="font-medium">{dish.servings}人份</span>
                            </div>
                          </div>

                          {/* 难度和分类标签 - 固定高度 */}
                          <div className="flex items-center justify-between mb-4 min-h-[32px]">
                            <div className={`${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border} border px-3 py-1.5 rounded-xl text-xs font-semibold`}>
                              {dish.difficulty}
                            </div>
                            <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium">
                              {dish.categoryName || dish.category}
                            </div>
                          </div>

                          {/* 标签云 - 固定高度 */}
                          <div className="mb-4 min-h-[32px] flex items-start">
                            {dish.tags && dish.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {(dish.tags || []).slice(0, 3).map((tag, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-medium"
                                  >
                                    {tag}
                                  </div>
                                ))}
                                {dish.tags && dish.tags.length > 3 && (
                                  <div className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                                    +{dish.tags.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div className="bg-slate-50 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-100">
                                  经典菜品
                                </div>
                                <div className="bg-slate-50 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-100">
                                  美味
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 特点介绍 - 弹性区域，占用剩余空间 */}
                          <div className="flex-1 flex flex-col justify-start">
                            {dish.features && dish.features.length > 0 ? (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                                  特色亮点
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                                  {dish.features.join(' • ')}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"></span>
                                  制作简单
                                </h4>
                                <p className="text-sm text-slate-500 leading-relaxed italic">
                                  这道菜品制作工艺精良，口感丰富，营养价值高，适合日常制作和享用。
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮区域 - 固定在底部 */}
                      <div className="px-6 pb-6 flex-shrink-0">
                        <div className="flex gap-3">
                          <Button
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2.5 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] flex-1"
                            size="sm"
                            onClick={() => navigate(`/dishes/${encodeURIComponent(dish.filePath)}`)}
                          >
                            查看详情
                          </Button>
                          <Button
                            className={isFav
                              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 px-4 py-2.5 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                              : "bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 hover:border-rose-300 px-4 py-2.5 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                            }
                            size="sm"
                            onClick={() => handleToggleFavorite(dish)}
                          >
                            {isFav ? '❤️' : '🤍'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 加载更多区域 */}
            {dishes.length > 0 && currentPage < totalPages && (
              <div className="text-center mt-16 animate-fade-in-up">
                {/* 加载中的顶部动画 */}
                {loadingMore && (
                  <div className="mb-8 animate-fade-in-up">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-600 font-semibold text-lg">正在加载更多菜谱...</p>
                        <p className="text-slate-500 text-sm mt-1">请稍候，为您搜寻美味佳肴</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 加载更多按钮 - 醒目设计 */}
                <div className="apple-card-elevated rounded-3xl p-8 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl apple-icon-shadow flex items-center justify-center">
                      <span className="text-white text-2xl">📚</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">还有更多精彩菜谱</h3>
                    <p className="text-slate-600 mb-6">已展示 {dishes.length} 道菜品，更多美味等您发现</p>
                    <Button
                      onClick={loadMoreDishes}
                      disabled={loadingMore}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-16 py-4 rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] hover:-translate-y-0.5"
                      size="lg"
                    >
                      {loadingMore ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>加载中...</span>
                        </div>
                      ) : (
                        <span>🍽️ 加载更多菜谱 ({currentPage}/{totalPages})</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 空状态 - 精致化设计 */}
            {!searching && dishes.length === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-6xl opacity-50">🍽️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">
                    暂无找到相关菜谱
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    当前条件下没有找到合适的菜谱。<br />
                    请尝试调整搜索关键词或选择其他分类。
                  </p>
                </div>
              </div>
            )}
          </div>



          {/* 底部建议卡片 - 精致化设计 */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 backdrop-blur-xl border border-amber-200/50 rounded-3xl p-8 shadow-xl">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl apple-icon-shadow flex items-center justify-center">
                  <span className="text-white text-2xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  烹饪建议
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg max-w-2xl mx-auto">
                  建议从简单的家常菜开始练习，循序渐进提升烹饪技巧。
                  <br />
                  新鲜食材和准确的时间控制是制作美味菜肴的关键要素。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}