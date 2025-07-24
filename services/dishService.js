const Dish = require('../models/Dish');

/**
 * DishService 菜品服务类
 * 提供菜品相关的业务逻辑操作
 */
class DishService {
  /**
   * 获取所有菜品（支持分页和筛选）
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @param {string} options.category - 菜品分类筛选
   * @param {string} options.difficulty - 难度筛选
   * @param {number} options.starLevel - 星级筛选
   * @param {string} options.region - 地域筛选
   * @param {boolean} options.isPublished - 是否已发布
   * @param {number} options.servings - 服务人数
   * @param {number} options.maxTime - 最大制作时间
   * @returns {Promise<Object>} 包含菜品列表和分页信息的对象
   */
  async getDishes(options = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      starLevel,
      region,
      isPublished = true,
      servings,
      maxTime,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // 构建查询条件
    const filter = { isPublished };

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (starLevel) {
      filter.starLevel = starLevel;
    }

    if (region) {
      filter.region = new RegExp(region, 'i');
    }

    if (servings) {
      filter.servings = servings;
    }

    if (maxTime) {
      filter.estimatedTime = { $lte: maxTime };
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 排序
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 执行查询
    const dishes = await Dish.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('relatedDishes', 'name category starLevel')
      .exec();

    // 获取总数
    const total = await Dish.countDocuments(filter);

    return {
      dishes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 根据关键词搜索菜品
   * @param {Object} options - 搜索选项
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.category - 菜品分类筛选
   * @param {string} options.difficulty - 难度筛选
   * @param {number} options.starLevel - 星级筛选
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @returns {Promise<Object>} 包含搜索结果和分页信息的对象
   */
  async searchDishes(options = {}) {
    const {
      keyword,
      category,
      difficulty,
      starLevel,
      page = 1,
      limit = 10
    } = options;

    // 构建查询条件
    const filter = { isPublished: true };

    // 关键词搜索
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      filter.$or = [
        { name: keywordRegex },
        { description: keywordRegex },
        { tags: keywordRegex },
        { 'ingredients.name': keywordRegex },
        { features: keywordRegex },
        { region: keywordRegex }
      ];
    }

    // 分类筛选
    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (starLevel) {
      filter.starLevel = starLevel;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 执行查询
    const dishes = await Dish.find(filter)
      .sort({ recommendationLevel: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedDishes', 'name category starLevel')
      .exec();

    // 获取总数
    const total = await Dish.countDocuments(filter);

    return {
      dishes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 根据ID获取单个菜品
   * @param {string} id - 菜品ID
   * @returns {Promise<Object>} 菜品对象
   */
  async getDishById(id) {
    return await Dish.findById(id)
      .populate('relatedDishes', 'name category starLevel estimatedTime')
      .exec();
  }

  /**
   * 根据文件路径获取单个菜品
   * @param {string} filePath - 菜品文件路径
   * @returns {Promise<Object>} 菜品对象
   */
  async getDishByFilePath(filePath) {
    return await Dish.findOne({ filePath, isPublished: true })
      .populate('relatedDishes', 'name category starLevel estimatedTime')
      .exec();
  }

  /**
   * 根据分类获取菜品
   * @param {string} category - 菜品分类
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 包含菜品列表和分页信息的对象
   */
  async getDishesByCategory(category, options = {}) {
    const { page = 1, limit = 10 } = options;

    const filter = {
      category,
      isPublished: true
    };

    // 计算分页
    const skip = (page - 1) * limit;

    // 执行查询
    const dishes = await Dish.find(filter)
      .sort({ recommendationLevel: -1, starLevel: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // 获取总数
    const total = await Dish.countDocuments(filter);

    return {
      dishes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 根据难度级别获取菜品
   * @param {string} difficulty - 难度级别
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 包含菜品列表和分页信息的对象
   */
  async getDishesByDifficulty(difficulty, options = {}) {
    const { page = 1, limit = 10 } = options;

    const filter = {
      difficulty,
      isPublished: true
    };

    // 计算分页
    const skip = (page - 1) * limit;

    // 执行查询
    const dishes = await Dish.find(filter)
      .sort({ recommendationLevel: -1, estimatedTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // 获取总数
    const total = await Dish.countDocuments(filter);

    return {
      dishes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 创建新菜品
   * @param {Object} dishData - 菜品数据
   * @returns {Promise<Object>} 创建的菜品对象
   */
  async createDish(dishData) {
    const dish = new Dish(dishData);
    return await dish.save();
  }

  /**
   * 更新菜品
   * @param {string} id - 菜品ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的菜品对象
   */
  async updateDish(id, updateData) {
    return await Dish.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * 删除菜品
   * @param {string} id - 菜品ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteDish(id) {
    return await Dish.findByIdAndDelete(id);
  }

  /**
   * 获取菜品统计信息
   * @returns {Promise<Object>} 统计信息对象
   */
  async getDishStats() {
    const totalDishes = await Dish.countDocuments({ isPublished: true });

    // 按分类统计
    const categoryStats = await Dish.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgStarLevel: { $avg: '$starLevel' } } },
      { $sort: { count: -1 } }
    ]);

    // 按难度统计
    const difficultyStats = await Dish.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 }, avgTime: { $avg: '$estimatedTime' } } },
      { $sort: { count: -1 } }
    ]);

    // 按星级统计
    const starLevelStats = await Dish.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$starLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 热门标签
    const popularTags = await Dish.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // 推荐菜品
    const recommendedDishes = await Dish.find({
      isPublished: true,
      recommendationLevel: { $gte: 4 }
    })
      .sort({ recommendationLevel: -1, successRate: -1 })
      .limit(10)
      .select('name category starLevel estimatedTime recommendationLevel');

    return {
      totalDishes,
      categoryStats,
      difficultyStats,
      starLevelStats,
      popularTags,
      recommendedDishes
    };
  }

  /**
   * 获取推荐菜品
   * @param {Object} options - 推荐选项
   * @param {string} options.category - 指定分类
   * @param {string} options.difficulty - 指定难度
   * @param {number} options.maxTime - 最大制作时间
   * @param {number} options.limit - 返回数量
   * @returns {Promise<Array>} 推荐菜品列表
   */
  async getRecommendedDishes(options = {}) {
    const {
      category,
      difficulty,
      maxTime,
      limit = 10
    } = options;

    const filter = {
      isPublished: true,
      recommendationLevel: { $gte: 3 }
    };

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (maxTime) {
      filter.estimatedTime = { $lte: maxTime };
    }

    return await Dish.find(filter)
      .sort({ recommendationLevel: -1, successRate: -1, starLevel: 1 })
      .limit(limit)
      .exec();
  }

  /**
   * 获取相关菜品
   * @param {string} dishId - 菜品ID
   * @param {number} limit - 返回数量
   * @returns {Promise<Array>} 相关菜品列表
   */
  async getRelatedDishes(dishId, limit = 5) {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return [];
    }

    // 查找相同分类或包含相同标签的菜品
    const relatedDishes = await Dish.find({
      _id: { $ne: dishId },
      isPublished: true,
      $or: [
        { category: dish.category },
        { tags: { $in: dish.tags } },
        { difficulty: dish.difficulty }
      ]
    })
      .sort({ recommendationLevel: -1, successRate: -1 })
      .limit(limit)
      .exec();

    return relatedDishes;
  }

  /**
   * 批量导入菜品数据
   * @param {Array} dishesData - 菜品数据数组
   * @returns {Promise<Object>} 导入结果
   */
  async importDishes(dishesData) {
    try {
      // 清空现有数据
      await Dish.deleteMany({});

      // 批量创建
      const results = await Dish.insertMany(dishesData);

      return {
        success: true,
        imported: results.length,
        total: dishesData.length,
        results
      };
    } catch (error) {
      console.error('导入菜品数据失败:', error);
      throw error;
    }
  }
}

module.exports = DishService; 