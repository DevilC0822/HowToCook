const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 6008;

// 引入数据库连接
const { connectDB, getConnectionStatus } = require('./db');

// 引入路由和中间件
const apiRoutes = require('./api');
const { checkDatabaseConnection } = require('./utils');

// CORS 配置
const corsOptions = {
  origin: [
    'http://localhost:6009',    // Vite 开发服务器
    'https://cook.mihouo.com', // 生产环境
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置 JSON 序列化选项，避免中文字符被转义
app.set('json escape', false);

// 基本路由
app.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    message: 'Express v5 服务器正在运行',
    database: dbStatus
  });
});

// API 路由（应用数据库连接检查中间件）
app.use('/api', checkDatabaseConnection, apiRoutes);

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await connectDB();

    // 启动服务器
    app.listen(port, () => {
      console.log(`服务器运行在端口 ${port}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

module.exports = app; 
