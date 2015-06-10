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
	this.insert_list = [];
	this.record_player = null;
}
GameMain.prototype.startGame = function() {
	var self = this;
	this.GAME_STATE = 'GAME_START';
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
	if (_player.username != this.playerList[this.curPlayerIndex].username) {
		_player.socket.emit('throw', {
			result: -1,
			msg: 'error : not cur action player!'
		});
		return;
	}
	if (this.GAME_STATE == 'GAME_WAIT') {
		if (this.record_player != _player) {
			_player.socket.emit('throw', {
				result: -1,
				msg: 'error : game state wait!'
			});
			return;
		}
	}
	// if (_player.onlyPeng == true) {
	// 	console.log('error: only peng');
	// 	_player.socket.emit('throw', {
	// 		result: -1,
	// 		msg: "error: only peng"
	// 	});
	// 	return;
	// }
	if (_index != -1) {
		_player.cardList.splice(_index, 1);
	}
	socket.emit('throw', {
		result: 0,
		card_name: cardName
	});
	socket.broadcast.to(this.roomId).emit('table add card', {
		card_name: cardName
	});
	this.table.addCard(cardName);

	this.turnNext();
};
GameMain.prototype.turnNext = function() {
	this.checkNotCurPlayerAblePeng();
	if (this.insert_list.length > 0) {
		this.waitPlayerAction();
		return;
	}
	this.turnNextPlayer();
};
GameMain.prototype.waitPlayerAction = function() {
	this.curPlayerIndex = this.playerList.indexOf(this.insert_list[0].player);
	this.record_player = this.playerList[this.curPlayerIndex];
	this.insert_list[0]['player'].socket.emit('player turn', {
		index: this.curPlayerIndex
	});
	this.GAME_STATE = "GAME_WAIT";
	this.insert_list[0]['player'].socket.broadcast.emit('wait player', {
		username: this.insert_list[0].username
	});
};
GameMain.prototype.guo = function(username) {
	if (this.record_player&&username != this.record_player.username) {
		return;
	}
	this.insert_list.forEach(function(ele, index) {
		if (ele.player.username == username) {
			this.GAME_STATE = "GAME_START";
			this.insert_list.splice(index, 1);
		}
	}, this);
	this.turnNext();
	// this.checkAllPlayerAblePeng();
	// //有玩家可以抢碰牌桌中的牌
	// if (this.insert_list.length > 0) {
	// 	this.waitPlayerAction();
	// } else {
	// 	this.curPlayerIndex = this.playerList.indexOf(this.record_player);
	// 	this.turnNextPlayer(this.record_player.username);
	// }
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
GameMain.prototype.turnNextPlayer = function() {
	var nextIndex = 0;
	var self = this;
	var _player = this.playerList[this.curPlayerIndex];
	var _index = this.playerList.indexOf(_player);
	if (_index >= this.playerList.length - 1) {
		nextIndex = 0;
	} else {
		nextIndex = _index + 1;
	}
	this.lastPlayerIndex = this.curPlayerIndex;
	this.curPlayerIndex = nextIndex;

	var _name = this.playerList[nextIndex].username;
	Global.io.to(this.roomId).emit('player turn', {
		name: _name
	});
	//检查下一位操作玩家是否可吃牌 如可吃 不发牌
	var chi_result = this.machine.chi(this.playerList[this.curPlayerIndex].cardList, this.table.lastCard());
	// console.log('this.playerList[this.curPlayerIndex]', this.playerList[this.curPlayerIndex].username);
	if (chi_result) {
		this.record_player = this.playerList[this.curPlayerIndex];
		this.GAME_STATE = "GAME_WAIT";
	} else {
		this.dealCardToPlayer(_name);
	}
};
GameMain.prototype.dealCardToPlayer = function(username) {
	var _player = this.getPlayerByName(username);
	var card = this.cardBox.dealCards(1);
	_player.addCard(card[0]);
	_player.socket.emit('deal card', {
		card_list: card
	});
};
GameMain.prototype.stopGame = function() {
	this.game_state = "GAME_STOP";
};
GameMain.prototype.chi = function(name) {
	// console.log('chi playername:', name);
	var _player = this.getPlayerByName(name);
	if (this.GAME_STATE == 'GAME_WAIT' && this.record_player && this.record_player.username != name) {
		// console.log('game state :wait');
		_player.socket.emit('chi', {
			result: -1,
			msg: 'error : game state wait!'
		});
		return;
	}
	this.record_player = null;
	var prevPlayerIndex = this.getPrevPlayerIndexByCurPlayerName(_player.username);
	// 检查上一张牌是否是从自己的上家打出的
	if (prevPlayerIndex != this.lastPlayerIndex) {
		this.getPlayerByName(name).socket.emit('chi', {
			result: -1,
			msg: 'not from prev player'
		});
		return;
	}
	var card_name = this.table.lastCard();
	if (card_name) {
		var result = this.machine.chi(_player.cardList, card_name);
		if (result) {
			this.GAME_STATE = "GAME_START";

			_player.socket.emit('chi', {
				hand_list: [result[0], result[1]],
				table_card: result[2]
			});
			_player.holdListAdd(result[0],result[1]);
			_player.delCards(result[0],result[1]);
			this.table.delCard(result[2]);
			_player.socket.broadcast.to(this.roomId).emit('table remove card', {
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
	var _player = this.getPlayerByName(name);
	// console.log('this.GAME_STATE::',this.GAME_STATE,this.record_player.username,name);
	if (this.GAME_STATE == 'GAME_WAIT' && this.record_player && this.record_player.username != name) {
		console.log('game state :wait');
		_player.socket.emit('peng', {
			result: -1,
			msg: 'error : game state wait!'
		});
		return;
	}
	this.record_player = null;
	var result = this.checkPeng(_player);
	// console.log('result_peng:', result);
	if (result) {
		_player.onlyPeng = false;
		this.GAME_STATE = "GAME_START";
		_player.delCards(result[0],result[1]);
		_player.holdListAdd(result[0],result[1]);
		this.table.delCard(result[2]);
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
GameMain.prototype.checkPeng = function(_player) {
	var result = null;
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
	if (this.GAME_STATE == 'GAME_WAIT' && this.record_player && this.record_player.username != name) {
		console.log('game state :wait');
		_player.socket.emit('gang', {
			result: -1,
			msg: 'error : game state wait!'
		});
		return;

	}
	this.record_player = null;
	var card_name = this.table.lastCard();
	var result = this.machine.gang(_player.cardList, card_name);
	if (result.result) {
		this.GAME_STATE = "GAME_START";
		if (result.type == 1) {
			_player.delCards(result.result[0],result.result[1],result.result[2],result.result[3]);
			_player.holdListAdd(result.result[0],result.result[1],result.result[2],result.result[3]);
			_player.socket.emit('gang', {
				result: 0,
				hand_list: result.result
			});
		} else if (result.type == 2) {
			_player.delCards(result.result[0],result.result[1],result.result[2]);
			_player.holdListAdd(result.result[0],result.result[1],result.result[2]);
			this.table.delCard(result.result[3]);
			_player.socket.emit('gang', {
				result: 0,
				hand_list: [result.result[0], result.result[1], result.result[2]],
				table_card: result.result[3]
			});
		}

	} else {
		_player.socket.emit('gang', {
			result: -1,
			msg: 'card check error'
		});
	}
};
GameMain.prototype.checkNotCurPlayerAblePeng = function() {
	// var results = [];
	var checkList = [];
	// console.log('checkNotCurPlayerAblePeng::', this.curPlayerIndex);
	var tempList = this.playerList;
	var a_arr = tempList.slice(this.curPlayerIndex, this.playerList.length);
	var b_arr = tempList.slice(0, this.curPlayerIndex);
	checkList = a_arr.concat(b_arr);

	for (var i = 0; i < checkList.length; i++) {
		var _result = this.checkPeng(checkList[i]);
		if (_result) {
			// checkList[i].onlyPeng = true;
			console.log('_result:', _result, checkList[i]);
			this.insert_list.push({
				result: _result,
				player: checkList[i]
			});
		}

	}
	// return results;
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