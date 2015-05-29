function Player(socket,username){
	this.socket=socket;
	this.username = username;
	this.isReady = false;
}
module.exports=Player;