const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const dayjs = require('dayjs');

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// 全局进度跟踪状态 - 所有实例共享
const globalProcessingTasks = new Map();

class AIService {
  constructor(options = {}) {
    // 配置选项
    this.config = {
      input: options.input || null,
      prompt: options.prompt || null,
      requiredFields: options.requiredFields || ['title', 'category', 'tags', 'summary'], // 默认为tips的字段
      maxFilesPerType: options.maxFilesPerType || 10, // 同类型最多保存的文件数量
      ...options
    };

    this.outputDirectory = path.join(__dirname, '..', 'output');

    // 确保输出目录存在
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  // 获取输入目录
  getInputDirectory() {
    return this.config.input;
  }

  // 设置输入目录
  setInputDirectory(directory) {
    this.config.input = directory;
  }

  // 获取提示词
  getPrompt() {
    return this.config.prompt;
  }

  // 设置提示词
  setPrompt(prompt) {
    this.config.prompt = prompt;
  }

  // 校验必需参数
  validateRequiredParams(directory = null, customPrompt = null) {
    const targetDirectory = directory || this.config.input;
    const targetPrompt = customPrompt || this.config.prompt;

    if (!targetDirectory) {
      throw new Error('请提供要处理的目录路径 (directory)');
    }

    if (!targetPrompt) {
      throw new Error('请提供AI分析的提示词 (prompt)');
    }

    return { targetDirectory, targetPrompt };
  }

  // 生成任务ID
  generateTaskId(directory) {
    const dirName = path.basename(directory);
    const timestamp = dayjs().valueOf();
    return `${dirName}_${timestamp}`;
  }

  // 获取输出文件路径
  getOutputFilePath(directory) {
    const dirName = path.basename(directory);
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    return path.join(this.outputDirectory, `${dirName}_${timestamp}.json`);
  }

  // 清理旧文件，保持同类型文件数量不超过配置限制
  cleanupOldFiles(directory) {
    const dirName = path.basename(directory);
    const maxFiles = this.config.maxFilesPerType;

    try {
      // 获取同类型的所有文件
      const files = fs.readdirSync(this.outputDirectory)
        .filter(file => {
          // 匹配 dirName_timestamp.json 格式
          const pattern = new RegExp(`^${dirName}_\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}\\.json$`);
          return pattern.test(file);
        })
        .map(file => {
          const filePath = path.join(this.outputDirectory, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            mtime: stats.mtime
          };
        })
        .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序排列

      // 如果文件数量超过限制，删除最旧的文件
      if (files.length > maxFiles) {
        const filesToDelete = files.slice(maxFiles);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`已删除旧文件: ${file.name}`);
        });
        console.log(`已清理 ${filesToDelete.length} 个旧文件，保留最新的 ${maxFiles} 个文件`);
      }
    } catch (error) {
      console.error('清理旧文件时发生错误:', error);
    }
  }

  // 获取处理进度
  getProcessingProgress(taskId) {
    const task = globalProcessingTasks.get(taskId);
    if (!task) {
      return {
        isProcessing: false,
        currentFile: 0,
        totalFiles: 0,
        currentFileName: '',
        progress: 0,
        startTime: null,
        errors: [],
        taskId: null
      };
    }

    return {
      isProcessing: task.isProcessing,
      currentFile: task.currentFile,
      totalFiles: task.totalFiles,
      currentFileName: task.currentFileName,
      progress: task.totalFiles > 0
        ? Math.round((task.currentFile / task.totalFiles) * 100)
        : 0,
      startTime: task.startTime,
      errors: task.errors,
      taskId: taskId,
      directory: task.directory
    };
  }

  // 获取所有处理任务的进度
  getAllProcessingProgress() {
    const allTasks = {};
    for (const [taskId, task] of globalProcessingTasks.entries()) {
      allTasks[taskId] = this.getProcessingProgress(taskId);
    }
    return allTasks;
  }

  // 重置处理状态
  resetProcessingStatus(taskId) {
    globalProcessingTasks.delete(taskId);
  }

  // 分析单个markdown文件
  async analyzeMarkdownFile(filePath, content, baseDirectory, customPrompt = null) {
    // 校验提示词
    const { targetPrompt } = this.validateRequiredParams(baseDirectory, customPrompt);

    const finalPrompt = targetPrompt.replace('{{content}}', content);

    try {
      const response = await openai.chat.completions.create({
        model: 'deepseek-ai/DeepSeek-R1-0528',
        messages: [
          {
            role: 'system',
            content:
              '你是一个专业的内容分析助手，擅长分析和归纳各种类型的内容。请确保你的回答是有效的JSON格式，不要添加任何额外的解释文字。',
          },
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
        response_format: {
          type: 'json_object',
        },
        temperature: 0.3,
        max_tokens: 8000,
      });
      console.log(response);
      // 安全检查：确保响应内容存在
      const messageContent = response.choices[0]?.message?.content;
      console.log('messageContent', messageContent);
      if (!messageContent) {
        throw new Error('AI 响应内容为空');
      }

      // 检查是否因为长度限制被截断
      const finishReason = response.choices[0]?.finish_reason;
      let aiResponse;
      if (finishReason === 'length') {
        console.warn(`AI响应被截断（长度限制）: ${filePath}`);
        // 添加截断标记，让后续的JSON修复逻辑知道这是被截断的
        aiResponse = messageContent.trim() + '\n/* AI_RESPONSE_TRUNCATED */';
      } else {
        aiResponse = messageContent.trim();
      }

      // 清理响应内容，移除可能的markdown代码块标记
      aiResponse = aiResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');

      // 处理思考模型的输出格式 - 提取<think></think>标签后的内容
      if (aiResponse.includes('<think>') && aiResponse.includes('</think>')) {
        console.log(`检测到思考模型输出: ${filePath}`);
        const thinkEndIndex = aiResponse.indexOf('</think>');
        if (thinkEndIndex !== -1) {
          // 提取</think>标签后的内容
          aiResponse = aiResponse.substring(thinkEndIndex + 8).trim(); // 8是'</think>'的长度
          console.log(`提取思考后的JSON内容: ${filePath}`);
        }
      }

      // 验证是否为有效JSON
      let result;
      try {
        result = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error(`JSON解析失败: ${filePath}`, parseError);
        console.error(`AI响应内容: ${aiResponse}`);

        // 尝试修复常见的JSON错误
        let fixedResponse = this.fixJsonResponse(aiResponse);

        try {
          result = JSON.parse(fixedResponse);
          console.log(`JSON修复成功: ${filePath}`);
        } catch (fixError) {
          console.error(`JSON修复失败: ${filePath}`, fixError);
          console.error(`修复后的内容: ${fixedResponse}`);

          // 提供降级策略：创建一个基本的结果对象
          const fileName = path.basename(filePath, '.md');
          const starLevel = parseInt(fileName.match(/(\d+)Star/)?.[1] || '1');

          result = {
            title: `${starLevel} 星难度菜品`,
            starLevel: starLevel,
            dishes: [],
            difficultyDescription: '解析失败，请手动处理',
            recommendedFor: ['所有人'],
            tags: ['解析失败'],
            error: `JSON解析失败: ${fixError.message}`
          };

          console.log(`使用降级策略: ${filePath}`);
        }
      }

      // 验证基本字段
      const requiredFields = this.config.requiredFields;

      // 检查字段是否存在且有有效值
      const missingFields = requiredFields.filter(field => {
        const value = result[field];
        // 检查字段是否不存在或者值无效
        return !result.hasOwnProperty(field) ||
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);
      });

      if (missingFields.length > 0) {
        console.warn(`缺少必要字段或字段值为空: ${filePath}, 缺少字段: ${missingFields.join(', ')}`);
        // 填充缺少的字段
        missingFields.forEach(field => {
          if (field === 'tags' || field === 'dishes' || field === 'recommendedFor' || field === 'suitableFor') {
            result[field] = [];
          } else if (field === 'starLevel') {
            result[field] = 1;
          } else if (field === 'title') {
            result[field] = path.basename(filePath, '.md');
          } else if (field === 'category') {
            result[field] = '未分类';
          } else if (field === 'summary') {
            result[field] = '暂无描述';
          } else {
            result[field] = '未知';
          }
        });
      }

      return {
        ...result,
        filePath: path.relative(baseDirectory, filePath),
        processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };
    } catch (error) {
      console.error(`AI分析文件失败: ${filePath}`, error);

      // 返回基础信息作为备用
      return {
        title: path.basename(filePath, '.md'),
        category: '未分类',
        tags: [],
        summary: content.substring(0, 100) + '...',
        filePath: path.relative(baseDirectory, filePath),
        processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        error: error.message,
      };
    }
  }

  // 修复JSON响应格式
  fixJsonResponse(jsonString) {
    let fixed = jsonString;

    // 1. 移除markdown代码块标记
    fixed = fixed.replace(/```json\s*/, '').replace(/```\s*$/, '');

    // 2. 处理思考模型的输出格式 - 提取<think></think>标签后的内容
    if (fixed.includes('<think>') && fixed.includes('</think>')) {
      console.log('修复过程中检测到思考模型输出');
      const thinkEndIndex = fixed.indexOf('</think>');
      if (thinkEndIndex !== -1) {
        // 提取</think>标签后的内容
        fixed = fixed.substring(thinkEndIndex + 8).trim(); // 8是'</think>'的长度
        console.log('修复过程中提取思考后的JSON内容');
      }
    }

    // 3. 移除多余的逗号（在对象或数组结束前）
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // 4. 处理截断的JSON - 检查是否以不完整的结构结束
    fixed = this.handleTruncatedJson(fixed);

    // 5. 修复未闭合的字符串
    fixed = this.fixUnterminatedStrings(fixed);

    // 6. 修复数组和对象的闭合
    fixed = this.fixUnclosedStructures(fixed);

    // 7. 修复常见的格式错误
    fixed = this.fixCommonFormatErrors(fixed);

    return fixed;
  }

  // 处理截断的JSON
  handleTruncatedJson(jsonString) {
    let lines = jsonString.split('\n');
    let modified = false;
    let wasTruncated = false;

    // 检查是否包含截断标记
    if (jsonString.includes('/* AI_RESPONSE_TRUNCATED */')) {
      wasTruncated = true;
      lines = lines.filter(line => !line.includes('/* AI_RESPONSE_TRUNCATED */'));
    }

    while (lines.length > 0) {
      const lastLine = lines[lines.length - 1].trim();

      // 检查各种截断模式
      if (
        // 不完整的字符串
        lastLine.match(/^"[^"]*$/) ||
        // 不完整的属性
        lastLine.match(/^\s*"[^"]*:\s*"[^"]*$/) ||
        // 不完整的对象开始
        lastLine.match(/^\s*{\s*"[^"]*":\s*"[^"]*$/) ||
        // 不完整的数组元素
        lastLine.match(/^\s*{\s*$/) ||
        // 不完整的属性值
        lastLine.match(/^\s*"[^"]*":\s*$/) ||
        // 不完整的filePath（常见问题）
        lastLine.match(/^\s*"filePath":\s*"[^"]*$/) ||
        // 空行或只有空格
        lastLine === '' ||
        // 只有逗号
        lastLine === ','
      ) {
        lines.pop();
        modified = true;
      } else {
        break;
      }
    }

    // 如果移除了行，清理最后一行的尾随逗号
    if (modified && lines.length > 0) {
      const lastIndex = lines.length - 1;
      lines[lastIndex] = lines[lastIndex].replace(/,\s*$/, '');
    }

    // 如果检测到截断，记录日志
    if (wasTruncated) {
      console.warn('检测到AI响应被截断，正在尝试修复JSON结构');
    }

    return lines.join('\n');
  }

  // 修复未闭合的字符串
  fixUnterminatedStrings(jsonString) {
    let fixed = jsonString;
    const lines = fixed.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const quotes = line.match(/"/g);

      // 如果引号数量是奇数，说明有未闭合的字符串
      if (quotes && quotes.length % 2 !== 0) {
        const lastQuoteIndex = line.lastIndexOf('"');
        const afterQuote = line.substring(lastQuoteIndex + 1);

        // 如果字符串后面有结构字符，在前面添加闭合引号
        if (afterQuote.match(/[,\]\}]/)) {
          const nextStructureIndex = afterQuote.search(/[,\]\}]/);
          lines[i] = line.substring(0, lastQuoteIndex + 1 + nextStructureIndex) +
            '"' +
            line.substring(lastQuoteIndex + 1 + nextStructureIndex);
        } else {
          // 否则直接在行尾添加闭合引号
          lines[i] = line + '"';
        }
      }
    }

    return lines.join('\n');
  }

  // 修复未闭合的结构
  fixUnclosedStructures(jsonString) {
    let fixed = jsonString;

    // 修复未闭合的对象
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixed += '}';
    }

    // 修复未闭合的数组
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixed += ']';
    }

    return fixed;
  }

  // 修复常见的格式错误
  fixCommonFormatErrors(jsonString) {
    let fixed = jsonString;

    // 修复缺少引号的属性名
    fixed = fixed.replace(/(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

    // 修复单引号
    fixed = fixed.replace(/'/g, '"');

    // 修复多余的逗号
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // 修复缺少逗号的数组元素
    fixed = fixed.replace(/"\s*\n\s*{/g, '",\n{');
    fixed = fixed.replace(/}\s*\n\s*{/g, '},\n{');

    return fixed;
  }

  // 获取所有markdown文件
  async getAllMarkdownFiles(dir) {
    const files = [];

    if (!fs.existsSync(dir)) {
      throw new Error(`目录不存在: ${dir}`);
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const subFiles = await this.getAllMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (path.extname(item) === '.md') {
        files.push(fullPath);
      }
    }

    return files;
  }

  // 处理指定目录的所有markdown文件
  async processMarkdownFiles(directory = null, customPrompt = null) {
    // 校验必需参数
    const { targetDirectory, targetPrompt } = this.validateRequiredParams(directory, customPrompt);

    const absoluteDirectory = path.resolve(targetDirectory);
    const taskId = this.generateTaskId(absoluteDirectory);

    // 检查是否已经有相同目录的任务在处理中
    for (const [existingTaskId, task] of globalProcessingTasks.entries()) {
      if (task.directory === absoluteDirectory && task.isProcessing) {
        return {
          taskId: existingTaskId,
          message: 'AI处理正在进行中，请等待完成后再试',
          progress: this.getProcessingProgress(existingTaskId)
        };
      }
    }

    console.log(`开始AI处理目录: ${absoluteDirectory}`);

    const markdownFiles = await this.getAllMarkdownFiles(absoluteDirectory);
    console.log(`发现 ${markdownFiles.length} 个markdown文件`);

    if (markdownFiles.length === 0) {
      throw new Error(`在目录 ${absoluteDirectory} 中没有找到markdown文件`);
    }

    // 初始化处理状态
    globalProcessingTasks.set(taskId, {
      isProcessing: true,
      currentFile: 0,
      totalFiles: markdownFiles.length,
      currentFileName: '',
      startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      errors: [],
      directory: absoluteDirectory
    });

    const processedItems = [];
    const outputFile = this.getOutputFilePath(absoluteDirectory);

    try {
      for (let i = 0; i < markdownFiles.length; i++) {
        const filePath = markdownFiles[i];
        const fileName = path.basename(filePath);

        // 更新进度状态
        const task = globalProcessingTasks.get(taskId);
        task.currentFile = i + 1;
        task.currentFileName = fileName;

        console.log(`处理文件 ${i + 1}/${markdownFiles.length}: ${fileName}`);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const analyzedResult = await this.analyzeMarkdownFile(filePath, content, absoluteDirectory, targetPrompt);
          processedItems.push(analyzedResult);

          // 添加延迟避免API限制
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`处理文件失败: ${filePath}`, error);
          // 记录错误到任务状态
          task.errors.push({
            file: fileName,
            error: error.message,
            timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
          });
        }
      }

      // 保存处理结果
      const output = {
        processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        directory: absoluteDirectory,
        totalFiles: markdownFiles.length,
        processedFiles: processedItems.length,
        taskId: taskId,
        items: processedItems,
      };

      fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
      console.log(`AI处理完成，结果保存到: ${outputFile}`);

      // 清理旧文件
      this.cleanupOldFiles(absoluteDirectory);

      return {
        taskId: taskId,
        message: 'AI处理完成',
        outputFile: outputFile,
        data: output
      };
    } finally {
      // 重置处理状态
      this.resetProcessingStatus(taskId);
    }
  }

  // 获取处理后的数据
  getProcessedData(directory = null) {
    const targetDirectory = directory || this.config.input;

    if (!targetDirectory) {
      throw new Error('请提供目录路径');
    }

    // 查找最新的处理结果文件
    const dirName = path.basename(targetDirectory);
    const outputFile = this.getLatestOutputFile(dirName);

    if (!outputFile) {
      throw new Error(`处理后的数据文件不存在，请先运行AI处理`);
    }

    const data = fs.readFileSync(outputFile, 'utf8');
    return JSON.parse(data);
  }

  // 获取指定类型的最新输出文件
  getLatestOutputFile(dirName) {
    try {
      // 获取同类型的所有文件
      const files = fs.readdirSync(this.outputDirectory)
        .filter(file => {
          // 匹配 dirName_timestamp.json 格式
          const pattern = new RegExp(`^${dirName}_\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}\\.json$`);
          return pattern.test(file);
        })
        .map(file => {
          const filePath = path.join(this.outputDirectory, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            mtime: stats.mtime
          };
        })
        .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序排列

      // 返回最新的文件路径
      return files.length > 0 ? files[0].path : null;
    } catch (error) {
      console.error('获取最新文件时发生错误:', error);
      return null;
    }
  }

}

module.exports = AIService;
