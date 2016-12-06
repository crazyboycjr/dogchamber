'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/dogchamber';

function connectMongo() {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
			if (err)
				reject(err);
			resolve(db);
		});
	});
}

connectMongo().then((db) => {
	let collection = db.collection('messages');
	collection.find({}).toArray((err, docs) => {
		console.log(docs);
	});
}, (err) => {
	console.log(err);
});
