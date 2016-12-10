'use strict';

const Log = require('../lib/log');
const co = require('co');
const PMessages = require('../models/messages');
const config = require('../config.json');
const room = config.default_room;
const TeleBot = require('telebot');
const bot = new TeleBot(config.botToken);
const chatId = config.botGroup;

function getDate() {
	return (new Date).toISOString().slice(0, 10); // like 2016-12-07
}

function getTime() {
	return (new Date).toTimeString().slice(0, 8); // like 18:21:40
}

function startBot(ws) {

	bot.on(['text', '/*'], (msg, self) => {
		
		let date = getDate(),
			time = getTime();

		co(function *() {
			let Messages = yield PMessages;
			let ret = yield Messages.getNextID(room);
			console.log(ret);
			let msg_id = ret.value.seq;
			console.log(msg_id);
			msg = {
				'sender': msg.from.first_name,
				'botmsg': true,
				'channel': 'telegram',
				'content': msg.text,
				'date': date,
				'time': time,
				'media_url': '',
				'mtype': 'text',
				'room': room,
				'msg_id': msg_id,
				'reply_to': '',
				'reply_text': ''
			};
			console.log(msg);
			yield Messages.insert(msg);
			ws.broadcast(JSON.stringify(msg));
		}).then(() => {}, (err) => {
			console.log(err);
		});
	});
	bot.connect();
}

function sendToBot(msg) {
	let parse = 'html';
	bot.sendMessage(chatId, `<b>${ msg.sender }</b> said in dogchamber: ${ msg.content }`, { parse });
}

module.exports = {
	startBot: startBot,
	sendToBot: sendToBot
}

// vim: ts=4 st=4 sw=4
