# Tips 烹饪技巧管理系统

Tips 是一个基于 AI 的烹饪技巧管理系统，用于处理和管理 HowToCook 项目中的烹饪技巧和知识。

## 功能特性

- **AI 增强处理**: 使用 OpenAI API 分析 markdown 文件，自动生成分类、难度级别、标签、摘要等元数据
- **自定义提示词**: 支持自定义 AI 分析的提示词，确保分析结果的准确性
- **进度跟踪**: 实时跟踪 AI 处理进度，支持多任务并行处理
- **RESTful API**: 提供完整的 CRUD 操作和搜索功能
- **MongoDB 存储**: 使用 MongoDB 存储和管理数据

## 处理流程

### 1. AI 处理阶段
通过 AI 分析 tips 文件夹中的 markdown 文件，生成结构化的 JSON 数据：
- 分析文件标题和主题
- 自动分类（基础知识、烹饪技巧、食材选择等）
- 确定难度级别
- 生成关键词标签
- 创建内容摘要
- 识别适用人群
- 提取重要提示

### 2. 数据导入阶段
将 AI 处理后的 JSON 数据导入数据库：
- 清空现有数据
- 批量创建 Tip 记录
- 自动设置时间戳

## AIService 使用方式

### 基本使用

```javascript
const AIService = require('./services/aiService');

// 创建实例时必须提供 prompt
const aiService = new AIService({
  input: 'tips',
  prompt: '请分析以下markdown文件内容...'
});

// 处理文件
await aiService.processMarkdownFiles();
```

### 参数校验

AIService 现在强制要求提供 prompt 参数：

```javascript
// ✅ 正确 - 提供了 prompt
const tipsService = new AIService({
  input: 'tips',
  prompt: '请分析以下烹饪相关的markdown文件内容...'
});

// ❌ 错误 - 缺少 prompt，会抛出错误
const invalidService = new AIService({
  input: 'tips'
  // 缺少 prompt 参数
});

// ❌ 错误 - 调用时也会校验
await invalidService.processMarkdownFiles(); // 抛出: 请提供AI分析的提示词 (prompt)
```

### 配置化使用

```javascript
// 创建配置了输入目录和提示词的实例
const tipsService = new AIService({
  input: 'tips',
  prompt: `
    请分析以下烹饪相关的markdown文件内容，并提供以下信息：
      1. 文件标题和主题
      2. 内容分类（例如：基础知识、烹饪技巧、食材选择、厨房工具、菜谱制作等）
      3. 难度级别（初级、中级、高级）
      4. 关键词标签（3-8个）
      5. 内容摘要（50-100字）
      6. 适用人群（新手、有经验的厨师、专业厨师等）
      7. 重要提示或注意事项

    请以JSON格式返回结果。
  `
});

// 使用配置的目录和提示词处理
await tipsService.processMarkdownFiles();

// 获取处理结果
const data = tipsService.getProcessedData();
```

### 动态配置

```javascript
const aiService = new AIService({
  input: 'tips',
  prompt: '默认提示词'
});

// 动态设置输入目录
aiService.setInputDirectory('/path/to/tips');

// 动态设置提示词
aiService.setPrompt('请分析以下烹饪技巧...');

// 处理文件
await aiService.processMarkdownFiles();
```

## API 接口

### AI 处理相关

- **AI处理（兼容模式）**: `POST /api/tips/ai-process`
  - 处理 tips 目录的 markdown 文件
  - **参数校验**: 如果提供自定义参数，directory 和 prompt 都必须提供
  - 请求体选项：
    - 空请求体：使用默认配置（tips 目录 + 预设提示词）
    - 自定义参数：`{ "directory": "tips", "prompt": "自定义提示词" }`（两个参数都必须提供）
  - 返回: `{"success": true, "code": 200, "msg": "AI处理已开始", "data": {"taskId": "tips_1234567890", ...}}`
  - 错误: `{"success": false, "code": 400, "msg": "请提供AI分析的提示词 (prompt)"}`

- **AI处理（自定义模式）**: `POST /api/tips/ai-process/custom`
  - 处理任意目录的 markdown 文件
  - **必需参数**: directory 和 prompt 都必须提供
  - 请求体: `{ "directory": "/path/to/directory", "prompt": "自定义提示词" }`
  - 返回: `{"success": true, "code": 200, "msg": "AI处理已开始", "data": {"taskId": "dirname_1234567890", ...}}`
  - 错误: `{"success": false, "code": 400, "msg": "请提供要处理的目录路径 (directory)"}`

- **AI处理进度**: `GET /api/tips/ai-process/progress`
  - 获取 AI 处理的实时进度（兼容模式，返回 tips 目录进度）
  - 查询参数: `?taskId=tips_1234567890` （可选，获取特定任务进度）
  - 返回: `{"success": true, "code": 200, "msg": "获取处理进度成功", "data": {"isProcessing": true, "currentFile": 5, "totalFiles": 18, "progress": 28, "currentFileName": "去腥.md", ...}}`

