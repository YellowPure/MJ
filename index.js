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

//game main
var usernames = {};
var numUsers = 0;

var roomIdPool = [];
global.roomPlayers = {};
var gameMain = null;
var GameMain = require('./game_main');
var MJList = require('./mj_list');

//global.io_obj=io;
//global.sockets=[];
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
			//			if (MJList[curRoomId] == undefined) {
			//				
			//			}
			gameMain = Object.create(new GameMain(curRoomId, socket.id));
			addPlayersToRoom(curRoomId, username);
			socket.gameMain = gameMain;
			//			console.log(Global.io.sockets.sockets[0].gameMain.game_state);
			//			debugger;
			
			var player_list = global.roomPlayers[curRoomId];
			console.log('global.roomPlayers:', global.roomPlayers[curRoomId]);
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
			gameMain.setPlayerNotReady(socket.username);
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
		gameMain.setPlayerReady(data.username);
		if (gameMain.checkToStartGame() == true) {
			io.to(data.roomId).emit('broadcast start game', { roomId: data.roomId });
			//			console.log('ready count!!!!');
			//			Global.io.sockets.sockets.forEach(function(element,index){
			//				element.gameMain.countDown(function () {
			//					element.gameMain.startGame();
			//					turnNextPlayer(global.roomPlayers[socket.roomId], 0, socket);
			//				});
			//			});
		}
		io.to(data.roomId).emit('player ready', {
			username: data.username
		});
	});
	socket.on('broadcast start game', function (data) {
		console.log('broadcast start game',data.username);
//		Global.io.sockets.sockets.forEach(function (element, index) {
//			if(data.roomId==element.roomId){
				socket.gameMain.countDown(function () {
					socket.gameMain.startGame();
					turnNextPlayer(global.roomPlayers[socket.roomId], 0, socket);
				});
//			}
//		});
	});
	socket.on('throw', function (data) {
		console.log('throw!');
		if (data.card_name) {
			gameMain.throwOneCard(data.card_name);
		}
	});
	socket.on('not ready', function (data) {
		console.log("I'm not ready!");
		gameMain.setPlayerNotReady(data.username);
		io.to(data.roomId).emit('player not ready', {
			username: data.username
		});
	});
	socket.on('turn one player', function (data) {
		console.log(" now one player moving", data);
		var _index = getIndexById(data.username);
		turnNextPlayer(global.roomPlayers[socket.roomId], _index);
	});
	socket.on('chi', function (data) {
		console.log("chi card", data);
	})
	socket.on('player get one card', function (player_name) {
		global.roomPlayers[socket.roomId].forEach(function (element, index) {
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
	global.sockets.forEach(function (element, index) {
		if (element.id == id) {
			_socket = element;
		}
	}, this);
	var arr = global.roomPlayers[_socket.roomId];
	arr.forEach(function (val, index) {
		if (val.username == name) {
			return index;
		}
	})
	return -1;
}

function turnNextPlayer(player_list, index, target) {
	console.log(index, " _player turn on");
	target.emit('player turn', { name: player_list[index].username });
}


function addPlayersToRoom(curRoomId, username) {
	var curRoomId = curRoomId || null;
	var username = username || null;
	if (curRoomId && username) {
		var roomId = curRoomId.toString();
		if (global.roomPlayers[roomId] == undefined) {
			global.roomPlayers[roomId] = new Array();
		}
		global.roomPlayers[roomId].push({ username: username, ready: false });
	}
}

function delPlayersFromRoom(curRoomId, username) {
	var curRoomId = curRoomId || null;
	var username = username || null;
	console.log('out~~~~roooooooooom!!', curRoomId, username);
	if (curRoomId && username) {
		var roomStr = curRoomId.toString()
		if (global.roomPlayers[roomStr]) {
			global.roomPlayers[roomStr].forEach(function (value, index) {
				if (value.username == username) {
					global.roomPlayers[roomStr].splice(index, 1);
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