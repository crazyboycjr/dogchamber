# dogchamber
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)
![node](https://img.shields.io/node/v/gh-badges.svg)

A chatroom for Computer Networks course. Re-implemented WebSocket protocol (server side) based on TCP socket.
Under heavy development.

## Protocols and Architecture
### Basic Architecture
```
               +-----------------+
               |      HTTP       |
               v                 v
        +------------+     +------------+
        |   Browser  |     |   WebUI    |<-+
        +------------+     +------------+  |
               |    WebSocket              |
               +-----------------+         |Data
                                 v         |
                           +------------+  |
                           |            |  |
                   +------>|SocketServer|--+
                   |       |    +---+   |
               Data|       +----|---|---+
                   |            v   ^
              +---------+  Data |   | Data +----------+
              | MongoDB |<------+   +----->| Telegram |
              +---------+                  +----------+
```

### Data
```json
{
	"msg_id": 2,
	"sender": "zrz",
	"botmsg": false,
	"channel": "web",
	"content": "Hello, cjr.",
	"date": "2016-12-06",
	"time": "17:15:51",
	"room": "Room506",
	"mtype": "text",
	"media_url": null,
	"reply_to" : "cjr",
	"reply_text" : "Hello, I'm cjr."
}
```
- channel: Message from web or telegram
- mtype: MIME-Type range in [text, document, photo, sticker, image, audio, animation, video]. 'document' means the resource is downloadable.
- media_url: When mtype != 'text', this field refers to the url of the resource


## Build
### Requirements
Mongodb

### Build
Install dependencies.
```
npm install
```
You can edit the `config.json` and change `botToken` to yours, and change the `uploaddir` as you like. We assume you to set `uploaddir` to `/uploads`, create the directory.
```
mkdir public/uploads
```

Create a room by insert documents in Mongodb. Assuming the room's name is `Chatroom`
```
$ mongo
> use dogchamber
> db.createCollection('messages')
> db.createCollection('counters')
> db.counters.insert({'room': 'Chatroom', 'seq': 0})
```
Start the app
```
node app.js
```
Open your browser and visit http://127.0.0.1:3000/

### Notice
This program will listen on port 3000(HTTP) and 4000(WebSocket) at the same time, so don't forget to close your firewall on both 3000 and 4000.

## Plugin
We can add plugins by implementing two interfaces
```
init(ws) // param: Class WebSocketServer
handle(msg) // param: a message Object
```
and add it to `config.json`.

## Screenshot
![screenshot](https://github.com/crazyboycjr/dogchamber/blob/master/dogchamber.png)

## TODO
- Fix bug of name conflict
- Add timestamp and client ip when logging
- Make the UI adapt to windows of different size
- Polish the UI (Bubble box size, Download preview)
- Implement plugin mechanism
- File name bug when downloading
- Complete the WebSocket Protocol implementation
- Add favicon
- Use https and wss
