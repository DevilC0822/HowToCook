import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { dishesApi } from "../services/dishesApi";
import type { Dish } from "../services/dishesApi";
import { addFavorite, removeFavoriteWithCache, isFavorite } from "../utils/favorites";

export default function DishDetail() {
  const { filePath } = useParams<{ filePath: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (filePath) {
      loadDishDetail(filePath);
    }
  }, [filePath]);

  useEffect(() => {
    if (dish) {
      setIsFav(isFavorite(dish._id));
    }
  }, [dish]);

  const loadDishDetail = async (filePath: string) => {
    try {
      setLoading(true);
      setError(null);
      const dishData = await dishesApi.getDishByFilePath(decodeURIComponent(filePath));
      setDish(dishData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      setDish(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (dish) {
      if (isFav) {
        // 使用带缓存同步的移除收藏函数
        removeFavoriteWithCache(dish._id);
        console.log(`💔 已取消收藏: ${dish.name}`);
      } else {
        // 使用带缓存同步的添加收藏函数
        addFavorite(dish);
        console.log(`❤️ 已添加收藏: ${dish.name}`);
      }
      setIsFav(!isFav);
    }
  };



  const getStarIcons = (starLevel: number) => {
    return '★'.repeat(Math.min(starLevel, 5)) + '☆'.repeat(Math.max(0, 5 - starLevel));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
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
              <h3 className="text-xl font-semibold text-slate-800">正在加载菜品详情</h3>
              <p className="text-slate-600">为您精心准备详细的制作方法...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8 max-w-md mx-auto p-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <span className="text-6xl opacity-75">😞</span>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">加载失败</h3>
              <p className="text-slate-600 leading-relaxed">{error || '找不到指定的菜品，可能已被移除或路径错误'}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              >
                ← 返回上页
              </Button>
              <Button
                onClick={() => navigate('/dishes')}
                className="bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 hover:border-slate-300 px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              >
                浏览菜品
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dish-detail-container min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 scrollbar-premium">
      {/* 背景装饰 */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/3 via-purple-500/2 to-transparent pointer-events-none"></div>
      <div className="fixed top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-pink-400/5 to-orange-400/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* 顶部导航栏 */}
          <div className="mb-8 animate-fade-in-up">
            <div className="dish-detail-header flex items-center justify-between apple-card-elevated rounded-3xl p-6">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] btn-premium"
                >
                  ← 返回
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                    {dish.name}
                  </h1>
                  <p className="text-slate-600 mt-1 text-sm">精选美食 · 用心制作</p>
                </div>
              </div>

              <Button
                onClick={handleToggleFavorite}
                className={`favorite-button ${isFav
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                  : "bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 hover:border-rose-300 px-6 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                  }`}
              >
                {isFav ? '❤️ 已收藏' : '🤍 收藏'}
              </Button>
            </div>
          </div>

          {/* 菜品概览卡片 - 简约苹果风格 */}
          <div className="mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="apple-card-elevated rounded-3xl p-8">
              {/* 标签网格 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {/* 难度标签 */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-4 text-center border border-slate-200/50 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-slate-800 font-semibold text-sm mb-1">{dish.difficulty}</div>
                  <div className="text-slate-500 text-xs">难度</div>
                </div>

                {/* 星级标签 */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center border border-blue-200/50 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-blue-800 font-semibold text-sm mb-1">{getStarIcons(dish.starLevel)}</div>
                  <div className="text-blue-600 text-xs">{dish.starLevel}星级</div>
                </div>

                {/* 分类标签 */}
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 text-center border border-green-200/50 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl mb-2">🏷️</div>
                  <div className="text-green-800 font-semibold text-sm mb-1 line-clamp-1">{dish.categoryName || dish.category}</div>
                  <div className="text-green-600 text-xs">分类</div>
                </div>

                {/* 时间标签 */}
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4 text-center border border-orange-200/50 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="text-orange-800 font-semibold text-sm mb-1">{dish.estimatedTime}分钟</div>
                  <div className="text-orange-600 text-xs">时长</div>
                </div>

                {/* 人数标签 */}
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center border border-purple-200/50 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-purple-800 font-semibold text-sm mb-1">{dish.servings}人份</div>
                  <div className="text-purple-600 text-xs">份量</div>
                </div>
              </div>

              {/* 描述区域 */}
              <div className="relative bg-gradient-to-r from-slate-50/50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center apple-icon-shadow">
                    <span className="text-white text-lg">📖</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">菜品介绍</h3>
                </div>

                <div className="relative pl-4 border-l-2 border-blue-200">
                  <p className="text-slate-700 leading-relaxed font-medium text-base">
                    {dish.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 内容网格 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧内容 */}
            <div className="space-y-8">
              {/* 用料卡片 */}
              <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="apple-card-elevated rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center apple-icon-shadow">
                      <span className="text-white text-xl">🥬</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">用料清单</h2>
                  </div>

                  <div className="grid gap-3">
                    {dish.ingredients?.map((ing, idx) => (
                      <div
                        key={idx}
                        className="ingredient-item flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-all duration-300 animate-scale-in"
                        style={{ animationDelay: `${0.05 * idx}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                          <span className="font-medium text-slate-800">{ing.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-semibold">{ing.amount}{ing.unit}</span>
                          {ing.isOptional && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">可选</span>
                          )}
                        </div>
                      </div>
                    )) || (
                        <div className="text-center py-8 text-slate-500">
                          <span className="text-4xl mb-2 block">🤷‍♂️</span>
                          <p>暂无用料信息</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>


            </div>

            {/* 右侧内容 */}
            <div className="space-y-8">
              {/* 制作步骤卡片 */}
              <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="apple-card-elevated rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center apple-icon-shadow">
                      <span className="text-white text-xl">👨‍🍳</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">制作步骤</h2>
                  </div>

                  <div className="space-y-6">
                    {dish.steps?.map((step, idx) => (
                      <div
                        key={idx}
                        className="relative animate-fade-in-up"
                        style={{ animationDelay: `${0.1 * idx}s` }}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="step-number w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold apple-icon-shadow">
                              {step.stepNumber}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="step-card bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                              <p className="text-slate-800 font-medium leading-relaxed mb-3">
                                {step.instruction}
                              </p>

                              {step.tips && (
                                <div className="tip-card bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-xl border border-amber-100 mb-3">
                                  <div className="flex items-start gap-2">
                                    <span className="text-amber-500 text-sm">💡</span>
                                    <p className="text-amber-700 text-sm font-medium">{step.tips}</p>
                                  </div>
                                </div>
                              )}

                              {step.estimatedTime && step.estimatedTime > 0 && (
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                  <span>⏱️</span>
                                  <span>预计用时：{step.estimatedTime} 分钟</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 连接线 */}
                        {idx < dish.steps.length - 1 && (
                          <div className="step-connector absolute left-5 top-16 w-0.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        )}
                      </div>
                    )) || (
                        <div className="text-center py-8 text-slate-500">
                          <span className="text-4xl mb-2 block">📝</span>
                          <p>暂无制作步骤</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部信息区域 */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 标签信息 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="apple-card-elevated rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center apple-icon-shadow">
                    <span className="text-white text-lg">🏷️</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">菜品标签</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {dish.tags?.map((tag, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-4 py-2 rounded-2xl text-sm font-medium border border-purple-100 hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] animate-scale-in"
                      style={{ animationDelay: `${0.05 * idx}s` }}
                    >
                      {tag}
                    </div>
                  )) || (
                      <p className="text-slate-500 italic">暂无标签信息</p>
                    )}
                </div>
              </div>
            </div>

            {/* 适合人群 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="apple-card-elevated rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center apple-icon-shadow">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">适合人群</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {dish.suitableFor?.map((person, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-green-50 to-teal-50 text-green-700 px-4 py-2 rounded-2xl text-sm font-medium border border-green-100 hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] animate-scale-in"
                      style={{ animationDelay: `${0.05 * idx}s` }}
                    >
                      {person}
                    </div>
                  )) || (
                      <p className="text-slate-500 italic">适合所有人群</p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* 重要提示 */}
          {dish.importantNotes && dish.importantNotes.length > 0 && (
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="warning-section bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 backdrop-blur-xl border border-amber-200/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center apple-icon-shadow">
                    <span className="text-white text-xl">⚠️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-amber-800">重要提示</h3>
                </div>

                <div className="grid gap-4">
                  {dish.importantNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="warning-item flex items-start gap-3 p-4 bg-white/70 rounded-2xl border border-amber-100 animate-scale-in"
                      style={{ animationDelay: `${0.05 * idx}s` }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-amber-800 leading-relaxed font-medium">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 底部操作区域 */}
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="bottom-actions apple-card-elevated rounded-3xl p-8 text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">享受烹饪乐趣</h3>
                <p className="text-slate-600">希望这道美食能为您带来满满的幸福感</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => navigate('/dishes')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] btn-premium"
                >
                  浏览更多菜品
                </Button>
                <Button
                  onClick={handleToggleFavorite}
                  className={`favorite-button ${isFav
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                    : "bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 hover:border-rose-300 px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                    }`}
                >
                  {isFav ? '❤️ 已收藏' : '🤍 添加收藏'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 