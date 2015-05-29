var Player = require('./Player');

function Room(roomId) {
	this.roomId = roomId;
	this.playerList = [];
	this.usernameList = [];
};
Room.prototype.addPlayer = function(socket, username) {
	var _player = new Player(socket, username);
	this.playerList.push(_player);
	this.usernameList.push(username);
}
Room.prototype.checkSameUsername = function(username){
	var _index=this.usernameList.indexOf(username);
	if(_index==-1){
		return false;
	}else{
		return true;
	}
}
Room.prototype.delPlayerBySocketId = function(socketId) {
	var _index = this.hasPlayerBySocketId(socketId);
	if (_index != -1) {
		this.playerList.splice(_index, 1);
	}
}
Room.prototype.hasPlayerBySocketId = function(socketId) {
	var _index = -1;
	this.playerList.forEach(function(ele, index) {
		if (ele.id == socketId) {
			_index = index;
		}
	});
	return _index;
}
module.exports = room;