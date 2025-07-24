const express = require('express');
const router = express.Router();
const { success, error, parseTimeToMinutes, hasError } = require('../../utils');
const DishService = require('../../services/dishService');
const AIService = require('../../services/aiService');
const path = require('path');
const fs = require('fs');

const dishService = new DishService();

const input = path.join(__dirname, '..', '..', 'dishes');
const prompt = `
请分析以下菜品相关的markdown文件内容，并提供以下信息：
  1. 菜品名称和描述
  2. 菜品分类（基于文件路径）
  3. 星级难度（1-5星，根据文件中的★符号或复杂程度判断）
  4. 预计制作时间（根据操作步骤估算，单位：分钟）
  5. 服务人数（根据分量描述）
  6. 必备原料列表（从"必备原料和工具"部分提取）
  7. 必备工具列表（从"必备原料和工具"部分提取）
  8. 制作步骤（从"操作"部分提取，按顺序编号）
  9. 营养信息（如果有提及）
  10. 标签（根据菜品特点生成3-8个标签）
  11. 适合人群（根据难度和特点判断）
  12. 重要提示（从内容中提取注意事项）
  13. 菜品特点（根据描述总结）
  14. 季节性（根据食材判断适合的季节）
  15. 地域特色（如果有地域特色）
  16. 推荐级别（1-5星，根据制作难度和成功率评估）
  17. 制作成功率（根据难度和步骤复杂度估算，0-100%）

请以JSON格式返回结果，包含以下字段：
- name: 菜品名称
- description: 菜品描述
- category: 菜品分类（从文件路径提取）
- starLevel: 星级难度（1-5）
- estimatedTime: 预计制作时间（分钟）
- servings: 服务人数
- ingredients: 原料列表 [{ name, amount, unit, isOptional }]
- tools: 工具列表 [string]
- steps: 制作步骤 [{ stepNumber, instruction, tips, estimatedTime }]
- nutritionInfo: 营养信息 { calories, protein, carbohydrates, fat, fiber }
- tags: 标签数组
- suitableFor: 适合人群数组
- importantNotes: 重要提示数组
- features: 菜品特点数组
- season: 季节性数组
- region: 地域特色
- recommendationLevel: 推荐级别（1-5）
- successRate: 制作成功率（0-100）

文件内容：
{{content}}
`;

// 实例化AI服务
const dishesAiService = new AIService({
  input,
  prompt,
  requiredFields: ['name', 'category', 'tags', 'description'], // dishes类型的必需字段
  maxFilesPerType: 10, // dishes类型最多保留10个文件
});

