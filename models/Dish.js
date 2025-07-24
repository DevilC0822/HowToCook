const { mongoose } = require('../db');
const dayjs = require('dayjs');

/**
 * Dish 数据模型
 * 用于存储 dishes 文件夹中的具体菜品内容
 */
const dishSchema = new mongoose.Schema({
  // 菜品名称
  name: {
    type: String,
    required: true,
    trim: true
  },

  // 菜品描述/介绍
  description: {
    type: String,
    trim: true
  },

  // markdown 文件的完整内容
  content: {
    type: String,
    required: false,
    default: ''
  },

  // 原始 markdown 文件内容
  originalContent: {
    type: String,
    required: false,
    default: ''
  },

  // 菜品分类（基于目录结构）
  category: {
    type: String,
    required: true,
    trim: true
  },

  // 菜品分类名称（中文）
  categoryName: {
    type: String,
    required: false,
    trim: true
  },

  // 星级难度（1-5星）
  starLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },

  // 难度级别文本
  difficulty: {
    type: String,
    trim: true,
    default: '未知'
  },

  // 预计制作时间（分钟）
  estimatedTime: {
    type: Number,
    min: 0,
    default: 0
  },

  // 服务人数
  servings: {
    type: String,
    trim: true,
    default: '1人'
  },

  // 必备原料列表
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    },
    isOptional: {
      type: Boolean,
      default: false
    }
  }],

  // 必备工具列表
  tools: [{
    type: String,
    trim: true
  }],

  // 制作步骤
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true,
      trim: true
    },
    tips: {
      type: String,
      trim: true
    },
    estimatedTime: {
      type: Number,
      min: 0
    }
  }],

  // 营养信息
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number
  },

  // 标签
  tags: [{
    type: String,
    trim: true
  }],

  // 适合人群
  suitableFor: [{
    type: String,
    trim: true
  }],

  // 重要提示和注意事项
  importantNotes: [{
    type: String,
    trim: true
  }],

  // 菜品特点
  features: [{
    type: String,
    trim: true
  }],

  // 季节性
  season: [{
    type: String,
    trim: true
  }],

  // 地域特色
  region: {
    type: String,
    trim: true
  },

  // 菜品图片路径
  imagePath: {
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

  // 推荐级别（1-5星）
  recommendationLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },

  // 制作成功率（AI分析或用户反馈）
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },

  // 相关菜品（参考菜品ID）
  relatedDishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
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
dishSchema.pre('save', function (next) {
  this.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
  next();
});

// 保存前处理分类名称
dishSchema.pre('save', function (next) {
  const categoryMap = {
    'meat_dish': '荤菜',
    'vegetable_dish': '素菜',
    'soup': '汤羹',
    'staple': '主食',
    'drink': '饮品',
    'dessert': '甜品',
    'breakfast': '早餐',
    'aquatic': '水产',
    'condiment': '调料',
    'semi-finished': '半成品',
    'international': '国际料理'
  };

  // 如果categoryName为空，则设置为mapped值或category本身
  if (!this.categoryName) {
    this.categoryName = categoryMap[this.category] || this.category;
  }
  next();
});

// 保存前处理难度级别
dishSchema.pre('save', function (next) {
  // 如果difficulty为空，根据starLevel自动设置
  if (!this.difficulty || this.difficulty === '未知') {
    if (this.starLevel <= 1) {
      this.difficulty = '初级';
    } else if (this.starLevel <= 2) {
      this.difficulty = '中级';
    } else if (this.starLevel <= 4) {
      this.difficulty = '高级';
    } else {
      this.difficulty = '专家级';
    }
  }
  next();
});

// 添加索引以提高查询性能
dishSchema.index({ name: 1 });
dishSchema.index({ category: 1 });
dishSchema.index({ starLevel: 1 });
dishSchema.index({ difficulty: 1 });
dishSchema.index({ tags: 1 });
dishSchema.index({ suitableFor: 1 });
dishSchema.index({ estimatedTime: 1 });
dishSchema.index({ servings: 1 });
dishSchema.index({ recommendationLevel: 1 });
dishSchema.index({ createdAt: -1 });
dishSchema.index({ isPublished: 1 });

// 虚拟字段：菜品简介
dishSchema.virtual('summary').get(function () {
  if (this.description) {
    return this.description.length > 100 ? this.description.substring(0, 100) + '...' : this.description;
  }
  return `${this.categoryName}类菜品，${this.starLevel}星难度，预计${this.estimatedTime || '未知'}分钟制作完成。`;
});

// 虚拟字段：难度描述
dishSchema.virtual('difficultyDescription').get(function () {
  const descriptions = {
    '初级': '简单易做，适合新手',
    '中级': '需要一定基础，适合有经验的厨师',
    '高级': '较为复杂，需要丰富经验',
    '专家级': '技术要求高，适合专业厨师'
  };
  return descriptions[this.difficulty] || '难度未知';
});

// 虚拟字段：主要原料列表
dishSchema.virtual('mainIngredients').get(function () {
  if (!this.ingredients || !Array.isArray(this.ingredients)) {
    return [];
  }
  return this.ingredients.slice(0, 5).map(ingredient => ingredient.name);
});

// 虚拟字段：制作步骤总数
dishSchema.virtual('totalSteps').get(function () {
  if (!this.steps || !Array.isArray(this.steps)) {
    return 0;
  }
  return this.steps.length;
});

// 虚拟字段：是否适合新手
dishSchema.virtual('isBeginnerFriendly').get(function () {
  return this.starLevel <= 2 && this.successRate >= 70;
});

// 设置 JSON 输出时包含虚拟字段
dishSchema.set('toJSON', { virtuals: true });

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish; 