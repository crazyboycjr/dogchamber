'use strict';
const views = require('co-views');
const parse = require('co-body');

const render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

module.exports.home = function *home(ctx) {
	let room = config.default_room;
	let url = `/${room}/today`;
	this.redirect(url);
//this.body = yield render('list', { 'messages': messages });
};

module.exports.chatLogHandler = function *(room, date) {
}

module.exports.chatHandler = function *(room, date) {
	let enable_ws = date === 'today';

	this.body = yield render('chat_log', {
		'title': room + new Date,
		'enable_ws': enable_ws,
		'room': room
	});
}

// vim: ts=4 st=4 sw=4
