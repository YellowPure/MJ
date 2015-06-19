var Player = require('./Player');
var GameMain = require('./GameMain');
function Room(roomId) {
	this.roomId = roomId;
	this.playerList = [];
	this.usernameList = [];
	this.gameMain = null;
	this.limitPlayerNum = 2;
};
Room.prototype.addPlayer = function (socket, username) {
	var _player = new Player(socket, username);
	this.playerList.push(_player);
	this.usernameList.push(username);
};
Room.prototype.delPlayer = function (username) {
	for (var index = 0; index < this.playerList.length; index++) {
		var element = this.playerList[index];
		if (element.username == username) {
			this.playerList.splice(index, 1);
		}
	}
};
Room.prototype.resetGame = function(){
	this.playerList.forEach(function(ele){
		ele.ready = false;
	});
	this.gameMain = null;
};
Room.prototype.setPlayerReady = function (username) {
	var result = false;
	this.playerList.forEach(function (ele) {
		if (ele.username == username) {
			ele.ready = true;
			result = true;
		}
	});
	if (this.checkAbleStartGame() == true) {
		console.log('check open game');
		this.openGame();
	}
	return result;
};
Room.prototype.openGame = function () {
	this.gameMain = new GameMain({
		playerList: this.playerList,
		roomId: this.roomId
	});
	this.gameMain.startGame();
};
Room.prototype.setPlayerNotReady = function (username) {
	var result = false;
	this.playerList.forEach(function (ele) {
		if (ele.username == username) {
			ele.ready = false;
			result = true;
		}
	});
	return result;
};
Room.prototype.checkAbleStartGame = function () {
	var result = true;
	if (this.playerList.length == this.limitPlayerNum) {
		this.playerList.forEach(function (ele) {
			if (ele.ready == false) {
				result = false;
			}
		});
	}else{
		result = false;
	}
	return result;
};
Room.prototype.checkSameUsername = function (username) {
	var _index = this.usernameList.indexOf(username);
	if (_index == -1) {
		return false;
	} else {
		return true;
	}
};
Room.prototype.delPlayerBySocketId = function (socketId) {
	var _index = this.hasPlayerBySocketId(socketId);
	if (_index != -1) {
		this.playerList.splice(_index, 1);
	}
};
Room.prototype.getPlayerList = function () {
	var arr = [];
	this.playerList.forEach(function (ele) {
		arr.push({ username: ele.username, ready: ele.ready });
	})
	return arr;
};
Room.prototype.hasPlayerBySocketId = function (socketId) {
	var _index = -1;
	this.playerList.forEach(function (ele, index) {
		if (ele.id == socketId) {
			_index = index;
		}
	});
	return _index;
};
module.exports = Room;