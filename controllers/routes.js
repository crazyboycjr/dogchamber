'use strict';
const views = require('co-views');
const parse = require('co-body');
const busboy = require('co-busboy');
const os = require('os');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const Messages = require('../models/messages');
const config = require('../config');

const render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

function getDate() {
	return (new Date).toISOString().slice(0, 10); // like 2016-12-07
}

module.exports.home = function *home(ctx) {
	let room = config.default_room;
	let url = `/dogchamber/${room}/today`;
	this.redirect(url);
};

module.exports.chatLogHandler = function *(room, date) {
	let query = querystring.parse(this.request.querystring);
	if (date === 'today')
		date = getDate();
	console.log(date);
	let cond = {'room': room};
	if (date !== 'any')cond['date'] = date;
	if (query.last)
		cond['msg_id'] = {'$lt': Number(query.last)};
	this.body = yield (yield Messages).get(cond, Number(query.limit));
}

function *fetchDates() {
	return yield (yield Messages).distinct('date');
}

function *fetchRooms() {
	return yield (yield Messages).distinct('room');
}

function *getNextID(room, date) {
	let msg = yield Messages.getMax({
		'room': room,
		'date': date
	}, 'msg_id');
	// check msg.length > 0
	if (!msg.length)
		return 0;
	return msg[0].msg_id;
}

module.exports.chatHandler = function *(room, date) {
	let enable_ws = date === 'today' || date === getDate();
	if (date === 'today')
		date = getDate();

	/* fetch distinct dates */
	let dates = yield fetchDates();
	/* fetch distinct rooms */
	let rooms = yield fetchRooms();
	console.log(rooms);
	//let nextID = yield getNextID(room, date);
	//console.log(nextID);
	
	this.body = yield render('chat_log', {
		'title': room + ' ' + getDate(),
		'enable_ws': enable_ws,
		'room': room,
		'rooms': rooms,
		'date': date,
		'dates': dates,
		//'nextID': nextID,
		'config': config
	});
}

module.exports.uploadHandler = function *() {
	let parts = busboy(this, {autoFields: true});
	let part;
	let files = [];
	let uploaddir = path.join(__dirname, '..', 'public', config.uploaddir);
	while ((part = yield parts)) {
		//console.log(part);
		let randname = Math.random().toString().split('.').pop() + part.filename;
		let stream = fs.createWriteStream(path.join(uploaddir, randname));
		files.push(path.join(config.uploaddir, randname));
		console.log(part.filename, part.mime, stream.path);
		part.pipe(stream);
	}
	this.status = 200;
	this.body = {
		files: files
	};
}

// vim: ts=4 st=4 sw=4