- **所有处理进度**: `GET /api/tips/ai-process/all-progress`
  - 获取所有 AI 处理任务的进度
  - 返回: `{"success": true, "code": 200, "msg": "获取所有处理进度成功", "data": {"taskId1": {...}, "taskId2": {...}}}`

### 数据管理

- **导入AI处理数据**: `POST /api/tips/import-ai-processed`
  - 将 AI 处理后的数据导入到 MongoDB 数据库
  - 请求体: `{ "directory": "tips" }` （可选，默认为 tips）
  - 返回: `{"success": true, "code": 200, "msg": "成功导入 18 条数据", "data": {"imported": 18, "total": 18, "results": [...]}}`

- **获取处理数据**: `GET /api/tips/processed-data`
  - 获取 AI 处理后的原始数据（不导入数据库）
  - 查询参数: `?directory=tips` （可选，默认为 tips）
  - 返回: `{"success": true, "code": 200, "msg": "获取AI处理数据成功", "data": {"processedAt": "2024-01-12T10:30:00.000Z", "totalFiles": 18, "items": [...]}}`

- **获取处理文件列表**: `GET /api/tips/processed-files`
  - 获取所有处理结果文件的列表
  - 返回: `{"success": true, "code": 200, "msg": "获取处理结果文件成功", "data": [{"name": "tips.json", "path": "/output/tips.json", "size": 12345, "modifiedAt": "2024-01-12T10:30:00.000Z"}]}`

### 数据查询

- **获取所有Tips**: `GET /api/tips`
  - 支持分页和筛选
  - 查询参数: `?page=1&limit=10&category=烹饪技巧&difficulty=初级`
  - 返回: `{"success": true, "code": 200, "msg": "获取tips成功", "data": {"tips": [...], "total": 18, "page": 1, "limit": 10, "totalPages": 2}}`

- **搜索Tips**: `GET /api/tips/search`
  - 支持关键词搜索和筛选
  - 查询参数: `?keyword=油温&category=烹饪技巧&difficulty=初级&page=1&limit=10`
  - 返回: `{"success": true, "code": 200, "msg": "搜索成功", "data": {"tips": [...], "total": 5, "page": 1, "limit": 10, "totalPages": 1}}`

- **获取单个Tip**: `GET /api/tips/:id`
  - 根据 ID 获取具体的 tip 详情
  - 返回: `{"success": true, "code": 200, "msg": "获取tip成功", "data": {"_id": "...", "title": "...", "content": "...", ...}}`

## 数据模型

### Tip 模型字段

- `title`: 标题
- `content`: markdown 文件内容
- `category`: 分类（AI动态分类，如"烹饪技巧"、"基础知识"、"厨房工具"等）
- `difficulty`: 难度级别（初级/中级/高级/未知）
- `summary`: AI生成的摘要
- `targetAudience`: 适用人群
- `importantNotes`: 重要提示数组
- `filePath`: 文件路径
- `isPublished`: 是否发布
- `tags`: 标签数组
- `excerpt`: 内容摘要（虚拟字段）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## 使用示例

### 1. 启动AI处理

```bash
# 使用默认配置处理tips目录
curl -X POST http://localhost:3000/api/tips/ai-process
```

响应示例：
```json
{
  "success": true,
  "data": {
    "isProcessing": true,
    "currentFile": 0,
    "totalFiles": 18,
    "taskId": "tips_1640000000000"
  },
  "msg": "AI处理已开始"
}
```

### 2. 查询处理进度

```bash
# 查看AI处理进度
curl http://localhost:3000/api/tips/ai-process/progress
```

响应示例：
```json
{
  "success": true,
  "data": {
    "isProcessing": true,
    "currentFile": 5,
    "totalFiles": 18,
    "currentFileName": "去腥.md",
    "progress": 28
  },
  "msg": "获取处理进度成功"
}
```

### 3. 导入处理后的数据

```bash
# 导入AI处理后的数据到数据库
curl -X POST http://localhost:3000/api/tips/import-ai-processed
```

响应示例：
```json
{
  "success": true,
  "data": {
    "imported": 18,
    "total": 18,
    "results": [...]
  },
  "msg": "成功导入 18 条数据"
}
```

### 4. 查询数据

```bash
# 获取所有tips数据
curl "http://localhost:3000/api/tips?limit=10"

# 搜索tips
curl "http://localhost:3000/api/tips/search?keyword=油温"

# 获取单个tip
curl "http://localhost:3000/api/tips/60d5ecb54f1b2c001f647b8a"
```

### 命令行示例

