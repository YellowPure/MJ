var CardBox = require('./CardBox');
var Table = require("./Table");
var Global = require("./Global");
var Machine = require("./Machine");

function GameMain(option) {
	this.playerList = option.playerList || null;
	this.roomId = option.roomId || null;
	this.GAME_STATE = "NOT_BEGIN";
	this.table = null;
	this.cardBox = null;
	this.machine = Object.create(Machine);
	this.curPlayerIndex = 0;
}
GameMain.prototype.startGame = function() {
	var self = this;
	this.game_state = 'GAME_START';
	//	this.getCards();
	//	this.card_list.sort();
	//	this.socket.emit('count down');
	this.table = new Table();
	this.cardBox = new CardBox();
	this.playerList.forEach(function(ele,index) {
		var _num=13;
		if(index==0){
			_num=14;
		}
		var cards = self.cardBox.dealCards(_num);
		ele.cardList = cards;
		ele.socket.emit('start game', {
			card_list: cards
		});
	});
	// this.dealCardsToPlayers();
	// Global.io.to(this.roomId).emit('start game');
};
GameMain.prototype.dealCardsToPlayers = function() {
	var self = this;
	this.playerList.forEach(function(ele) {
		var cards = self.cardBox.dealCards(13);
		ele.cardList = cards;
		ele.socket.emit('deal card', {
			card_list: cards
		});
	});
};
GameMain.prototype.getThrowCard = function(cardName, socket) {
	console.log('gameMain get throw Card');
	var _player = this.getPlayerByName(socket.username);
	var _index = _player.cardList.indexOf(cardName);
	console.log('_player:', this.curPlayerIndex);
	if (_player.username != this.playerList[this.curPlayerIndex].username) {
		console.log('error : not cur action player!');
		return;
	}
	if (_index != -1) {
		_player.cardList.splice(_index, 1);
	}
	socket.emit('throw success', {
		card_name: cardName
	});
	socket.broadcast.to(this.roomId).emit('table add card', {
		card_name: cardName
	});
	this.table.addCard(cardName);
	this.turnNextPlayer(_player.username);
};
GameMain.prototype.getPlayerByName = function(username) {
	var result = null;
	this.playerList.forEach(function(ele, index) {
		if (ele.username == username) {
			result = ele;
		}
	});
	return result;
};
GameMain.prototype.turnNextPlayer = function(username) {
	var nextIndex = 0;
	var self = this;
	var _player = this.getPlayerByName(username);
	var _index = this.playerList.indexOf(_player);
	if (_index >= this.playerList.length - 1) {
		nextIndex = 0;
	} else {
		nextIndex = _index + 1;
	}
	this.curPlayerIndex = nextIndex;
	console.log('player turn ', nextIndex);
	var _name = this.playerList[nextIndex].username;
	Global.io.to(this.roomId).emit('player turn', {
		name: _name
	});
	this.dealCardToPlayer(_name);
};
GameMain.prototype.dealCardToPlayer = function(username) {
	var _player = this.getPlayerByName(username);
	var card = this.cardBox.dealCards(1);
	_player.socket.emit('deal card', {
		card_list: card
	});
};
GameMain.prototype.stopGame = function() {
	this.game_state = "GAME_STOP";
};

