const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('@koa/cors');

const index = require('./routes/index');
const users = require('./routes/users');

// error handler
onerror(app);

// 增加跨域
app.use(cors());

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
);
app.use(json());
app.use(logger());
// app.use(require('koa-static')(__dirname + '/public/dist'));

app.use(
  views(__dirname + '/views', {
    extension: 'ejs',
  })
);

// app.use(
//   views(__dirname + '/public/dist', {
//     extension: 'html',
//   })
// );

/** 解决vue 历史模式刷新404问题 */
// app.use(async (ctx, next) => {
//   if (ctx.status === 404 && ctx.method === 'GET') {
//     await ctx.render('index');
//   } else {
//     await next();
//   }
// });

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});



module.exports = app;
