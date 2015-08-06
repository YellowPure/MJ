var Machine = {
	checkArrIsEqual: function(array) {
		var same = true;
		for (var index = 0; index < array.length; index++) {
			var element = array[index];
			// console.log('element1ment   array[0]',element,array[0]);
			if (element != array[0]) {
				same = false;
			}
		}
		// console.log('same',same);
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
			var match_arr = [card_one, card_two, card_three];
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
        if(!match_card){
            return result;
        }
		var match_type = match_card.split('_')[1];
		var _arr = [];
		var two_card_arr = [];
		card_list.forEach(function(ele) {
			var _type = ele.split('_')[1];
			if (_type == match_type) {
				_arr.push(ele);
			}
		});
		_arr.sort();
		for (var i = 0; i < _arr.length; i++) {
			var j = i + 1;
			if (j < _arr.length) {
				two_card_arr.push([_arr[i], _arr[j]]);
			}
		}
		// console.log(two_card_arr,match_card,'three_card_arr');
		// 此处有一个bug待修复 只返回最后一个符合条件的结果 应该是返回所有符合条件结果的数组
		for (var i = 0; i < two_card_arr.length; i++) {
			var _res = check_three_card(two_card_arr[i][0], two_card_arr[i][1], match_card);
			if (_res) {
				result = _res;
			}
		}
		// console.log('check chi result',result);
		return result;
	},
	peng: function(card_list, match_card) {
		var self = this;
		var result = null;
        if(!match_card){
            return result;
        }
		var match_type = match_card.split('_')[1];
		var _arr = [];
		var two_card_arr = [];
		card_list.forEach(function(ele) {
			var _type = ele.split('_')[1];
			if (_type == match_type) {
				_arr.push(ele);
			}
		});
		_arr.sort();
		for (var i = 0; i < _arr.length; i++) {
			var j = i + 1;
			if (j < _arr.length) {
				two_card_arr.push([_arr[i], _arr[j]]);
			}
		}
		for (var i = 0; i < two_card_arr.length; i++) {
			var _res = self.check_peng(two_card_arr[i][0], two_card_arr[i][1], match_card);
			if (_res) {
				result = _res;
			}
		}
		return result;
	},
	check_peng: function(card_one, card_two, match_card) {
		var result = null;
		var match_arr = [match_card, card_one, card_two];
		var type_arr = this.getTypeByMatchArr(match_arr);
		var num_arr = this.getNumsByMatchArr(match_arr);
		// console.log('card_one,card_two,match_card',card_one,card_two,match_card);
		var same_type = this.checkArrIsEqual(type_arr);
		var same_num = this.checkArrIsEqual(num_arr);
		if (same_num && same_type) {
			result = match_arr;
		}
		return result;
	},
	gang: function(card_list, match_card) {
		var result = null;
        if(!match_card){return result;}
		var type = null;
		//先check card_list中是否满足条件
		var result1 = this.check_player_list_gang(card_list);
		//再check table_card最后一张
		if (match_card) {
			var result2 = this.check_table_gang(card_list, match_card);
		}
		//此处有bug 当玩家手中有符合条件的杠时 牌桌中也有符合的情况下只返回一种
		if (result1) {
			result = result1;
			type = 1;
		} else if (result2) {
			result = result2;
			type = 2;
		}
		return {
			result: result,
			type: type
		};
	},
	check_table_gang: function(card_list, match_card) {
		var result = null;
		var _typeObj = {};
		var match_type = match_card.split('_')[1];
		var match_num = match_card.split('_')[0];
		var player_match_arr = [];
		for (var i = 0; i < card_list.length; i++) {
			var ele = card_list[i];
			var eleType = ele.split('_')[1];
			var eleNum = ele.split('_')[0];
			if (eleType == match_type && eleNum == match_num) {
				player_match_arr.push(ele);
			}
			if(!_typeObj[eleType]){
				_typeObj[eleType] = new Array();
			}
			_typeObj[eleType].push(ele);
		};
		if (player_match_arr.length == 4) {
			result = player_match_arr;
		}
		return result;
	},
	check_player_list_gang: function(card_list) {
		var result = null;
		var _typeObj = {};
		// console.log('card_list',card_list);
		for (var i = 0; i < card_list.length; i++) {
			var ele = card_list[i];
			var eleType = ele.split('_')[1];
			var eleNum = ele.split('_')[0];
			//把玩家手中牌分类 
			if (!_typeObj[eleType]) {
				_typeObj[eleType] = [];
			}
			_typeObj[eleType].push(ele);
		};
		// 获取符合条件的 一类牌 中的所有可能情况数组
		var _same_type_arr = [];
		for (var p in _typeObj) {
			if (_typeObj[p].length > 3) {
				var nums_arr = _typeObj[p];
				nums_arr.sort();
				for (var j = 0; j < nums_arr.length; j++) {
					var k = j + 1;
					var l = j + 2;
					var n = j + 3;
					if (k < nums_arr.length && l < nums_arr.length && n < nums_arr.length) {
						_same_type_arr.push([nums_arr[j], nums_arr[k], nums_arr[l], nums_arr[n]]);
					}
				}
			}
		}
		// console.log('_arr',_same_type_arr);
		// 此处有一个bug待修复 只返回最后一个符合条件的结果 应该是返回所有符合条件结果的数组
		for (var m = 0; m < _same_type_arr.length; m++) {
			var res = this.check_gang(_same_type_arr[m]);
			// console.log('res',res);
			if (res) {
				result = res;
			}
		}

		return result;
	},
	check_gang: function(arr) {
		var result = null;
		var same_num = this.checkArrIsEqual(arr);

		if (same_num) {
			result = arr;
		}
		return result;
	},
	hu: function(card_list) {
		var result = null;
		var wan_arr = this.getTypesByList('wan', card_list);
		var feng_arr = this.getTypesByList('f', card_list);
		var o_arr = this.getTypesByList('o', card_list);
		var tiao_arr = this.getTypesByList('tiao', card_list);
		var tong_arr = this.getTypesByList('tong', card_list);

		/*
		 * @info {duizi:[],shunzi:[],juzi:[]}
		 */
		var wan_info = this.getInfoByList(wan_arr);
		var feng_info = this.getInfoByList(feng_arr);
		var o_info = this.getInfoByList(o_arr);
		var tiao_info = this.getInfoByList(tiao_arr);
		var tong_info = this.getInfoByList(tong_arr);


		var duizi_count = wan_info['duizi'].length + feng_info['duizi'].length + o_info['duizi'].length + tiao_info['duizi'].length + tong_info['duizi'].length;
		var juzi_count = wan_info['juzi'].length + feng_info['juzi'].length + o_info['juzi'].length + tiao_info['juzi'].length + tong_info['juzi'].length;
		var shunzi_count = wan_info['shunzi'].length + tiao_info['shunzi'].length + tong_info['shunzi'].length;

		// console.log('duizi_count,juzi_count,shunzi_count', duizi_count, juzi_count, shunzi_count);

		if (duizi_count == 1 && (juzi_count + shunzi_count) == 3) {
			result = true;
		}
        //debug game start
		return result;
	},
	getTypesByList: function(type, card_list) {
		var arr = [];
		card_list.forEach(function(ele) {
			var tp = ele.split('_')[1];
			if (tp == type) {
				arr.push(ele);
			}
		});
		return arr;
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
		obj['duizi'] = new Array();
		obj['shunzi'] = new Array();
		obj['juzi'] = new Array();
		if (list.length) {
			obj['juzi'] = this.check_juzi(list);
		}
		if (list.length) {
			if (list[0].split('_')[1] != 'o' || list[0].split('_')[1] != 'f') {
				obj['shunzi'] = this.check_shunzi(list);
			}
		}
		if (list.length) {
			obj['duizi'] = this.check_duizi(list);
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
					array.splice(i, 2);
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
				if (element == element1 && element1 == element2) {
					array.splice(index, 3);
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
				var element = parseInt(nums_arr[index]);
				var element1 = parseInt(nums_arr[index + 1]);
				var element2 = parseInt(nums_arr[index + 2]);
				if (element1 == (element + 1) && element2 == (element1 + 1)) {
					index += 2;
					shunzi_arr.push([array[index], array[index+1], array[index+2]]);
					array.splice(index, 3);
				}
			}
		}
		return shunzi_arr;
	}
}
module.exports = Machine;