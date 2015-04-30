var MJList={
	roomId:null,
	list:{},
	init:function(roomId){
		this.list[roomId]=new Array();
		this.initList(roomId);
		this.randomList(roomId);
	},
	initList:function(roomId){
		var wan_list=['1_wan','2_wan','3_wan','4_wan','5_wan','6_wan','7_wan','8_wan','9_wan'];
		var tiao_list=['1_tiao','2_tiao','3_tiao','4_tiao','5_tiao','6_tiao','7_tiao','8_tiao','9_tiao'];
		var tong_list=['1_tong','2_tong','3_tong','4_tong','5_tong','6_tong','7_tong','8_tong','9_tong'];
		var feng_list=['dong_f','nan_f','bei_f','xi_f'];
		var other_list=['hz_o','fc_o','bb_o'];
		var arr1=[];
		for (var i = 0; i < 4; i++) {
			this.list[roomId]=this.list[roomId].concat(wan_list);
			this.list[roomId]=this.list[roomId].concat(tiao_list);
			this.list[roomId]=this.list[roomId].concat(tong_list);
			this.list[roomId]=this.list[roomId].concat(feng_list);
			this.list[roomId]=this.list[roomId].concat(other_list);
		}
	},
	randomList:function(roomId){
		var arr=this.list[roomId];
		var arr1=[];
		while(arr.length>0){
			var random_index=parseInt(Math.random()*arr.length);
			arr1.push(arr[random_index]);
			arr.splice(random_index,1);
		}
		this.list[roomId]=arr1;
	},
	dealCards:function(roomId){
		if(this.list[roomId].length>0){
			return this.list[roomId].splice(0,13);
		}
		return null;
	},
	dealOneCard:function(roomId){
		if(this.list[roomId].length>0){
			return this.list[roomId].splice(0,1);
		}
		return null;
	}
}
module.exports=MJList;