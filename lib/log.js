'use strict';

const fs = require('fs');
const util = require('util');

function getTime() {
	let d = new Date();
	let M = d.getMonth() + 1;
	if (M < 10)
		M = '0' + M.toString();
	let dd = d.getDay();
	if (dd < 10)
		dd = '0' + dd.toString();
	let time = d.toLocaleTimeString('en-US', { hour12: false });
	return `[${d.getFullYear()}-${M}-${dd} ${time}]`;
}

class Log {
	
	constructor(filename) {
		this.logfile = fs.createWriteStream(filename, {
			flags: 'a'
		});
	}

	log() {
		let args = Array.prototype.slice.apply(arguments);
		let str = args.map(x => typeof x === 'string' ? x : util.inspect(x)).join(' ');
		str = getTime() + ' ' + str;
		console.log(str);
		this.logfile.write(str);
		this.logfile.write('\n');
	}

}

module.exports = new Log('../log.txt');
