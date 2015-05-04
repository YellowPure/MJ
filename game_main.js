var mj_list = require('./mj_list');
var table = require("./table");
function GameMain(roomId) {
	this.roomId = roomId || null;
	this.players = [];
	this.card_list = [];
	this.game_state = 'NOT_BEGIN';
}
GameMain.prototype.addPlayer = function (playername) {
	console.log('do here!');
	this.players.push({ name: playername, ready: false });
}
GameMain.prototype.addPlayers = function (list) {
	var self = this;
	list.forEach(function (value, index) {
		self.addPlayer(value);
	})
}
GameMain.prototype.delPlayer = function (player) {
	console.log('doo here!');
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].name == player) {
			this.players.splice(i, 1);
		}
	}
}
GameMain.prototype.setPlayerReady = function (name) {
	console.log("setPlayerReady:", this.roomId, name);
	for (var i = 0; i < global.roomPlayers[this.roomId].length; i++) {
		if (global.roomPlayers[this.roomId][i].username == name) {
			global.roomPlayers[this.roomId][i].ready = true;
		}
	}
//	var ableToStart = this.checkToStartGame();
//	if (ableToStart == true) {
//		console.log('count down!');
//		this.countDown();
//	}
}
GameMain.prototype.setPlayerNotReady = function (name) {
	for (var i = 0; i < global.roomPlayers[this.roomId].length; i++) {
		if (global.roomPlayers[this.roomId][i].username == name) {
			global.roomPlayers[this.roomId][i].ready = false;
		}
	}
}
GameMain.prototype.getPlayerInfoByName = function (playerName) {
	var result = null;
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].name == playername) {
			result = this.players[i];
		}
	};
	return result;
}
GameMain.prototype.checkToStartGame = function () {
	var pass = true;
	if (global.roomPlayers[this.roomId].length == 4) {
		for (var i = 0; i < global.roomPlayers[this.roomId].length; i++) {
			if (global.roomPlayers[this.roomId][i].ready == false) {
				pass = false;
			}
		}
	} else {
		pass = false;
	}
	console.log('all player in!!', pass);
	return pass;
}
GameMain.prototype.countDown = function (callback) {
	var self = this;
	console.log('count down', this.roomId);
	global.io_obj.to(this.roomId).emit('count down');
	setTimeout(function () {
		if(callback&&typeof callback =="function"){
			callback();
		}
//		self.startGame();
	}, 3000);
}
GameMain.prototype.startGame = function () {
	this.game_state = 'GAME_START';
	global.io_obj.to(this.roomId).emit('start game');
	this.getCards();
	this.getOneCard();
}
GameMain.prototype.getCards = function () {
	this.card_list = mj_list.dealCards(this.roomId);
	console.log('card_list', this.card_list.length);
}
GameMain.prototype.getOneCard = function () {
	this.card_list.push(mj_list.dealOneCard());
}
GameMain.prototype.throwOneCard = function (name) {
	var _index = this.card_list.indexOf(name);
	if (_index != -1) {
		this.card_list.splice(_index, 1);
	}
	table.addCard(this.roomId, name);
}
GameMain.prototype.pauseGame = function () {
	this.game_state = "GAME_PAUSE";
}
GameMain.prototype.endGame = function () {
	this.game_state = "GAME_END";
}
GameMain.prototype.throwOneCard = function (card) {
	var index = this.card_list.indexOf(card);
	if (index != -1) {
		table.addCard(this.roomId, this.card_list[index]);
		this.card_list.splice(index, 1);
	}
}
GameMain.prototype.getOneCard = function (card) {
	var card = mj_list.dealOneCard(this.roomId);
	this.list.push(card);
}
GameMain.prototype.chi = function (card_one, card_two) {
	var match_card = table.lastCard();
	var match_arr = [match_card, card_one, card_two];
	var type_arr = this.getTypeByMatchArr(match_arr);
	var num_arr = this.getNumsByMatchArr(match_arr);

	var same_type = this.checkArrIsEqual(type_arr);

	var be_list = true;
	var item = null;
	num_arr.sort();
	for (var i = 0; i < num_arr.length; i++) {
		item = num_arr[i];
		if (i > 0) {
			num_arr[i - 1]++;
			if (num_arr[i - 1] != item) {
				be_list = false;
			}
		}
	}
	if (same_type && be_list) {
		//符合吃的条件
		//		global.io_obj.to(this.roomId).emit('chi',{card:match_card});
	} else {
		global.io_obj.to(this.roomId).emit('not able chi', { error: '不满足条件' });
	}
}
GameMain.prototype.peng = function (card_one, card_two) {
	var match_card = talbe.lastCard();
	var match_arr = [match_card, card_one, card_two];
	var type_arr = this.getTypeByMatchArr(match_arr);
	var num_arr = this.getNumsByMatchArr(match_arr);

	var same_type = this.checkArrIsEqual(type_arr);
	var same_num = this.checkArrIsEqual(num_arr);

	if (same_num && same_type) {
		//满足碰的条件
	} else {
		global.io_obj.to(this.roomId).emit('not able peng', { error: '不满足条件' });
	}
}

