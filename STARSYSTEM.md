# StarSystem 星级菜单系统

StarSystem 是一个基于星级难度的菜品菜单管理系统，用于管理和展示不同难度级别的菜品。

## 功能特点

- **星级分类**: 支持1-7星级别的菜品分类
- **AI智能处理**: 使用AI分析markdown文件并生成结构化JSON数据
- **自动解析**: 从markdown文件中自动提取菜品信息和分类
- **完整API**: 提供完整的RESTful API接口
- **实时进度**: 支持AI处理进度查询

## 系统架构

```
starsystem/
├── models/StarSystem.js          # 数据模型
├── services/starSystemService.js # 业务逻辑服务
├── api/starsystem/index.js       # API接口
└── starsystem/                   # 原始markdown文件目录
```

## 处理流程

### 1. AI处理阶段
通过AI分析markdown文件，生成结构化的JSON数据：
- 解析菜单标题和星级
- 提取菜品列表和分类
- 生成难度描述和推荐人群
- 分析相关标签

### 2. 数据导入阶段
将AI处理后的JSON数据导入数据库：
- 清空现有数据
- 批量创建StarSystem记录
- 自动计算菜品统计信息

## 数据模型

### StarSystem Schema

```javascript
{
  title: String,              // 菜单标题（如："1 星难度菜品"）
  starLevel: Number,          // 星级等级（1-7）
  content: String,            // markdown 文件的完整内容
  dishes: [{                  // 菜品列表
    name: String,             // 菜品名称
    filePath: String,         // 菜品文件路径
    category: String          // 菜品分类
  }],
  dishCount: Number,          // 菜品数量（自动计算）
  categoryStats: Map,         // 菜品分类统计（自动计算）
  difficultyDescription: String, // 难度描述
  filePath: String,           // 文件路径
  tags: [String],             // 标签
  recommendedFor: [String],   // 推荐人群
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}
```

### 虚拟字段

- `difficultyLevel`: 难度级别文本（初级/中级/高级/专家级）
- `summary`: 菜单简介
- `mainCategories`: 主要分类列表

## API 接口

### AI处理相关

```bash
# 启动AI处理
POST /api/starsystem/ai-process

# 获取AI处理进度
GET /api/starsystem/ai-process/progress

# 导入AI处理后的数据
POST /api/starsystem/import-ai-processed
```

### 数据查询

```bash
# 获取所有 starsystem（支持分页和筛选）
GET /api/starsystem?page=1&limit=10&starLevel=3&difficultyLevel=中级

# 搜索 starsystem
GET /api/starsystem/search?keyword=菜品&starLevel=3

# 根据ID获取单个 starsystem
GET /api/starsystem/:id

# 根据星级获取 starsystem
GET /api/starsystem/level/:starLevel

# 获取统计信息
GET /api/starsystem/stats
```

### 数据管理

```bash
# 创建新的 starsystem
POST /api/starsystem

# 更新 starsystem
PUT /api/starsystem/:id

# 删除 starsystem
DELETE /api/starsystem/:id
```

## 使用流程

### 1. 启动AI处理

```bash
curl -X POST http://localhost:3000/api/starsystem/ai-process
```

响应示例：
```json
{
  "success": true,
  "data": {
    "isProcessing": true,
    "currentFile": 0,
    "totalFiles": 6,
    "taskId": "starsystem_1640000000000"
  },
  "msg": "AI处理已开始"
}
```

### 2. 查询处理进度

```bash
curl -X GET http://localhost:3000/api/starsystem/ai-process/progress
```

响应示例：
```json
{
  "success": true,
  "data": {
    "isProcessing": true,
    "currentFile": 3,
    "totalFiles": 6,
    "currentFileName": "3Star.md",
    "progress": 50
  },
  "msg": "获取处理进度成功"
}
```

### 3. 导入处理后的数据

```bash
curl -X POST http://localhost:3000/api/starsystem/import-ai-processed
```

响应示例：
```json
{
  "success": true,
  "data": {
    "imported": 6,
    "total": 6,
    "results": [...]
  },
  "msg": "成功导入 6 条数据"
}
```

### 4. 查询数据

```bash
# 获取所有星级菜单
curl -X GET http://localhost:3000/api/starsystem

# 获取3星级菜单
curl -X GET http://localhost:3000/api/starsystem/level/3

# 搜索菜品
curl -X GET "http://localhost:3000/api/starsystem/search?keyword=鸡蛋"

# 获取统计信息
curl -X GET http://localhost:3000/api/starsystem/stats
```

## 星级分类系统

### 星级定义

| 星级  | 难度级别 | 推荐人群                             |
| ----- | -------- | ------------------------------------ |
| 1-2星 | 初级     | 新手厨师、学生、忙碌上班族           |
| 3-4星 | 中级     | 有基础的厨师、家庭主妇、烹饪爱好者   |
| 5-6星 | 高级     | 有经验的厨师、烹饪专业学生、美食达人 |
| 7星   | 专家级   | 专业厨师、烹饪大师、美食创作者       |

### AI提示词

系统使用以下提示词来分析markdown文件：

```
请分析以下星级菜单的markdown文件内容，并提供以下信息：
  1. 菜单标题和星级
  2. 菜单中包含的菜品列表（从markdown链接中提取）
  3. 菜品分类统计
  4. 难度级别描述
  5. 推荐人群
  6. 相关标签

请以JSON格式返回结果，包含以下字段：
- title: 菜单标题
- starLevel: 星级（1-7的数字）
- dishes: 菜品列表数组，每个菜品包含 name, filePath, category
- difficultyDescription: 难度描述
- recommendedFor: 推荐人群数组
- tags: 标签数组
```

## 开发指南

### 扩展AI提示词

修改 `api/starsystem/index.js` 中的 `prompt` 变量来自定义AI分析逻辑。

### 添加新的星级

1. 在 `starsystem/` 目录下创建新的 markdown 文件
2. 更新 `StarSystem.js` 模型中的验证规则
3. 重新运行AI处理流程

### 自定义搜索功能

在 `StarSystemService.searchStarSystems()` 中添加新的搜索条件。

### 扩展统计功能

在 `StarSystemService.getStarSystemStats()` 中添加新的统计维度。

## 注意事项

1. **AI处理**: 需要配置OpenAI API密钥
2. **数据一致性**: 导入数据前会清空现有数据
3. **星级范围**: 目前支持1-7星级，超出范围会报错
4. **文件格式**: 确保markdown文件格式正确

## 故障排除

### 常见问题

1. **AI处理失败**: 检查OpenAI API配置和网络连接
2. **导入失败**: 确保AI处理完成并生成了JSON文件
3. **数据查询异常**: 检查数据库连接状态
4. **文件解析错误**: 确保markdown文件格式正确

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
curl -X GET http://localhost:3000/api/starsystem?limit=100 > backup.json
``` 