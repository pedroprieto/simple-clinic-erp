module.exports = function(router) {
  router.get(router.routesList["root"].name, router.routesList["root"].href, async (ctx, next) => {
    var collection = { };

    // Items
    collection.items = [];

    collection.links = [];
    collection.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    collection.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    collection.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    ctx.body = {collection: collection};
    return next();
  });

}
