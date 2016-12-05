'use script';

const Log = require('./lib/log');
const WebSocketServer = require('./lib/websocket').Server;
const port = 4400;

let wss = new WebSocketServer({
	host: '0.0.0.0',
	port: 4400
});

/*
wss.on('connection', (wsock) => {
	wsock.on('message', (msg) => {
		console.log(msg);
	});

	wsock.on('close', () => {
		console.log('wsock close.');
	});

	wsock.on('error', (err) => {
		console.log(err);
	});
}).on('error', (err) => {
	console.log(err);
	console.log('server close.');
});
*/

wss.on('error', (err) => {
	Log.log(err);
	Log.log('server close');
});

wss.on('message', (msg) => {
	console.log(msg.toString());
	wss.broadcast('To everyone:' + msg.toString());
});

// vim: ts=4 st=4 sw=4
