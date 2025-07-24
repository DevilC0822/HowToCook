// API 基础配置
const API_BASE_URL = __API_BASE_URL__;

// 通用响应接口
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  msg: string;
  data: T;
}

// 通用搜索选项基础接口
export interface BaseSearchOptions {
  page?: number;
  limit?: number;
}

// API 请求封装
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.msg || 'API request failed');
    }

    return result.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// 构建查询参数工具函数
export function buildQueryParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
} 