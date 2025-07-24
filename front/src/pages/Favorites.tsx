import { Button } from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Dish } from "../services/dishesApi";
import { useAppCache } from "../hooks/useAppCache";
import { getFavorites, removeFavorite } from "../utils/favorites";
import { useTheme } from "../hooks/useTheme";

export default function Favorites() {
  const navigate = useNavigate();
  const appCache = useAppCache();
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemoveFavorite = (dish: Dish) => {
    // 更新localStorage
    const updated = removeFavorite(dish._id);
    setFavorites(updated);

    // 同步更新应用级缓存
    appCache.updateFavoritesMap(dish._id, false);

    console.log(`🗑️ 已从收藏中移除: ${dish.name}，同时更新了应用级缓存`);
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
        ? 'bg-gradient-to-br from-pink-400/15 to-rose-400/15 opacity-40'
        : 'bg-gradient-to-br from-pink-400/10 to-rose-400/10 opacity-50'
        }`}></div>
      <div className={`fixed bottom-20 right-10 w-40 h-40 rounded-full blur-3xl animate-float pointer-events-none transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-purple-400/15 to-pink-400/15 opacity-40'
        : 'bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-50'
        }`} style={{ animationDelay: '2s' }}></div>
      <div className={`fixed top-1/2 right-1/4 w-24 h-24 rounded-full blur-2xl animate-float pointer-events-none transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-red-400/12 to-pink-400/12 opacity-35'
        : 'bg-gradient-to-br from-red-400/8 to-pink-400/8 opacity-40'
        }`} style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* 页面标题 - 精致化重设计 */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-glow">
                <span className="text-3xl animate-float">❤️</span>
              </div>
            </div>
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300 ${isDark
              ? 'from-slate-200 via-slate-100 to-slate-200'
              : 'from-slate-800 via-slate-700 to-slate-800'
              }`}>
              我的收藏
            </h1>
            <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8 font-light transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
              管理您收藏的菜品，随时查看喜爱的美食制作方法
            </p>
            <div className="mt-8 flex justify-center items-center">
              <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl apple-icon-shadow transition-colors duration-300 ${isDark
                ? 'bg-slate-800/60 backdrop-blur-sm border border-slate-700/20'
                : 'bg-white/60 backdrop-blur-sm border border-white/20'
                }`}>
                <span className="text-pink-500">❤️</span>
                <span className={`font-medium transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>共 {favorites.length} 道收藏菜品</span>
              </div>
            </div>
          </div>

          {/* 收藏菜品列表 - 精致化重设计 */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {favorites.map((dish, index) => {
                const difficultyStyle = getDifficultyColor(dish.difficulty);

                return (
                  <div
                    key={dish._id}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${0.05 * (index % 20)}s` }}
                  >
                    {/* 设置统一高度：h-[420px] */}
                    <div className={`h-[420px] rounded-3xl overflow-hidden flex flex-col transition-colors duration-300 ${isDark
                      ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
                      : 'apple-glass'
                      }`}>
                      {/* 卡片头部 - flex-1 让内容区域自动填充 */}
                      <div className="relative p-6 pb-4 flex-1 flex flex-col">
                        {/* 背景装饰 */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-full -mr-12 -mt-12"></div>

                        <div className="relative z-10 flex-1 flex flex-col">
                          {/* 标题区域 - 固定高度 */}
                          <div className="flex items-start justify-between mb-4 min-h-[80px]">
                            <div className="flex-1 pr-4">
                              <h3 className={`text-xl font-bold mb-2 group-hover:text-pink-600 transition-colors duration-300 line-clamp-2 leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'
                                }`}>
                                {dish.name}
                              </h3>
                              <p className={`text-sm leading-relaxed line-clamp-2 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                {dish.description || '暂无描述'}
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
                              <span className="font-medium">{dish.servings || '2'}人份</span>
                            </div>
                          </div>

                          {/* 难度和分类标签 - 固定高度 */}
                          <div className="flex items-center justify-between mb-4 min-h-[32px]">
                            <div className={`${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border} border px-3 py-1.5 rounded-xl text-xs font-semibold`}>
                              {dish.difficulty}
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-300 ${isDark
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-slate-100 text-slate-700'
                              }`}>
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
                                    className="bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-100 px-2.5 py-1 rounded-lg text-xs font-medium"
                                  >
                                    {tag}
                                  </div>
                                ))}
                                {dish.tags && dish.tags.length > 3 && (
                                  <div className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-300 ${isDark
                                    ? 'bg-slate-700 text-slate-400'
                                    : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    +{dish.tags.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors duration-300 ${isDark
                                  ? 'bg-slate-800 text-slate-500 border-slate-700'
                                  : 'bg-slate-50 text-slate-400 border-slate-100'
                                  }`}>
                                  精选收藏
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors duration-300 ${isDark
                                  ? 'bg-slate-800 text-slate-500 border-slate-700'
                                  : 'bg-slate-50 text-slate-400 border-slate-100'
                                  }`}>
                                  美味
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 特点介绍 - 弹性区域，占用剩余空间 */}
                          <div className="flex-1 flex flex-col justify-start">
                            {dish.features && dish.features.length > 0 ? (
                              <div>
                                <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                  <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span>
                                  特色亮点
                                </h4>
                                <p className={`text-sm leading-relaxed line-clamp-3 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                  {dish.features.join(' • ')}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                  <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"></span>
                                  我的收藏
                                </h4>
                                <p className={`text-sm leading-relaxed italic transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  这道菜品是您精心挑选的收藏，制作工艺精良，口感丰富，值得反复品味。
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
                            onPress={() => {
                              console.log(`🔍 查看菜品详情: ${dish.name}`);
                              navigate(`/dishes/${encodeURIComponent(dish.filePath || dish._id)}`);
                            }}
                          >
                            查看详情
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 px-4 py-2.5 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                            size="sm"
                            onPress={() => handleRemoveFavorite(dish)}
                          >
                            💔
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 空状态 - 精致化重设计 */
            <div className="text-center py-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 apple-icon-shadow transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-slate-700 to-slate-800'
                : 'bg-gradient-to-br from-slate-100 to-slate-200'
                }`}>
                <span className="text-3xl">💔</span>
              </div>
              <h3 className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                还没有收藏的菜品
              </h3>
              <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                快去菜品大全中发现您喜欢的美食，点击❤️按钮收藏吧！
              </p>
              <div className="mt-8">
                <Button
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                  size="lg"
                  onPress={() => navigate('/dishes')}
                >
                  去发现美食 🍽️
                </Button>
              </div>
            </div>
          )}

          {/* 底部提示信息 */}
          {favorites.length > 0 && (
            <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className={`rounded-3xl p-8 shadow-2xl premium-glass max-w-4xl mx-auto transition-colors duration-300 ${isDark
                ? '!bg-slate-800/60 backdrop-blur-xl'
                : '!bg-white/60 backdrop-blur-xl'
                }`}>
                {/* 背景装饰 */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-pink-500/10 to-rose-500/10'
                  : 'bg-gradient-to-br from-pink-500/5 to-rose-500/5'
                  }`}></div>
                <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                  : 'bg-gradient-to-br from-purple-500/5 to-pink-500/5'
                  }`}></div>

                <div className="relative z-10">
                  <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>收藏提示</h3>
                  <p className={`leading-relaxed text-lg max-w-2xl mx-auto transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    收藏功能会将您喜欢的菜品保存在本地浏览器中，方便您随时查看。
                    如果您清理了浏览器数据，收藏信息可能会丢失，建议您记录下喜欢的菜品名称。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 底部装饰 */}
          <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className={`inline-flex items-center gap-2 text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
              <span>❤️</span>
              <span>用心收藏，用爱烹饪</span>
              <span>❤️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

