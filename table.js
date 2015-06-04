var Global=require('./Global');
function Table (){
	this.cardList=[];
}
Table.prototype.addCard = function(cardName){
	console.log('table addCard');
	this.cardList.push(cardName);
};
Table.prototype.delCard = function (cardName){
	var _index = this.cardList.indexOf(cardName);
	if(_index != -1){
		this.cardList.splice(_index,1);
	}	
};
Table.prototype.lastCard = function (){
	var result = null;
	if(this.cardList.length>0){
		result = this.cardList[this.cardList.length-1];	
	}
	return result;
};
//var table={
//	list:{},
//	addCard:function(roomId,card_name){
//		console.log('table addCard');
//		if(this.list[roomId]==undefined){
//			this.list[roomId]=new Array();
//		}
//		this.list[roomId].push(card_name);
////		Global.io.to(roomId).emit('table add card',{card_name:card_name});
//	},
//	delCard:function(roomId,card_name){
//		if(this.list[roomId].length>0){
//			var _index=this.list[roomId].indexOf(card_name);
//			if(_index!=-1){
//				this.list[roomId].splice(_index,1);
//			}
//		}
//	},
//	lastCard:function(roomId){
//		return this.list[roomId][this.list[roomId].length-1];
//	}
//}
module.exports=Table;