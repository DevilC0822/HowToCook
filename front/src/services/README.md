# API 服务架构

本目录包含前端应用的 API 服务层，已按功能模块拆分为独立文件。

## 文件结构

```
services/
├── baseApi.ts          # 基础 API 工具和通用接口
├── tipsApi.ts         # Tips 相关 API 服务
├── starSystemApi.ts   # StarSystem 相关 API 服务
├── dishesApi.ts       # Dishes 相关 API 服务
├── index.ts           # 统一导出入口
└── README.md          # 本文档
```

## 使用方式

### 单独导入（推荐）

```typescript
// Tips 页面
import { tipsApi } from "../services/tipsApi";
import type { Tip, TipsStats } from "../services/tipsApi";

// StarSystem 页面
import { starSystemApi } from "../services/starSystemApi";
import type { StarSystem, StarSystemStats } from "../services/starSystemApi";

// Dishes 页面
import { dishesApi } from "../services/dishesApi";
import type { Dish, DishesStats } from "../services/dishesApi";
```

### 统一导入

```typescript
// 从入口文件导入多个服务
import { tipsApi, starSystemApi, dishesApi } from "../services";
import type { Tip, StarSystem, Dish } from "../services";
```

## 基础 API 工具

`baseApi.ts` 提供了以下通用工具：

- `apiRequest<T>()` - 统一的 fetch 请求封装
- `buildQueryParams()` - 查询参数构建工具
- `ApiResponse<T>` - 通用响应类型
- `BaseSearchOptions` - 基础搜索选项接口

## 各服务功能

### TipsApi
- 获取烹饪技巧列表
- 搜索技巧
- 获取分类和统计信息

### StarSystemApi  
- 获取星级系统数据
- 按星级查询
- 获取系统统计

### DishesApi
- 获取菜品列表
- 搜索和筛选菜品
- 获取推荐和统计

## 特性

- ✅ TypeScript 类型安全
- ✅ 统一错误处理
- ✅ 模块化设计
- ✅ 可维护性强
- ✅ 单一职责原则 