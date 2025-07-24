const { mongoose } = require('../db');
const dayjs = require('dayjs');

/**
 * Tip 数据模型
 * 用于存储 tips 文件夹中的 markdown 文件内容
 */
const tipSchema = new mongoose.Schema({
  // 提示标题（AI分析结果）
  title: {
    type: String,
    required: true,
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

  // 分类（AI分析结果，动态分类）
  category: {
    type: String,
    required: true,
    trim: true
  },

  // 难度级别（AI分析结果）
  difficulty: {
    type: String,
    enum: ['初级', '中级', '高级', '未知'],
    default: '未知'
  },

  // AI生成的摘要
  summary: {
    type: String,
    trim: true
  },

  // 适用人群
  targetAudience: [{
    type: String,
    trim: true
  }],

  // 重要提示
  importantNotes: [{
    type: String,
    trim: true
  }],

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

  // 标签
  tags: [{
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
tipSchema.pre('save', function (next) {
  this.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
  next();
});

// 添加索引以提高查询性能
tipSchema.index({ title: 1 });
tipSchema.index({ category: 1 });
tipSchema.index({ difficulty: 1 });
tipSchema.index({ tags: 1 });
tipSchema.index({ createdAt: -1 });

// 添加虚拟字段：从 markdown 内容中提取简介
tipSchema.virtual('excerpt').get(function () {
  if (!this.content) return '';

  // 移除 markdown 标记，获取纯文本
  const plainText = this.content
    .replace(/^#{1,6}\s+/gm, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/`(.*?)`/g, '$1') // 移除代码标记
    .replace(/\n\s*\n/g, '\n') // 移除多余的空行
    .trim();

  // 返回前200个字符作为简介
  return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
});

// 设置 JSON 输出时包含虚拟字段
tipSchema.set('toJSON', { virtuals: true });

const Tip = mongoose.model('Tip', tipSchema);

module.exports = Tip; 