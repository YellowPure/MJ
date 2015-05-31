function Player(socket,username){
	this.socket=socket;
	this.username = username;
	this.ready = false;
	this.cardList = [];
}
module.exports=Player;