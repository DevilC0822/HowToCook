const express = require('express');
const router = express.Router();

// 引入子路由
const tipsRouter = require('./tips');
const starSystemRouter = require('./starsystem');
const dishesRouter = require('./dishes');

// 挂载子路由
router.use('/tips', tipsRouter);
router.use('/starsystem', starSystemRouter);
router.use('/dishes', dishesRouter);

// 可以在这里添加其他 API 路由，比如：
// router.use('/users', require('./users'));
// router.use('/auth', require('./auth'));

module.exports = router; 