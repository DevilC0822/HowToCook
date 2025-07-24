const express = require('express');
const router = express.Router();
const { success, error } = require('../../utils');
const StarSystemService = require('../../services/starSystemService');
const AIService = require('../../services/aiService');
const path = require('path');

const input = path.join(__dirname, '..', '..', 'starsystem');
const prompt = `
你是一个专业的菜谱分析师，请分析以下星级菜单的markdown文件内容。

请严格按照以下JSON格式返回结果，保持紧凑格式，不要添加任何其他文本：

{
  "title": "菜单标题",
  "starLevel": 数字(1-7),
  "dishes": [
    {
      "name": "菜品名称",
      "filePath": "文件路径",
      "category": "分类"
    }
  ],
  "difficultyDescription": "简短难度描述(20字以内)",
  "recommendedFor": ["推荐人群"],
  "tags": ["标签1", "标签2"]
}

分析要求：
1. 从文件名中提取星级信息 (1-7)
2. 解析markdown链接，提取菜品信息
3. 根据菜品路径判断分类 (如: aquatic, breakfast, meat_dish等)
4. 生成20字以内的简短难度描述
5. 推荐1个主要目标人群
6. 提供2个相关标签

文件内容：
{{content}}
`;

// 实例化AI服务
const starSystemAiService = new AIService({
  input,
  prompt,
  requiredFields: ['title', 'starLevel', 'dishes', 'tags'], // starsystem的必需字段
  maxFilesPerType: 3, // starsystem类型最多保留3个文件
});

