import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import Markdown from 'react-markdown';
import { starSystemApi } from "../services/starSystemApi";
import type { StarSystem } from "../services/starSystemApi";

export default function StarSystemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [starSystem, setStarSystem] = useState<StarSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 根据星级获取颜色
  const getDifficultyColor = (starLevel: number) => {
    const colors = {
      1: { color: "apple-green", gradient: "from-apple-green to-apple-green-dark" },
      2: { color: "apple-blue", gradient: "from-apple-blue to-apple-blue-dark" },
      3: { color: "apple-yellow", gradient: "from-apple-yellow to-apple-orange" },
      4: { color: "apple-orange", gradient: "from-apple-orange to-apple-red" },
      5: { color: "apple-red", gradient: "from-apple-red to-apple-pink" },
      6: { color: "apple-purple", gradient: "from-apple-purple to-apple-pink" },
      7: { color: "apple-pink", gradient: "from-apple-pink to-apple-red" }
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
    if (id) {
      loadStarSystemDetail(id);
    }
  }, [id]);

  const loadStarSystemDetail = async (starSystemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const starSystemData = await starSystemApi.getStarSystemById(starSystemId);
      setStarSystem(starSystemData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('Error loading star system detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            {/* 精致的加载动画 */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-spin">
                  <div className="absolute inset-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">正在加载菜谱详情</h3>
              <p className="text-slate-600">为您精心准备详细的烹饪指南...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !starSystem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50 pt-8 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-apple-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">加载失败</h3>
          <p className="text-apple-red mb-6">{error || '找不到指定的星级菜谱'}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate('/starsystem')}
              className="bg-apple-blue hover:bg-apple-blue-dark text-white px-6 py-3 rounded-2xl font-semibold"
            >
              返回星级菜谱
            </Button>
            <Button
              onClick={() => id && loadStarSystemDetail(id)}
              className="bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-700 px-6 py-3 rounded-2xl font-semibold"
            >
              重新加载
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { color, gradient } = getDifficultyColor(starSystem.starLevel);
  const icon = getDifficultyIcon(starSystem.starLevel);
  const level = getDifficultyLevel(starSystem.starLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50 pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 顶部导航 - 精致面包屑 */}
        <div className="mb-8 animate-fade-in-up">
          <div className="apple-glass px-6 py-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-apple-gray-600">
                <Button
                  onClick={() => navigate('/starsystem')}
                  className="bg-transparent hover:bg-apple-gray-100 text-apple-gray-600 hover:text-apple-blue px-3 py-2 rounded-xl transition-all duration-200"
                  size="sm"
                >
                  ← 返回菜谱
                </Button>
                <span>/</span>
                <span className="font-medium text-apple-gray-900">{starSystem.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: starSystem.starLevel }, (_, i) => (
                  <span key={i} className="text-apple-yellow text-lg">⭐</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 主标题区域 - 精品级设计 */}
        <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative inline-block mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl">{icon}</span>
              <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-tight`}>
                {starSystem.title}
              </h1>
            </div>
            <div className={`absolute -inset-4 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-20 animate-pulse`}></div>
          </div>

          <div className="flex justify-center items-center gap-6 mb-6">
            <Chip
              className={`bg-gradient-to-r from-${color}/10 to-${color}/20 text-${color} px-6 py-3 text-lg font-bold border border-${color}/20`}
              size="lg"
            >
              {level} • {starSystem.dishCount} 道菜品
            </Chip>
          </div>

          {starSystem.difficultyDescription && (
            <p className="text-xl text-apple-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              {starSystem.difficultyDescription}
            </p>
          )}
        </div>

        {/* 推荐人群和标签 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* 推荐人群 */}
          {starSystem.recommendedFor && starSystem.recommendedFor.length > 0 && (
            <div className="apple-card-elevated p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6 flex items-center gap-3">
                <span className="w-3 h-3 bg-apple-orange rounded-full animate-pulse"></span>
                推荐人群
              </h2>
              <div className="flex flex-wrap gap-3">
                {starSystem.recommendedFor.map((audience, index) => (
                  <Chip
                    key={index}
                    className="bg-gradient-to-r from-apple-orange/10 to-apple-orange/20 text-apple-orange px-4 py-2 text-sm font-semibold border border-apple-orange/20"
                    size="md"
                  >
                    {audience}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          {starSystem.tags && starSystem.tags.length > 0 && (
            <div className="apple-card-elevated p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6 flex items-center gap-3">
                <span className="w-3 h-3 bg-apple-purple rounded-full animate-pulse"></span>
                相关标签
              </h2>
              <div className="flex flex-wrap gap-3">
                {starSystem.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    className="bg-gradient-to-r from-apple-purple/10 to-apple-purple/20 text-apple-purple px-4 py-2 text-sm font-semibold border border-apple-purple/20"
                    size="md"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 菜品列表 - 精美卡片网格 */}
        {starSystem.dishes && starSystem.dishes.length > 0 && (
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="apple-card-elevated p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-apple-gray-900 mb-8 flex items-center gap-3">
                <span className={`w-3 h-3 bg-${color} rounded-full animate-pulse`}></span>
                菜品列表
                <span className="text-lg text-apple-gray-500 font-normal">({starSystem.dishes.length} 道)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {starSystem.dishes.map((dish, index) => (
                  <div
                    key={index}
                    className="apple-glass p-4 rounded-2xl animate-scale-in cursor-pointer group"
                    style={{ animationDelay: `${0.05 * (index % 12)}s` }}
                    onClick={() => navigate(`/dishes/${encodeURIComponent(dish.filePath)}`)}
                  >
                    <div className="text-center">
                      <h3 className="text-base font-semibold text-apple-gray-900 group-hover:text-apple-blue transition-colors duration-300 line-clamp-2 leading-tight">
                        {dish.name}
                      </h3>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs text-apple-gray-500">点击查看详情</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {/* 详细内容区域 */}
        {starSystem.content && (
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="apple-card-elevated p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6 flex items-center gap-3">
                <span className="w-3 h-3 bg-apple-green rounded-full animate-pulse"></span>
                详细说明
              </h2>

              <div className="prose prose-lg max-w-none">
                <div className="text-apple-gray-700 leading-relaxed markdown-content">
                  <Markdown>{starSystem.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* 底部操作区域 */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="apple-glass p-6 rounded-3xl">
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => navigate('/starsystem')}
                className="bg-apple-blue hover:bg-apple-blue-dark text-white px-8 py-3 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                返回星级菜谱
              </Button>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-700 px-8 py-3 rounded-2xl font-semibold transition-all duration-200"
              >
                回到顶部
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 