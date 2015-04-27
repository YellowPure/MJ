function GameMain(roomId){
	this.roomId=roomId||null;
	this.players=[];
	this.game_state='NOT_BEGIN';
	// console.log('fuck11',global.socket_obj,global.socket_obj.roomId);
}
GameMain.prototype.addPlayer=function(playername){
	console.log('do here!');
	this.players.push({name:playername,ready:false});
}
GameMain.prototype.delPlayer=function(player){
	console.log('doo here!');
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].name==player){
			this.players.splice(i,1);
		}
	}
}
GameMain.prototype.setPlayerReady=function(name){
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].name==name){
			this.players[i].ready=true;
		}
	}
	if(this.checkToStartGame()){
		this.startGame();
	}
}
GameMain.prototype.setPlayerNotReady=function(name){
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].name==name){
			this.players[i].ready=false;
		}
	}
}
GameMain.prototype.updateState=function(){
	if(this.players.length==4){
		this.startGame();
	}
}
GameMain.prototype.getPlayerInfoByName=function(playerName){
	var result=null;
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].name==playername){
			result=this.players[i];
		}
	};
	return result;
}
GameMain.prototype.checkToStartGame=function(){
	var pass=true;
	if(this.players.length==4){
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].ready==false){
				pass=false;
			}
		}
	}else{
		pass=false;
	}
	console.log('all player in!!',pass);
	return false;
}

GameMain.prototype.startGame=function(){
	this.game_state='GAME_START';
}
GameMain.prototype.pauseGame=function(){
	this.game_state="GAME_PAUSE";
}
GameMain.prototype.endGame=function(){
	this.game_state="GAME_END";
}
module.exports=GameMain;