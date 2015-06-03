var Machine = {
	checkArrIsEqual: function(array) {
		var same = true;
		for (var index = 0; index < array.length; index++) {
			var element = array[index];
			if (element != array[0]) {
				same = false;
			}
		}
		return same;
	},
	getTypeByMatchArr: function(array) {
		var arr = [];
		if (Object.prototype.toString.call(array) === "[object Array]") {
			array.forEach(function(val) {
				arr.push(val.split('_')[1]);
			});
		}
		return arr;
	},
	getNumsByMatchArr: function(array) {
		var arr = [];
		if (Object.prototype.toString.call(array) === "[object Array]") {
			array.forEach(function(val) {
				arr.push(val.split('_')[0]);
			})
		}
		return arr;
	},
	chi: function(card_list, match_card) {
		var self = this;
		var check_three_card = function(card_one, card_two, card_three) {
			var _result = null;
			var match_arr = [card_one, card_two,card_three];
			var type_arr = self.getTypeByMatchArr(match_arr);
			var num_arr = self.getNumsByMatchArr(match_arr);
			// console.log('match_arr',match_arr,num_arr);
			var same_type = self.checkArrIsEqual(type_arr);

			var be_list = true;
			var item = null;
			num_arr.sort();
			for (var i = 0; i < num_arr.length; i++) {
				item = num_arr[i];
				if (i > 0) {
					num_arr[i - 1]++;
					if (num_arr[i - 1] != item) {
						// console.log('be_list:false',num_arr[i-1],item);
						be_list = false;
					}
				}
			}
			// console.log('same_type',same_type);
			// console.log('num_arr',num_arr);
			// console.log('type_arr',type_arr);
			// console.log('---------------------------------------------------------------');
			if (same_type && be_list) {
				_result = match_arr;
			}
			return _result;
		};

		var result = null;
		var match_type = match_card.split('_')[1];
		var _arr = [];
		var two_card_arr= [];
		card_list.forEach(function(ele) {
			var _type = ele.split('_')[1];
			if (_type == match_type) {
				_arr.push(ele);
			}
		});
		_arr.sort();
		for (var i = 0; i < _arr.length; i++) {
			var j=i+1;
			if (j<_arr.length){
				two_card_arr.push([_arr[i],_arr[j]]);
			}
		}
		// console.log(two_card_arr,match_card,'three_card_arr');
		for (var i = 0; i < two_card_arr.length; i++) {
			var _res = check_three_card(two_card_arr[i][0],two_card_arr[i][1],match_card);
			console.log('_res',_res);
			if(_res){
				result = _res;
			}
		}
		console.log('check chi result',result);
		return result;
	},
	peng: function(card_one, card_two, socket) {
		var match_card = table.lastCard();
		var match_arr = [match_card, card_one, card_two];
		var type_arr = this.getTypeByMatchArr(match_arr);
		var num_arr = this.getNumsByMatchArr(match_arr);

		var same_type = this.checkArrIsEqual(type_arr);
		var same_num = this.checkArrIsEqual(num_arr);

		if (same_num && same_type) {
			//满足碰的条件
		} else {
			socket.emit('not able peng', {
				error: '不满足条件'
			});
		}
	},
	gang: function(card_one, card_two, card_three) {
		var match_card = table.lastCard();
		var match_arr = [match_card, card_one, card_two, card_three];
		var type_arr = this.getTypeByMatchArr(match_arr);
		var num_arr = this.getNumsByMatchArr(match_arr);

		var same_type = this.checkArrIsEqual(type_arr);
		var same_num = this.checkArrIsEqual(num_arr);



		if (same_num && same_type || this.check_gane()) {
			//
		} else {
			Global.io.to(this.roomId).emit('not able gane', {
				error: '不满足条件'
			});
		}
	},
	check_gang: function() {
		var _check = {};
		var _indexArr = [];
		this.card_list.forEach(function(val, index) {
			if (_check[val] == undefined) {
				_check[val] = new Array();
				_indexArr.push(_check[val]);
			} else {
				_check[val].push(index);
			}
		});
		_indexArr.forEach(function(val) {
			if (val.length == 4) {
				return true;
			}
		});
		return false;
	},
	hu: function() {

	},
	check_hu: function() {
		var wan_arr = this.getTypesByList('wan');
		var feng_arr = this.getTypesByList('f');
		var o_arr = this.getTypesByList('o');
		var tiao_arr = this.getTypesByList('tiao');
		var tong_arr = this.getTypesByList('tong');

		var wan_info = this.getInfoByList(wan_arr);
	},
	getTypesArrByList: function(type) {
		var arr = [];
		this.card_list.forEach(function(val, index) {
			var tp = val.split('_')[1];
			if (tp == type) {
				arr.push(val);
			}
		});
		return arr;
	},
	getInfoByList: function(list) {
		var obj = {};
		if (list.length) {
			obj['duizi'] = this.check_duizi(list);
			obj['juzi'] = this.check_juzi(list);

			if (list[0].split('_')[1] != 'o' || list[0].split('_')[1] != 'f') {
				obj['shunzi'] = this.check_shunzi(list);
			}
		}
		return obj;
	},
	check_duizi: function(array) {
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
	},
	check_juzi: function(array) {
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
	},
	check_shunzi: function(array) {
		var shunzi_arr = [];
		var nums_arr = [];
		if (array.length >= 3) {
			array.sort();
			array.forEach(function(val, index) {
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
}
module.exports = Machine;