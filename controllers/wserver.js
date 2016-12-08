'use strict';

const wsconfig = require('../config.json').websocket;
const WebSocketServer = require('../lib/WebSocketServer');
const Log = require('../lib/log');
const co = require('co');
const Messages = require('../models/messages');

function getDate() {
	return (new Date).toISOString().slice(0, 10); // like 2016-12-07
}

function getTime() {
	return (new Date).toTimeString().slice(0, 8); // like 18:21:40
}

function *getMaxID(room) {
	let msg = yield Messages.getMax({
		'room': room
	}, 'msg_id');
	return msg[0].msg_id;
}

function startWsServer() {

	let ws = new WebSocketServer({host: wsconfig.host, port: wsconfig.port});

	ws.on('message', (data) => {
		console.log(data);
		console.log(data.toString());
		let msg = JSON.parse(data);
		
		let date = getDate(),
			time = getTime();
		
		//FIXME data race here XXX
		Messages.getMax({'room': msg.room}, 'msg_id').then((msgs) => {
			let msg_id = msgs[0].msg_id + 1;
			msg = Object.assign({
				'sender': '',
				'botmsg': false,
				'channel': 'web',
				'content': '',
				'date': date,
				'time': time,
				'media_url': '',
				'mtype': 'text',
				'room': '',
				'msg_id': msg_id,
				'reply_to': '',
				'reply_text': ''
			}, msg);
			console.log(msg);
			Messages.insert(msg);
			ws.broadcast(JSON.stringify(msg));
		}, (err) => {
			console.log(err);
		});
	});
	ws.on('error', err => Log.log('websocket error', err));
}

module.exports = startWsServer;
