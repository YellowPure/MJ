//var Card = require('./Card');
function CardBox() {
	this.list = new Array();
	this.init();
}
CardBox.prototype.init = function() {
	this.initList();
	this.randomList();
};
CardBox.prototype.initList = function() {
	// var wan_list = [];
	// var tiao_list = [];
	// var tong_list = [];
	// var other_list = [new Card('hz','o'),new Card('fc','o'),new Card('bb','o')];
	// var feng_list = [new Card('dong','f'),new Card('xi','f'),new Card('nan','f'),new Card('bei','f')];
	// var feng_list = [];
	// for (var i = 0; i < 9; i++) {
	// 	var card1 = new Card((i+1).toString(),'wan');
	// 	wan_list.push(card1);
	// 	var card2 = new Card((i+1).toString(),'tiao');
	// 	tiao_list.push(card2);
	// 	var card3 = new Card((i+1).toString(),'tong');
	// 	tong_list.push(card3);
	// };
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
CardBox.prototype.randomList = function() {
	var arr = this.list;
	var arr1 = [];
	while (arr.length > 0) {
		var random_index = parseInt(Math.random() * arr.length,10);
		arr1.push(arr[random_index]);
		arr.splice(random_index, 1);
	}
	this.list = arr1;
};
CardBox.prototype.dealCards = function(cardNum) {
	var arr = null;
	if (this.list.length > cardNum) {
		console.log(this.list.length, 'cardBox');
		arr = this.list.splice(0, cardNum);
	}
	// if (arr) {
	// 	arr.sort(function(a,b){
 //   			return a.replace(/\d+_/,'').localeCompare(b.replace(/\d+_/,''));
	// 	});
	// }
	return arr;
};
module.exports = CardBox;