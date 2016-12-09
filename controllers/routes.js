'use strict';
const views = require('co-views');
const parse = require('co-body');
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
	let url = `/${room}/today`;
	this.redirect(url);
};

module.exports.chatLogHandler = function *(room, date) {
	let query = querystring.parse(this.request.querystring);
	if (date === 'today')
		date = getDate();
	console.log(date);
	let cond = {'date': date}
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
	let enable_ws = date === 'today';
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

// vim: ts=4 st=4 sw=4
