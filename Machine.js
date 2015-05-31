var Machine = {
	chi: function (card_one, card_two,match_card) {
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
			//		Global.io_obj.to(this.roomId).emit('chi',{card:match_card});
		} else {
//			this.socket.emit('not able chi', { error: '不满足条件' });
		}
	},
};
module.exports = Machine;