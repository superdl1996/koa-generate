const router = require('koa-router')();
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const { log } = require('debug/src/node');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!',
  });
});

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string';
});

router.get('/json', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');

  // await new Promise((resolve) => setTimeout(resolve, 3000 * Math.random()));

  ctx.body = {
    status: 'success',
    ...ctx.query,
  };
});

router.options('/json', (ctx) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'POST');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, x-request-id, Authorization, apifoxtoken'); // 添加 x-request-id
  ctx.status = 204;
});

router.post('/json', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');

  // await new Promise((resolve) => setTimeout(resolve, 3000 * Math.random()));

  ctx.body = {
    status: 'success',
    ...ctx.request.body,
  };
});

router.get('/image', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');

  const imagePath = path.join(__dirname, '../public/images/redrose.png');

  // const fileName = path.basename(imagePath);
  const fileName = encodeURIComponent('我是谁.png');
  // const fileName = '我是谁.png';
  ctx.set('Content-Disposition', `attachment; filename=${fileName}`);

  const img = fs.readFileSync(imagePath);
  ctx.type = 'image/jpeg';
  ctx.body = img;
});

router.post('/generate', async (ctx, next) => {
  ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');

  const {codeModel,fileName} = ctx.request.body
  // 设置响应头以便下载文件
  ctx.response.set('Content-Disposition', `attachment; filename=${fileName}.zip`);
  ctx.response.set('Content-Type', 'application/zip');

  // 创建一个 archiver 实例
  const archive = archiver('zip', { zlib: { level: 9 } });
  // 添加文件到压缩包
  // 这里你可以添加多个文件，可以来自于内存、流或文件系统
  archive.append(codeModel.GenIndex, { name: `${fileName}/index.tsx` });
  archive.append(codeModel.GenServices, { name: `${fileName}/services.ts` });
  archive.append(codeModel.GenTypings, { name: `${fileName}/typings.d.ts` });
  archive.append(codeModel.GenUseFormColumns, { name: `${fileName}/useFormColumns.tsx` });
  archive.append(codeModel.GenUseTableColumns, { name: `${fileName}/useTableColumns.tsx` });

  // 将 archive 输出到响应流
  ctx.body = archive;

  // 完成归档
  archive.finalize();
});

module.exports = router;
