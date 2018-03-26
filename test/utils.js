var mongoose = require('mongoose');
var db_config = require('../config/db.js');
var db_conn;

// Dump test database
beforeEach(async function () {
  db_conn = await mongoose.createConnection(db_config.db.testuri);
  await db_conn.dropDatabase();
  await db_conn.close();
});

// after(function (done) {
//   // mongoose.disconnect();
//   console.log('Mongoose connections closed');
//   done();
// });
