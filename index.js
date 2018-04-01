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
    prompt: link.prompt
  }
};

// Resources
require('./resources/root')(router);
require('./resources/patients')(router);
require('./resources/doctors')(router);
require('./resources/doctorSchedule')(router);
require('./resources/rooms')(router);
require('./resources/appointments')(router);

// Error processing
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    // Show info if error is not 500
    if (err.expose) {
      if (!(ctx.body && ctx.body.collection)) {
        ctx.body = {};
        ctx.body.collection = {};
        ctx.body.collection.version = "1.0";
      }
      var err_col = {};
      err_col.title = ctx.i18n.__("Error");
      err_col.code = err.status;
      err_col.message = ctx.i18n.__(err.message);

      ctx.body.collection.error = err_col;
    }
    ctx.app.emit('error', err, ctx);
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

// Content type
app.use(async (ctx, next) => {
  ctx.type = 'application/vnd.collection+json; charset=utf-8';
  return next();
});


// i18n
app.use(async (ctx, next) => {
  // ctx.type = 'application/vnd.collection+json; charset=utf-8';
  if (ctx.response.body && ctx.response.body.collection) {
    var col = ctx.response.body.collection;
    // Title
    if (col.title)
      col.title = ctx.i18n.__(col.title);
    // Items
    if (col.items) {
      col.items = col.items.map(function(it) {
        if (it.data) {
          it.data = it.data.map(function (d) {
            d.prompt = ctx.i18n.__(d.prompt);
            return d;
          });
        }
        if (it.links) {
          it.links = it.links.map(function (l) {
            l.prompt = ctx.i18n.__(l.prompt);
            return l;
          });
        }
        return it;
      });
    }
    // Links
    if (col.links) {
      col.links = col.links.map(function(link) {
        link.prompt = ctx.i18n.__(link.prompt);
        return link;
      });
    }
    // Template
    if (col.template && col.template.data) {
      col.template.data = col.template.data.map(function(d) {
        d.prompt = ctx.i18n.__(d.prompt);
        return d;
      });
    }
    // Queries
    if (col.queries) {
      col.queries = col.queries.map(function(q) {
        if (q.prompt)
          q.prompt = ctx.i18n.__(q.prompt);
        if (q.data) {
          q.data = q.data.map(function (d) {
            d.prompt = ctx.i18n.__(d.prompt);
            return d;
          });
        }
        return q;
      });
    }
  }
  return next();
});

// Start server and export for testing
var server = module.exports.server = app.listen(3000);

// export app for testing
module.exports.app = app;

// When the server is shut down, close mongoose connection
server.on('close', (e) => {
  mongoose.connection.close();
  console.log('closing');
})
