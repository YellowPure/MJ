$(function() {
	$('.login').show();
	$('.game').hide();
	$('.player').hide();
	$('#game_view').hide();
	$('#action_box').hide();
	var socket = io();
	var Global={
		roomId:null,
		username:null,
		player_name_list:null
	}
	$('form.chat_form').submit(function(e) {
		// e.preventDefault();
		socket.emit('new message', {msg:$('#m').val(),roomId:Global.roomId});
		$('#m').val('');
		return false;
	});
	$('#nickname').on('keydown', function(e) {
		if (e.keyCode == 13) {
			socket.emit('add user', $('#nickname').val());
			$('.login').hide(200);
			$('.game').show(200);
		}
	});
	socket.on('login',function(data){
		console.log('welcome',data);
		Global.roomId=data.roomId;
		Global.username=data.username;
		updatePlayerShow(data['player_list']);
		$('#messages').append($('<li>').text('welcome! there are '+data.numUsers + 'people in the room,roomId:'+data.roomId));
	});
	var userNum=0;
	socket.on('user join', function(data) {
		console.log(data,'user join');
		updatePlayerShow(data['player_list']);
		$('#messages').append($('<li>').text(data.username+' join the room, '+data.numUsers + 'people in the room__roomId:'+data.roomId));
	});
	function updatePlayerShow(list){
		Global.player_name_list=list;
		var curUserIndex=null;
				for (var i = 0; i < list.length; i++) {
			if(list[i].username==Global.username){
				curUserIndex=i;
			}
		}
		// var curUserIndex=list.indexOf(Global.username);
		if(curUserIndex!=-1){
			var arr1=list.slice(curUserIndex);
			var arr2=list.slice(0, curUserIndex);
			list=arr1.concat(arr2);
		}
		console.log('do!!',list);

		var len=list.length;
		for (var i = 0; i < 4; i++) {
			if(i<len){
				$('.player').eq(i).show();
			}else{
				$('.player').eq(i).hide();
			}
		}
		for (var i = 0; i < list.length; i++) {
			console.log('list:',list[i].username);
			$('.player').eq(i).attr('data-name', list[i].username);
			$('.player').eq(i).find('.name').text(list[i].username);
			if(i!=0){
				if(list[i].ready==true){
				 	$('.player').eq(i).find('.ready_info').text('玩家已准备');
				}else{
					$('.player').eq(i).find('.ready_info').text('玩家没有准备');
				}

			}
		}
	}
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
		updatePlayerShow(data['player_list']);
		$('#messages').append($('<li class="red">').text(data.username + '' + data.numUsers));
	});
	socket.on('player ready',function(data){
		console.log('player:'+data.username+' ready');
		$.each($('.player'), function(index, val) {
			 /* iterate through array or object */
			 if($(val).data('name')==data.username&&index==0){
			 	$(val).find('.ready').attr('disabled', true);
			 	$(val).find('.not_ready').attr('disabled', false);
			 }
			 if($(val).data('name')==data.username){
			 	$(val).find('.ready_info').text('玩家已准备');
			 }
		});
	});
	socket.on('player not ready',function(data){
		console.log('player:'+data.username+' not ready');
		$.each($('.player'), function(index, val) {
			 /* iterate through array or object */
			 if($(val).data('name')==data.username&&index==0){
			 	$(val).find('.ready').attr('disabled', false);
			 	$(val).find('.not_ready').attr('disabled', true);
			 }
			 if($(val).data('name')==data.username){
			 	$(val).find('.ready_info').text('玩家没准备好');
			 }
		});
	});
	socket.on('count down',function(){
		console.log('count down');
		var num=3;
		countDown(num);
		var timeId=setInterval(function(){
			num--;
			countDown(num);
			console.log(num);
			if(num==0){
				clearInterval(timeId);
				$('.count_down').remove();
			}
		},1000);
	});
	socket.on('start game',function(data){
		console.log('start game get cards',data.card_list);
		$('#game_view').show();
//		game_data.init({card_list:data.card_list});
		view.init();
		view.setData({card_list:data.card_list});
	});
	socket.on('player turn',function(data){
		console.log(data.name,'player turn');
		if(Global.username===data.name){
			//check是本玩家
			$('#action_box').show(200);
			$('.player1').hide(200);
		}else{
			if($('#action_box').is(":visibled")){
				$('#action_box').hide();
			}
		}
	});	
	function countDown(num){
		if($('.count_down').length==0){
			$('body').append('<h1 class="count_down">'+num.toString()+'</h1>');
		}
		setTimeout(function(){
			$('.count_down').remove();
		},950);
	}

	$('.ready').on('click',function(e){
		socket.emit('ready',{username:Global.username,roomId:Global.roomId});
	});
	$('.not_ready').on('click',function(e){
		socket.emit('not ready',{username:Global.username,roomId:Global.roomId});
	});
});