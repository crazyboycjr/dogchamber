'use strict';

//var comongo = require('co-mongo');
var co = require('co');
var connect = require('yieldb').connect;

/*
comongo.configure({
	host: '127.0.0.1',
	port: 27017,
	name: 'dogchamber',
	pool: 50,
	collections: ['messages']
});

co(function *() {
	let db = yield comongo.get();

	let msgs = db.users.find().toArray();
	console.log(msgs);
	
	yield db.close();
});
*/

co(function *() {
	/*let db = yield comongo.connect('mongodb://127.0.0.1:27017/dogchamber');
	let collection = yield db.collection('messages');

	let count = yield collection.count();
	console.log(count);

	yield db.close();
	*/
	console.log('gg');
	let db = yield connect('mongodb://127.0.0.1:27017/admin');

	console.log('ff');
})
.then(() => {
	console.log('exit');
}, () => {
	console.log('ex');
});
