'use strict';

const handshake = require('handshake');

const net = require('net');

var logfile = fs.createWriteStream('../log.txt', {
    flags: 'a'
});

function log() {
    let args = Array.prototype.slice.apply(arguments);
    let str = args.map(x => typeof x === 'string' ? x : util.inspect(x)).join(' ');
	str = Date().toString() + str;
    console.log(str);
    logfile.write(str);
    logfile.write('\n');
}

class WebSocketServer extends EventEmitter {
	
	constructor(options, cb) {
		super();

		options = Object.assign({
			perMessageDeflate: true,
			server: '127.0.0.1',
			host: null,
			port: null
		}, options);

		this.tcpServer = net.createServer((sock) => {
			sock.on('data', (data) => {

			});

			sock.on('connect', (data) => {
				
			});
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
}