//var GameMain = {
//	init: function (roomId, socketId) {
//		this.roomId = roomId || null;
//		this.socketId = socketId;
//		this.players = [];
//		this.card_list = [];
//		this.game_state = 'NOT_BEGIN';
//		this.player_nums = 2;
//		this.curPlayerIndex = 0;
//		var self = this;
//		console.log('new game main', this.roomId, this.socketId);
//	},
//	addPlayer: function (playername) {
//		console.log('do here!');
//		this.players.push({ name: playername, ready: false });
//	},
//	addPlayers: function (list) {
//		var self = this;
//		list.forEach(function (value, index) {
//			self.addPlayer(value);
//		})
//	},
//	delPlayer: function (player) {
//		console.log('doo here!');
//		for (var i = 0; i < this.players.length; i++) {
//			if (this.players[i].name == player) {
//				this.players.splice(i, 1);
//			}
//		}
//	},
//	setPlayerReady: function (name) {
//		console.log("setPlayerReady:", this.roomId, name);
//		for (var i = 0; i < Global.roomPlayers[this.roomId].length; i++) {
//			if (Global.roomPlayers[this.roomId][i].username == name) {
//				Global.roomPlayers[this.roomId][i].ready = true;
//			}
//		}
//	},
//	setCurPlayerByData: function (data) {
//		var self = this;
//		var arr = Global.roomPlayer(self.roomId);
//		var index = arr.indexOf(data.username);
//
//	},
//	setPlayerNotReady: function (name) {
//		for (var i = 0; i < Global.roomPlayers[this.roomId].length; i++) {
//			if (Global.roomPlayers[this.roomId][i].username == name) {
//				Global.roomPlayers[this.roomId][i].ready = false;
//			}
//		}
//	},
//	getPlayerInfoByName: function (playerName) {
//		var result = null;
//		for (var i = 0; i < this.players.length; i++) {
//			if (this.players[i].name == playername) {
//				result = this.players[i];
//			}
//		};
//		return result;
//	},
//	getPlayerIndexByName: function (username) {
//		var _index = null;
//		Global.roomPlayers[this.roomId].forEach(function (ele, index) {
//			if (ele.username == username) {
//				_index = index;
//			}
//		});
//		return _index;
//	},
//	checkToStartGame: function () {
//		var pass = true;
//		var limit_num = this.player_nums;//debug:1;  build:4
//		console.log("(Global.roomPlayers[this.roomId].length", Global.roomPlayers[this.roomId].length);
//		if (Global.roomPlayers[this.roomId].length == limit_num) {
//			for (var i = 0; i < Global.roomPlayers[this.roomId].length; i++) {
//				if (Global.roomPlayers[this.roomId][i].ready == false) {
//					pass = false;
//				}
//			}
//		} else {
//			pass = false;
//		}
//		console.log('all player in!!', pass);
//		return pass;
//	},
//	countDown: function (callback, socket) {
//		var self = this;
//		console.log('count down', this.roomId);
//		socket.emit('count down');
//		setTimeout(function () {
//			if (callback && typeof callback == "function") {
//				callback();
//			}
//		}, 3000);
//	},
//	startGame: function (socket) {
//		this.game_state = 'GAME_START';
//		this.getCards();
//		this.card_list.sort();
//		//	this.socket.emit('count down');
//		console.log(socket.username, 'username');
//		socket.emit('start game', { card_list: this.card_list });
//	},
//	endAnimated: function (username) {
//		var _index = this.getPlayerIndexByName(username);
//		if (_index == this.curPlayerIndex) {
//			this.playerGetOneCard();
//		}
//	},
//	playerGetOneCard: function () {
//		var username = Global.roomPlayers[this.roomId][this.curPlayerIndex].username;
//		var arr = Global.io.sockets.sockets;
//		var _sk;
//		arr.forEach(function (ele) {
//			if (ele.username == username) {
//				_sk = ele;
//			}
//		});
//		if (_sk) {
//			var card = mj_list.dealOneCard(_sk.roomId);
//			console.log('player get one card!');
//			_sk.emit('player get one card', { name: _sk.username, card: card });
//		}
//	},
//
//	getCards: function () {
//		console.log(mj_list.list[this.roomId].length, 'gameMain getCards');
//		this.card_list = mj_list.dealCards(this.roomId);
//		console.log('card_list', this.card_list.length);
//	},
//	throwOneCard: function (name, socketId, username) {
//		console.log('gameMain throwOneCard', this.socketId);
//		var _index = this.card_list.indexOf(name);
//		var _playerIndex = this.getPlayerIndexByName(username);
//		console.log('_playerIndex', _playerIndex, this.curPlayerIndex);
//		if (_playerIndex != this.curPlayerIndex) {
//			console.log('error : not cur action player!');
//			return;
//		}
//		if (_index != -1) {
//			this.card_list.splice(_index, 1);
//			var $index = Global.io.sockets.sockets;
//		}
//		table.addCard(this.roomId, name);
//		this.turnNextPlayer(username);
//	},
//	turnNextPlayer: function (username) {
//		var nextIndex = 0;
//		var self = this;
//		var _index = this.getPlayerIndexByName(username);
//		if (_index >= self.player_nums - 1) {
//			nextIndex = 0;
//		} else {
//			nextIndex = _index + 1;
//		}
//		this.curPlayerIndex = nextIndex;
//		console.log('player turn ', nextIndex);
//		this.playerGetOneCard();
//		Global.io.to(this.roomId).emit('player turn', { name: Global.roomPlayers[this.roomId][nextIndex].username });
//	},
//	pauseGame: function () {
//		this.game_state = "GAME_PAUSE";
//	},
//	endGame: function () {
//		this.game_state = "GAME_END";
//	},
//
//
//}
module.exports = GameMain;