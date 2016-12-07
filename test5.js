'use strict';

const Messages = require('./models/messages');

Messages.get({sender: "cjr"}, (docs) => {
	console.log(docs);
});
