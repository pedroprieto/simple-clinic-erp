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
    col.title = ctx.getLinkCJFormat(router.routesList["rooms"]).prompt;

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
	    item.data = p.toObject({transform: Room.tx_cj});

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["room"], {room: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (roomList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay salas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = Room.template();

	  // Return collection object
    return col;

  }

  // Parameter room
  router.param('room', (id, ctx, next) => {
    ctx.room = id;
    return next();
  });

  // GET Room list
  router.get(router.routesList["rooms"].name, router.routesList["rooms"].href, async (ctx, next) => {
    var rooms = await Room.find();
    var col= renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["room"].name, router.routesList["room"].href, async (ctx, next) => {
    var room = await Room.findOne({_id: ctx.room});
	  var rooms = [];
	  rooms.push(room);
    var col = renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["room"].name, router.routesList["room"].href, async (ctx, next) => {
    var doc = await Room.findByIdAndRemove(ctx.room);
    var rooms = await Room.find();
    var col= renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    return next();

  });

  // PUT item
  router.put(router.routesList["room"].name, router.routesList["room"].href, async (ctx, next) => {
    var roomData = await CJUtils.parseTemplate(ctx);
    await Room.findByIdAndUpdate(ctx.room, roomData);
    var rooms = await Room.find();
    var col= renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["rooms"].href, async (ctx,next) => {
    var roomData = await CJUtils.parseTemplate(ctx);
    var p = new Room(roomData);
    var psaved = await p.save();
    var rooms = await Room.find();
    var col= renderCollectionRooms(ctx, rooms);
    ctx.body = {collection: col};
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["room"], {room: psaved._id}).href);
    return next();
  });
}
