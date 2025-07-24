import { Button, Chip, Tooltip } from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tipsApi } from "../services/tipsApi";
import type { Tip, TipsStats, TipsResponse } from "../services/tipsApi";
import CacheIndicator from "../components/CacheIndicator";
import { useAppCache } from "../hooks/useAppCache";
import { useTheme } from "../hooks/useTheme";

export default function Tips() {
  const navigate = useNavigate();
  const appCache = useAppCache();
  const { isDark } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [tips, setTips] = useState<Tip[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<TipsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 缓存指示器状态
  const [showCacheIndicator, setShowCacheIndicator] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  const difficulties = tipsApi.getDifficulties();

  // 生成缓存键
  const getCacheKey = (category: string, difficulty: string) => {
    const catKey = category || 'all';
    const diffKey = difficulty || 'all';
    return `tips_${catKey}_${diffKey}`;
  };

  // 页面状态恢复和保存
  useEffect(() => {
    // 恢复页面状态
    // 重置状态，防止从其他页面进入时状态不正确
    setCurrentPage(1);
    setLoadingMore(false);
    setError(null);

    const savedCategory = localStorage.getItem('tips_selectedCategory');
    const savedDifficulty = localStorage.getItem('tips_selectedDifficulty');

    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
    if (savedDifficulty) {
      setSelectedDifficulty(savedDifficulty);
    }

    loadInitialData();

    // 添加临时全局调试函数
    const clearTipsCache = () => {
      // 清理Tips缓存
      const cacheKeys = ['tips_all_all', 'tips__', 'tips_', 'tips'];
      cacheKeys.forEach(key => {
        localStorage.removeItem(`cache_tips_${key}`);
        console.log(`🗑️ 已清理Tips缓存: ${key}`);
      });

      // 清理应用级缓存中的tips数据
      try {
        const cacheData = JSON.parse(localStorage.getItem('appCache') || '{}');
        if (cacheData.tips) {
          delete cacheData.tips;
          localStorage.setItem('appCache', JSON.stringify(cacheData));
          console.log('🗑️ 已清理应用级Tips缓存');
        }
      } catch (e) {
        console.warn('清理应用级缓存失败:', e);
      }

      console.log('🎯 Tips缓存已全部清理，请刷新页面测试');
    };

    (window as typeof window & { clearTipsCache?: () => void }).clearTipsCache = clearTipsCache;
    console.log('🔧 调试功能：在控制台输入 clearTipsCache() 可清理Tips缓存');

    // 页面卸载时保存状态
    return () => {
      localStorage.setItem('tips_selectedCategory', selectedCategory);
      localStorage.setItem('tips_selectedDifficulty', selectedDifficulty);
      delete (window as typeof window & { clearTipsCache?: () => void }).clearTipsCache;
    };
  }, []);

  // 筛选时的智能加载
  useEffect(() => {
    if (!loading) {
      handleFilterChange();
    }
  }, [selectedCategory, selectedDifficulty]);

  // 保存页面状态
  useEffect(() => {
    localStorage.setItem('tips_selectedCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('tips_selectedDifficulty', selectedDifficulty);
  }, [selectedDifficulty]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 从应用级缓存获取数据
      const cacheKey = getCacheKey("", "");
      const cachedTipsResponse = appCache.getCache<TipsResponse>('tips', cacheKey);
      const cachedStats = appCache.getStatsCache('tips');
      const cachedCategories = appCache.getCategoriesCache();

      // 如果有完整的缓存数据，直接使用
      if (cachedTipsResponse && cachedStats && cachedCategories) {
        setTips(cachedTipsResponse.data.tips);
        setStats(cachedStats);
        setCategories(cachedCategories);
        setCurrentPage(cachedTipsResponse.data.page);
        setTotalPages(cachedTipsResponse.data.totalPages);
        setLoading(false);
        setIsFromCache(true);
        setShowCacheIndicator(true);
        console.log('🎯 从应用级缓存加载Tips页面数据', {
          tips: cachedTipsResponse.data.tips.length,
          currentPage: cachedTipsResponse.data.page,
          totalPages: cachedTipsResponse.data.totalPages
        });
        return;
      }

      // 没有缓存或缓存不完整，从API加载
      const [categoriesData, statsData, tipsData] = await Promise.all([
        tipsApi.getCategories(),
        tipsApi.getStats(),
        tipsApi.getTips({ page: 1, limit: 12 })
      ]);

      // 保存到应用级缓存 - 存储完整的TipsResponse对象
      appCache.setCache('tips', cacheKey, tipsData);
      appCache.setStatsCache('tips', statsData);
      appCache.setCategoriesCache(categoriesData);

      setTips(tipsData.tips);
      setTotalPages(tipsData.totalPages);
      setCurrentPage(tipsData.page);
      setCategories(categoriesData);
      setStats(statsData);
      setIsFromCache(false);
      setShowCacheIndicator(true);

      console.log('🌐 从API加载Tips页面数据并缓存', {
        tips: tipsData.tips.length,
        currentPage: tipsData.page,
        totalPages: tipsData.totalPages,
        total: tipsData.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 智能处理筛选变化
  const handleFilterChange = async () => {
    try {
      setLoadingMore(true);
      setError(null);

      // 从应用级缓存获取筛选数据
      const cacheKey = getCacheKey(selectedCategory, selectedDifficulty);
      const cachedTipsResponse = appCache.getCache<TipsResponse>('tips', cacheKey);

      if (cachedTipsResponse) {
        setTips(cachedTipsResponse.data.tips);
        setTotalPages(cachedTipsResponse.data.totalPages);
        setCurrentPage(cachedTipsResponse.data.page);
        setLoadingMore(false);
        setIsFromCache(true);
        setShowCacheIndicator(true);
        console.log(`🎯 从应用级缓存加载筛选: 分类=${selectedCategory || '全部'}, 难度=${selectedDifficulty || '全部'}`, {
          tips: cachedTipsResponse.data.tips.length,
          currentPage: cachedTipsResponse.data.page,
          totalPages: cachedTipsResponse.data.totalPages
        });
        return;
      }

      console.log(`🌐 从API加载筛选: 分类=${selectedCategory || '全部'}, 难度=${selectedDifficulty || '全部'}`);

      // 缓存中没有数据，从API加载
      const options = {
        page: 1,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty })
      };

      const tipsData = await tipsApi.getTips(options);

      // 保存到应用级缓存 - 存储完整的TipsResponse对象
      appCache.setCache('tips', cacheKey, tipsData);

      setTips(tipsData.tips);
      setTotalPages(tipsData.totalPages);
      setCurrentPage(tipsData.page);
      setIsFromCache(false);
      setShowCacheIndicator(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('Error loading tips:', err);
    } finally {
      setLoadingMore(false);
    }
  };



  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setCurrentPage(1);
  };

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty === selectedDifficulty ? "" : difficulty);
    setCurrentPage(1);
  };

  const loadMoreTips = async () => {
    if (currentPage >= totalPages || loadingMore) return;

    const nextPage = currentPage + 1;

    // 直接从API加载更多数据
    try {
      setLoadingMore(true);
      setError(null);

      // 增加一个短暂延迟让loading动画更明显
      await new Promise(resolve => setTimeout(resolve, 500));

      const options = {
        page: nextPage,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty })
      };

      const tipsData = await tipsApi.getTips(options);

      setTips(prevTips => [...prevTips, ...tipsData.tips]);
      setCurrentPage(nextPage); // 成功加载后才更新页码

      // 更新应用级缓存
      const cacheKey = getCacheKey(selectedCategory, selectedDifficulty);
      const existingData = appCache.getCache<TipsResponse>('tips', cacheKey);
      if (existingData) {
        const mergedTipsData: TipsResponse = {
          ...tipsData,
          tips: [...existingData.data.tips, ...tipsData.tips],
          page: nextPage
        };
        appCache.setCache('tips', cacheKey, mergedTipsData);
      }

      setIsFromCache(false);
      setShowCacheIndicator(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载更多失败');
      console.error('Error loading more tips:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'
        }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            {/* 精致的加载动画 */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin">
                  <div className={`absolute inset-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-white'}`}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className={`text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>正在加载做饭指南</h3>
              <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>为您精心准备实用的烹饪指南...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'
        }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <div className="text-6xl mb-4">😞</div>
            <h3 className={`text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>加载失败</h3>
            <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>{error}</p>
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
    <div className={`min-h-screen scrollbar-premium transition-colors duration-300 ${isDark
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'
      }`}>
      {/* 顶部装饰性渐变 */}
      <div className={`absolute top-0 left-0 right-0 h-96 pointer-events-none transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent'
        : 'bg-gradient-to-b from-blue-500/5 via-purple-500/3 to-transparent'
        }`}></div>

      {/* 浮动装饰元素 */}
      <div className={`fixed top-20 left-10 w-32 h-32 rounded-full blur-3xl animate-float pointer-events-none transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-blue-400/15 to-purple-400/15 opacity-40'
        : 'bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-50'
        }`}></div>
      <div className={`fixed bottom-20 right-10 w-40 h-40 rounded-full blur-3xl animate-float pointer-events-none transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-pink-400/15 to-orange-400/15 opacity-40'
        : 'bg-gradient-to-br from-pink-400/10 to-orange-400/10 opacity-50'
        }`} style={{ animationDelay: '2s' }}></div>
      <div className={`fixed top-1/2 right-1/4 w-24 h-24 rounded-full blur-2xl animate-float pointer-events-none transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-green-400/12 to-teal-400/12 opacity-35'
        : 'bg-gradient-to-br from-green-400/8 to-teal-400/8 opacity-40'
        }`} style={{ animationDelay: '4s' }}></div>

      {/* 缓存状态指示器 */}
      <CacheIndicator
        isFromCache={isFromCache}
        visible={showCacheIndicator}
        onHide={() => setShowCacheIndicator(false)}
        position="top-right"
      />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* 页面标题 - 精致化重设计 */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-glow">
                <span className="text-3xl animate-float">💡</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              做饭指南
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 font-light">
              从食材选择到烹饪技巧，<br className="hidden md:block" />
              让您轻松掌握美食制作的秘诀
            </p>
            {stats && (
              <div className={`mt-8 flex flex-wrap justify-center items-center gap-4 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-2xl apple-icon-shadow transition-colors duration-300 ${isDark
                  ? 'bg-slate-800/60 border border-slate-700/20'
                  : 'bg-white/60 border border-white/20'
                  }`}>
                  <span className="text-blue-500">📚</span>
                  <span className="font-medium">{stats.total} 个技巧</span>
                </div>
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-2xl apple-icon-shadow transition-colors duration-300 ${isDark
                  ? 'bg-slate-800/60 border border-slate-700/20'
                  : 'bg-white/60 border border-white/20'
                  }`}>
                  <span className="text-green-500">🏷️</span>
                  <span className="font-medium">{categories.length} 个分类</span>
                </div>
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-2xl apple-icon-shadow transition-colors duration-300 ${isDark
                  ? 'bg-slate-800/60 border border-slate-700/20'
                  : 'bg-white/60 border border-white/20'
                  }`}>
                  <span className="text-purple-500">⭐</span>
                  <span className="font-medium">{stats.popularTags.length} 个热门</span>
                </div>
              </div>
            )}
          </div>

          {/* 筛选栏 - 精致化重设计 */}
          <div className="mb-12 animate-slide-in">
            <div className={`rounded-3xl p-6 md:p-8 transition-colors duration-300 ${isDark
              ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
              : 'apple-card-elevated'
              }`}>
              {/* 背景装饰 */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                : 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'
                }`}></div>
              <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full -ml-8 -mb-8 transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-blue-400/10 to-blue-500/10'
                : 'bg-gradient-to-br from-blue-400/5 to-blue-500/5'
                }`}></div>

              <div className="relative z-10 space-y-8">
                {/* 分类筛选 */}
                <div>
                  <h3 className={`text-lg font-semibold mb-6 flex items-center gap-3 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                    分类筛选
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category, index) => (
                      <Chip
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`px-4 py-2.5 rounded-2xl font-medium cursor-pointer transition-all duration-300 transform hover:scale-[1.01] animate-scale-in whitespace-nowrap ${selectedCategory === category
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white apple-icon-shadow hover:shadow-xl'
                          : isDark
                            ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:shadow-md border border-slate-600/50'
                            : 'bg-white/80 text-slate-700 hover:bg-white hover:shadow-md border border-slate-200/50'
                          }`}
                        style={{ animationDelay: `${0.05 * index}s` }}
                        size="lg"
                      >
                        {category}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* 难度筛选 */}
                <div>
                  <h3 className={`text-lg font-semibold mb-6 flex items-center gap-3 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                    难度筛选
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {difficulties.map((difficulty, index) => (
                      <Chip
                        key={difficulty}
                        onClick={() => handleDifficultySelect(difficulty)}
                        className={`px-6 py-2.5 rounded-2xl font-medium cursor-pointer transition-all duration-300 transform hover:scale-[1.01] animate-scale-in whitespace-nowrap ${selectedDifficulty === difficulty
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white apple-icon-shadow hover:shadow-xl'
                          : isDark
                            ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:shadow-md border border-slate-600/50'
                            : 'bg-white/80 text-slate-700 hover:bg-white hover:shadow-md border border-slate-200/50'
                          }`}
                        style={{ animationDelay: `${0.1 * index}s` }}
                        size="lg"
                      >
                        {difficulty}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* 清除筛选 */}
                {(selectedCategory || selectedDifficulty) && (
                  <div className={`flex justify-end pt-4 transition-colors duration-300 ${isDark ? 'border-t border-slate-700/30' : 'border-t border-slate-200/30'
                    }`}>
                    <Button
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedDifficulty("");
                        setCurrentPage(1);
                      }}
                      className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      size="sm"
                    >
                      清除筛选 ✨
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips 网格 - 精致化重设计 */}
          <div className="mb-12">
            {tips.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up">
                {tips.map((tip, index) => (
                  <div
                    key={tip._id}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${0.05 * (index % 20)}s` }}
                  >
                    {/* 主卡片 - 设置统一高度：h-[420px] */}
                    <div className={`h-[368px] rounded-3xl overflow-hidden flex flex-col transition-colors duration-300 ${isDark
                      ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
                      : 'apple-glass'
                      }`}>
                      {/* 背景装饰 */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-blue-400/5 to-blue-500/5 rounded-full -ml-6 -mb-6"></div>

                      <div className="relative z-10 p-6 flex flex-col h-full">
                        {/* 标题和描述区域 - 固定高度 */}
                        <div className="mb-4 flex-shrink-0 min-h-[120px]">
                          <Tooltip
                            content={tip.title}
                            placement="top"
                            showArrow
                            classNames={{
                              base: "max-w-xs",
                              content: "bg-slate-900 text-white p-3 rounded-xl font-medium shadow-xl"
                            }}
                          >
                            <h3 className="text-lg font-bold text-slate-800 line-clamp-2 cursor-help hover:text-blue-600 transition-colors duration-200 mb-2 leading-tight">
                              {tip.title}
                            </h3>
                          </Tooltip>

                          <p className="text-slate-600 leading-relaxed text-sm line-clamp-3 overflow-hidden">
                            {tip.summary}
                          </p>
                        </div>

                        {/* 中间标签区域 - 弹性增长 */}
                        <div className="flex-grow flex flex-col">
                          <div className="space-y-3">
                            {/* 分类和难度标签 - 精致设计 */}
                            <div className="flex items-center gap-2">
                              <Chip
                                className="bg-gradient-to-r from-blue-500/10 to-blue-500/20 text-blue-600 text-xs font-semibold border border-blue-500/20 shadow-sm"
                                size="sm"
                              >
                                {tip.category}
                              </Chip>
                              <Chip
                                className="bg-gradient-to-r from-green-500/10 to-green-500/20 text-green-600 text-xs font-semibold border border-green-500/20 shadow-sm"
                                size="sm"
                              >
                                {tip.difficulty}
                              </Chip>
                            </div>

                            {/* 标签云 - 优雅布局 */}
                            <div className="min-h-[2rem]">
                              {tip.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {tip.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className={`text-xs px-3 py-1 rounded-full font-medium hover:shadow-sm transition-colors duration-200 ${isDark
                                        ? 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/80'
                                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                                        }`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {tip.tags.length > 3 && (
                                    <span className="text-xs bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full font-medium shadow-sm">
                                      +{tip.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 底部区域 - 适合人群 + 按钮 */}
                        <div className="flex-shrink-0 space-y-3 mt-auto">
                          {/* 适合人群 */}
                          <div className="min-h-[1.5rem]">
                            {tip.targetAudience.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-4 h-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                                  <span className="text-xs">👥</span>
                                </div>
                                <span className="font-medium">适合: {tip.targetAudience.slice(0, 2).join(', ')}</span>
                              </div>
                            )}
                          </div>

                          {/* 分隔线 */}
                          <div className="border-t border-slate-200/30"></div>

                          {/* 操作按钮 */}
                          <Button
                            onClick={() => navigate(`/tips/${tip._id}`)}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl py-3 font-semibold transition-all duration-300 apple-icon-shadow hover:shadow-xl transform hover:scale-[1.01]"
                            size="md"
                          >
                            查看详情 ✨
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 空状态 - 精美设计 */}
            {tips.length === 0 && (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 apple-icon-shadow">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">暂无找到相关指南</h3>
                <p className="text-slate-600 mb-6">尝试调整筛选条件或查看全部指南</p>
                <Button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedDifficulty("");
                    setCurrentPage(1);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                >
                  查看全部指南 🍳
                </Button>
              </div>
            )}

            {/* 加载更多区域 */}
            {(() => {
              const shouldShow = tips.length > 0 && (currentPage < totalPages || loadingMore);
              console.log('🔍 Tips加载更多按钮显示条件:', {
                tipsLength: tips.length,
                currentPage,
                totalPages,
                loadingMore,
                shouldShow,
                condition1: tips.length > 0,
                condition2: currentPage < totalPages,
                condition3: loadingMore
              });
              return shouldShow;
            })() && (
                <div className="text-center mt-16 animate-fade-in-up">


                  {/* 加载中的顶部动画 */}
                  {loadingMore && (
                    <div className="mb-8 animate-fade-in-up">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-600 font-semibold text-lg">正在加载更多指南...</p>
                          <p className="text-slate-500 text-sm mt-1">请稍候，为您准备更多烹饪技巧</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 加载更多按钮 - 醒目设计 */}
                  <div className={`rounded-3xl p-8 max-w-2xl mx-auto transition-colors duration-300 ${isDark
                    ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
                    : 'apple-card-elevated'
                    }`}>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl apple-icon-shadow flex items-center justify-center">
                        <span className="text-white text-2xl">💡</span>
                      </div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>还有更多实用指南</h3>
                      <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>已展示 {tips.length} 个指南，更多烹饪经验等你发现</p>
                      <Button
                        onClick={loadMoreTips}
                        disabled={loadingMore || currentPage >= totalPages}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-16 py-4 rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] hover:-translate-y-0.5"
                        size="lg"
                      >
                        {loadingMore ? (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>加载中...</span>
                          </div>
                        ) : (
                          <span>📚 加载更多指南 ({currentPage}/{totalPages})</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* 统计信息卡片 - 精致化重设计 */}
          {stats && (
            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl premium-glass transition-colors duration-300 ${isDark
                ? '!bg-slate-800/60'
                : '!bg-white/60'
                }`}>
                {/* 背景装饰 */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                  : 'bg-gradient-to-br from-purple-500/5 to-pink-500/5'
                  }`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full -ml-8 -mb-8 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-purple-400/10 to-purple-500/10'
                  : 'bg-gradient-to-br from-purple-400/5 to-purple-500/5'
                  }`}></div>

                <div className="relative z-10">
                  <h2 className={`text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse"></div>
                    热门标签
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full animate-pulse"></div>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-items-center">
                    {stats.popularTags.slice(0, 10).map((tag, index) => (
                      <Chip
                        key={tag._id}
                        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 px-4 py-2 text-sm font-semibold border border-purple-500/20 hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] animate-scale-in"
                        style={{ animationDelay: `${0.05 * index}s` }}
                        size="md"
                      >
                        {tag._id} ({tag.count})
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 底部装饰 */}
          <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
              <span>🍳</span>
              <span>掌握技巧，享受烹饪</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 