function Player(socket,username,index){
	this.socket=socket;
	this.username = username;
	this.ready = false;
	this.cardList = [];
	this.onlyPeng = false;
}
module.exports=Player;