// POST /api/dishes/ai-process - 使用AI处理markdown文件生成JSON
router.post('/ai-process', async (req, res) => {
  try {
    // 检查是否已经在处理中
    const allProgress = dishesAiService.getAllProcessingProgress();
    const processingTask = Object.values(allProgress).find(task =>
      task.isProcessing && task.directory.endsWith('dishes')
    );

    if (processingTask) {
      return success(res, processingTask, 'AI处理正在进行中');
    }

    // 开始处理（异步执行，不等待完成）
    setImmediate(() => {
      dishesAiService.processMarkdownFiles().catch(err => {
        console.error('AI处理过程中发生错误:', err);
      });
    });

    // 等待一小段时间确保处理状态已初始化
    await new Promise(resolve => setTimeout(resolve, 100));

    // 获取所有进度并找到刚开始的任务
    const updatedProgress = dishesAiService.getAllProcessingProgress();
    const currentTask = Object.values(updatedProgress).find(task =>
      task.isProcessing && task.directory.endsWith('dishes')
    );

    success(res, currentTask || { message: '处理已开始' }, 'AI处理已开始');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/ai-process/progress - 获取AI处理进度
router.get('/ai-process/progress', async (req, res) => {
  try {
    const allProgress = dishesAiService.getAllProcessingProgress();
    const dishesProgress = Object.values(allProgress).find(task =>
      task.directory && task.directory.endsWith('dishes')
    );

    if (dishesProgress) {
      success(res, dishesProgress, '获取处理进度成功');
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

// POST /api/dishes/import-ai-processed - 导入AI处理后的JSON数据到数据库
router.post('/import-ai-processed', async (req, res) => {
  try {
    const processedData = dishesAiService.getProcessedData();

    if (!processedData || !processedData.items || processedData.items.length === 0) {
      return error(res, '没有找到AI处理后的数据');
    }

    // 清空现有数据
    await dishService.importDishes([]);

    const results = [];
    const skippedItems = [];

    // 导入AI处理后的数据
    for (const dishData of processedData.items) {
      // 检查是否存在error字段，如果存在则跳过
      if (hasError(dishData)) {
        console.log(`跳过包含错误的数据: ${dishData.filePath || '未知文件'}, 错误: ${dishData.error}`);
        skippedItems.push({
          filePath: dishData.filePath || '未知文件',
          error: dishData.error
        });
        continue;
      }

      try {
        // 处理分类字段
        let category = dishData.category || 'meat_dish';
        if (Array.isArray(category)) {
          category = category[0] || 'meat_dish';
        }

        // 处理适合人群字段
        let suitableFor = dishData.suitableFor || ['未知'];
        if (typeof suitableFor === 'string') {
          suitableFor = suitableFor.split(',').map(item => item.trim());
        } else if (!Array.isArray(suitableFor)) {
          suitableFor = ['未知'];
        }

        // 处理原料列表
        let ingredients = dishData.ingredients || [];
        if (!Array.isArray(ingredients)) {
          ingredients = [];
        }

        // 处理制作步骤并转换estimatedTime
        let steps = dishData.steps || [];
        if (!Array.isArray(steps)) {
          steps = [];
        }

        // 转换步骤中的estimatedTime字段
        steps = steps.map(step => {
          if (step.estimatedTime) {
            step.estimatedTime = parseTimeToMinutes(step.estimatedTime);
          }
          return step;
        });

        // 处理主要的estimatedTime字段
        const mainEstimatedTime = parseTimeToMinutes(dishData.estimatedTime);

        // 读取原始markdown文件内容
        let originalContent = '';
        if (dishData.filePath) {
          try {
            const fullFilePath = path.join(__dirname, '..', '..', 'dishes', dishData.filePath);
            if (fs.existsSync(fullFilePath)) {
              originalContent = fs.readFileSync(fullFilePath, 'utf-8');
            } else {
              console.warn(`文件不存在: ${fullFilePath}`);
            }
          } catch (fileError) {
            console.error(`读取文件失败: ${dishData.filePath}`, fileError);
          }
        }

        const dish = await dishService.createDish({
          name: dishData.name || '未知菜品',
          description: dishData.description || '',
          content: dishData.content || '',
          originalContent: originalContent,
          category: category,
          starLevel: dishData.starLevel || 1,
          estimatedTime: mainEstimatedTime,
          servings: dishData.servings || 1,
          ingredients: ingredients,
          tools: dishData.tools || [],
          steps: steps,
          nutritionInfo: dishData.nutritionInfo || {},
          tags: dishData.tags || [],
          suitableFor: suitableFor,
          importantNotes: dishData.importantNotes || [],
          features: dishData.features || [],
          season: dishData.season || ['全年'],
          region: dishData.region || '',
          recommendationLevel: dishData.recommendationLevel || 3,
          successRate: dishData.successRate || 80,
          filePath: dishData.filePath,
          isPublished: true
        });
        results.push(dish);
      } catch (itemError) {
        console.error(`处理单个菜品数据失败: ${dishData.filePath || '未知文件'}`, itemError);
        skippedItems.push({
          filePath: dishData.filePath || '未知文件',
          error: itemError.message
        });
      }
    }

    success(res, {
      imported: results.length,
      total: processedData.items.length,
      skipped: skippedItems.length,
      results: results,
      skippedItems: skippedItems
    }, `成功导入 ${results.length} 条数据，跳过 ${skippedItems.length} 条数据`);
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/search - 搜索菜品
router.get('/search', async (req, res) => {
  try {
    const { keyword, category, difficulty, starLevel, page = 1, limit = 10 } = req.query;

    const searchOptions = {
      keyword,
      category,
      difficulty,
      starLevel: starLevel ? parseInt(starLevel) : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const results = await dishService.searchDishes(searchOptions);
    success(res, results, '搜索成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/stats - 获取统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = await dishService.getDishStats();
    success(res, stats, '获取统计信息成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/recommendations - 获取推荐菜品
router.get('/recommendations', async (req, res) => {
  try {
    const {
      category,
      difficulty,
      maxTime,
      limit = 10
    } = req.query;

    const options = {
      category,
      difficulty,
      maxTime: maxTime ? parseInt(maxTime) : undefined,
      limit: parseInt(limit)
    };

    const dishes = await dishService.getRecommendedDishes(options);
    success(res, dishes, '获取推荐菜品成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/category/:category - 根据分类获取菜品
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await dishService.getDishesByCategory(category, options);
    success(res, result, '获取分类菜品成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/difficulty/:difficulty - 根据难度获取菜品
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await dishService.getDishesByDifficulty(difficulty, options);
    success(res, result, '获取难度菜品成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/:id - 获取单个菜品
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await dishService.getDishById(id);

    if (!dish) {
      return error(res, '未找到指定的菜品', 404);
    }

    success(res, dish, '获取菜品成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes/filepath/:filePath - 根据文件路径获取单个菜品
router.get('/filepath/:filePath', async (req, res) => {
  try {
    const { filePath } = req.params;
    let decodedFilePath = decodeURIComponent(filePath);

    // 处理StarSystem中的filePath格式差异
    // StarSystem: "./../dishes/breakfast/微波炉荷包蛋.md"
    // Dishes DB: "breakfast/微波炉荷包蛋.md"
    if (decodedFilePath.startsWith('./../dishes/')) {
      decodedFilePath = decodedFilePath.replace('./../dishes/', '');
    }

    const dish = await dishService.getDishByFilePath(decodedFilePath);

    if (!dish) {
      return error(res, '未找到指定的菜品', 404);
    }

    success(res, dish, '获取菜品成功');
  } catch (err) {
    error(res, err.message);
  }
});

// GET /api/dishes - 获取所有菜品
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, starLevel, region, servings, maxTime, sortBy, sortOrder } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      difficulty,
      starLevel: starLevel ? parseInt(starLevel) : undefined,
      region,
      servings: servings ? parseInt(servings) : undefined,
      maxTime: maxTime ? parseInt(maxTime) : undefined,
      sortBy,
      sortOrder
    };

    const result = await dishService.getDishes(options);
    success(res, result, '获取菜品成功');
  } catch (err) {
    error(res, err.message);
  }
});

module.exports = router; 