```bash
# 1. 启动服务器
npm start

# 2. 使用默认配置处理tips目录
curl -X POST http://localhost:3000/api/tips/ai-process

# 3. 使用自定义参数处理tips目录
curl -X POST http://localhost:3000/api/tips/ai-process \
  -H "Content-Type: application/json" \
  -d '{"directory": "tips", "prompt": "请分析以下烹饪相关的markdown文件内容..."}'

# 4. 使用AI处理自定义目录的markdown文件（必须提供 directory 和 prompt）
curl -X POST http://localhost:3000/api/tips/ai-process/custom \
  -H "Content-Type: application/json" \
  -d '{"directory": "/path/to/custom/directory", "prompt": "请分析以下文档内容..."}'

# 5. 查看AI处理进度
curl http://localhost:3000/api/tips/ai-process/progress

# 6. 查看所有处理任务进度
curl http://localhost:3000/api/tips/ai-process/all-progress

# 7. 查看AI处理结果
curl http://localhost:3000/api/tips/processed-data

# 8. 导入AI处理后的数据到数据库
curl -X POST http://localhost:3000/api/tips/import-ai-processed

# 9. 获取改进后的tips数据
curl "http://localhost:3000/api/tips?limit=10"

# 10. 搜索tips
curl "http://localhost:3000/api/tips/search?keyword=油温"

# 11. 获取处理文件列表
curl http://localhost:3000/api/tips/processed-files
```

### 代码示例

```javascript
const AIService = require('./services/aiService');

// 示例1: 正确的基本使用
const basicService = new AIService({
  input: 'tips',
  prompt: '请分析以下markdown文件内容...'
});
await basicService.processMarkdownFiles();

// 示例2: 配置化使用
const tipsService = new AIService({
  input: 'tips',
  prompt: '请分析以下烹饪相关的markdown文件内容...'
});
await tipsService.processMarkdownFiles();

// 示例3: 动态配置
const dynamicService = new AIService({
  input: 'tips',
  prompt: '请分析以下文章内容...'
});
dynamicService.setInputDirectory('/new/path');
dynamicService.setPrompt('新的提示词');
await dynamicService.processMarkdownFiles();

// 示例4: 错误处理
try {
  const invalidService = new AIService({
    input: 'tips'
    // 缺少 prompt 参数
  });
  await invalidService.processMarkdownFiles();
} catch (error) {
  console.error(error.message); // 请提供AI分析的提示词 (prompt)
}

// 示例5: 获取处理结果
const processedData = tipsService.getProcessedData();
console.log(`处理了 ${processedData.items.length} 个文件`);
```

## 自定义提示词

可以根据不同类型的内容使用不同的提示词：

```bash
# 使用自定义提示词处理烹饪技巧
curl -X POST http://localhost:3000/api/tips/ai-process/custom \
  -H "Content-Type: application/json" \
  -d '{
    "directory": "tips",
    "prompt": "请详细分析以下烹饪技巧文档，重点关注操作步骤、注意事项和适用场景..."
  }'
```

## 开发指南

### 扩展AI提示词

修改 `api/tips/index.js` 中的 `prompt` 变量来自定义AI分析逻辑：

```javascript
const prompt = `
  请分析以下烹饪相关的markdown文件内容，并提供以下信息：
    1. 文件标题和主题
    2. 内容分类（例如：基础知识、烹饪技巧、食材选择、厨房工具、菜谱制作等）
    3. 难度级别（初级、中级、高级）
    4. 关键词标签（3-8个）
    5. 内容摘要（50-100字）
    6. 适用人群（新手、有经验的厨师、专业厨师等）
    7. 重要提示或注意事项

    请以JSON格式返回结果。
`;
```

### 自定义搜索功能

在 `TipService.searchTips()` 中添加新的搜索条件：

```javascript
if (keyword) {
  searchConditions.push(
    { title: { $regex: keyword, $options: 'i' } },
    { content: { $regex: keyword, $options: 'i' } },
    { tags: { $regex: keyword, $options: 'i' } },
    { summary: { $regex: keyword, $options: 'i' } }
  );
}
```

### 扩展数据字段

在 `models/Tip.js` 中添加新的字段：

```javascript
const tipSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // 新增字段
  difficulty: {
    type: String,
    enum: ['初级', '中级', '高级', '专家级'],
    default: '未知'
  },
  
  cookingTime: {
    type: Number, // 烹饪时间（分钟）
    min: 0
  }
});
```

## 注意事项

1. **必需参数**: prompt 参数现在是必需的，不提供会抛出错误
2. **API 限制**: 为避免触发 OpenAI API 限制，文件处理间隔为 1 秒
3. **文件大小**: 建议单个 markdown 文件不超过 10MB
4. **并发处理**: 支持多个目录同时处理，但相同目录不能重复处理
5. **错误处理**: 处理失败的文件会记录错误信息，不影响其他文件处理
6. **参数校验**: 方法参数 > 实例配置，但都必须提供 prompt
7. **数据一致性**: 导入数据前会清空现有数据

## 故障排除

### 常见问题

1. **AI处理失败**: 检查OpenAI API配置和网络连接
2. **导入失败**: 确保AI处理完成并生成了JSON文件
3. **搜索无结果**: 检查关键词拼写和数据库连接
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
curl -X GET http://localhost:3000/api/tips?limit=100 > tips_backup.json
``` 