// POST /api/starsystem/ai-process - 使用AI处理markdown文件生成JSON
router.post('/ai-process', async (req, res) => {
  try {
    // 检查是否已经在处理中
    const allProgress = starSystemAiService.getAllProcessingProgress();
    const processingTask = Object.values(allProgress).find(task =>
      task.isProcessing && task.directory.endsWith('starsystem')
    );

    if (processingTask) {
      return success(res, processingTask, 'AI处理正在进行中');
    }

    // 开始处理（异步执行，不等待完成）
    setImmediate(() => {
      starSystemAiService.processMarkdownFiles().catch(err => {
        console.error('AI处理过程中发生错误:', err);
      });
    });

    // 等待一小段时间确保处理状态已初始化
    await new Promise(resolve => setTimeout(resolve, 100));

    // 获取所有进度并找到刚开始的任务
    const updatedProgress = starSystemAiService.getAllProcessingProgress();
    const currentTask = Object.values(updatedProgress).find(task =>
      task.isProcessing && task.directory.endsWith('starsystem')
    );

    success(res, currentTask || { message: '处理已开始' }, 'AI处理已开始');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/starsystem/ai-process/progress - 获取AI处理进度
router.get('/ai-process/progress', async (req, res) => {
  try {
    const allProgress = starSystemAiService.getAllProcessingProgress();
    const starSystemProgress = Object.values(allProgress).find(task =>
      task.directory && task.directory.endsWith('starsystem')
    );

    if (starSystemProgress) {
      success(res, starSystemProgress, '获取处理进度成功');
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

// POST /api/starsystem/import-ai-processed - 导入AI处理后的JSON数据到数据库
router.post('/import-ai-processed', async (req, res) => {
  try {
    const processedData = starSystemAiService.getProcessedData();

    if (!processedData || !processedData.items || processedData.items.length === 0) {
      return error(res, '没有找到AI处理后的数据');
    }

    // 清空现有数据
    await StarSystemService.clearAllStarSystems();

    const results = [];

    // 导入AI处理后的数据
    for (const starSystemData of processedData.items) {
      const dishes = starSystemData.dishes || [];
      const starSystem = await StarSystemService.createStarSystem({
        title: starSystemData.title,
        starLevel: starSystemData.starLevel,
        dishes: dishes,
        dishCount: dishes.length,
        difficultyDescription: starSystemData.difficultyDescription,
        recommendedFor: starSystemData.recommendedFor || [],
        tags: starSystemData.tags || [],
        filePath: starSystemData.filePath,
        isPublished: true
      });
      results.push(starSystem);
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

// GET /api/starsystem/search - 搜索starsystem
router.get('/search', async (req, res) => {
  try {
    const { keyword, starLevel, difficultyLevel, page = 1, limit = 10 } = req.query;

    const searchOptions = {
      keyword,
      starLevel: starLevel ? parseInt(starLevel) : null,
      difficultyLevel,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const results = await StarSystemService.searchStarSystems(searchOptions);
    success(res, results, '搜索成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/starsystem/stats - 获取统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = await StarSystemService.getStarSystemStats();
    success(res, stats, '获取统计信息成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/starsystem/level/:starLevel - 根据星级获取starsystem
router.get('/level/:starLevel', async (req, res) => {
  try {
    const starLevel = parseInt(req.params.starLevel);

    if (starLevel < 1 || starLevel > 7) {
      return error(res, '星级必须在 1-7 之间', 400);
    }

    const starSystem = await StarSystemService.getStarSystemByLevel(starLevel);

    if (!starSystem) {
      return error(res, `${starLevel} 星级的 StarSystem 不存在`, 404);
    }

    success(res, starSystem, '获取成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/starsystem/:id - 获取单个starsystem
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const starSystem = await StarSystemService.getStarSystemById(id);

    if (!starSystem) {
      return error(res, '未找到指定的starsystem', 404);
    }

    success(res, starSystem, '获取starsystem成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/starsystem - 获取所有starsystem
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, starLevel, difficultyLevel } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      starLevel: starLevel ? parseInt(starLevel) : null,
      difficultyLevel
    };

    const result = await StarSystemService.getStarSystems(options);
    success(res, result, '获取starsystem成功');
  } catch (err) {
    error(res, err.message);
  }
});

// POST /api/starsystem - 创建新的starsystem
router.post('/', async (req, res) => {
  try {
    const { title, starLevel, content, dishes, tags, recommendedFor, difficultyDescription } = req.body;

    if (!title || !starLevel || !content) {
      return error(res, '标题、星级和内容为必填项', 400);
    }

    if (starLevel < 1 || starLevel > 7) {
      return error(res, '星级必须在 1-7 之间', 400);
    }

    const starSystemData = {
      title,
      starLevel,
      content,
      dishes: dishes || [],
      tags: tags || [],
      recommendedFor: recommendedFor || [],
      difficultyDescription: difficultyDescription || '',
      filePath: `starsystem/${starLevel}Star.md`
    };

    const starSystem = await StarSystemService.createStarSystem(starSystemData);

    success(res, starSystem, 'StarSystem 创建成功');
  } catch (err) {
    if (err.code === 11000) {
      return error(res, '该 StarSystem 已存在', 409);
    }
    error(res, err.message);
  }
});

// PUT /api/starsystem/:id - 更新starsystem
router.put('/:id', async (req, res) => {
  try {
    const { title, starLevel, content, dishes, tags, recommendedFor, difficultyDescription } = req.body;

    if (starLevel && (starLevel < 1 || starLevel > 7)) {
      return error(res, '星级必须在 1-7 之间', 400);
    }

    const updateData = {};

    if (title) updateData.title = title;
    if (starLevel) updateData.starLevel = starLevel;
    if (content) updateData.content = content;
    if (dishes) updateData.dishes = dishes;
    if (tags) updateData.tags = tags;
    if (recommendedFor) updateData.recommendedFor = recommendedFor;
    if (difficultyDescription) updateData.difficultyDescription = difficultyDescription;

    const starSystem = await StarSystemService.updateStarSystem(req.params.id, updateData);

    if (!starSystem) {
      return error(res, 'StarSystem 不存在', 404);
    }

    success(res, starSystem, 'StarSystem 更新成功');
  } catch (err) {
    error(res, err.message);
  }
});

// DELETE /api/starsystem/:id - 删除starsystem
router.delete('/:id', async (req, res) => {
  try {
    const starSystem = await StarSystemService.deleteStarSystem(req.params.id);

    if (!starSystem) {
      return error(res, 'StarSystem 不存在', 404);
    }

    success(res, null, 'StarSystem 删除成功');
  } catch (err) {
    error(res, err.message);
  }
});

module.exports = router; 