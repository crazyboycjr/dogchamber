var Db = require('mongodb').Db,
  Server = require('mongodb').Server,
  test = require('assert');
// Connect using single Server
var db = new Db('dogchamber', new Server('localhost', 27017));

let collection = db.collection('messages');

collection.find({}).toArray().then(docs => console.log(docs));

