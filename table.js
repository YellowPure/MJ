var table={
	list:{},
	addCard:function(roomId,card_name){
		this.list[roomId].push(card_name);
	},
	delCard:function(roomId,card_name){
		if(this.list[roomId].length>0){
			var _index=this.list[roomId].indexOf(card_name);
			if(_index!=-1){
				this.list[roomId].splice(_index,1);
			}
		}
	},
	lastCard:function(roomId){
		return this.list[roomId][this.list[roomId].length-1];
	}
}
module.exports=table;