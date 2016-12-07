'use strict';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('../config.json').mongo;

let url = `mongodb://${config.host}:${config.port}/${config.database}`;

function connectDB() {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
			if (err)
				reject(err);
			resolve(db);
		});
	});
}

module.exports = connectDB;
