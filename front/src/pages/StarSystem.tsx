import { Button, Chip } from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { starSystemApi } from "../services/starSystemApi";
import type { StarSystem, StarSystemStats, StarSystemResponse } from "../services/starSystemApi";
import { useAppCache } from "../hooks/useAppCache";
import CacheIndicator from "../components/CacheIndicator";
import { useTheme } from "../hooks/useTheme";

export default function StarSystem() {
  const navigate = useNavigate();
  const appCache = useAppCache();
  const { isDark } = useTheme();

  const [starSystems, setStarSystems] = useState<StarSystem[]>([]);
  const [stats, setStats] = useState<StarSystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 缓存指示器状态
  const [showCacheIndicator, setShowCacheIndicator] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // 根据星级获取颜色
  const getDifficultyColor = (starLevel: number) => {
    const colors = {
      1: { color: "green-500", gradient: "from-green-500 to-green-600", bg: "green" },
      2: { color: "blue-500", gradient: "from-blue-500 to-blue-600", bg: "blue" },
      3: { color: "yellow-500", gradient: "from-yellow-500 to-orange-500", bg: "yellow" },
      4: { color: "orange-500", gradient: "from-orange-500 to-red-500", bg: "orange" },
      5: { color: "red-500", gradient: "from-red-500 to-pink-500", bg: "red" },
      6: { color: "purple-500", gradient: "from-purple-500 to-pink-500", bg: "purple" },
      7: { color: "pink-500", gradient: "from-pink-500 to-rose-500", bg: "pink" }
    };
    return colors[starLevel as keyof typeof colors] || colors[1];
  };

  // 根据星级获取图标
  const getDifficultyIcon = (starLevel: number) => {
    const icons = {
      1: "🌱", 2: "🍃", 3: "🌿", 4: "🌳", 5: "🔥", 6: "💎", 7: "👑"
    };
    return icons[starLevel as keyof typeof icons] || "⭐";
  };

  // 根据星级获取难度级别
  const getDifficultyLevel = (starLevel: number) => {
    if (starLevel <= 2) return "初级";
    if (starLevel <= 4) return "中级";
    if (starLevel <= 6) return "高级";
    return "专家级";
  };

  useEffect(() => {
    // 重置状态，防止从其他页面进入时状态不正确
    setCurrentPage(1);
    setLoadingMore(false);
    setError(null);

    loadInitialData();

    // 添加临时全局调试函数
    const clearStarSystemCache = () => {
      // 清理StarSystem缓存
      const cacheKeys = ['starSystems_all', 'starSystems'];
      cacheKeys.forEach(key => {
        localStorage.removeItem(`cache_starSystems_${key}`);
        console.log(`🗑️ 已清理StarSystem缓存: ${key}`);
      });

      // 清理应用级缓存中的starSystems数据
      try {
        const cacheData = JSON.parse(localStorage.getItem('appCache') || '{}');
        if (cacheData.starSystems) {
          delete cacheData.starSystems;
          localStorage.setItem('appCache', JSON.stringify(cacheData));
          console.log('🗑️ 已清理应用级StarSystem缓存');
        }
      } catch (e) {
        console.warn('清理应用级缓存失败:', e);
      }

      console.log('🎯 StarSystem缓存已全部清理，请刷新页面测试');
    };

    (window as typeof window & { clearStarSystemCache?: () => void }).clearStarSystemCache = clearStarSystemCache;
    console.log('🔧 调试功能：在控制台输入 clearStarSystemCache() 可清理StarSystem缓存');

    // 页面卸载时清理
    return () => {
      delete (window as typeof window & { clearStarSystemCache?: () => void }).clearStarSystemCache;
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 从应用级缓存获取数据
      const cachedStarSystemsResponse = appCache.getCache<StarSystemResponse>('starSystems', 'all');
      const cachedStats = appCache.getStatsCache('starSystems');

      // 如果有完整的缓存数据，直接使用
      if (cachedStarSystemsResponse && cachedStats) {
        setStarSystems(cachedStarSystemsResponse.data.starSystems);
        setTotalPages(cachedStarSystemsResponse.data.totalPages);
        setCurrentPage(cachedStarSystemsResponse.data.page);
        setStats(cachedStats);
        setLoading(false);
        setIsFromCache(true);
        setShowCacheIndicator(true);
        console.log('🎯 从应用级缓存加载StarSystem页面数据', {
          starSystems: cachedStarSystemsResponse.data.starSystems.length,
          currentPage: cachedStarSystemsResponse.data.page,
          totalPages: cachedStarSystemsResponse.data.totalPages
        });
        return;
      }

      // 没有缓存或缓存不完整，从API加载
      const [starSystemsData, statsData] = await Promise.all([
        starSystemApi.getStarSystems({ page: 1, limit: 9 }),
        starSystemApi.getStats()
      ]);

      setStarSystems(starSystemsData.starSystems || []);
      setTotalPages(starSystemsData.totalPages || 1);
      setCurrentPage(starSystemsData.page || 1);

      // 处理统计数据，计算平均值
      let processedStats = null;
      if (statsData) {
        processedStats = {
          ...statsData,
          total: statsData.totalStarSystems,
          averageDishesPerLevel: statsData.totalStarSystems > 0
            ? statsData.totalDishes / statsData.totalStarSystems
            : 0
        };
        setStats(processedStats);
      }

      // 保存到应用级缓存 - 存储完整的StarSystemResponse对象
      appCache.setCache('starSystems', 'all', starSystemsData);
      if (processedStats) {
        appCache.setStatsCache('starSystems', processedStats);
      }

      setIsFromCache(false);
      setShowCacheIndicator(true);

      console.log('🌐 从API加载StarSystem页面数据并缓存', {
        starSystems: starSystemsData.starSystems?.length || 0,
        currentPage: starSystemsData.page,
        totalPages: starSystemsData.totalPages,
        total: starSystemsData.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('Error loading initial data:', err);
      // 确保在错误情况下starSystems仍然是数组
      setStarSystems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreStarSystems = async () => {
    if (currentPage >= totalPages || loadingMore) return;

    const nextPage = currentPage + 1;

    try {
      setLoadingMore(true);
      setError(null);

      // 增加一个短暂延迟让loading动画更明显
      await new Promise(resolve => setTimeout(resolve, 500));

      const starSystemsData = await starSystemApi.getStarSystems({
        page: nextPage,
        limit: 9
      });

      // 追加数据
      setStarSystems(prev => [...prev, ...(starSystemsData.starSystems || [])]);
      setCurrentPage(nextPage); // 成功加载后才更新页码
      setTotalPages(starSystemsData.totalPages || 1);

      // 更新应用级缓存
      const existingData = appCache.getCache<StarSystemResponse>('starSystems', 'all');
      if (existingData) {
        const mergedStarSystemsData: StarSystemResponse = {
          ...starSystemsData,
          starSystems: [...existingData.data.starSystems, ...(starSystemsData.starSystems || [])],
          page: nextPage
        };
        appCache.setCache('starSystems', 'all', mergedStarSystemsData);
      }

      setIsFromCache(false);
      setShowCacheIndicator(true);

      console.log(`🌐 从API加载更多StarSystem数据: 页面=${nextPage}`, {
        newStarSystems: starSystemsData.starSystems?.length || 0,
        totalStarSystems: starSystems.length + (starSystemsData.starSystems?.length || 0),
        currentPage: nextPage,
        totalPages: starSystemsData.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载更多失败');
      console.error('Error loading more star systems:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleViewStarSystemDetail = (starSystem: StarSystem) => {
    // 可以根据需要导航到详情页面或者显示菜品列表
    console.log('查看星级详情:', starSystem);
    navigate(`/starsystem/${starSystem._id}`);
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
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-spin">
                  <div className={`absolute inset-2 rounded-full transition-colors duration-300 ${isDark ? 'bg-slate-800' : 'bg-white'}`}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className={`text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>正在加载星级菜谱</h3>
              <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>为您精心准备分级烹饪指南...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50 pt-8 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-apple-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">加载失败</h3>
          <p className="text-apple-red mb-6">{error}</p>
          <Button
            onClick={loadInitialData}
            className="bg-apple-blue hover:bg-apple-blue-dark text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            重新加载
          </Button>
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
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/5 via-purple-500/3 to-transparent pointer-events-none"></div>

      {/* 浮动装饰元素 */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-float pointer-events-none opacity-50"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float pointer-events-none opacity-50" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-blue-400/8 to-teal-400/8 rounded-full blur-2xl animate-float pointer-events-none opacity-40" style={{ animationDelay: '4s' }}></div>

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
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-glow">
                <span className="text-3xl animate-float">⭐</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              星级菜谱
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 font-light">
              从一星简易到七星大师级，<br className="hidden md:block" />
              系统化学习烹饪技能，成就美食达人
            </p>
            {stats && (
              <div className={`mt-8 flex flex-wrap justify-center items-center gap-4 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-2xl apple-icon-shadow transition-colors duration-300 ${isDark
                  ? 'bg-slate-800/60 border border-slate-700/20'
                  : 'bg-white/60 border border-white/20'
                  }`}>
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-medium">{stats.totalStarSystems} 个星级</span>
                </div>
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-2xl apple-icon-shadow transition-colors duration-300 ${isDark
                  ? 'bg-slate-800/60 border border-slate-700/20'
                  : 'bg-white/60 border border-white/20'
                  }`}>
                  <span className="text-green-500">🍽️</span>
                  <span className="font-medium">{stats.totalDishes} 道菜品</span>
                </div>
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-2xl apple-icon-shadow transition-colors duration-300 ${isDark
                  ? 'bg-slate-800/60 border border-slate-700/20'
                  : 'bg-white/60 border border-white/20'
                  }`}>
                  <span className="text-purple-500">📈</span>
                  <span className="font-medium">平均 {stats.averageDishesPerLevel != null ? stats.averageDishesPerLevel.toFixed(1) : '0.0'} 道/级</span>
                </div>
              </div>
            )}
          </div>

          {/* 星级卡片网格 - 精致化重设计 */}
          <div className="mb-12">
            {starSystems && starSystems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {starSystems.map((starSystem, index) => {
                  const { gradient } = getDifficultyColor(starSystem.starLevel);
                  const icon = getDifficultyIcon(starSystem.starLevel);
                  const level = getDifficultyLevel(starSystem.starLevel);

                  return (
                    <div
                      key={starSystem._id}
                      className="group animate-scale-in"
                      style={{ animationDelay: `${0.05 * (index % 20)}s` }}
                    >
                      {/* 主卡片 - 设置统一高度：h-[420px] */}
                      <div className={`h-[420px] rounded-3xl overflow-hidden flex flex-col transition-colors duration-300 ${isDark
                        ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
                        : 'apple-glass'
                        }`}>
                        {/* 背景装饰 */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-full -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-yellow-400/5 to-yellow-500/5 rounded-full -ml-6 -mb-6"></div>

                        <div className="relative z-10 p-6 flex flex-col h-full">
                          {/* 标题区域 - 固定高度 */}
                          <div className="mb-4 flex-shrink-0 min-h-[100px]">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                                  <span className="text-2xl">{icon}</span>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                                    {starSystem.title}
                                  </h3>
                                  <p className="text-slate-600 text-sm font-medium">{level}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {Array.from({ length: starSystem.starLevel }, (_, i) => (
                                  <span key={i} className="text-yellow-500 text-base">⭐</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 中间内容区域 - 弹性增长 */}
                          <div className="flex-grow flex flex-col">
                            <div className="space-y-3">
                              {/* 菜品数量徽章 */}
                              <div className="flex items-center gap-2">
                                <Chip
                                  className={`bg-gradient-to-r ${gradient}/10 to-${gradient.split(' ')[1]}/20 text-slate-700 text-sm font-semibold border border-slate-200/50 shadow-sm`}
                                  size="md"
                                >
                                  {starSystem.dishCount} 道菜品
                                </Chip>
                              </div>

                              {/* 难度描述 */}
                              {starSystem.difficultyDescription && (
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                  {starSystem.difficultyDescription}
                                </p>
                              )}

                              {/* 推荐人群 */}
                              {starSystem.recommendedFor && starSystem.recommendedFor.length > 0 && (
                                <div className="min-h-[2rem]">
                                  <div className="flex flex-wrap gap-1">
                                    {starSystem.recommendedFor.slice(0, 3).map((audience, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-slate-100/80 text-slate-600 px-3 py-1 rounded-full font-medium shadow-sm"
                                      >
                                        {audience}
                                      </span>
                                    ))}
                                    {starSystem.recommendedFor.length > 3 && (
                                      <span className="text-xs bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full font-medium shadow-sm">
                                        +{starSystem.recommendedFor.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 标签 */}
                              {starSystem.tags && starSystem.tags.length > 0 && (
                                <div className="min-h-[2rem]">
                                  <div className="flex flex-wrap gap-1">
                                    {starSystem.tags.slice(0, 2).map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-500/20 shadow-sm"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {starSystem.tags.length > 2 && (
                                      <span className="text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full font-medium shadow-sm">
                                        +{starSystem.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 底部操作区域 - 固定高度 */}
                          <div className="flex-shrink-0 space-y-3 mt-auto">
                            {/* 分隔线 */}
                            <div className="border-t border-slate-200/30"></div>

                            {/* 操作按钮 */}
                            <Button
                              onClick={() => handleViewStarSystemDetail(starSystem)}
                              className={`w-full bg-gradient-to-r ${gradient} text-white rounded-2xl py-3 font-semibold transition-all duration-300 apple-icon-shadow hover:shadow-xl transform hover:scale-[1.01]`}
                              size="md"
                            >
                              查看详情 ✨
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 加载更多区域 */}
            {(() => {
              const shouldShow = starSystems.length > 0 && (currentPage < totalPages || loadingMore);
              console.log('🔍 StarSystem加载更多按钮显示条件:', {
                starSystemsLength: starSystems.length,
                currentPage,
                totalPages,
                loadingMore,
                shouldShow,
                condition1: starSystems.length > 0,
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
                          <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold text-lg transition-colors duration-300 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>正在加载更多星级菜谱...</p>
                          <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>请稍候，为您准备更多挑战菜谱</p>
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
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl apple-icon-shadow flex items-center justify-center">
                        <span className="text-white text-2xl">⭐</span>
                      </div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>还有更多星级菜谱</h3>
                      <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>已展示 {starSystems.length} 个星级，更多进阶菜谱等你挑战</p>
                      <Button
                        onClick={loadMoreStarSystems}
                        disabled={loadingMore || currentPage >= totalPages}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-16 py-4 rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] hover:-translate-y-0.5"
                        size="lg"
                      >
                        {loadingMore ? (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>加载中...</span>
                          </div>
                        ) : (
                          <span>⭐ 加载更多星级 ({currentPage}/{totalPages})</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            {/* 空状态 - 精美设计 */}
            {starSystems.length === 0 && (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 apple-icon-shadow">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>暂无星级菜谱</h3>
                <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>系统正在为您准备精彩内容</p>
                <Button
                  onClick={loadInitialData}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                >
                  重新加载 🔄
                </Button>
              </div>
            )}
          </div>

          {/* 提示信息 - 精致化重设计 */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl premium-glass max-w-4xl mx-auto transition-colors duration-300 ${isDark
              ? '!bg-slate-800/60'
              : '!bg-white/60'
              }`}>
              {/* 背景装饰 */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
                : 'bg-gradient-to-br from-yellow-500/5 to-orange-500/5'
                }`}></div>
              <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full -ml-8 -mb-8 transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-yellow-400/10 to-yellow-500/10'
                : 'bg-gradient-to-br from-yellow-400/5 to-yellow-500/5'
                }`}></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 apple-icon-shadow">
                  <span className="text-white text-2xl">💡</span>
                </div>
                <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>学习建议</h3>
                <p className={`leading-relaxed text-lg max-w-2xl mx-auto transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                  <span className="font-semibold text-blue-600">🌟 循序渐进：</span>
                  选择适合你当前水平的星级菜谱，从基础技能开始积累经验。
                  <br />
                  每完成一个星级的菜谱，你就能解锁更高难度的挑战，逐步成为烹饪大师！
                </p>
              </div>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
              <span>⭐</span>
              <span>挑战自我，精进厨艺</span>
              <span>🎯</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 