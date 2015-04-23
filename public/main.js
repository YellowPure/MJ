$(function() {
	$('.login').show();
	$('.chat').hide();

	var socket = io();
	$('form').submit(function() {
		socket.emit('new message', $('#m').val());
		$('#m').val('');
		return false;
	});
	$('#nickname').on('keydown', function(e) {
		if (e.keyCode == 13) {
			socket.emit('add user', $('#nickname').val());
			$('.login').hide(200);
			$('.chat').show(200);
		}
	});
	socket.on('login',function(data){
		console.log('welcome');
		$('#messages').append($('<li>').text('welcome! there are '+data.numUsers + 'people in the room'));
	});
	socket.on('user join', function(data) {
		console.log(data);
		$('#messages').append($('<li>').text(data.username+' join the room, '+data.numUsers + 'people in the room'));
	});
	socket.on('new message', function(data) {
		console.log('new messages123');
		$('#messages').append($('<li>').text(data.username + ':' + data.message));
	});
	// socket.on('disconnect',function(msg){
	// 	$('#messages').append($('<li class="red">').text(msg));
	// })
	socket.on('connection', function(msg) {
		$('#messages').append($('<li class="red">').text(msg));
	});
	socket.on('user left', function(data) {
		$('#messages').append($('<li class="red">').text(data.username + '' + data.numUsers));
	});
});