# dogchamber
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)
![node](https://img.shields.io/node/v/gh-badges.svg)

A chatroom for Computer Networks course. Re-implemented WebSocket protocol (server side) based on TCP socket.

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

Open your browser and visit http://127.0.0.1:3000/

## Screenshot
![](/home/cjr/Developing/dogchamber/dogchamber.png)

## TODO
- Fix bug of name conflict
- Add timestamp and client ip when logging
- Make the UI adapt windows of different size
- Polish the UI (Bubble box size, Download preview)
- Implement plugin mechanism
- File name bug when downloading
- Complete the WebSocket Protocol
- Add favicon