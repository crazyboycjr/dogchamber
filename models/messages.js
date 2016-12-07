'use strict';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('../config.json').mongo;

let url = `mongodb://${config.host}:${config.port}/${config.database}`;

const mongoritwo = require('mongoritwo');
const Model = mongoritwo.Model;
 
class Messages extends Model {
    
}
 
mongoritwo.connect('mongodb://localhost:27017/dogchamber');

Messages.find().then((docs) => {
	console.log('ff');
	console.log(docs[0].attributes);
}, () => {
	console.log('gg');
});



// FIXME XXX

class Messages {

	constructor() {
		/*function connect() {
			return new Promise((resolve, reject) => {
				MongoClient.connect(url, (err, db) => {
					if (err)
						reject(err);
					resolve(db);
				});
			});
		}

		connect().then((db) => {
			this.db = db;
			this.collection = db.collection('messages');
		}, (err) => {
			console.log(err);
		});*/

	}

	get(cond, cb) {
		assert(this.collection);
		if (!cond)
			cond = {};

		this.collection.find(cond).toArray((err, docs) => {
			assert(err === null);
			cb(docs);
		});
	}
}

/*
class Messages {

	constructor() {
	}

	get(cond, cb) {
		MongoClient.connect(url, (err, db) => {
			assert(err === null);
			let collection = db.collection('messages');
			collection.find(cond).toArray((err, docs) => {
				assert(err === null);
				cb(docs);
			});
		});
	}

	save(cond, cb) {
		MongoClient.connect(url, (err, db) => {
			assert(err === null);
			let collection = db.collection('messages');
			collection.save(cond)
		});
	}
}
*/

module.exports = new Messages();
