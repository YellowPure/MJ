function Player(socket,username,index){
	this.socket=socket;
	this.username = username;
	this.ready = false;
	this.cardList = [];
	this.onlyPeng = false;
	this.cardHoldList = [];
}
Player.prototype.delCards = function(){
	for (var i = 0; i < arguments.length; i++) {
		var index = this.cardList.indexOf(arguments[i]);
		if(index!=-1){
			this.cardList.splice(index,1);
		}
	}
}
Player.prototype.holdListAdd = function(){
	for (var i = 0; i < arguments.length; i++) {
		this.cardHoldList.push(arguments[i]);
	}
}
Player.prototype.addCard = function(cardName){
	this.cardList.push(cardName);
}
module.exports=Player;