const { mongoose } = require('../db');
const dayjs = require('dayjs');

/**
 * StarSystem 数据模型
 * 用于存储 starsystem 文件夹中的星级菜单内容
 */
const starSystemSchema = new mongoose.Schema({
  // 菜单标题（如："1 星难度菜品"）
  title: {
    type: String,
    required: true,
    trim: true
  },

  // 星级等级（1-7星）
  starLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },

  // markdown 文件的完整内容
  content: {
    type: String,
    required: false,
    default: ''
  },

  // 菜品列表（解析出的菜品信息）
  dishes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true
    },
    category: {
      type: String,
      trim: true
    }
  }],

  // 菜品数量统计
  dishCount: {
    type: Number,
    default: 0
  },

  // 菜品分类统计
  categoryStats: {
    type: Map,
    of: Number,
    default: new Map()
  },

  // 难度描述
  difficultyDescription: {
    type: String,
    trim: true
  },

  // 文件的相对路径
  filePath: {
    type: String,
    required: true,
    unique: true // 确保同一文件不会重复存储
  },

  // 是否已发布
  isPublished: {
    type: Boolean,
    default: true
  },

  // 标签（如：初学者、进阶、专业等）
  tags: [{
    type: String,
    trim: true
  }],

  // 推荐人群
  recommendedFor: [{
    type: String,
    trim: true
  }],

  // 创建时间
  createdAt: {
    type: String,
    default: () => dayjs().format('YYYY-MM-DD HH:mm:ss')
  },

  // 更新时间
  updatedAt: {
    type: String,
    default: () => dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
});

// 更新时自动设置 updatedAt
starSystemSchema.pre('save', function (next) {
  this.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
  next();
});

// 保存前自动计算菜品数量和分类统计
starSystemSchema.pre('save', function (next) {
  // 更新菜品数量
  this.dishCount = this.dishes.length;

  // 更新分类统计
  const categoryStats = new Map();
  this.dishes.forEach(dish => {
    if (dish.category) {
      const count = categoryStats.get(dish.category) || 0;
      categoryStats.set(dish.category, count + 1);
    }
  });
  this.categoryStats = categoryStats;

  next();
});

// 添加索引以提高查询性能
starSystemSchema.index({ starLevel: 1 });
starSystemSchema.index({ dishCount: 1 });
starSystemSchema.index({ title: 1 });
starSystemSchema.index({ tags: 1 });
starSystemSchema.index({ createdAt: -1 });
starSystemSchema.index({ isPublished: 1 });

// 虚拟字段：难度级别文本
starSystemSchema.virtual('difficultyLevel').get(function () {
  if (this.starLevel <= 2) return '初级';
  if (this.starLevel <= 4) return '中级';
  if (this.starLevel <= 6) return '高级';
  return '专家级';
});

// 虚拟字段：菜单简介
starSystemSchema.virtual('summary').get(function () {
  return `${this.starLevel}星难度菜单，包含${this.dishCount}道菜品，适合${this.difficultyLevel}厨师。`;
});

// 虚拟字段：主要分类
starSystemSchema.virtual('mainCategories').get(function () {
  const categories = Array.from(this.categoryStats.keys());
  return categories.slice(0, 5); // 返回前5个主要分类
});

// 设置 JSON 输出时包含虚拟字段
starSystemSchema.set('toJSON', { virtuals: true });

const StarSystem = mongoose.model('StarSystem', starSystemSchema);

module.exports = StarSystem;