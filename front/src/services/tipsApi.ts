import { apiRequest, buildQueryParams } from './baseApi';
import type { BaseSearchOptions } from './baseApi';

// Tips 相关接口
export interface Tip {
  _id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  summary: string;
  targetAudience: string[];
  importantNotes: string[];
  filePath: string;
  content?: string;
  originalContent?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TipSearchOptions extends BaseSearchOptions {
  keyword?: string;
  category?: string;
  difficulty?: string;
}

export interface TipsResponse {
  tips: Tip[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TipsStats {
  total: number;
  categories: Array<{ _id: string; count: number }>;
  difficulties: Array<{ _id: string; count: number }>;
  popularTags: Array<{ _id: string; count: number }>;
}

// Tips API 服务
export const tipsApi = {
  // 获取所有tips
  getTips: (options: TipSearchOptions = {}): Promise<TipsResponse> => {
    const queryString = buildQueryParams({
      page: options.page,
      limit: options.limit,
      category: options.category,
      difficulty: options.difficulty
    });

    const endpoint = `/tips${queryString ? `?${queryString}` : ''}`;
    return apiRequest<TipsResponse>(endpoint);
  },

  // 搜索tips
  searchTips: (options: TipSearchOptions): Promise<TipsResponse> => {
    const queryString = buildQueryParams({
      keyword: options.keyword,
      category: options.category,
      difficulty: options.difficulty,
      page: options.page,
      limit: options.limit
    });

    return apiRequest<TipsResponse>(`/tips/search?${queryString}`);
  },

  // 根据ID获取单个tip
  getTipById: (id: string): Promise<Tip> => {
    return apiRequest<Tip>(`/tips/${id}`);
  },

  // 获取分类列表
  getCategories: (): Promise<string[]> => {
    return apiRequest<string[]>('/tips/categories');
  },

  // 获取统计信息
  getStats: (): Promise<TipsStats> => {
    return apiRequest<TipsStats>('/tips/stats');
  },

  // 获取难度列表
  getDifficulties: (): string[] => {
    return ['初级', '中级', '高级'];
  }
};

export default tipsApi; 