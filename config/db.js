exports.db = {};
var dburl = process.env.MONGODB_URL || 'mongodb://localhost/';
exports.db.uri = dburl + 'clinic-erp';
exports.db.testuri = dburl + 'clinic-erp-test';
exports.options = {};
