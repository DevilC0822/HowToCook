import { Button } from "@heroui/react";
import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export default function Home() {
  const { isDark } = useTheme();

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

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* 英雄区域 - 精致化重设计 */}
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-[1.01] transition-transform duration-300 animate-pulse-glow">
                <span className="text-4xl animate-float">🍳</span>
              </div>
            </div>
            <h1 className={`text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300 ${isDark
              ? 'from-slate-200 via-slate-100 to-slate-200'
              : 'from-slate-800 via-slate-700 to-slate-800'
              }`}>
              程序员做饭指南
            </h1>
            <p className={`text-2xl md:text-3xl max-w-3xl mx-auto leading-relaxed mb-10 font-light transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
              发现美食的艺术，掌握烹饪的技巧
              <br className="hidden md:block" />
              开启您的精致烹饪之旅
            </p>
            <div className="mt-10">
              <Button
                as={Link}
                to="/tips"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-3xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.01] text-xl"
                size="lg"
              >
                开始探索 ✨
              </Button>
            </div>
          </div>

          {/* 功能卡片区域 - 完全重新设计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
            {/* 做饭指南卡片 */}
            <div className="group animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className={`h-full rounded-3xl overflow-hidden transition-colors duration-300 ${isDark
                ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
                : 'apple-glass'
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

                <div className="relative z-10 p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 apple-icon-shadow transition-all duration-300">
                    <span className="text-3xl">💡</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>做饭指南</h3>
                  <p className={`mb-8 leading-relaxed flex-grow transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    从食材选择到烹饪技巧，从厨房工具到制作要领，让您轻松掌握美食制作的精髓
                  </p>
                  <Link to="/tips" className="mt-auto">
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-full rounded-2xl py-3 font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                      size="lg"
                    >
                      查看指南 🔍
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 星级菜谱卡片 */}
            <div className="group animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className={`h-full rounded-3xl overflow-hidden transition-colors duration-300 ${isDark
                ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
                : 'apple-glass'
                }`}>
                {/* 背景装饰 */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10'
                  : 'bg-gradient-to-br from-orange-500/5 to-yellow-500/5'
                  }`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full -ml-8 -mb-8 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-orange-400/10 to-orange-500/10'
                  : 'bg-gradient-to-br from-orange-400/5 to-orange-500/5'
                  }`}></div>

                <div className="relative z-10 p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 apple-icon-shadow transition-all duration-300">
                    <span className="text-3xl">⭐</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 group-hover:text-orange-600 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>星级菜谱</h3>
                  <p className={`mb-8 leading-relaxed flex-grow transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    从简单到复杂，按难度分级的精选菜谱，循序渐进提升厨艺，成就烹饪大师梦想
                  </p>
                  <Link to="/starsystem" className="mt-auto">
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white w-full rounded-2xl py-3 font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                      size="lg"
                    >
                      查看菜谱 📚
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 菜品大全卡片 */}
            <div className="group animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className={`h-full rounded-3xl overflow-hidden transition-colors duration-300 ${isDark
                ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
                : 'apple-glass'
                }`}>
                {/* 背景装饰 */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10'
                  : 'bg-gradient-to-br from-green-500/5 to-teal-500/5'
                  }`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full -ml-8 -mb-8 transition-colors duration-300 ${isDark
                  ? 'bg-gradient-to-br from-green-400/10 to-green-500/10'
                  : 'bg-gradient-to-br from-green-400/5 to-green-500/5'
                  }`}></div>

                <div className="relative z-10 p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 apple-icon-shadow transition-all duration-300">
                    <span className="text-3xl">🍽️</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 group-hover:text-green-600 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>菜品大全</h3>
                  <p className={`mb-8 leading-relaxed flex-grow transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    精选家常美食菜谱，涵盖荤菜、素菜、汤羹等各类美食，详细的制作步骤和营养搭配
                  </p>
                  <Link to="/dishes" className="mt-auto">
                    <Button
                      className="bg-gradient-to-r from-green-500 to-teal-500 text-white w-full rounded-2xl py-3 font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                      size="lg"
                    >
                      查看菜谱 🍽️
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 特色区域 - 精致化重设计 */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className={`rounded-3xl p-12 transition-colors duration-300 ${isDark
              ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
              : 'apple-card-elevated'
              }`}>
              {/* 背景装饰 */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                : 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'
                }`}></div>
              <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-pink-500/10 to-orange-500/10'
                : 'bg-gradient-to-br from-pink-500/5 to-orange-500/5'
                }`}></div>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-8 apple-icon-shadow">
                  <span className="text-white text-2xl">✨</span>
                </div>
                <h2 className={`text-4xl font-bold mb-8 bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300 ${isDark
                  ? 'from-slate-200 via-slate-100 to-slate-200'
                  : 'from-slate-800 via-slate-700 to-slate-800'
                  }`}>
                  为什么选择我们？
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 apple-icon-shadow transition-all duration-300">
                      <span className="text-white font-bold text-lg">AI</span>
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>智能分析</h3>
                    <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>AI 驱动的菜品分析和推荐系统，让您的烹饪更加智能高效</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 apple-icon-shadow transition-all duration-300">
                      <span className="text-white text-2xl">📊</span>
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>数据丰富</h3>
                    <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>全面的菜品信息和营养数据，科学搭配健康饮食</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 apple-icon-shadow transition-all duration-300">
                      <span className="text-white text-2xl">🎯</span>
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>精准推荐</h3>
                    <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>基于个人偏好的智能推荐，发现更多适合您的美味</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className={`inline-flex items-center gap-2 text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
              <span>✨</span>
              <span>精致烹饪，品味生活</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 