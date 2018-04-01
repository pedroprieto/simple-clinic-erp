var should = require('should');
var Room = require('../models/room');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');

describe('Rooms resource', function() {
  it('Room CRUD test', async function() {
    var room_test = testdata.room_test_template_1;

    var response = await request(app.server)
        .post(routesList['rooms'].href)
        .set('Accept', 'application/json')
	      .send(room_test)
        .expect(201);

    // GET item from location header and check if it is the same as the original object
    var url_created_room = response.headers['location'];
    var response2 = await request('')
        .get(url_created_room)
        .set('Accept', 'application/json')
        .expect(200);
    var item = response2.body.collection.items[0];
    item.href.should.equal(url_created_room);

    // GET room list and check item length
    var response3 = await request(app.server)
        .get(routesList['rooms'].href)
        .set('Accept', 'application/json')
        .expect(200);
    response3.body.collection.should.have.property('items').with.lengthOf(1);

    // UPDATE item
    var newname = "New name";
    var newcapacity = 5;
    room_test.template.data[0].value = newname;
    room_test.template.data[1].value = 5;
    var response4 = await request('')
        .put(url_created_room)
        .set('Accept', 'application/json')
	      .send(room_test)
        .expect(200);
    var c = response4.body.collection;
    c.should.have.property('items').with.lengthOf(1);
    c.items[0].data[0].value.should.equal(newname);
    c.items[0].data[1].value.should.equal(newcapacity);

    // Remove item
    var response5 = await request('')
        .delete(url_created_room)
        .set('Accept', 'application/json')
        .expect(200);
    var col = response5.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

  });
});
