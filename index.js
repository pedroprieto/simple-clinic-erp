const Koa = require('koa');
var Router = require('koa-router');

const app = new Koa();
var router = new Router();

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World' + router.url('other');
  // ctx.router available
});

router.get('patients','/patients', (ctx, next) => {
  ctx.body = 'Hello Other';
  // ctx.router available
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
