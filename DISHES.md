# Dishes 菜品管理系统

Dishes 是一个基于 AI 的菜品管理系统，用于处理和管理 HowToCook 项目中的具体菜品信息。

## 功能特性

- **AI 智能分析**: 使用 OpenAI API 分析菜品 markdown 文件，自动提取菜品信息
- **丰富的数据结构**: 包含菜品的完整制作信息（原料、步骤、难度、时间等）
- **多维度查询**: 支持按分类、难度、时间、地域等多种维度查询
- **推荐系统**: 基于菜品特征的智能推荐功能
- **RESTful API**: 提供完整的 CRUD 操作和搜索功能
- **MongoDB 存储**: 使用 MongoDB 存储和管理菜品数据

## 系统架构

```
dishes/
├── models/Dish.js                # 菜品数据模型
├── services/dishService.js       # 菜品业务逻辑服务
├── api/dishes/index.js           # API 接口
└── dishes/                       # 原始 markdown 文件目录
    ├── meat_dish/               # 荤菜
    ├── vegetable_dish/          # 素菜
    ├── soup/                    # 汤羹
    ├── staple/                  # 主食
    ├── drink/                   # 饮品
    ├── dessert/                 # 甜品
    ├── breakfast/               # 早餐
    ├── aquatic/                 # 水产
    ├── condiment/               # 调料
    └── semi-finished/           # 半成品
```

## 数据模型

### Dish Schema

```javascript
{
  name: String,                    // 菜品名称
  description: String,             // 菜品描述
  content: String,                 // markdown 文件内容
  category: String,                // 菜品分类
  categoryName: String,            // 分类名称（中文）
  starLevel: Number,               // 星级难度（1-5）
  difficulty: String,              // 难度级别文本
  estimatedTime: Number,           // 预计制作时间（分钟）
  servings: Number,                // 服务人数
  ingredients: [{                  // 原料列表
    name: String,                  // 原料名称
    amount: String,                // 用量
    unit: String,                  // 单位
    isOptional: Boolean            // 是否可选
  }],
  tools: [String],                 // 工具列表
  steps: [{                        // 制作步骤
    stepNumber: Number,            // 步骤编号
    instruction: String,           // 操作说明
    tips: String,                  // 小贴士
    estimatedTime: Number          // 预计时间
  }],
  nutritionInfo: {                 // 营养信息
    calories: Number,              // 卡路里
    protein: Number,               // 蛋白质
    carbohydrates: Number,         // 碳水化合物
    fat: Number,                   // 脂肪
    fiber: Number                  // 纤维
  },
  tags: [String],                  // 标签
  suitableFor: [String],           // 适合人群
  importantNotes: [String],        // 重要提示
  features: [String],              // 菜品特点
  season: [String],                // 季节性
  region: String,                  // 地域特色
  imagePath: String,               // 菜品图片路径
  filePath: String,                // 文件路径
  isPublished: Boolean,            // 是否发布
  recommendationLevel: Number,     // 推荐级别（1-5）
  successRate: Number,             // 制作成功率（0-100）
  relatedDishes: [ObjectId],       // 相关菜品
  createdAt: String,               // 创建时间
  updatedAt: String                // 更新时间
}
```

### 虚拟字段

- `summary`: 菜品简介
- `difficultyDescription`: 难度描述
- `mainIngredients`: 主要原料列表
- `totalSteps`: 制作步骤总数
- `isBeginnerFriendly`: 是否适合新手

## API 接口

### AI 处理相关

```bash
# 启动AI处理（使用默认配置）
POST /api/dishes/ai-process

# 获取AI处理进度
GET /api/dishes/ai-process/progress

# 导入AI处理后的数据
POST /api/dishes/import-ai-processed
```

### 数据查询

```bash
# 获取所有菜品（支持分页和筛选）
GET /api/dishes?page=1&limit=10&category=meat_dish&difficulty=中级&starLevel=3

# 搜索菜品
GET /api/dishes/search?keyword=鸡蛋&category=vegetable_dish&page=1&limit=10

# 获取单个菜品
GET /api/dishes/:id

# 根据分类获取菜品
GET /api/dishes/category/meat_dish?page=1&limit=10

# 根据难度获取菜品
GET /api/dishes/difficulty/初级?page=1&limit=10

# 获取统计信息
GET /api/dishes/stats

# 获取推荐菜品
GET /api/dishes/recommendations?category=meat_dish&difficulty=初级&maxTime=30&limit=10
```

## 使用流程

### 1. 启动AI处理

```bash
# 使用默认配置处理dishes目录
curl -X POST http://localhost:3000/api/dishes/ai-process
```

响应示例：
```json
{
  "success": true,
  "code": 200,
  "msg": "AI处理已开始",
  "data": {
    "taskId": "dishes_1640000000000",
    "isProcessing": true,
    "currentFile": 0,
    "totalFiles": 0
  }
}
```

### 2. 查询处理进度

```bash
curl -X GET http://localhost:3000/api/dishes/ai-process/progress
```

响应示例：
```json
{
  "success": true,
  "code": 200,
  "msg": "获取处理进度成功",
  "data": {
    "isProcessing": true,
    "currentFile": 50,
    "totalFiles": 325,
    "currentFileName": "西红柿炒鸡蛋.md",
    "progress": 15
  }
}
```

### 3. 导入处理后的数据

```bash
curl -X POST http://localhost:3000/api/dishes/import-ai-processed
```

响应示例：
```json
{
  "success": true,
  "code": 200,
  "msg": "成功导入 325 条数据",
  "data": {
    "imported": 325,
    "total": 325,
    "results": [...]
  }
}
```

### 4. 查询数据

