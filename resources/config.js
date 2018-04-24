module.exports = function(router) {
  router.get(router.routesList["config"].name, router.routesList["config"].href, (ctx, next) => {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["config"]).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["config"]).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["medicalProcedures"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["rooms"]));

    ctx.body = {collection: col};
    return next();

  });

}
