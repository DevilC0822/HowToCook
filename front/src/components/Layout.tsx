import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, setTheme, isDark } = useTheme();

  // 防止主题切换时页面抖动
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    // 临时固定页面宽度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    setTheme(newTheme);

    // 短暂延迟后恢复正常
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 100);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      // 首页需要精确匹配
      return location.pathname === "/";
    }
    // 其他页面支持前缀匹配，例如 /tips 可以匹配 /tips/:id
    return location.pathname.startsWith(path);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '🖥️';
      default:
        return '☀️';
    }
  };



  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'
      }`}>
      {/* 精致化导航栏 */}
      <Navbar
        className="border-0 backdrop-blur-xl apple-icon-shadow premium-glass transition-colors duration-300"
        height="80px"
        maxWidth="full"
      >
        {/* 品牌区域 - 精致化重设计 */}
        <NavbarBrand className="flex items-center gap-3">
          <RouterLink
            to="/"
            className={`flex items-center gap-3 font-semibold text-xl transition-all duration-300 group ${isDark
              ? 'text-slate-200 hover:text-blue-400'
              : 'text-slate-800 hover:text-blue-600'
              }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center apple-icon-shadow transition-all duration-300">
              <span className="text-white font-bold text-lg">🍳</span>
            </div>
            <span className={`bg-gradient-to-r bg-clip-text text-transparent font-bold ${isDark
              ? 'from-slate-200 via-slate-100 to-slate-200'
              : 'from-slate-800 via-slate-700 to-slate-800'
              }`}>
              程序员做饭指南
            </span>
          </RouterLink>
        </NavbarBrand>

        {/* 中央导航链接 - 精致化重设计 */}
        <NavbarContent className="hidden sm:flex gap-2" justify="center">
          <NavbarItem>
            <Link
              as={RouterLink}
              to="/"
              className={`px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.01] ${isActive("/")
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white apple-icon-shadow"
                : isDark
                  ? "text-slate-300 hover:text-blue-400 hover:bg-slate-700/60 hover:shadow-md"
                  : "text-slate-700 hover:text-blue-600 hover:bg-white/60 hover:shadow-md"
                }`}
            >
              首页
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              as={RouterLink}
              to="/tips"
              className={`px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.01] ${isActive("/tips")
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white apple-icon-shadow"
                : isDark
                  ? "text-slate-300 hover:text-blue-400 hover:bg-slate-700/60 hover:shadow-md"
                  : "text-slate-700 hover:text-blue-600 hover:bg-white/60 hover:shadow-md"
                }`}
            >
              做饭指南
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              as={RouterLink}
              to="/starsystem"
              className={`px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.01] ${isActive("/starsystem")
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white apple-icon-shadow"
                : isDark
                  ? "text-slate-300 hover:text-blue-400 hover:bg-slate-700/60 hover:shadow-md"
                  : "text-slate-700 hover:text-blue-600 hover:bg-white/60 hover:shadow-md"
                }`}
            >
              星级菜谱
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              as={RouterLink}
              to="/dishes"
              className={`px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.01] ${isActive("/dishes")
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white apple-icon-shadow"
                : isDark
                  ? "text-slate-300 hover:text-blue-400 hover:bg-slate-700/60 hover:shadow-md"
                  : "text-slate-700 hover:text-blue-600 hover:bg-white/60 hover:shadow-md"
                }`}
            >
              菜品大全
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              as={RouterLink}
              to="/favorites"
              className={`px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.01] ${isActive("/favorites")
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white apple-icon-shadow"
                : isDark
                  ? "text-slate-300 hover:text-blue-400 hover:bg-slate-700/60 hover:shadow-md"
                  : "text-slate-700 hover:text-blue-600 hover:bg-white/60 hover:shadow-md"
                }`}
            >
              我的收藏
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* 右侧操作区域 - 精致化重设计 */}
        <NavbarContent justify="end">
          <NavbarItem>
            <Dropdown
              placement="bottom-end"
              shouldBlockScroll={false}
              closeOnSelect={true}
            >
              <DropdownTrigger>
                <Button
                  variant="light"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-[1.05] apple-icon-shadow hover:shadow-lg ${isDark
                    ? 'bg-slate-700/60 hover:bg-slate-600/60'
                    : 'bg-white/60 hover:bg-slate-100'
                    }`}
                  isIconOnly
                >
                  <span className="text-lg">{getThemeIcon()}</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="主题选择"
                selectedKeys={[theme]}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  handleThemeChange(selectedKey as 'light' | 'dark' | 'system');
                }}
                className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl shadow-lg`}
              >
                <DropdownItem key="light" className={`${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span>☀️</span>
                    <span>亮色模式</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="dark" className={`${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span>🌙</span>
                    <span>暗色模式</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="system" className={`${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span>🖥️</span>
                    <span>跟随系统</span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="https://github.com/DevilC0822/HowToCook"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-[1.05] apple-icon-shadow hover:shadow-lg group ${isDark
                ? 'bg-slate-700/60 hover:bg-slate-600/60'
                : 'bg-white/60 hover:bg-slate-100'
                }`}
            >
              <svg
                className={`w-5 h-5 transition-colors duration-300 ${isDark
                  ? 'text-slate-300 group-hover:text-slate-100'
                  : 'text-slate-700 group-hover:text-slate-900'
                  }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* 主内容区域 - 优化背景和过渡效果 */}
      <main>
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
} 