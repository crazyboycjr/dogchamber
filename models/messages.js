'use strict';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('../config.json').mongo;


let url = `mongodb://${config.host}:${config.port}/${config.database}`;
// FIXME XXX 这下面代码可能需要改写
/*
class Messages {

	constructor() {
		function connect() {
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
		});

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
*/
class Messages {

	constructor() {
	}

	get(cond, limit) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, db) => {
				if (err)
					reject(err);
				assert(err === null);
				let collection = db.collection('messages');
				console.log(cond);
				let cur = collection.find(cond);
				if (limit)
					cur = cur.sort([['msg_id', -1]]).limit(limit);
				cur.toArray((err, docs) => {
					if (err)
						reject(err);
					assert(err === null);
					resolve(docs.reverse());
				});
				db.close();
			});
		});
	}
	
	distinct(key) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, db) => {
				assert(err === null);
				if (err)
					reject(err);
				let collection = db.collection('messages');
				collection.distinct(key, (err, docs) => {
					assert(err === null);
					if (err)
						reject(err);
					
					resolve(docs);
				});
				db.close();
			})
		});
	}
	
	getMax(cond, key) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, db) => {
				assert(err === null);
				if (err)
					reject(err);
				let collection = db.collection('messages');
				collection.find(cond).sort([[key, -1]]).limit(1).toArray((err, docs) => {
					assert(err === null);
					if (err)
						reject(err);
					
					resolve(docs);
				});
				db.close();
			})
		});
	}
/*
	save(cond) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, db) => {
				assert(err === null);
				let collection = db.collection('messages');
				collection.save(cond);
			});
		});
	}
*/
}

module.exports = new Messages();
