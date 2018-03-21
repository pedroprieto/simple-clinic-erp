const Koa = require('koa');
var Router = require('koa-router');
var bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/clinic-erp');

const app = new Koa();
app.use(bodyParser());
var router = new Router();

require('./resources/patients')(router);

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World' + router.url('patients');
  // ctx.router available
});


app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
