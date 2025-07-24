import React from "react";

interface LoadingSpinnerProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  icon = "🍽️",
  title = "正在加载内容",
  subtitle = "为您精心准备美食内容...",
  gradientFrom = "blue-500",
  gradientTo = "purple-500"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          {/* 精致的加载动画 */}
          <div className="relative">
            <div className="w-20 h-20 mx-auto">
              <div className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} rounded-full animate-spin`}>
                <div className="absolute inset-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">{icon}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            <p className="text-slate-600">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 