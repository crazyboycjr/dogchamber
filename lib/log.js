'use strict';

const fs = require('fs');
const util = require('util');

class Log {
	
	constructor(filename) {
		this.logfile = fs.createWriteStream(filename, {
			flags: 'a'
		});
	}

	log() {
		let args = Array.prototype.slice.apply(arguments);
		let str = args.map(x => typeof x === 'string' ? x : util.inspect(x)).join(' ');
		str = Date().toString() + str;
		console.log(str);
		this.logfile.write(str);
		this.logfile.write('\n');
	}

}

module.exports = new Log('../log.txt');
