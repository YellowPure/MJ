var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io')(server);
var port=process.env.PORT||3000;

server.listen(port,function(){
	console.log('listening on %d',port);
})

app.use(express.static(__dirname+'/public'));

//chat room
var usernames={};
var numUsers=0;
var chat=require('./chat');
chat=Object.create(new Chat());

var roomIdPool=[];

io.on('connection',function(socket){
	var addUsers=false;

	socket.on('new message',function(data){
		console.log(data,'get message');
		io.to(data.roomId).emit('new message',{
			username:socket.username,
			message:data.msg
		});
	});
	
	socket.on('add user',function(username){
		if(usernames[username]==undefined){
			socket.username=username;
			usernames[username]=username;
			addUsers=true;
			++numUsers;

			
			var curRoomId=updateRoomPoolByUsers();
			socket.join(curRoomId.toString());
			socket.emit('login',{numUsers:numUsers,roomId:curRoomId});
			console.log(numUsers,username,curRoomId,'user join');
			socket.broadcast.to(curRoomId.toString()).emit('user join',{roomId:curRoomId,numUsers:numUsers,username:username});
		}
	});

	// socket.broadcast.emit('connection','connection 1');
	socket.on('disconnect',function(){
		console.log('use disconnect');
		if(addUsers){
			delete usernames[socket.username];
			--numUsers;
			socket.broadcast.emit('user left',{username:socket.username,numUsers:numUsers});
		}
	});
})

function updateRoomPoolByUsers(){
	var len=Math.ceil(numUsers/4);
	roomIdPool=[];
	var num=10000;
	for (var i = 0; i < len; i++) {
		roomIdPool.push(num.toString());
		num++;
	}
	return 10000+(len-1);
}


