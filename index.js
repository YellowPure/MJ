var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
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
var MJList=require('./mj_list');

global.io_obj=io;
io.on('connection', function(socket) {
	var addUsers = false;
	console.log('connection success!');
	global.socket_obj=socket;
	socket.on('new message', function(data) {
		console.log(data, 'get message');
		io.to(data.roomId).emit('new message', {
			username: socket.username,
			message: data.msg
		});
	});

	socket.on('add user', function(username) {
		if (usernames[username] == undefined) {
			socket.username = username;

			usernames[username] = username;
			addUsers = true;
			++numUsers;

			var curRoomId = updateRoomPoolByUsers();
			socket.join(curRoomId);
			socket.roomId = curRoomId;
			if(MJList[curRoomId]==undefined){
				MJList.init(curRoomId);
			}
			gameMain = Object.create(new GameMain(curRoomId));
			addPlayersToRoom(curRoomId, username);

			var player_list=global.roomPlayers[curRoomId];
			console.log('global.roomPlayers:',global.roomPlayers[curRoomId]);
			socket.emit('login', {
				username: username,
				numUsers: numUsers,
				roomId: curRoomId,
				player_list: player_list
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
	socket.on('disconnect', function() {
		console.log('use disconnect');
		if (addUsers) {
			delete usernames[socket.username];
			--numUsers;
			delPlayersFromRoom(socket.roomId, socket.username);
			socket.broadcast.emit('user left', {
				roomId: socket.roomId,
				username: socket.username,
				numUsers: numUsers,
				player_list: roomPlayers[socket.roomId]
			});
		}
	});
	socket.on('ready', function(data) {
		console.log("I'm ready!");
		gameMain.setPlayerReady(data.username);
		if(gameMain.checkToStartGame()==true){
			gameMain.countDown(function(){
				gameMain.startGame();
				turnNextPlayer(global.roomPlayers[socket.roomId],0);
			});
		}
		io.to(data.roomId).emit('player ready', {
			username: data.username
		});
	});
	socket.on('throw',function(data){
		console.log('throw!');
		if(data.card_name){
			gameMain.throwOneCard(data.card_name);
		}
	});
	socket.on('not ready', function(data) {
		console.log("I'm not ready!");
		gameMain.setPlayerNotReady(data.username);
		io.to(data.roomId).emit('player not ready', {
			username: data.username
		});
	});
	socket.on('turn one player',function(data){
		console.log(" now one player moving",data);
		var _index=getIndexByName(data.username);
		turnNextPlayer(global.roomPlayers[socket.roomId],_index);
	});
});

function getIndexByName(name){
	var arr=global.roomPlayers[global.socket_obj.roomId];
	arr.forEach(function(val,index){
		if(val.username==name){
			return index;
		}
	})
	return -1;
}

function turnNextPlayer(player_list,index){
	console.log(index," _player turn on");
	io.to(global.socket_obj.roomId).emit('player turn',{name:player_list[index].username});
}


function addPlayersToRoom(curRoomId, username) {
	var curRoomId = curRoomId || null;
	var username = username || null;
	if (curRoomId && username) {
		var roomId=curRoomId.toString();
		if(global.roomPlayers[roomId]==undefined){
			global.roomPlayers[roomId]=new Array();
		}
		global.roomPlayers[roomId].push({username:username,ready:false});
	}
}

function delPlayersFromRoom(curRoomId, username) {
	var curRoomId = curRoomId || null;
	var username = username || null;
	console.log('out~~~~roooooooooom!!', curRoomId, username);
	if (curRoomId && username) {
		var roomStr = curRoomId.toString()
		if (global.roomPlayers[roomStr]) {
			global.roomPlayers[roomStr].forEach(function(value,index){
				if(value.username==username){
					global.roomPlayers[roomStr].splice(index, 1);
				}
			});
		}
	}
}
function updateRoomPoolByUsers(){
	var len=Math.ceil(numUsers/4);
	roomIdPool=[];
	var num=10000;
	for (var i = 0; i < len; i++) {
		roomIdPool.push(num.toString());
		num++;
	}
	return (10000+(len-1)).toString();
}