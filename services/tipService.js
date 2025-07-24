const Tip = require('../models/Tip');

/**
 * Tips 服务类
 * 处理 tips 数据库操作
 */
class TipService {

  /**
   * 根据ID获取单个 tip
   * @param {string} id - tip ID
   * @returns {Object} tip 对象
   */
  static async getTipById(id) {
    return await Tip.findById(id);
  }

  /**
   * 清空所有 tips
   * @returns {Object} 删除结果
   */
  static async clearAllTips() {
    return await Tip.deleteMany({});
  }

  /**
   * 创建新的 tip
   * @param {Object} tipData - tip 数据
   * @returns {Object} 创建的 tip 对象
   */
  static async createTip(tipData) {
    const tip = new Tip(tipData);
    return await tip.save();
  }

  /**
   * 获取 tips 支持分页和筛选
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @param {string} options.category - 分类筛选
   * @param {string} options.difficulty - 难度筛选
   * @returns {Object} 分页结果
   */
  static async getTips(options = {}) {
    const {
      page = 1,
      limit = 10,
      category = null,
      difficulty = null
    } = options;

    const query = {};

    // 添加筛选条件
    if (category) {
      // 使用正则表达式进行部分匹配，支持逗号分隔的多分类
      query.category = { $regex: category, $options: 'i' };
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const skip = (page - 1) * limit;
    const tips = await Tip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tip.countDocuments(query);

    return {
      tips,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 搜索 tips
   * @param {Object} options - 搜索选项
   * @param {string} options.keyword - 关键词
   * @param {string} options.category - 分类筛选
   * @param {string} options.difficulty - 难度筛选
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @returns {Object} 搜索结果
   */
  static async searchTips(options = {}) {
    const {
      keyword = null,
      category = null,
      difficulty = null,
      page = 1,
      limit = 10
    } = options;

    const query = {};
    const searchConditions = [];

    if (keyword) {
      searchConditions.push(
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } }
      );
    }

    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    // 添加筛选条件
    if (category) {
      // 使用正则表达式进行部分匹配，支持逗号分隔的多分类
      query.category = { $regex: category, $options: 'i' };
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // 如果没有任何搜索条件，返回空结果
    if (Object.keys(query).length === 0) {
      return {
        tips: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    const skip = (page - 1) * limit;
    const tips = await Tip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tip.countDocuments(query);

    return {
      tips,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 获取所有分类
   * @returns {Array} 分类列表
   */
  static async getCategories() {
    const categoryFields = await Tip.distinct('category');

    // 铺平分类：将逗号分隔的分类拆分成单个分类
    const flattenedCategories = categoryFields
      .filter(category => category && category !== '未分类') // 过滤空值和未分类
      .flatMap(category =>
        category.split(',').map(cat => cat.trim()) // 按逗号分割并去除首尾空格
      )
      .filter(category => category && category !== '未分类') // 再次过滤空值和未分类
      .filter((category, index, array) => array.indexOf(category) === index) // 去重
      .sort(); // 排序

    return flattenedCategories;
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  static async getStats() {
    const total = await Tip.countDocuments();

    // 按分类统计 - 处理逗号分隔的分类
    const categoryStats = await Tip.aggregate([
      // 过滤掉空的category
      { $match: { category: { $exists: true, $ne: null, $ne: '' } } },
      // 按逗号分割category字段
      {
        $project: {
          categories: {
            $split: ['$category', ',']
          }
        }
      },
      // 展开分类数组
      { $unwind: '$categories' },
      // 去除首尾空格
      {
        $project: {
          category: { $trim: { input: '$categories' } }
        }
      },
      // 过滤掉空值和"未分类"
      {
        $match: {
          category: { $ne: '', $ne: '未分类' }
        }
      },
      // 按分类分组统计
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 按难度统计
    const difficultyStats = await Tip.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 热门标签统计
    const tagStats = await Tip.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      total,
      categories: categoryStats,
      difficulties: difficultyStats,
      popularTags: tagStats
    };
  }
}

module.exports = TipService; 