'use strict';

const WebSocket = require('./WebSocket.js');
const Log = require('./log');
const net = require('net');
const EventEmitter = require('events');

class WebSocketServer extends EventEmitter {
	
	constructor(options, cb) {
		super();

		options = Object.assign({
			perMessageDeflate: true,
			server: '127.0.0.1',
			host: null,
			port: null
		}, options);

		this.clients = new Set();

		this.tcpServer = net.createServer((sock) => {
			let websocket = new WebSocket(sock);
			this.clients.add(websocket);

			websocket.on('message', (data) => {
				this.emit('message', data);
			});
			websocket.on('close', () => this.clients.delete(websocket));
		})
		.on('error', (err) => {
			this.emit('error', err);
		});

		this.tcpServer.listen({
			host: options.host,
			port: options.port,
			exclusive: false
		});
	}

	broadcast(data) {
		for (let wsock of this.clients) {
			wsock.send(data);
		}
	}
}

module.exports = WebSocketServer;

// vim: ts=4 st=4 sw=4
