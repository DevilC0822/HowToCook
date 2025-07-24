const StarSystem = require('../models/StarSystem');

/**
 * StarSystem 服务类
 * 处理 starsystem 数据库操作
 */
class StarSystemService {

  /**
   * 根据ID获取单个 starsystem
   * @param {string} id - starsystem ID
   * @returns {Object} starsystem 对象
   */
  static async getStarSystemById(id) {
    return await StarSystem.findById(id);
  }

  /**
   * 根据星级获取 starsystem
   * @param {number} starLevel - 星级
   * @returns {Object} starsystem 对象
   */
  static async getStarSystemByLevel(starLevel) {
    return await StarSystem.findOne({ starLevel });
  }

  /**
   * 清空所有 starsystem
   * @returns {Object} 删除结果
   */
  static async clearAllStarSystems() {
    return await StarSystem.deleteMany({});
  }

  /**
   * 创建新的 starsystem
   * @param {Object} starSystemData - starsystem 数据
   * @returns {Object} 创建的 starsystem 对象
   */
  static async createStarSystem(starSystemData) {
    const starSystem = new StarSystem(starSystemData);
    return await starSystem.save();
  }

  /**
   * 获取 starsystem 支持分页和筛选
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @param {number} options.starLevel - 星级筛选
   * @param {string} options.difficultyLevel - 难度级别筛选
   * @returns {Object} 分页结果
   */
  static async getStarSystems(options = {}) {
    const {
      page = 1,
      limit = 10,
      starLevel = null,
      difficultyLevel = null
    } = options;

    const query = {};

    if (starLevel) {
      query.starLevel = starLevel;
    }

    if (difficultyLevel) {
      // 根据难度级别筛选星级范围
      switch (difficultyLevel) {
        case '初级':
          query.starLevel = { $lte: 2 };
          break;
        case '中级':
          query.starLevel = { $gte: 3, $lte: 4 };
          break;
        case '高级':
          query.starLevel = { $gte: 5, $lte: 6 };
          break;
        case '专家级':
          query.starLevel = 7;
          break;
      }
    }

    const skip = (page - 1) * limit;

    const [starSystems, totalCount] = await Promise.all([
      StarSystem.find(query)
        .sort({ starLevel: 1 })
        .skip(skip)
        .limit(limit),
      StarSystem.countDocuments(query)
    ]);

    return {
      starSystems,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  /**
   * 搜索 starsystem 支持分页和筛选
   * @param {Object} options - 搜索选项
   * @param {string} options.keyword - 搜索关键词
   * @param {number} options.starLevel - 星级筛选
   * @param {string} options.difficultyLevel - 难度级别筛选
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @returns {Object} 分页搜索结果
   */
  static async searchStarSystems(options = {}) {
    const {
      keyword,
      starLevel = null,
      difficultyLevel = null,
      page = 1,
      limit = 10
    } = options;

    const query = {};

    // 构建搜索条件
    const searchConditions = [];

    if (keyword) {
      searchConditions.push(
        { title: { $regex: keyword, $options: 'i' } },
        { difficultyDescription: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
        { recommendedFor: { $regex: keyword, $options: 'i' } },
        { 'dishes.name': { $regex: keyword, $options: 'i' } }
      );
    }

    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    // 添加筛选条件
    if (starLevel) {
      query.starLevel = starLevel;
    }

    if (difficultyLevel) {
      // 根据难度级别筛选星级范围
      switch (difficultyLevel) {
        case '初级':
          query.starLevel = { $lte: 2 };
          break;
        case '中级':
          query.starLevel = { $gte: 3, $lte: 4 };
          break;
        case '高级':
          query.starLevel = { $gte: 5, $lte: 6 };
          break;
        case '专家级':
          query.starLevel = 7;
          break;
      }
    }

    // 如果没有任何搜索条件，返回空结果
    if (Object.keys(query).length === 0) {
      return {
        starSystems: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    const skip = (page - 1) * limit;
    const starSystems = await StarSystem.find(query)
      .sort({ starLevel: 1 })
      .skip(skip)
      .limit(limit);

    const total = await StarSystem.countDocuments(query);

    return {
      starSystems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 更新 starsystem
   * @param {string} id - starsystem ID
   * @param {Object} updateData - 更新数据
   * @returns {Object} 更新后的 starsystem 对象
   */
  static async updateStarSystem(id, updateData) {
    return await StarSystem.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  /**
   * 删除 starsystem
   * @param {string} id - starsystem ID
   * @returns {Object} 删除结果
   */
  static async deleteStarSystem(id) {
    return await StarSystem.findByIdAndDelete(id);
  }

  /**
   * 获取所有星级的统计信息
   * @returns {Object} 统计信息
   */
  static async getStarSystemStats() {
    const stats = await StarSystem.aggregate([
      {
        $group: {
          _id: '$starLevel',
          count: { $sum: 1 },
          totalDishes: { $sum: '$dishCount' },
          avgDishes: { $avg: '$dishCount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalStarSystems = await StarSystem.countDocuments();
    const totalDishes = await StarSystem.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$dishCount' }
        }
      }
    ]);

    return {
      byStarLevel: stats,
      totalStarSystems,
      totalDishes: totalDishes[0]?.total || 0
    };
  }
}

module.exports = StarSystemService; 