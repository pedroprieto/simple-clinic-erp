// Rooms resource
var Room = require('../models/room');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

  function renderCollectionRooms(ctx, roomList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["rooms"]).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["rooms"]).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["medicalProcedures"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["rooms"]));

	  // Items
	  col.items = roomList.map(function(p) {

      var item = {};
	    // Item data
      item.data = Room.toCJ(ctx.i18n, p);

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["room"], {room: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (roomList.length == 0) {
	    var item = {};
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay salas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
    col.template = {};
	  col.template.data = Room.getTemplate(ctx.i18n);

	  // Return collection object
    return col;

  }

  // Parameter room
  router.param('room', async (id, ctx, next) => {
    ctx.room = await Room.findById(id);
    if (!ctx.room) {
      ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
    }
    return next();
  });

  // GET Room list
  router.get(router.routesList["rooms"].name, router.routesList["rooms"].href, async (ctx, next) => {
    var rooms = await Room.list();
    var col= renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["room"].name, router.routesList["room"].href, async (ctx, next) => {
    var room = ctx.room;
	  var rooms = [];
	  rooms.push(room);
    var col = renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["room"].name, router.routesList["room"].href, async (ctx, next) => {
    var doc = await Room.delById(ctx.room._id);
    ctx.status = 200;
    return next();
  });

  // PUT item
  router.put(router.routesList["room"].name, router.routesList["room"].href, async (ctx, next) => {
    var roomData = CJUtils.parseTemplate(ctx);
    var updatedRoom = await ctx.room.updateRoom(roomData);
    var rooms = [];
    rooms.push(updatedRoom);
    var col= renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["rooms"].href, async (ctx,next) => {
    var roomData = CJUtils.parseTemplate(ctx);
    var p = new Room(roomData);
    var psaved = await p.save();
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["room"], {room: psaved._id}).href);
    return next();
  });
}
