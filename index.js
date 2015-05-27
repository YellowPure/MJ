var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var Global = require('./Global');
Global.io = io;

//console.log(Global,'Global');
server.listen(port, function () {
	console.log('listening on %d', port);
})
app.use(express.static(__dirname + '/public'));
var room=require('./room');
//game main
var usernames = {};
var numUsers = 0;

var roomIdPool = [];
var GameMain = require('./game_main');
var MJList = require('./mj_list');

io.on('connection', function (socket) {
	var addUsers = false;
	console.log('connection success!', Global.io.sockets.sockets.length);//,io.sockets.sockets,socket.id);
	//	global.sockets=io.sockets.sockets;
	socket.on('new message', function (data) {
		console.log(data, 'get message');
		io.to(data.roomId).emit('new message', {
			username: socket.username,
			message: data.msg
		});
	});

	socket.on('add user', function (username) {
		if (usernames[username] == undefined) {
			socket.username = username;

			usernames[username] = username;
			addUsers = true;
			++numUsers;

			var curRoomId = updateRoomPoolByUsers();
			socket.join(curRoomId);
			console.log('socket join room:', socket.rooms);
			socket.roomId = curRoomId;
			var count = MJList.getCount();
			if (count != socket.roomId) {
				MJList.init(curRoomId);
				console.log('MJlist init!!', socket.roomId);
				MJList.setCount(socket.roomId);
			}
			count = GameMain.getCount();
			console.log('gamemain getcount', count);
			if (count != socket.roomId) {
				GameMain.init(curRoomId, socket.id);
			}
			//			gameMain = Object.create(new GameMain(curRoomId, socket.id));
			addPlayersToRoom(curRoomId, username);

			var player_list = Global.roomPlayers[curRoomId];
			console.log('Global.roomPlayers:', Global.roomPlayers[curRoomId]);
			socket.emit('login', {
				username: username,
				numUsers: numUsers,
				roomId: curRoomId,
				player_list: player_list,
				socketId: socket.id
			});
			console.log(numUsers, username, curRoomId, 'user join');
			socket.broadcast.to(curRoomId.toString()).emit('user join', {
				roomId: curRoomId,
				numUsers: numUsers,
				username: username,
				player_list: player_list
			});
		}
	});

	// socket.broadcast.emit('connection','connection 1');
	socket.on('disconnect', function () {
		console.log('use disconnect');
		if (addUsers) {
			delete usernames[socket.username];
			--numUsers;
			GameMain.setPlayerNotReady(socket.username);
			io.to(socket.roomId).emit('player not ready', {
				username: socket.username
			});
			delPlayersFromRoom(socket.roomId, socket.username);
			socket.broadcast.emit('user left', {
				roomId: socket.roomId,
				username: socket.username,
				numUsers: numUsers,
				player_list: roomPlayers[socket.roomId]
			});
		}
	});
	socket.on('ready', function (data) {
		console.log("I'm ready!");
		GameMain.setPlayerReady(data.username);
		if (GameMain.checkToStartGame() == true) {
			io.to(data.roomId).emit('broadcast start game', { roomId: data.roomId });
		}
		io.to(data.roomId).emit('player ready', {
			username: data.username
		});
	});
	socket.on('broadcast start game', function (data) {
		console.log('broadcast start game', data.username);
		GameMain.countDown(function () {
			GameMain.startGame(socket);
			turnFirstPlayer(Global.roomPlayers[socket.roomId], 0, socket);
		}, socket);
	});
	socket.on('throw', function (data) {
		console.log('throw!');
		if (data.card_name) {
			GameMain.throwOneCard(data.card_name,data.socketId,data.username);
		}
	});
	socket.on('not ready', function (data) {
		console.log("I'm not ready!");
		GameMain.setPlayerNotReady(data.username);
		io.to(data.roomId).emit('player not ready', {
			username: data.username
		});
	});
	socket.on('chi', function (data) {
		console.log("chi card", data);
	})
	socket.on('player get one card', function (player_name) {
		Global.roomPlayers[socket.roomId].forEach(function (element, index) {
			if (element.username === player_name) {
				var card = MJList.dealOneCard(socket.roomId);
				console.log("player get one card", card, element.username);
				socket.emit('player get one card', { name: element.username, card: card });
			}
		}, this);

	});
});

function getIndexById(id) {
	var _socket;
	Global.sockets.forEach(function (element, index) {
		if (element.id == id) {
			_socket = element;
		}
	}, this);
	var arr = Global.roomPlayers[_socket.roomId];
	arr.forEach(function (val, index) {
		if (val.username == name) {
			return index;
		}
	})
	return -1;
}

function turnFirstPlayer(player_list, index, target) {
	console.log(index, "first player turn on");
	target.emit('player turn', { name: player_list[index].username });
}


function addPlayersToRoom(curRoomId, username) {
	var _curRoomId = curRoomId || null;
	var _username = username || null;
	if (_curRoomId && _username) {
		var roomId = _curRoomId.toString();
		if (Global.roomPlayers[roomId] == undefined) {
			Global.roomPlayers[roomId] = new Array();
		}
		Global.roomPlayers[roomId].push({ username: _username, ready: false });
	}
}

function delPlayersFromRoom(curRoomId, username) {
	var _curRoomId = curRoomId || null;
	var _username = username || null;
	console.log('out~~~~roooooooooom!!', _curRoomId, _username);
	if (_curRoomId && username) {
		var roomStr = _curRoomId.toString()
		if (Global.roomPlayers[roomStr]) {
			Global.roomPlayers[roomStr].forEach(function (value, index) {
				if (value.username == username) {
					Global.roomPlayers[roomStr].splice(index, 1);
				}
			});
		}
	}
}
function updateRoomPoolByUsers() {
	var len = Math.ceil(numUsers / 4);
	roomIdPool = [];
	var num = 10000;
	for (var i = 0; i < len; i++) {
		roomIdPool.push(num.toString());
		num++;
	}
	return (10000 + (len - 1)).toString();
}