'use strict';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('../config.json').mongo;

let url = `mongodb://${config.host}:${config.port}/${config.database}`;

function connectDB() {
	return MongoClient.connect(url);
}

module.exports = connectDB;
//module.exports = connectDB;
