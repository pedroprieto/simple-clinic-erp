const Koa = require('koa');
var Router = require('koa-router');
var bodyParser = require('koa-bodyparser');
const locale = require('koa-locale'); //  detect the locale
const i18n = require('koa-i18n');
const mongoose = require('mongoose');
var db_config = require('./config/db.js');
mongoose.connect(process.env.NODE_ENV!='test'? db_config.db.uri : db_config.db.testuri);

const app = new Koa();
// Required!
locale(app);
app.use(bodyParser());
app.use(i18n(app, {
  directory: './config/locales',
  locales: ['es_ES', 'en'], //  `es_ES` defualtLocale, must match the locales to the filenames
  modes: [
    'query',                //  optional detect querystring - `/?locale=en-US`
    'subdomain',            //  optional detect subdomain   - `zh-CN.koajs.com`
    'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
    'header',               //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
    'url',                  //  optional detect url         - `/en`
    'tld'                  //  optional detect tld(the last domain) - `koajs.cn`
  ]
}));


var router = new Router();


// Named routes
router.routesList = require("./routesList");

// Get links in CJ format
app.context.getLinkCJFormat = function(link, ...params) {
  return {
    href: this.request.origin + this.router.url(link.name, ...params),
    rel: link.rel,
    prompt: this.i18n.__(link.prompt)
  }
};

// Resources
require('./resources/root')(router);
require('./resources/patients')(router);
require('./resources/appointments')(router);


app
  .use(router.routes())
  .use(router.allowedMethods());

// Content type
app.use(async (ctx, next) => {
  ctx.type = 'application/vnd.collection+json; charset=utf-8';
  next();
});

// Export server for testing
var server = module.exports = app.listen(3000);

// When the server is shut down, close mongoose connection
server.on('close', (e) => {
  mongoose.connection.close();
  console.log('closing');
})
