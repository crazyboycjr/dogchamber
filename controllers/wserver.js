'use strict';

const wsconfig = require('../config.json').websocket;
const WebSocketServer = require('../lib/WebSocketServer');
const Log = require('../lib/log');
const co = require('co');
const PMessages = require('../models/messages');
const config = require('../config.json');

function getDate() {
	return (new Date).toISOString().slice(0, 10); // like 2016-12-07
}

function getTime() {
	return (new Date).toTimeString().slice(0, 8); // like 18:21:40
}

let plugins = new Set();

function loadPlugin(ws) {
	for (let plugin of config.plugins) {
		let p = require('./' + plugin);
		p.init(ws);
		plugins.add(p);
	}
}

function runPlugin(msg) {
	for (let plugin of plugins) {
		plugin.handle(msg);
	}
}

function startWsServer() {

	let ws = new WebSocketServer({host: wsconfig.host, port: wsconfig.port});
	loadPlugin(ws);

	ws.on('message', (data) => {
		console.log(data);
		console.log(data.toString());
		let msg = JSON.parse(data);
		
		let date = getDate(),
			time = getTime();

		co(function *() {
			let Messages = yield PMessages;
			let ret = yield Messages.getNextID(msg.room);
			console.log(ret);
			let msg_id = ret.value.seq;
			console.log(msg_id);
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
			yield Messages.insert(msg);
			ws.broadcast(JSON.stringify(msg));

			runPlugin(msg);

		}).then(() => {}, (err) => {
			console.log(err);
		});
	});
	ws.on('error', err => Log.log('websocket error', err));
	return ws;
}

module.exports = startWsServer;

// vim: ts=4 st=4 sw=4