```bash
# 获取所有菜品
curl -X GET "http://localhost:3000/api/dishes?limit=10"

# 搜索菜品
curl -X GET "http://localhost:3000/api/dishes/search?keyword=鸡蛋"

# 获取推荐菜品
curl -X GET "http://localhost:3000/api/dishes/recommendations?difficulty=初级&limit=5"

# 获取统计信息
curl -X GET "http://localhost:3000/api/dishes/stats"
```

## 分类系统

### 菜品分类

| 分类代码       | 中文名称 | 描述                   |
| -------------- | -------- | ---------------------- |
| meat_dish      | 荤菜     | 以肉类为主要食材的菜品 |
| vegetable_dish | 素菜     | 以蔬菜为主要食材的菜品 |
| soup           | 汤羹     | 汤类和羹类菜品         |
| staple         | 主食     | 米饭、面条、包子等主食 |
| drink          | 饮品     | 各种饮料和茶品         |
| dessert        | 甜品     | 甜点和糕点             |
| breakfast      | 早餐     | 早餐专用菜品           |
| aquatic        | 水产     | 鱼类、虾类等水产菜品   |
| condiment      | 调料     | 调味料和酱料           |
| semi-finished  | 半成品   | 半成品食材             |

### 难度级别

| 星级  | 难度级别 | 描述                           |
| ----- | -------- | ------------------------------ |
| 1星   | 初级     | 简单易做，适合新手             |
| 2星   | 中级     | 需要一定基础，适合有经验的厨师 |
| 3-4星 | 高级     | 较为复杂，需要丰富经验         |
| 5星   | 专家级   | 技术要求高，适合专业厨师       |

## AI 提示词

系统使用专门设计的提示词来分析菜品markdown文件：

```
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
```

## 开发指南

### 扩展AI提示词

修改 `api/dishes/index.js` 中的 `dishPrompt` 变量来自定义AI分析逻辑。

### 添加新的菜品分类

1. 在 `dishes/` 目录下创建新的分类文件夹
2. 更新 `models/Dish.js` 中的分类枚举
3. 更新分类映射表
4. 重新运行AI处理流程

### 自定义搜索功能

在 `DishService.searchDishes()` 中添加新的搜索条件：

```javascript
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
```

### 扩展数据字段

在 `models/Dish.js` 中添加新的字段：

```javascript
// 新增字段示例
cookingMethod: {
  type: String,
  enum: ['炒', '煮', '蒸', '烤', '炖', '凉拌'],
  trim: true
},

spiciness: {
  type: Number,
  min: 0,
  max: 5,
  default: 0
}
```

## 使用示例

### 命令行示例

```bash
# 1. 启动服务器
npm start

# 2. 使用默认配置处理dishes目录
curl -X POST http://localhost:3000/api/dishes/ai-process

# 3. 查看AI处理进度
curl -X GET http://localhost:3000/api/dishes/ai-process/progress

# 4. 导入AI处理后的数据到数据库
curl -X POST http://localhost:3000/api/dishes/import-ai-processed

# 5. 获取所有菜品
curl -X GET "http://localhost:3000/api/dishes?limit=10"

# 6. 搜索菜品
curl -X GET "http://localhost:3000/api/dishes/search?keyword=鸡蛋"

# 7. 获取荤菜分类
curl -X GET "http://localhost:3000/api/dishes/category/meat_dish"

# 8. 获取初级难度菜品
curl -X GET "http://localhost:3000/api/dishes/difficulty/初级"

# 9. 获取推荐菜品
curl -X GET "http://localhost:3000/api/dishes/recommendations?maxTime=30&limit=5"

# 10. 获取统计信息
curl -X GET "http://localhost:3000/api/dishes/stats"
```

### 代码示例

```javascript
const DishService = require('./services/dishService');

// 创建服务实例
const dishService = new DishService();

// 获取推荐菜品
const recommendations = await dishService.getRecommendedDishes({
  difficulty: '初级',
  maxTime: 30,
  limit: 5
});

// 搜索菜品
const searchResults = await dishService.searchDishes({
  keyword: '鸡蛋',
  category: 'vegetable_dish',
  page: 1,
  limit: 10
});

// 获取统计信息
const stats = await dishService.getDishStats();
console.log(`共有 ${stats.totalDishes} 道菜品`);
```

## 注意事项

1. **AI处理**: 需要配置OpenAI API密钥
2. **数据一致性**: 导入数据前会清空现有数据
3. **分类映射**: 确保菜品分类与目录结构一致
4. **文件格式**: 确保markdown文件格式正确
5. **性能优化**: 大量数据时建议分批处理

## 故障排除

### 常见问题

1. **AI处理失败**: 检查OpenAI API配置和网络连接
2. **导入失败**: 确保AI处理完成并生成了JSON文件
3. **搜索无结果**: 检查关键词拼写和数据库连接
4. **分类错误**: 确保文件路径与分类枚举一致

### 日志查看

系统会在控制台输出详细的操作日志，包括：
- AI处理进度和状态
- 数据导入结果
- 错误信息和堆栈跟踪
- API请求和响应日志

### 数据备份

建议在导入新数据前备份现有数据：
```bash
# 获取所有数据
curl -X GET "http://localhost:3000/api/dishes?limit=1000" > dishes_backup.json
```

## 与其他系统的关系

- **Tips系统**: 提供烹饪技巧和知识支持
- **StarSystem系统**: 提供难度分级参考
- **共享特性**: 都支持AI处理、搜索、统计等功能

## 未来扩展

1. **图像识别**: 支持菜品图片的AI识别和分析
2. **营养分析**: 更详细的营养成分计算
3. **用户评价**: 支持用户评分和评论
4. **食谱推荐**: 基于用户偏好的个性化推荐
5. **购物清单**: 自动生成购物清单功能 