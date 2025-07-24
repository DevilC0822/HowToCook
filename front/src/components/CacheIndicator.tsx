import { useState, useEffect } from 'react';
import { Chip } from '@heroui/react';

interface CacheIndicatorProps {
  isFromCache: boolean;
  visible: boolean;
  onHide?: () => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export default function CacheIndicator({
  isFromCache,
  visible,
  onHide,
  position = 'top-right'
}: CacheIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      // 3秒后自动隐藏
      const timer = setTimeout(() => {
        setShow(false);
        onHide?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!show) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 transition-all duration-300 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
      <Chip
        className={`px-4 py-2 text-sm font-medium apple-icon-shadow transition-colors duration-300 ${isFromCache
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
          }`}
        startContent={
          <span className="text-lg mr-1">
            {isFromCache ? '⚡' : '🌐'}
          </span>
        }
      >
        {isFromCache ? '从缓存加载' : '从服务器加载'}
      </Chip>
    </div>
  );
} 