import { Button, Chip } from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Dish } from "../services/dishesApi";
import { useAppCache } from "../hooks/useAppCache";
import { getFavorites, removeFavorite } from "../utils/favorites";

export default function Favorites() {
  const navigate = useNavigate();
  const appCache = useAppCache();
  const [favorites, setFavorites] = useState<Dish[]>([]);

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
    switch (difficulty) {
      case '初级': return { color: 'green-500', bg: 'green-500/10', text: 'green-600' };
      case '中级': return { color: 'orange-500', bg: 'orange-500/10', text: 'orange-600' };
      case '高级': return { color: 'red-500', bg: 'red-500/10', text: 'red-600' };
      case '专家级': return { color: 'purple-500', bg: 'purple-500/10', text: 'purple-600' };
      default: return { color: 'slate-500', bg: 'slate-500/10', text: 'slate-600' };
    }
  };

  const getStarLevelIcon = (starLevel: number) => {
    if (starLevel <= 2) return '🌟';
    if (starLevel <= 4) return '⭐';
    return '✨';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 scrollbar-premium">
      {/* 顶部装饰性渐变 */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/5 via-purple-500/3 to-transparent pointer-events-none"></div>

      {/* 浮动装饰元素 */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-float pointer-events-none opacity-50"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float pointer-events-none opacity-50" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-red-400/8 to-pink-400/8 rounded-full blur-2xl animate-float pointer-events-none opacity-40" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* 页面标题 - 精致化重设计 */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-glow">
                <span className="text-3xl animate-float">❤️</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              我的收藏
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 font-light">
              管理您收藏的菜品，随时查看喜爱的美食制作方法
            </p>
            <div className="mt-8 flex justify-center items-center">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl apple-icon-shadow border border-white/20">
                <span className="text-pink-500">❤️</span>
                <span className="font-medium text-slate-700">共 {favorites.length} 道收藏菜品</span>
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
                    <div className="h-[420px] apple-glass rounded-3xl overflow-hidden flex flex-col">
                      {/* 背景装饰 */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-full -mr-12 -mt-12"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-pink-400/5 to-pink-500/5 rounded-full -ml-8 -mb-8"></div>

                      <div className="relative z-10 p-6 flex flex-col h-full">
                        {/* 标题和描述区域 - 固定高度 */}
                        <div className="mb-4 flex-shrink-0 min-h-[100px]">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-pink-600 transition-colors duration-300 leading-tight flex-1 pr-2">
                              {dish.name}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-lg">{getStarLevelIcon(dish.starLevel)}</span>
                              <span className="text-sm text-slate-600 font-medium">{dish.starLevel}</span>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                            {dish.description}
                          </p>
                        </div>

                        {/* 中间信息区域 - 弹性增长 */}
                        <div className="flex-grow flex flex-col">
                          <div className="space-y-3">
                            {/* 基本信息 */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-500">⏱️</span>
                                <span className="text-sm text-slate-600 font-medium">{dish.estimatedTime}分钟</span>
                              </div>
                              <Chip
                                className="bg-slate-100/80 text-slate-700 text-xs font-medium shadow-sm"
                                size="sm"
                              >
                                {dish.categoryName || dish.category}
                              </Chip>
                            </div>

                            {/* 难度标签 */}
                            <div className="flex items-center gap-2">
                              <Chip
                                className={`bg-${difficultyStyle.bg} text-${difficultyStyle.text} text-xs font-semibold border border-${difficultyStyle.color}/20 shadow-sm`}
                                size="sm"
                              >
                                {dish.difficulty}
                              </Chip>
                            </div>

                            {/* 标签云 */}
                            {dish.tags && dish.tags.length > 0 && (
                              <div className="min-h-[2rem]">
                                <div className="flex flex-wrap gap-1">
                                  {(dish.tags || []).slice(0, 3).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-500/20 shadow-sm"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {dish.tags && dish.tags.length > 3 && (
                                    <span className="text-xs bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full font-medium shadow-sm">
                                      +{dish.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 底部操作区域 - 固定在底部 */}
                        <div className="flex-shrink-0 space-y-3 mt-auto">
                          {/* 分隔线 */}
                          <div className="border-t border-slate-200/30"></div>

                          {/* 操作按钮 */}
                          <div className="flex gap-3">
                            <Button
                              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl py-3 font-semibold transition-all duration-300 apple-icon-shadow hover:shadow-xl transform hover:scale-[1.01] flex-1"
                              size="sm"
                              onClick={() => navigate(`/dishes/${encodeURIComponent(dish.filePath)}`)}
                            >
                              查看详情 ✨
                            </Button>
                            <Button
                              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl py-3 font-semibold transition-all duration-300 apple-icon-shadow hover:shadow-xl transform hover:scale-[1.01] px-4"
                              size="sm"
                              onClick={() => handleRemoveFavorite(dish)}
                            >
                              💔
                            </Button>
                          </div>
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
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 apple-icon-shadow">
                <span className="text-4xl">💔</span>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                还没有收藏任何菜品
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                去菜品大全页面浏览美食，点击收藏按钮将喜欢的菜谱添加到这里吧！
              </p>
              <Button
                onClick={() => navigate('/dishes')}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                size="lg"
              >
                去发现菜谱 🍽️
              </Button>
            </div>
          )}

          {/* 收藏提示 - 精致化重设计 */}
          {favorites.length > 0 && (
            <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl premium-glass max-w-4xl mx-auto">
                {/* 背景装饰 */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-pink-400/5 to-pink-500/5 rounded-full -ml-8 -mb-8"></div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-6 apple-icon-shadow">
                    <span className="text-white text-2xl">💡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">收藏提示</h3>
                  <p className="text-slate-600 leading-relaxed text-lg max-w-2xl mx-auto">
                    收藏的菜品会保存在本地浏览器中。定期备份重要的收藏，或者截图保存制作方法。
                    <br />
                    建议优先学会简单的菜品，再挑战复杂的料理。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 底部装饰 */}
          <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
              <span>❤️</span>
              <span>珍藏美味，用心烹饪</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

