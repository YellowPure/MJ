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
var rooms= {};
var cardBoxs = {};
var Room=require('./Room');
Global.rooms = rooms;
//game main
var usernames = {};
var numUsers = 0;

var roomIdPool = [];
io.on('connection', function (socket) {
	var addUsers = false;

	console.log('connection success!', Global.io.sockets.sockets.length);//,io.sockets.sockets,socket.id);
	//	global.sockets=io.sockets.sockets;
	socket.on('new message', function (data) {
		// console.log(data, 'get message');
		io.to(data.roomId).emit('new message', {
			username: socket.username,
			message: data.msg
		});
	});

	socket.on('add user', function (username) {
		addUsers = true;
		++ numUsers;
		var curRoomId = createRoomId();
		if (rooms[curRoomId] == undefined ){
			rooms[curRoomId] = new Room(curRoomId);
		}
		//判断当前房间中是否有重复名称的玩家
		if(rooms[curRoomId].checkSameUsername() == false){
			rooms[curRoomId].addPlayer(socket,username);
			
			socket.join(curRoomId);
			// console.log('socket join room:', socket.rooms);
			socket.roomId = curRoomId;
			socket.username = username;
//			addPlayersToRoom(curRoomId, username);

			var player_list = rooms[curRoomId].getPlayerList();
//			console.log('Global.roomPlayers:', Global.roomPlayers[curRoomId]);
			socket.emit('login', {
				username: username,
				numUsers: numUsers,
				roomId: curRoomId,
				player_list: player_list,
				socketId: socket.id
			});
			console.log(username +'  joined '+ curRoomId +"_Room");
			socket.broadcast.to(curRoomId.toString()).emit('user join', {
				roomId: curRoomId,
				numUsers: numUsers,
				username: username,
				player_list: player_list
			});
		}else{
			socket.emit('error',{msg:'same name!'});
		}
	});
		
	socket.on('disconnect', function () {
		console.log('use disconnect');
		
		if (addUsers) {
			rooms[socket.roomId].delPlayer(socket.username);
//			delete usernames[socket.username];
			--numUsers;
//			GameMain.setPlayerNotReady(socket.username);
//			io.to(socket.roomId).emit('player not ready', {
//				username: socket.username
//			});
//			delPlayersFromRoom(socket.roomId, socket.username);
			socket.broadcast.emit('user left', {
				roomId: socket.roomId,
				username: socket.username,
				numUsers: numUsers,
				player_list: rooms[socket.roomId].getPlayerList()
			});
		}
	});
	socket.on('ready', function (data) {
		console.log("I'm ready!");
		if(rooms[data.roomId].setPlayerReady(data.username)){
			io.to(data.roomId).emit('player ready', {
				username: data.username
			});
		}else{
			io.to(data.roomId).emit('error',{msg:'ready error'});
		}
		
	});
	socket.on('broadcast start game', function(data) {
		console.log('broadcast start game', data.username);
		GameMain.countDown(function () {
			GameMain.startGame(socket);
		}, socket);
	});
	socket.on('not ready', function (data) {
		console.log("I'm not ready!");
		if(rooms[data.roomId].setPlayerNotReady(data.username)){
			io.to(data.roomId).emit('player not ready', {
				username: data.username
			});
		}else{
			io.to(data.roomId).emit('error',{msg:'not ready error'});
		}
	});
	socket.on('throw', function (data) {
		console.log('throw!');
		if (data.card_name) {
			rooms[socket.roomId].gameMain.throwCard(data.card_name,socket);
		}
	});
	socket.on('chi', function () {
		console.log("chi card");
		rooms[socket.roomId].gameMain.chi(socket.username);
	});
	socket.on('peng', function (){
		console.log('peng');
		rooms[socket.roomId].gameMain.peng(socket.username);
	});
	socket.on('gang', function(){
		console.log('gang');
		rooms[socket.roomId].gameMain.gang(socket.username);
	});
	socket.on('guo', function(){
		console.log('guo');
		rooms[socket.roomId].gameMain.guo(socket.username);
	});
	socket.on('hu', function(){
		console.log('hu');
		rooms[socket.roomId].gameMain.hu(socket.username);
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
function createRoomId(){
	var len = Math.ceil(numUsers / 4);
	var num = 10000;
	for (var i = 0; i < len; i++) {
		roomIdPool.push(num.toString());
		num++;
	}
	return (10000 + (len - 1)).toString();
}