GameMain.prototype.gang = function (card_one, card_two, card_three) {
	var match_card = table.lastCard();
	var match_arr = [match_card, card_one, card_two, card_three];
	var type_arr = this.getTypeByMatchArr(match_arr);
	var num_arr = this.getNumsByMatchArr(match_arr);

	var same_type = this.checkArrIsEqual(type_arr);
	var same_num = this.checkArrIsEqual(num_arr);



	if (same_num && same_type || this.check_gane()) {
		//
	} else {
		global.io_obj.to(this.roomId).emit('not able gane', { error: '不满足条件' });
	}
}
GameMain.prototype.check_gang = function(){
	var _check = {};
	var _indexArr = [];
	this.card_list.forEach(function (val, index) {
		if (_check[val] == undefined) {
			_check[val] = new Array();
			_indexArr.push(_check[val]);
		} else {
			_check[val].push(index);
		}
	});
	_indexArr.forEach(function (val) {
		if (val.length == 4) {
			return true;
		}
	});
	return false;
}
GameMain.prototype.hu = function () {

}
GameMain.prototype.check_hu = function () {
	var wan_arr = this.getTypesByList('wan');
	var feng_arr = this.getTypesByList('f');
	var o_arr = this.getTypesByList('o');
	var tiao_arr = this.getTypesByList('tiao');
	var tong_arr = this.getTypesByList('tong');

	var wan_info = this.getInfoByList(wan_arr);
}
GameMain.prototype.getTypesArrByList = function (type) {
	var arr = [];
	this.card_list.forEach(function (val, index) {
		var tp = val.split('_')[1];
		if (tp == type) {
			arr.push(val);
		}
	});
	return arr;
}
GameMain.prototype.getInfoByList = function (list) {
	var obj = {};
	if (list.length) {
		obj['duizi'] = this.check_duizi(list);
		obj['juzi'] = this.check_juzi(list);

		if (list[0].split('_')[1] != 'o' || list[0].split('_')[1] != 'f') {
			obj['shunzi'] = this.check_shunzi(list);
		}
	}
	return obj;
}
GameMain.prototype.check_duizi = function (array) {
	var dui_arr = [];

	if (array.length >= 2) {
		array.sort();
		for (var i = 0; i < array.length - 1; i++) {
			var ele = array[i];
			var ele1 = array[i + 1];
			if (ele == ele1) {
				dui_arr.push([ele, ele]);
				i++;
			}
		}
	}

	return dui_arr;
}
GameMain.prototype.check_juzi = function (array) {
	var juzi_arr = [];
	if (array.length >= 3) {
		array.sort();
		for (var index = 0; index < array.length - 2; index++) {
			var element = array[index];
			var element1 = array[index + 1];
			var element2 = array[index + 2];
			if (element == element1 == element2) {
				juzi_arr.push([element, element, element]);
				index += 2;
			}
		}
	}

	return juzi_arr;
}
GameMain.prototype.check_shunzi = function (array) {
	var shunzi_arr = [];
	var nums_arr = [];
	if (array.length >= 3) {
		array.sort();
		array.forEach(function (val, index) {
			nums_arr.push(val.split('_')[0]);
		});
		for (var index = 0; index < nums_arr.length; index++) {
			var element = nums_arr[index];
			var element1 = nums_arr[index + 1];
			var element2 = nums_arr[index + 2];
			if (element1 == (element + 1) && element2 == (element1 + 1)) {
				index += 2;
				shunzi_arr.push([element, element1, element2]);
			}
		}
	}
	return shunzi_arr;
}
GameMain.prototype.checkArrIsEqual = function (array) {
	var same = true;
	for (var index = 0; index < array.length; index++) {
		var element = array[index];
		if (element != array[0]) {
			same = false;
		}
	}
	return same;
}
GameMain.prototype.getTypeByMatchArr = function (array) {
	var arr = [];
	if (Object.prototype.toString.call(array) === "[object Array]") {
		array.forEach(function (val) {
			arr.push(val.split('_')[1]);
		})
	}
}
GameMain.prototype.getNumsByMatchArr = function (array) {
	var arr = [];
	if (Object.prototype.toString.call(array) === "[object Array]") {
		array.forEach(function (val) {
			arr.push(val.split('_')[0]);
		})
	}
}
module.exports = GameMain;