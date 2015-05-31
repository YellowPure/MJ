//var Card = require('./Card');
function CardBox() {
	this.list = new Array();
	this.init();
}
CardBox.prototype.init = function () {
	this.initList();
	this.randomList();
};
CardBox.prototype.initList = function () {
	var wan_list = ['1_wan', '2_wan', '3_wan', '4_wan', '5_wan', '6_wan', '7_wan', '8_wan', '9_wan'];
	var tiao_list = ['1_tiao', '2_tiao', '3_tiao', '4_tiao', '5_tiao', '6_tiao', '7_tiao', '8_tiao', '9_tiao'];
	var tong_list = ['1_tong', '2_tong', '3_tong', '4_tong', '5_tong', '6_tong', '7_tong', '8_tong', '9_tong'];
	var feng_list = ['dong_f', 'nan_f', 'bei_f', 'xi_f'];
	var other_list = ['hz_o', 'fc_o', 'bb_o'];
	for (var i = 0; i < 4; i++) {
		this.list = this.list.concat(wan_list);
		this.list = this.list.concat(tiao_list);
		this.list = this.list.concat(tong_list);
		this.list = this.list.concat(feng_list);
		this.list = this.list.concat(other_list);
	}
};
CardBox.prototype.randomList = function () {
	var arr = this.list;
	var arr1 = [];
	while (arr.length > 0) {
		var random_index = parseInt(Math.random() * arr.length);
		arr1.push(arr[random_index]);
		arr.splice(random_index, 1);
	}
	this.list = arr1;
};
CardBox.prototype.dealCards = function (cardNum) {
	if (this.list.length > cardNum) {
		console.log(this.list.length, 'cardBox');
		return this.list.splice(0, cardNum);
	}
	return null;
};
CardBox.prototype.checkArrIsEqual = function (array) {
	var same = true;
	for (var index = 0; index < array.length; index++) {
		var element = array[index];
		if (element != array[0]) {
			same = false;
		}
	}
	return same;
};
CardBox.prototype.getTypeByMatchArr = function (array) {
	var arr = [];
	if (Object.prototype.toString.call(array) === "[object Array]") {
		array.forEach(function (val) {
			arr.push(val.split('_')[1]);
		})
	}
};
CardBox.prototype.getNumsByMatchArr = function (array) {
	var arr = [];
	if (Object.prototype.toString.call(array) === "[object Array]") {
		array.forEach(function (val) {
			arr.push(val.split('_')[0]);
		})
	}
};
CardBox.prototype.peng = function (card_one, card_two, socket) {
	var match_card = table.lastCard();
	var match_arr = [match_card, card_one, card_two];
	var type_arr = this.getTypeByMatchArr(match_arr);
	var num_arr = this.getNumsByMatchArr(match_arr);

	var same_type = this.checkArrIsEqual(type_arr);
	var same_num = this.checkArrIsEqual(num_arr);

	if (same_num && same_type) {
		//满足碰的条件
	} else {
		socket.emit('not able peng', { error: '不满足条件' });
	}
}
CardBox.prototype.gang = function (card_one, card_two, card_three) {
	var match_card = table.lastCard();
	var match_arr = [match_card, card_one, card_two, card_three];
	var type_arr = this.getTypeByMatchArr(match_arr);
	var num_arr = this.getNumsByMatchArr(match_arr);

	var same_type = this.checkArrIsEqual(type_arr);
	var same_num = this.checkArrIsEqual(num_arr);



	if (same_num && same_type || this.check_gane()) {
		//
	} else {
		Global.io.to(this.roomId).emit('not able gane', { error: '不满足条件' });
	}
}
CardBox.prototype.check_gang = function () {
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
};
CardBox.prototype.hu = function () {

};
CardBox.prototype.check_hu = function () {
	var wan_arr = this.getTypesByList('wan');
	var feng_arr = this.getTypesByList('f');
	var o_arr = this.getTypesByList('o');
	var tiao_arr = this.getTypesByList('tiao');
	var tong_arr = this.getTypesByList('tong');

	var wan_info = this.getInfoByList(wan_arr);
},
CardBox.prototype.getTypesArrByList = function (type) {
	var arr = [];
	this.card_list.forEach(function (val, index) {
		var tp = val.split('_')[1];
		if (tp == type) {
			arr.push(val);
		}
	});
	return arr;
};
CardBox.prototype.getInfoByList = function (list) {
	var obj = {};
	if (list.length) {
		obj['duizi'] = this.check_duizi(list);
		obj['juzi'] = this.check_juzi(list);

		if (list[0].split('_')[1] != 'o' || list[0].split('_')[1] != 'f') {
			obj['shunzi'] = this.check_shunzi(list);
		}
	}
	return obj;
};
CardBox.prototype.check_duizi = function (array) {
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
};
CardBox.prototype.check_juzi = function (array) {
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
};
CardBox.prototype.check_shunzi = function (array) {
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
};
module.exports = CardBox;