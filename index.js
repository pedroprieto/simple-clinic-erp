const Koa = require('koa');
var Router = require('koa-router');
var bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/clinic-erp');

const app = new Koa();
app.use(bodyParser());
var router = new Router();



require('./resources/patients')(router);


router.get('root', '/', (ctx, next) => {
  ctx.body = {"name": "ey"};
  return next();
  // ctx.router available
});


// Content type
router.use((ctx, next) => {
  ctx.type = 'application/vnd.collection+json; charset=utf-8';
  next();
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
