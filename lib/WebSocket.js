'use strict';

const Log = require('./log');
const net = require('net');
const assert = require('assert');
const crypto = require('crypto');
const EventEmitter = require('events');

class WebSocket extends EventEmitter {

	constructor(sock) {
		super();
		
		this.socket = sock;
		this.handshaked = false;

		this.socket.on('data', (data) => {
			if (!this.handshaked) {
				//console.log('receive handshake data', data);
				let req = this.parseHTTPReq(data);
				this.handshake(this.socket, req);
				this.handshaked = true;
				console.log('handshake finished.');
			} else {
				console.log('receive data buffer:', Buffer.from(data));
				let opcode;
				[opcode, data] = this.deframe(data);
				console.log('deframed data:', data);
				if (opcode >> 3)
					this.handleControl(opcode, data);
				else
					this.emit('message', data);
			}
		});


		this.socket.on('error', (err) => this.emit('error', err));
		this.socket.on('close', () => this.emit('close'));
	}

	send(data) {
		data = this.enframe(0x1, data);
		this.socket.write(data);
	}

	parseHTTPReq(data) {
		console.log(data.toString());
		let raw = data.toString().split('\r\n');
		let headers = {};

		let request_line = raw.shift().split(' ');
		let [method, path] = [request_line[0], request_line[1]];
		console.log(method, path);
		assert(method === 'GET');

		raw.pop();
		assert(raw.pop() === '');

		let re = /(^[^:]+)(:\s)(.*)$/;
		raw.forEach((line, i) => {
			let m = line.match(re);
			assert(m.length === 4 && m[1]);
			headers[m[1].toLowerCase()] = m[3];
		});

		assert(headers.host && headers.origin);

		return {
			headers: headers,
			url: path
		}

	}

	handshake(sock, req) {
		const magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
		let h = req.headers;
		let headers = [
			'HTTP/1.1 101 WebSocket Protocol Handshake',
			'Upgrade: websocket',
			'Connection: Upgrade',
			'Sec-WebSocket-Origin: ' + h.origin,
			'Sec-WebSocket-Location: ws://' + h.host + req.url
		];
		if (h['sec-websocket-protocol'])
			headers.push('Sec-WebSocket-Protocol: ' + h['sec-websocket-protocol']);

		let key = crypto.createHash('sha1')
			.update(h['sec-websocket-key'] + magic)
			.digest('base64');
		headers = headers.concat(['Sec-WebSocket-Accept:' + key, '\r\n']).join('\r\n');
		sock.write(headers);
	}

	handleClose(data) {
		data = this.enframe(0x8, data);
		this.socket.write(data);
	}

	handleControl(opcode, data) {
		switch (opcode) {
			case 0x8:
				this.handleClose(data);
				break;
			case 0x9:
				//handlePing();
				break;
			case 0xA:
				//handlePong();
				break;
			default:
				assert(0);
		}
	}

	deframe(data) {
		data = Buffer.from(data);
		let fin, mask, opcode, payloadLen, extendLen, rsv1;
		let byte0 = data.readUInt8();

		fin = byte0 >> 7;
		rsv1 = byte0 & 0x40;
		opcode = byte0 & 0x0f;
		mask = data.readUInt8(1);
		payloadLen = mask & 0x7f;
		mask >>= 7;

		let pos = 2;
		switch (payloadLen) {
			case 126:
				extendLen = data.readUInt16BE(pos);
				pos += 2;
				break;
			case 127:
				let hi, lo;
				hi = data.readUInt32BE(pos);
				lo = data.readUInt32BE(pos + 4);
				assert(Number.isSafeInteger(hi << 32));
				extendLen = (hi << 32) + lo;
				pos += 8;
				break;
			default:
				extendLen = payloadLen;
		}
		payloadLen = extendLen;

		let masks = Buffer.allocUnsafe(4);
		let ret = Buffer.allocUnsafe(payloadLen);
		if (mask) {
			data.copy(masks, 0, pos, pos + 4);
			pos += 4;
		}
		data.copy(ret, 0, pos, pos + payloadLen);
		if (mask) {
			for (let i = 0; i < payloadLen; i++)
				ret[i] ^= masks[i & 3];
		}

		return [opcode, ret];
	}

	enframe(opcode, data) {
		data = Buffer.from(data);
		let ret;
		if (data.length <= 125) {
			ret = Buffer.from([0x80 | opcode, data.length]);
			ret = Buffer.concat([ret, Buffer.from(data)], 2 + data.length);
		} else if (data.length <= 65535) {
			ret = Buffer.from([0x80 | opcode, 126]);
			let extendLen = Buffer.alloc(2);
			extendLen.writeUInt16BE(data.length, 0);
			ret = Buffer.concat([ret, extendLen, Buffer.from(data)],
				ret.length + extendLen.length + data.length);
		} else {
			ret = Buffer.from([0x80 | opcode, 127]);
			let hi, lo;
			hi = data.length >> 32;
			lo = data.length ^ hi;
			let extendLen = Buffer.alloc(8);
			extendLen.writeUInt32BE(hi, 0);
			extendLen.writeUInt32BE(lo, 4);
			ret = Buffer.concat([ret, extendLen, Buffer.from(data)],
				ret.length + extendLen.length + data.length);
		}
		return ret;
	}
}

module.exports = WebSocket;

// vim: ts=4 st=4 sw=4
