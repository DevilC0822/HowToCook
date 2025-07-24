# HowToCook 服务器

一个基于 Node.js + Express + MongoDB 的 API 服务器，用于管理 HowToCook 项目的内容。

## 功能特性

- **AI 增强处理**: 使用 OpenAI API 分析 markdown 文件，自动生成分类、难度级别、标签、摘要等元数据
- **多目录支持**: 支持处理任意目录的 markdown 文件
- **自定义提示词**: 支持自定义 AI 分析的提示词，适应不同类型的内容
- **参数校验**: 强制要求提供 prompt 参数，确保 AI 分析的准确性
- **进度跟踪**: 实时跟踪 AI 处理进度，支持多任务并行处理
- **灵活输出**: 输出文件根据目录名称自动生成，保存在 `/output/` 目录下
- **配置化实例**: 支持通过构造函数参数配置输入目录和提示词
- **RESTful API**: 提供完整的 CRUD 操作和搜索功能
- **MongoDB 存储**: 使用 MongoDB 存储和管理数据

## 系统模块

### [Tips 烹饪技巧管理系统](./TIPS.md)
基于 AI 的烹饪技巧管理系统，用于处理和管理 HowToCook 项目中的烹饪技巧和知识。

### [StarSystem 星级菜单系统](./STARSYSTEM.md)
基于星级难度的菜品菜单管理系统，用于管理和展示不同难度级别的菜品。

## 环境要求

- Node.js 14+
- MongoDB 4.0+
- OpenAI API Key

## 安装和配置

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量，创建 `.env` 文件：
```
# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/howtocook

# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.deepseek.com/v1
```

3. 启动服务器：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## AIService 核心功能

### 基本使用

```javascript
const AIService = require('./services/aiService');

// 创建实例时必须提供 prompt
const aiService = new AIService({
  input: 'directory_path',
  prompt: '请分析以下markdown文件内容...'
});

// 处理文件
await aiService.processMarkdownFiles();
```

### 参数校验

AIService 现在强制要求提供 prompt 参数：

```javascript
// ✅ 正确 - 提供了 prompt
const service = new AIService({
  input: 'docs',
  prompt: '请分析以下markdown文件内容...'
});

// ❌ 错误 - 缺少 prompt，会抛出错误
const invalidService = new AIService({
  input: 'docs'
  // 缺少 prompt 参数
});
```

### 配置化使用

```javascript
// 创建配置了输入目录和提示词的实例
const service = new AIService({
  input: 'docs',
  prompt: '请分析以下文档内容...'
});

// 使用配置的目录和提示词处理
await service.processMarkdownFiles();

// 获取处理结果
const data = service.getProcessedData();
```

### 动态配置

```javascript
const aiService = new AIService({
  input: 'docs',
  prompt: '默认提示词'
});

// 动态设置输入目录
aiService.setInputDirectory('/path/to/docs');

// 动态设置提示词
aiService.setPrompt('请分析以下技术文档...');

// 处理文件
await aiService.processMarkdownFiles();
```

### 参数优先级

提示词的优先级顺序：
1. 方法参数提供的提示词
2. 实例配置的提示词
3. **注意**: 不再有默认提示词，必须明确提供

```javascript
const aiService = new AIService({
  input: 'docs',
  prompt: '实例配置的提示词'
});

// 使用实例配置的提示词
await aiService.processMarkdownFiles();

// 使用参数提供的提示词（优先级更高）
await aiService.processMarkdownFiles(null, '参数提供的提示词');
```

## 通用API模式

每个模块都遵循相同的API模式：

### AI处理流程
1. **启动AI处理**: `POST /api/{module}/ai-process`
2. **查询进度**: `GET /api/{module}/ai-process/progress`
3. **导入数据**: `POST /api/{module}/import-ai-processed`

### 数据查询
- **获取所有数据**: `GET /api/{module}`
- **搜索数据**: `GET /api/{module}/search`
- **获取单个数据**: `GET /api/{module}/:id`

### 数据管理
- **创建数据**: `POST /api/{module}`
- **更新数据**: `PUT /api/{module}/:id`
- **删除数据**: `DELETE /api/{module}/:id`

## 文件结构

```
├── api/
│   ├── index.js          # 主路由文件
│   ├── tips/
│   │   └── index.js      # Tips相关路由
│   └── starsystem/
│       └── index.js      # StarSystem相关路由
├── models/
│   ├── Tip.js           # Tip数据模型
│   └── StarSystem.js    # StarSystem数据模型
├── services/
│   ├── aiService.js     # AI处理服务
│   ├── tipService.js    # Tips数据服务
│   └── starSystemService.js # StarSystem数据服务
├── utils/
│   └── index.js         # 工具函数
├── output/              # AI处理结果输出目录
│   ├── tips.json        # tips目录处理结果
│   └── starsystem.json  # starsystem目录处理结果
├── db.js               # 数据库连接
└── server.js           # 服务器入口
```

## 新功能说明

### 参数校验

现在 AIService 强制要求提供 prompt 参数：

```javascript
// ✅ 正确
const aiService = new AIService({
  input: 'docs',
  prompt: '请分析以下内容...'
});

// ❌ 错误 - 会抛出异常
const invalidService = new AIService({
  input: 'docs'
  // 缺少 prompt
});
```

### 配置化实例

现在可以通过构造函数参数配置 AIService 实例：

```javascript
const service = new AIService({
  input: 'docs',
  prompt: '自定义提示词'
});
```

### 多目录支持

现在可以处理任意目录的 markdown 文件：

```javascript
// 处理不同类型的文档
const tipsService = new AIService({
  input: 'tips',
  prompt: '请分析以下烹饪技巧...'
});

const docsService = new AIService({
  input: 'docs',
  prompt: '请分析以下技术文档...'
});
```

### 进度跟踪改进

- 支持多任务并行处理
- 每个任务都有唯一的 taskId
- 可以查看所有任务的进度状态
- 支持按 taskId 查询特定任务进度

## 使用示例

### 启动服务器

```bash
# 启动服务器
npm start
```

### 使用不同模块

```bash
# 处理烹饪技巧
curl -X POST http://localhost:3000/api/tips/ai-process

# 处理星级菜单
curl -X POST http://localhost:3000/api/starsystem/ai-process

# 查看处理进度
curl http://localhost:3000/api/tips/ai-process/progress
curl http://localhost:3000/api/starsystem/ai-process/progress
```

### 代码示例

```javascript
const AIService = require('./services/aiService');

// 处理不同类型的内容
const tipsService = new AIService({
  input: 'tips',
  prompt: '请分析以下烹饪相关的markdown文件内容...'
});

const starSystemService = new AIService({
  input: 'starsystem',
  prompt: '请分析以下星级菜单的markdown文件内容...'
});

// 并行处理
await Promise.all([
  tipsService.processMarkdownFiles(),
  starSystemService.processMarkdownFiles()
]);
```

## 注意事项

1. **必需参数**: prompt 参数现在是必需的，不提供会抛出错误
2. **API 限制**: 为避免触发 OpenAI API 限制，文件处理间隔为 1 秒
3. **文件大小**: 建议单个 markdown 文件不超过 10MB
4. **并发处理**: 支持多个目录同时处理，但相同目录不能重复处理
5. **错误处理**: 处理失败的文件会记录错误信息，不影响其他文件处理
6. **参数校验**: 方法参数 > 实例配置，但都必须提供 prompt

## 详细文档

- [Tips 烹饪技巧管理系统](./TIPS.md) - 详细的 Tips 模块使用指南
- [StarSystem 星级菜单系统](./STARSYSTEM.md) - 详细的 StarSystem 模块使用指南 