function Chat(){
	var self=this;
	var roomIdPool=new Array();
	var playerPool={};
	var curPlayerId=0;
	var updateRoomPoolByUsers=function(numUsers){
		var len=Math.ceil(numUsers/4);
		roomIdPool=[];
		var num=10000;
		for (var i = 0; i < len; i++) {
			roomIdPool.push(num.toString());
			num++;
		}
		var roomId=10000+(len-1);
		appendPlayer(roomId);
		return roomId;
	}
	var appendPlayer=function(roomId){
		playerPool[roomId].push(curPlayerId);
	}
}
module.exports=Chat;