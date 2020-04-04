module.exports = function(router) {
    router.get(router.routesList["root"].name, router.routesList["root"].href, async (ctx, next) => {
        return ctx.redirect(router.routesList["doctors"].href);
    });

}
