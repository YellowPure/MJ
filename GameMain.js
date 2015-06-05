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
	//上一个操作的玩家索引
	this.lastPlayerIndex = null;
}
GameMain.prototype.startGame = function() {
	var self = this;
	this.game_state = 'GAME_START';
	this.table = new Table();
	this.cardBox = new CardBox();
	this.playerList.forEach(function(ele, index) {
		var _num = 13;
		if (index == 0) {
			_num = 14;
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
	var check_result = this.checkAllPlayerAblePeng();
	//有玩家可以抢碰牌桌中的牌
	if(check_result.length>0){
		this.waitPlayerAction(check_result);
	}else{
		this.turnNextPlayer(_player.username);
	}
	
};
GameMain.prototype.waitPlayerAction = function (playerInfoArr){
	if(playerInfoArr.length>0){
		this.curPlayerIndex = playerInfoArr[0].index;
		playerInfoArr[0].socket.emit('player turn',{index:this.curPlayerIndex,type:'peng'});
		playerInfoArr[0].socket.broadcast.emit('wait player',{username:playerInfoArr[0].username});
	}
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
	this.lastPlayerIndex = this.curPlayerIndex;
	this.curPlayerIndex = nextIndex;
	console.log('player turn', {index:nextIndex,type:'normal'});
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
GameMain.prototype.chi = function(name) {
	var _player = this.getPlayerByName(name);

	var prevPlayerIndex = this.getPrevPlayerIndexByCurPlayerName(_player.username);
	// 检查上一张牌是否是从自己的上家打出的
	if (prevPlayerIndex != this.lastPlayerIndex) {
		this.getPlayerByName(curPlayerName).socket.emit('chi', {
			result: -1,
			msg: 'not from prev player'
		});
		return;
	}
	var card_name = this.table.lastCard();
	if (card_name) {
		var result = this.machine.chi(_player.cardList, card_name);
		if (result) {
			_player.socket.emit('chi', {
				hand_list: [result[0], result[1]],
				table_card: result[2]
			});
		} else {
			_player.socket.emit('chi', {
				result: -1,
				msg: 'card check error'
			});
		}
	} else {
		_player.socket.emit('chi', {
			result: -1,
			msg: 'card check error'
		});
	}

};
GameMain.prototype.peng = function(name) {
	var result = this.checkPeng(name);
	if (result) {
		_player.socket.emit('peng', {
			result: 0,
			hand_list: [result[0], result[1]],
			table_card: result[2]
		});
	} else {
		_player.socket.emit('peng', {
			result: -1,
			msg: 'card check error'
		});
	}
};
GameMain.prototype.checkPeng = function(name) {
	var result = null;
	var _player = this.getPlayerByName(name);
	var card_name = this.table.lastCard();
	if (card_name) {
		var _result = this.machine.peng(_player.cardList, card_name);
		if (_result) {
			result = _result;
		}
	}
	return result;
}
GameMain.prototype.getPrevPlayerIndexByCurPlayerName = function(username) {
	var _index = -1;
	this.playerList.forEach(function(ele, index) {
		if (ele.username == username) {
			_index = index;
		}
	});
	if (_index != -1) {
		_index -= 1;
		if (_index < 0) {
			_index = this.playerList.length - 1;
		}
	}
	return _index;
};
GameMain.prototype.gang = function(name) {
	var _player = this.getPlayerByName(name);
	var card_name = this.table.lastCard();
	var result = this.machine.gang(_player.cardList, card_name);
	if (result.result) {
		if (result.type == 1) {
			_player.socket.emit('gang', {
				result: 0,
				hand_list: result.result
			});
		} else if (result.type == 2) {
			_player.socket.emit('gang', {
				result: 0,
				hand_list: [result[0], result[1], result[2]],
				table_card: result[3]
			});
		}

	} else {
		_player.socket.emit('gang', {
			result: -1,
			msg: 'card check error'
		});
	}
};
GameMain.prototype.checkAllPlayerAblePeng = function() {
	var results = [];
	for (var i = 0; i < this.playerList.length; i++) {
		var _result = this.checkPeng(this.playerList[i].username);
		if (_result) {
			results.push({result:_result,player:this.playerList[i],index:i});
		}
	}
	return results;
};
GameMain.prototype.checkTurn = function() {
	var pass = true;
	var result_hu = this.checkHu();
	var result_peng = this.checPeng();
	if (result_peng.length == 0 && result_hu.length == 0) {
		pass = true;
	} else {
		pass = false;
	}
	return pass;
};
GameMain.prototype.checkHu = function() {
	var result = true;
	return result;
};
GameMain.prototype.wait = function() {
	this.curPlayerIndex = -1;
}
module.exports = GameMain;