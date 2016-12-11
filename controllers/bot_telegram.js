'use strict';

const Log = require('../lib/log');
const co = require('co');
const PMessages = require('../models/messages');
const config = require('../config.json');
const room = config.default_room;
const TeleBot = require('telebot');
const bot = new TeleBot(config.botToken);
const chatId = config.botGroup;
const url = require('url');
const exec = require('child_process').exec;
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');

function getDate() {
	return (new Date).toISOString().slice(0, 10); // like 2016-12-07
}

function getTime() {
	return (new Date).toTimeString().slice(0, 8); // like 18:21:40
}

function *download_file_wget(file_url) {
	let file_name = Math.random().toString() + '.' + url.parse(file_url).pathname.split('.').pop();
	let file_name_origin = url.parse(file_url).pathname.split('/').pop();
	let downloaddir = path.join(__dirname, '..', 'public', config.uploaddir, file_name);
	return new Promise((resolve, reject) => {
		let re = /^https/g;
		let data = '';
		let agent = http;
		if (re.test(file_url))
			agent = https;
		agent.get(file_url, (res) => {
			res.setEncoding('binary');
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				/*
				 * write data to file here
				 */
				let file = fs.createWriteStream(downloaddir, {flags: 'w', defaultEncoding : 'binary'});
				file.write(data);
				file.end();
				file.on('finish', () => {
					resolve([ 'http://10.131.238.237:3000/uploads/' + file_name, file_name_origin ]);
				});
			});
		}).on('error', (err) => {
			console.log(err);
			reject(err);
		}); 
	});
	/*
	let wget = 'wget ' + file_url + ' -O ' + downloaddir;
	//console.log(window.location.origin);
	let child = exec(wget, function(err, stdout, stderr) {
		if (err) throw err;
		else console.log(file_name + ' downloaded to ' + downloaddir);
	});
	return [ 'http://10.131.238.237:3000/uploads/' + file_name, file_name_origin ];
	*/
};


function startBot(ws) {

	bot.on(['text'], (msg, self) => {
		let date = getDate(),
			time = getTime();
		co(function *() {
			let Messages = yield PMessages;
			let ret = yield Messages.getNextID(room);
			console.log(ret);
			let msg_id = ret.value.seq;
			console.log(msg_id);
			msg = {
				'sender': msg.from.first_name + ' ' + msg.from.last_name,
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

	bot.on(['photo', 'audio', 'sticker', 'video', 'document'], (msg, self) => {
		let date = getDate(),
			time = getTime();
		console.log(msg);
		let file_id;
		//TODO: other conditions.
		if (self.type == 'photo')
			file_id = msg.photo[msg.photo.length - 1].file_id;
		if (self.type == 'audio')
			file_id = msg.audio.file_id; 
		if (self.type == 'sticker')
			file_id = msg.sticker.file_id;
		if (self.type == 'video')
			file_id = msg.video.file_id;
		if (self.type == 'document' && msg.document.mime_type == 'video/mp4')
			file_id = msg.document.file_id;
		bot.getFile(file_id).then(function(result){
			console.log(result);
			let url = 'https://api.telegram.org/file/bot' + config.botToken + '/' + result.result.file_path;
			co(function *() {
				let download_ret = yield download_file_wget(url);
				let Messages = yield PMessages;
				let ret = yield Messages.getNextID(room);
				console.log(ret);
				let msg_id = ret.value.seq;
				console.log(msg_id);
				msg = {
					'sender': msg.from.first_name + ' ' + msg.from.last_name,
					'botmsg': true,
					'channel': 'telegram',
					'content': download_ret[1],
					'date': date,
					'time': time,
					'media_url': download_ret[0],
					'mtype': self.type,
					'room': room,
					'msg_id': msg_id,
					'reply_to': '',
					'reply_text': ''
				};
				if (self.type == 'document')
					msg.mtype = 'video';
				console.log(msg);
				yield Messages.insert(msg);
				ws.broadcast(JSON.stringify(msg));
			}).then(() => {}, (err) => {
				console.log(err);
			});
		});
	});
	bot.connect();
}

function sendToBot_msg(msg) {
	let parse = 'html';
	bot.sendMessage(chatId, `<b>[${ msg.sender }]</b>${ msg.content }`, { parse });
}

function sendToBot_media(msg) {
	let file_name = msg.media_url.split('/').pop();
	console.log(file_name);
	fs.readFile(path.join(__dirname, '..', 'public', config.uploaddir, file_name), function(err, buf) {
		if (err) throw err;
		console.log('readFile success');
		if (msg.mtype == 'photo') {
			bot.sendPhoto(chatId, buf, {caption: `${ msg.sender } sent a photo:`});
			bot.sendAction(chatId, 'upload_photo');
		}
		if (msg.mtype == 'audio') {
			let promise = bot.sendAudio(chatId, buf, {caption: `${ msg.sender } sent an audio:`});
			bot.sendAction(chatId, 'upload_audio');
			promise.catch(error => {
				console.log('[error]', error);
				// Send an error
				bot.sendMessage(id, `😿 An error ${ error } occurred, try again.`);
			});
		}
		if (msg.mtype == 'sticker') {
			let promise = bot.sendSticker(chatId, buf, {caption: `${ msg.sender } sent a sticker:`, fileName : 'file.webp'});
			promise.catch(error => {
				console.log('[error]', error);
				// Send an error
				bot.sendMessage(id, `😿 An error ${ error } occurred, try again.`);
			});
			//bot.sendAction(chatId, 'upload_document');
		}
		if (msg.mtype == 'video') {
			let promise = bot.sendVideo(chatId, buf, {caption: `${ msg.sender } sent a video:`});
			bot.sendAction(chatId, 'upload_video');
			promise.catch(error => {
				console.log('[error]', error);
				// Send an error
				bot.sendMessage(id, `😿 An error ${ error } occurred, try again.`);
			});
		}
		if (msg.mtype == 'image') {
			let ext = msg.content.split('.').pop();
			let promise;
			if (ext == 'gif') {
				promise = bot.sendDocument(chatId, buf, {caption: `${ msg.sender } sent a image:`, fileName: 'file.gif'});
				bot.sendAction(chatId, 'upload_photo');
			}
			else {
				promise = bot.sendSticker(chatId, buf, {caption: `${ msg.sender } sent a sticker:`, fileName : 'file.webp'});
			}
			promise.catch(error => {
				console.log('[error]', error);
				// Send an error
				bot.sendMessage(id, `😿 An error ${ error } occurred, try again.`);
			});
		}
	});
}

module.exports = {
	startBot: startBot,
	sendToBot_msg: sendToBot_msg,
	sendToBot_media: sendToBot_media,
}

// vim: ts=4 st=4 sw=4
