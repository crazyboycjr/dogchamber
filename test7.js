const mongoritwo = require('mongoritwo');
const Model = mongoritwo.Model;
 
class Messages extends Model {
    
}
 
mongoritwo.connect('mongodb://localhost:27017/dogchamber');

Messages.find().then((docs) => {
	console.log('ff');
	console.log(docs[0].attributes);
}, () => {
	console.log('gg');
});

