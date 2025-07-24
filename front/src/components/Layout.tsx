import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@heroui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      // 首页需要精确匹配
      return location.pathname === "/";
    }
    // 其他页面支持前缀匹配，例如 /tips 可以匹配 /tips/:id
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* 精致化导航栏 */}
      <Navbar
        className="border-0 backdrop-blur-xl bg-white/80 apple-icon-shadow premium-glass"
        height="80px"
        maxWidth="full"
      >
        {/* 品牌区域 - 精致化重设计 */}
        <NavbarBrand className="flex items-center gap-3">
          <RouterLink
            to="/"
            className="flex items-center gap-3 font-semibold text-xl text-slate-800 hover:text-blue-600 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center apple-icon-shadow transition-all duration-300">
              <span className="text-white font-bold text-lg">🍳</span>
            </div>
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent font-bold">
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
            <Button
              as={RouterLink}
              to="/tips"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl px-6 py-2.5 font-semibold apple-icon-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              size="sm"
            >
              开始烹饪 ✨
            </Button>
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