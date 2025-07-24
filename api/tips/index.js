const express = require('express');
const router = express.Router();
const { success, error } = require('../../utils');
const tipService = require('../../services/tipService');
const AIService = require('../../services/aiService');
const path = require('path');
const fs = require('fs');

const input = path.join(__dirname, '..', '..', 'tips');
const prompt = `
  请分析以下烹饪相关的markdown文件内容，并提供以下信息：
    1. 文件标题和主题
    2. 内容分类（例如：基础知识、烹饪技巧、食材选择、厨房工具、菜谱制作等）
    3. 难度级别（初级、中级、高级）
    4. 关键词标签（3-8个）
    5. 内容摘要（50-100字）
    6. 适用人群（新手、有经验的厨师、专业厨师等）
    7. 重要提示或注意事项

    请以JSON格式返回结果，包含以下字段：
    - title: 标题
    - category: 分类
    - difficulty: 难度级别
    - tags: 关键词标签数组
    - summary: 内容摘要
    - targetAudience: 适用人群
    - importantNotes: 重要提示数组

    文件内容：
    {{content}}
`

// 实例化AI服务
const AiService = new AIService({
  input,
  prompt,
  maxFilesPerType: 5, // tips类型最多保留5个文件
});

// GET /api/tips/categories - 获取所有分类
router.get('/categories', async (req, res) => {
  try {
    const categories = await tipService.getCategories();
    success(res, categories, '获取分类成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/tips/stats - 获取统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = await tipService.getStats();
    success(res, stats, '获取统计信息成功');
  } catch (err) {
    error(res, err.message);
  }
});

// POST /api/tips/ai-process - 使用AI处理markdown文件生成JSON
router.post('/ai-process', async (req, res) => {
  try {
    // 检查是否已经在处理中
    const allProgress = AiService.getAllProcessingProgress();
    const processingTask = Object.values(allProgress).find(task =>
      task.isProcessing && task.directory.endsWith('tips')
    );

    if (processingTask) {
      return success(res, processingTask, 'AI处理正在进行中');
    }

    // 开始处理（异步执行，不等待完成）
    setImmediate(() => {
      AiService.processMarkdownFiles().catch(err => {
        console.error('AI处理过程中发生错误:', err);
      });
    });

    // 等待一小段时间确保处理状态已初始化
    await new Promise(resolve => setTimeout(resolve, 100));

    // 获取所有进度并找到刚开始的任务
    const updatedProgress = AiService.getAllProcessingProgress();
    const currentTask = Object.values(updatedProgress).find(task =>
      task.isProcessing && task.directory.endsWith('tips')
    );

    success(res, currentTask || { message: '处理已开始' }, 'AI处理已开始');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/tips/ai-process/progress - 获取AI处理进度
router.get('/ai-process/progress', async (req, res) => {
  try {
    const allProgress = AiService.getAllProcessingProgress();
    const tipsProgress = Object.values(allProgress).find(task =>
      task.directory && task.directory.endsWith('tips')
    );

    if (tipsProgress) {
      success(res, tipsProgress, '获取处理进度成功');
    } else {
      success(res, {
        isProcessing: false,
        currentFile: 0,
        totalFiles: 0,
        progress: 0
      }, '没有正在处理的任务');
    }
  } catch (err) {
    error(res, err.message);
  }
});

// POST /api/tips/import-ai-processed - 导入AI处理后的JSON数据到数据库
router.post('/import-ai-processed', async (req, res) => {
  try {
    const processedData = AiService.getProcessedData();

    if (!processedData || !processedData.items || processedData.items.length === 0) {
      return error(res, '没有找到AI处理后的数据');
    }

    // 清空现有数据
    await tipService.clearAllTips();

    const results = [];

    // 导入AI处理后的数据
    for (const tipData of processedData.items) {
      // 统一处理targetAudience字段格式
      let targetAudience = tipData.targetAudience || ['未知'];
      if (typeof targetAudience === 'string') {
        // 如果是字符串，按逗号分割并去除空白
        targetAudience = targetAudience.split(',').map(item => item.trim());
      } else if (!Array.isArray(targetAudience)) {
        // 如果既不是字符串也不是数组，设置默认值
        targetAudience = ['未知'];
      }

      // 统一处理category字段格式
      let category = tipData.category || '未分类';
      if (Array.isArray(category)) {
        // 如果是数组，取第一个元素
        category = category[0] || '未分类';
      } else if (typeof category !== 'string') {
        // 如果既不是字符串也不是数组，设置默认值
        category = '未分类';
      }

      // 读取原始markdown文件内容
      let originalContent = '';
      if (tipData.filePath) {
        try {
          const fullFilePath = path.join(__dirname, '..', '..', 'tips', tipData.filePath);
          if (fs.existsSync(fullFilePath)) {
            originalContent = fs.readFileSync(fullFilePath, 'utf-8');
          } else {
            console.warn(`文件不存在: ${fullFilePath}`);
          }
        } catch (fileError) {
          console.error(`读取文件失败: ${tipData.filePath}`, fileError);
        }
      }

      const tip = await tipService.createTip({
        title: tipData.title,
        category: category,
        difficulty: tipData.difficulty || '未知',
        tags: tipData.tags || [],
        summary: tipData.summary,
        targetAudience: targetAudience,
        importantNotes: tipData.importantNotes || [],
        filePath: tipData.filePath,
        originalContent: originalContent,
        isPublished: true
      });
      results.push(tip);
    }

    success(res, {
      imported: results.length,
      total: processedData.items.length,
      results: results
    }, `成功导入 ${results.length} 条数据`);
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/tips/search - 搜索tips
router.get('/search', async (req, res) => {
  try {
    const { keyword, category, difficulty, page = 1, limit = 10 } = req.query;

    const searchOptions = {
      keyword,
      category,
      difficulty,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const results = await tipService.searchTips(searchOptions);
    success(res, results, '搜索成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/tips/:id - 获取单个tip
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tip = await tipService.getTipById(id);

    if (!tip) {
      return error(res, '未找到指定的tip', 404);
    }

    success(res, tip, '获取tip成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/tips - 获取所有tips
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      difficulty
    };

    const result = await tipService.getTips(options);
    success(res, result, '获取tips成功');
  } catch (err) {
    error(res, err.message);
  }
});

module.exports = router; 