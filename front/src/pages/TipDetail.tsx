import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import Markdown from 'react-markdown';
import { tipsApi } from "../services/tipsApi";
import type { Tip } from "../services/tipsApi";

export default function TipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
                  <span className="text-2xl">💡</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">正在加载技巧详情</h3>
              <p className="text-slate-600">为您精心准备详细的制作秘诀...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50 pt-8 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-apple-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">加载失败</h3>
          <p className="text-apple-red mb-6">{error || '找不到指定的技巧'}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate('/tips')}
              className="bg-apple-blue hover:bg-apple-blue-dark text-white px-6 py-3 rounded-2xl font-semibold"
            >
              返回列表
            </Button>
            <Button
              onClick={() => id && loadTipDetail(id)}
              className="bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-700 px-6 py-3 rounded-2xl font-semibold"
            >
              重新加载
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50 pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 顶部导航 */}
        <div className="mb-8 animate-fade-in-up">
          <Button
            onClick={() => navigate('/tips')}
            className="bg-white/80 hover:bg-white text-apple-gray-700 hover:text-apple-blue px-4 py-2 rounded-xl font-medium apple-icon-shadow hover:shadow-xl transition-all duration-200 border border-apple-gray-200/50 hover:border-apple-blue/30"
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
              <h1 className="text-4xl md:text-5xl font-bold apple-text-gradient leading-tight max-w-4xl">
                {tip.title}
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-apple-blue/20 to-apple-purple/20 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            </div>

            {/* 标签区域 */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Chip className="bg-gradient-to-r from-apple-blue/10 to-apple-blue/20 text-apple-blue px-4 py-2 font-semibold border border-apple-blue/20">
                {tip.category}
              </Chip>
              <Chip className="bg-gradient-to-r from-apple-green/10 to-apple-green/20 text-apple-green px-4 py-2 font-semibold border border-apple-green/20">
                {tip.difficulty}
              </Chip>
            </div>
          </div>

          {/* 内容卡片 */}
          <div className="apple-card-elevated rounded-3xl overflow-hidden">
            {/* 摘要区域 */}
            <div className="p-8 bg-gradient-to-r from-apple-blue/5 to-apple-purple/5">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-apple-blue rounded-full"></span>
                内容摘要
              </h2>
              <p className="text-apple-gray-700 leading-relaxed text-lg font-light">
                {tip.summary}
              </p>
            </div>

            {/* 详细内容区域 */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-apple-green rounded-full"></span>
                详细内容
              </h2>

              {tip.originalContent ? (
                <div className="prose prose-lg max-w-none">
                  <div className="text-apple-gray-700 leading-relaxed markdown-content">
                    <Markdown>{tip.originalContent}</Markdown>
                  </div>
                </div>
              ) : tip.content ? (
                <div className="prose prose-lg max-w-none">
                  <div
                    className="text-apple-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{
                      __html: tip.content.replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-apple-gray-500">
                  <span className="text-4xl mb-4 block">📝</span>
                  <p>暂无详细内容</p>
                </div>
              )}
            </div>

            {/* 标签和人群信息 */}
            <div className="p-8 bg-gradient-to-r from-apple-gray-50/50 to-apple-blue/5 border-t border-apple-gray-200/30">
              <div className="grid md:grid-cols-2 gap-8">
                {/* 技能标签 */}
                {tip.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-apple-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-apple-purple rounded-full"></span>
                      相关标签
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tip.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-sm bg-apple-purple/10 text-apple-purple px-3 py-1 rounded-full font-medium border border-apple-purple/20"
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
                    <h3 className="text-lg font-semibold text-apple-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-apple-orange rounded-full"></span>
                      适用人群
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tip.targetAudience.map((audience, index) => (
                        <span
                          key={index}
                          className="text-sm bg-apple-orange/10 text-apple-orange px-3 py-1 rounded-full font-medium border border-apple-orange/20"
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
              <div className="p-8 bg-gradient-to-r from-apple-yellow/5 to-apple-orange/5 border-t border-apple-gray-200/30">
                <h3 className="text-lg font-semibold text-apple-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-apple-yellow rounded-full"></span>
                  重要提示
                </h3>
                <div className="space-y-3">
                  {tip.importantNotes.map((note, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-apple-yellow/20">
                      <span className="text-apple-yellow mt-0.5">⚠️</span>
                      <p className="text-apple-gray-700 leading-relaxed">{note}</p>
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
                className="bg-white/80 hover:bg-white text-apple-gray-700 hover:text-apple-blue px-8 py-4 rounded-2xl font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 border border-apple-gray-200/50 hover:border-apple-blue/30"
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