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

io.on('connection',function(socket){
	var addUsers=false;

	socket.on('new message',function(data){
		io.emit('new message',{
			username:socket.username,
			message:data
		});
	});
	
	socket.on('add user',function(username){
		if(usernames[username]==undefined){
			socket.username=username;
			usernames[username]=username;
			addUsers=true;
			++numUsers;
			socket.emit('login',{numUsers:numUsers});
			console.log(numUsers,username,'user join');
			socket.broadcast.emit('user join',{numUsers:numUsers,username:username});
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