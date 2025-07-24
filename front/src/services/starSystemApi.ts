import { apiRequest, buildQueryParams } from './baseApi';
import type { BaseSearchOptions } from './baseApi';

// StarSystem 相关接口
export interface StarSystem {
  _id: string;
  title: string;
  starLevel: number;
  content: string;
  dishes: Array<{
    name: string;
    filePath: string;
    category: string;
  }>;
  dishCount: number;
  categoryStats: Record<string, number>;
  difficultyDescription: string;
  filePath: string;
  tags: string[];
  recommendedFor: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StarSystemSearchOptions extends BaseSearchOptions {
  keyword?: string;
  starLevel?: number;
}

export interface StarSystemResponse {
  starSystems: StarSystem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StarSystemStats {
  byStarLevel: Array<{
    _id: number;
    count: number;
    totalDishes: number;
    avgDishes: number;
  }>;
  totalStarSystems: number;
  totalDishes: number;
  total?: number;  // 向前兼容
  averageDishesPerLevel?: number;  // 计算字段
}

// StarSystem API 服务
export const starSystemApi = {
  // 获取所有StarSystem
  getStarSystems: async (options: StarSystemSearchOptions = {}): Promise<StarSystemResponse> => {
    const queryParams = buildQueryParams(options as Record<string, string | number | undefined>);
    return await apiRequest(`/starsystem${queryParams ? `?${queryParams}` : ''}`);
  },

  // 根据ID获取单个StarSystem
  getStarSystemById: async (id: string): Promise<StarSystem> => {
    return await apiRequest(`/starsystem/${id}`);
  },

  // 搜索StarSystem
  searchStarSystems: async (options: StarSystemSearchOptions = {}): Promise<StarSystemResponse> => {
    const queryParams = buildQueryParams(options as Record<string, string | number | undefined>);
    return await apiRequest(`/starsystem/search${queryParams ? `?${queryParams}` : ''}`);
  },

  // 根据星级获取star system
  getStarSystemByLevel: (starLevel: number): Promise<StarSystem> => {
    return apiRequest<StarSystem>(`/starsystem/level/${starLevel}`);
  },

  // 获取统计信息
  getStats: async (): Promise<StarSystemStats> => {
    return await apiRequest('/starsystem/stats');
  }
};

export default starSystemApi; 