import { apiRequest, buildQueryParams } from './baseApi';
import type { BaseSearchOptions } from './baseApi';

// Dishes 相关接口
export interface Dish {
  _id: string;
  name: string;
  description: string;
  content: string;
  originalContent: string;
  category: string;
  categoryName: string;
  starLevel: number;
  difficulty: string;
  estimatedTime: number;
  servings: number;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
    isOptional: boolean;
  }>;
  tools: string[];
  steps: Array<{
    stepNumber: number;
    instruction: string;
    tips: string;
    estimatedTime: number;
  }>;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  suitableFor: string[];
  importantNotes: string[];
  features: string[];
  season: string[];
  region: string;
  imagePath: string;
  filePath: string;
  isPublished: boolean;
  recommendationLevel: number;
  successRate: number;
  relatedDishes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DishSearchOptions extends BaseSearchOptions {
  keyword?: string;
  category?: string;
  difficulty?: string;
  starLevel?: number;
  maxTime?: number;
}

export interface DishesResponse {
  dishes: Dish[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DishesStats {
  total: number;
  categories: Array<{ _id: string; count: number }>;
  difficulties: Array<{ _id: string; count: number }>;
  starLevels: Array<{ _id: number; count: number }>;
  averageTime: number;
  popularTags: Array<{ _id: string; count: number }>;
}

// Dishes API 服务
export const dishesApi = {
  // 获取所有dishes
  getDishes: (options: DishSearchOptions = {}): Promise<DishesResponse> => {
    const queryString = buildQueryParams({
      page: options.page,
      limit: options.limit,
      category: options.category,
      difficulty: options.difficulty,
      starLevel: options.starLevel,
      maxTime: options.maxTime
    });

    const endpoint = `/dishes${queryString ? `?${queryString}` : ''}`;
    return apiRequest<DishesResponse>(endpoint);
  },

  // 搜索dishes
  searchDishes: (options: DishSearchOptions): Promise<DishesResponse> => {
    const queryString = buildQueryParams({
      keyword: options.keyword,
      category: options.category,
      difficulty: options.difficulty,
      starLevel: options.starLevel,
      maxTime: options.maxTime,
      page: options.page,
      limit: options.limit
    });

    return apiRequest<DishesResponse>(`/dishes/search?${queryString}`);
  },

  // 根据ID获取单个dish
  getDishById: (id: string): Promise<Dish> => {
    return apiRequest<Dish>(`/dishes/${id}`);
  },

  // 根据 filePath 获取单个 dish
  getDishByFilePath: (filePath: string): Promise<Dish> => {
    return apiRequest<Dish>(`/dishes/filepath/${encodeURIComponent(filePath)}`);
  },

  // 根据分类获取dishes
  getDishesByCategory: (category: string, options: DishSearchOptions = {}): Promise<DishesResponse> => {
    const queryString = buildQueryParams({
      page: options.page,
      limit: options.limit
    });

    return apiRequest<DishesResponse>(`/dishes/category/${category}${queryString ? `?${queryString}` : ''}`);
  },

  // 根据难度获取dishes
  getDishesByDifficulty: (difficulty: string, options: DishSearchOptions = {}): Promise<DishesResponse> => {
    const queryString = buildQueryParams({
      page: options.page,
      limit: options.limit
    });

    return apiRequest<DishesResponse>(`/dishes/difficulty/${difficulty}${queryString ? `?${queryString}` : ''}`);
  },

  // 获取推荐dishes
  getRecommendations: (options: DishSearchOptions = {}): Promise<DishesResponse> => {
    const queryString = buildQueryParams({
      category: options.category,
      difficulty: options.difficulty,
      maxTime: options.maxTime,
      limit: options.limit
    });

    return apiRequest<DishesResponse>(`/dishes/recommendations${queryString ? `?${queryString}` : ''}`);
  },

  // 获取统计信息
  getStats: (): Promise<DishesStats> => {
    return apiRequest<DishesStats>('/dishes/stats');
  }
};

export default dishesApi; 