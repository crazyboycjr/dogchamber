'use strict';

const assert = require('assert');
const config = require('../config.json').mongo;
const DB = require('./db');
const co = require('co');
const MongoClient = require('mongodb').MongoClient;

let url = `mongodb://${config.host}:${config.port}/${config.database}`;

class Messages {

	constructor() {
		this.db = Messages.db;
		this.collection = this.db.collection('messages');
	}

	get(cond, limit) {
		return new Promise((resolve, reject) => {
			console.log(cond);
			let cur = this.collection.find(cond);
			if (limit)
				cur = cur.sort([['msg_id', -1]]).limit(limit);
			cur.toArray((err, docs) => {
				if (err)
					reject(err);
				assert(err === null);
				resolve(docs.reverse());
			});
		});
	}
	
	distinct(key) {
		return this.collection.distinct(key);
	}

	getMax(cond, key) {
		return this.collection.find(cond).sort([[key, -1]]).limit(1).toArray();
	}

	insert(cond) {
		return this.collection.insert(cond);
	}
	
	getNextID(room) {
		return this.db.collection('counters').findAndModify(
			{'room': room},
			[],
			{'$inc': {'seq': 1}},
			{upsert: true}
		);
	}
	
}

module.exports = co(function *() {
	Messages.db = yield DB();
	return new Messages();
});

//module.exports = new Messages();
