module.exports = function(router) {
  router.get(router.routesList["root"].name, router.routesList["root"].href, async (ctx, next) => {
    var collection = { };

    // Items
    collection.items = [];

    collection.links = [];
    collection.links.push( {prompt: 'Raíz', href: ctx.request.origin + router.url("root"), rel: "root" });
    collection.links.push( {prompt: 'Pacientes', href: ctx.request.origin + router.url("patients"), rel: "collection" });
    collection.links.push( {prompt: 'Citas', href: ctx.request.origin + router.url("appointments"), rel: "collection" });
    ctx.body = {collection: collection};
    return next();
  });

}
