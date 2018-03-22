const Koa = require('koa');
var Router = require('koa-router');
var bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/clinic-erp');

const app = new Koa();
app.use(bodyParser());
var router = new Router();



require('./resources/root')(router);
require('./resources/patients')(router);
require('./resources/appointments')(router);


// Content type
router.use((ctx, next) => {
  ctx.type = 'application/vnd.collection+json; charset=utf-8';
  next();
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
