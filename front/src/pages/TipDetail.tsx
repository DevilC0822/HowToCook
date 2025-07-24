import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import Markdown from 'react-markdown';
import { tipsApi } from "../services/tipsApi";
import type { Tip } from "../services/tipsApi";
import { useTheme } from "../hooks/useTheme";

export default function TipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTipDetail(id);
    }
  }, [id]);

  const loadTipDetail = async (tipId: string) => {
    try {
      setLoading(true);
      setError(null);
      const tipData = await tipsApi.getTipById(tipId);
      setTip(tipData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('Error loading tip detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen scrollbar-premium transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'
        }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            {/* 精致的加载动画 */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin">
                  <div className={`absolute inset-2 rounded-full transition-colors duration-300 ${isDark ? 'bg-slate-800' : 'bg-white'}`}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className={`text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>正在加载技巧详情</h3>
              <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>为您精心准备详细的制作秘诀...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tip) {
    return (
      <div className={`min-h-screen pt-8 pb-16 flex items-center justify-center transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50'
        }`}>
        <div className="text-center max-w-md mx-auto">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${isDark
            ? 'bg-red-500/20'
            : 'bg-apple-red/10'
            }`}>
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-apple-gray-900'}`}>加载失败</h3>
          <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-apple-red'}`}>{error || '找不到指定的技巧'}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate('/tips')}
              className="bg-apple-blue hover:bg-apple-blue-dark text-white px-6 py-3 rounded-2xl font-semibold"
            >
              返回列表
            </Button>
            <Button
              onClick={() => id && loadTipDetail(id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-colors duration-300 ${isDark
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-700'
                }`}
            >
              重新加载
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-8 pb-16 scrollbar-premium transition-colors duration-300 ${isDark
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      : 'bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50'
      }`}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 顶部导航 */}
        <div className="mb-8 animate-fade-in-up">
          <Button
            onClick={() => navigate('/tips')}
            className={`px-4 py-2 rounded-xl font-medium apple-icon-shadow hover:shadow-xl transition-all duration-200 border ${isDark
              ? 'bg-slate-800/50 backdrop-blur-xl text-slate-300 hover:text-blue-400 border-slate-700/50 hover:border-blue-500/30'
              : 'bg-white/80 hover:bg-white text-apple-gray-700 hover:text-apple-blue border-apple-gray-200/50 hover:border-apple-blue/30'
              }`}
            size="sm"
          >
            ← 返回指南列表
          </Button>
        </div>

        {/* 主内容区域 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <h1 className={`text-4xl md:text-5xl font-bold leading-tight max-w-4xl transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-clip-text text-transparent'
                : 'apple-text-gradient'
                }`}>
                {tip.title}
              </h1>
              <div className={`absolute -inset-2 rounded-3xl blur-xl opacity-30 animate-pulse transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30'
                : 'bg-gradient-to-r from-apple-blue/20 to-apple-purple/20'
                }`}></div>
            </div>

            {/* 标签区域 */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Chip className={`px-4 py-2 font-semibold border transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/30 text-blue-300 border-blue-500/30'
                : 'bg-gradient-to-r from-apple-blue/10 to-apple-blue/20 text-apple-blue border-apple-blue/20'
                }`}>
                {tip.category}
              </Chip>
              <Chip className={`px-4 py-2 font-semibold border transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-r from-green-500/20 to-green-500/30 text-green-300 border-green-500/30'
                : 'bg-gradient-to-r from-apple-green/10 to-apple-green/20 text-apple-green border-apple-green/20'
                }`}>
                {tip.difficulty}
              </Chip>
            </div>
          </div>

          {/* 内容卡片 */}
          <div className={`rounded-3xl overflow-hidden transition-colors duration-300 ${isDark
            ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
            : 'apple-card-elevated'
            }`}>
            {/* 摘要区域 */}
            <div className={`p-8 transition-colors duration-300 ${isDark
              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
              : 'bg-gradient-to-r from-apple-blue/5 to-apple-purple/5'
              }`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-apple-gray-900'}`}>
                <span className={`w-3 h-3 rounded-full ${isDark ? 'bg-blue-400' : 'bg-apple-blue'}`}></span>
                内容摘要
              </h2>
              <p className={`leading-relaxed text-lg font-light transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-apple-gray-700'}`}>
                {tip.summary}
              </p>
            </div>

            {/* 详细内容区域 */}
            <div className="p-8">
              <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-apple-gray-900'}`}>
                <span className={`w-3 h-3 rounded-full ${isDark ? 'bg-green-400' : 'bg-apple-green'}`}></span>
                详细内容
              </h2>

              {tip.originalContent ? (
                <div className="prose prose-lg max-w-none">
                  <div className={`leading-relaxed markdown-content transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-apple-gray-700'}`}>
                    <Markdown>{tip.originalContent}</Markdown>
                  </div>
                </div>
              ) : tip.content ? (
                <div className="prose prose-lg max-w-none">
                  <div
                    className={`leading-relaxed space-y-4 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-apple-gray-700'}`}
                    dangerouslySetInnerHTML={{
                      __html: tip.content.replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
              ) : (
                <div className={`text-center py-12 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-apple-gray-500'}`}>
                  <span className="text-4xl mb-4 block">📝</span>
                  <p>暂无详细内容</p>
                </div>
              )}
            </div>

            {/* 标签和人群信息 */}
            <div className={`p-8 border-t border-apple-gray-200/30 transition-colors duration-300 ${isDark
              ? 'bg-gradient-to-r from-slate-800/50 to-blue-500/5 border-slate-700/30'
              : 'bg-gradient-to-r from-apple-gray-50/50 to-apple-blue/5'
              }`}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* 技能标签 */}
                {tip.tags.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-apple-gray-900'}`}>
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-apple-purple'}`}></span>
                      相关标签
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tip.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`text-sm px-3 py-1 rounded-full font-medium border transition-colors duration-300 ${isDark
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-apple-purple/10 text-apple-purple border-apple-purple/20'
                            }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 适用人群 */}
                {tip.targetAudience.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-apple-gray-900'}`}>
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-orange-400' : 'bg-apple-orange'}`}></span>
                      适用人群
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tip.targetAudience.map((audience, index) => (
                        <span
                          key={index}
                          className={`text-sm px-3 py-1 rounded-full font-medium border transition-colors duration-300 ${isDark
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                            : 'bg-apple-orange/10 text-apple-orange border-apple-orange/20'
                            }`}
                        >
                          👥 {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 重要提示 */}
            {tip.importantNotes && tip.importantNotes.length > 0 && (
              <div className={`p-8 border-t transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-slate-700/30'
                : 'bg-gradient-to-r from-apple-yellow/5 to-apple-orange/5 border-apple-gray-200/30'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-apple-gray-900'}`}>
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-apple-yellow'}`}></span>
                  重要提示
                </h3>
                <div className="space-y-3">
                  {tip.importantNotes.map((note, index) => (
                    <div key={index} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors duration-300 ${isDark
                      ? 'bg-slate-800/50 border-yellow-500/20'
                      : 'bg-white/50 border-apple-yellow/20'
                      }`}>
                      <span className={`mt-0.5 ${isDark ? 'text-yellow-400' : 'text-apple-yellow'}`}>⚠️</span>
                      <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-apple-gray-700'}`}>{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 底部操作区域 */}
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => navigate('/tips')}
                className="bg-apple-blue hover:bg-apple-blue-dark text-white px-8 py-4 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                size="lg"
              >
                返回技巧列表
              </Button>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`px-8 py-4 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 border ${isDark
                  ? 'bg-slate-800/50 backdrop-blur-xl text-slate-300 hover:text-blue-400 border-slate-700/50 hover:border-blue-500/30'
                  : 'bg-white/80 hover:bg-white text-apple-gray-700 hover:text-apple-blue border-apple-gray-200/50 hover:border-apple-blue/30'
                  }`}
                size="lg"
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