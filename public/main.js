var socket = io();
var Global = {
	roomId: null,
	username: null,
	player_name_list: null,
	table: null,
	canvas: null,
	socketId: null,
	pengActionOnly:false
};
var main = {
	init: function() {
		$('.login').show();
		$('.game').hide();
		$('.player').hide();
		$('#game_view').hide();
		$('#action_box').hide();
		this.bindEvent();
	},
	bindEvent: function() {
		var _this = this;
		$('form.chat_form').submit(function(e) {
			// e.preventDefault();
			socket.emit('new message', {
				msg: $('#m').val(),
				roomId: Global.roomId
			});
			$('#m').val('');
			return false;
		});
		$('#nickname').on('keydown', function(e) {
			if (e.keyCode == 13) {
				if ($('#nickname').val != "") {
					socket.emit('add user', $('#nickname').val());
					$('.login').hide(200);
					$('.game').show(200);
				}
			}
		});
		$('.ready').on('click', function(e) {
			socket.emit('ready', {
				username: Global.username,
				roomId: Global.roomId
			});
		});
		$('.not_ready').on('click', function(e) {
			socket.emit('not ready', {
				username: Global.username,
				roomId: Global.roomId
			});
		});
		$('#restart-btn').on('click',function(e){
			$('.game_main').css('visibility','visible');
			socket.emit('not ready', {
				username: Global.username,
				roomId: Global.roomId
			});
			$('.player1').show(200);
			_this.hideWinnerPop();
		});
		this.bindSocketEvent();
	},
	bindSocketEvent: function() {
		var self = this;
		socket.on('login', function(data) {
			console.log('welcome', data);
			Global.roomId = data.roomId;
			Global.username = data.username;
			Global.socketId = data.socketId;
			self.updatePlayerShow(data['player_list']);
			$('#messages').append($('<li>').text('welcome! there are ' + data.numUsers + 'people in the room,roomId:' + data.roomId));
		});
		socket.on('user join', function(data) {
			console.log(data, 'user join');
			self.updatePlayerShow(data['player_list']);
			$('#messages').append($('<li>').text(data.username + ' join the room, ' + data.numUsers + 'people in the room__roomId:' + data.roomId));
		});
		socket.on('new message', function(data) {
			console.log('new messages123');
			$('#messages').append($('<li>').text(data.username + ':' + data.message));
		});
		socket.on('disconnect', function(msg) {
			console.log('disconnect');
			socket.disconnect();
			// $('#messages').append($('<li class="red">').text(msg));
		});
		socket.on('error', function(data) {
			console.log('error', data);
		})
		socket.on('connection', function(msg) {
			$('#messages').append($('<li class="red">').text(msg));
		});
		socket.on('user left', function(data) {
			self.updatePlayerShow(data['player_list']);
			$('#messages').append($('<li class="red">').text(data.username + '' + data.numUsers));
		});
		socket.on('player ready', function(data) {
			console.log('player:' + data.username + ' ready');
			$.each($('.player'), function(index, val) {
				/* iterate through array or object */
				if ($(val).data('name') == data.username && index == 0) {
					$(val).find('.ready').attr('disabled', true);
					$(val).find('.not_ready').attr('disabled', false);
				}
				if ($(val).data('name') == data.username) {
					$(val).find('.ready_info').text('玩家已准备');
				}
			});
		});
		socket.on('player not ready', function(data) {
			console.log('player:' + data.username + ' not ready');
			$.each($('.player'), function(index, val) {
				/* iterate through array or object */
				if ($(val).data('name') == data.username && index == 0) {
					$(val).find('.ready').attr('disabled', false);
					$(val).find('.not_ready').attr('disabled', true);
				}
				if ($(val).data('name') == data.username) {
					$(val).find('.ready_info').text('玩家没准备好');
				}
			});
		});
		socket.on('start game', function(data) {
			console.log('start game');
			$('#game_view').show();
			$('.player1').hide(200);
			view.init();
            
			game_data.setCardData(data.card_list);
			view.countDown(function() {
				view.table.dealCards();
			});
		});
		socket.on('deal card', function(data) {
			console.log('deal card',data);
			if (data.card_list) {
				game_data.setCardData(data.card_list);
				Global.table.playerAddCards(data.card_list);
			}
		});
		socket.on('player turn', function(data) {
			console.log(data, 'player turn');
			if(data.type == 'peng'){
				Global.pengActionOnly = true;
			}
		});
		socket.on('throw', function(data) {
			console.log('throw success', data);
			if(data.result ==0){
				Global.table.playerThrowCard(data.card_name);
			}else{
				console.log('throw error:',data.msg);
			}
		});
		socket.on('table add card', function(data) {
			console.log('table add card', data);
			if (data && data.card_name) {
				Global.table.throwListAddCard(data.card_name);
			}
		});
		socket.on('chi',function(data){
			console.log('chi',data.hand_list,data.table_card);
			if(data.result !=-1){
				Global.table.chi(data.hand_list,data.table_card);
			}else{
				console.log('chi error',data.msg);
			}
		});
		socket.on('peng',function(data){
			if(data.result!=-1){
				Global.table.peng(data.hand_list,data.table_card);
			}else{
				console.log('peng error',data.msg);
			}
		});
		socket.on('gang',function(data){
			if(data.result!=-1){
				console.log('data hand_list',data);
				// if(data.table_card){
					Global.table.gang(data.hand_list,data.table_card);
				// }else{
				// 	Global.table.peng(data.hand_list);
				// }
				
			}else{
				console.log('gang error',data.msg);
			}
		});
		socket.on('table remove card',function(data){
			Global.table.tableRemoveCard(data.table_card);
		});
		socket.on('hu',function(data){
			// if(data.result == 0){
			// 	self.showWinnerPop(data.winner);
			// 	$('#game_view').hide();
			// }
		});
		socket.on('game end',function(data){
			console.log('game end');
			if(data.result == 0){
				self.showWinnerPop(data.winner);
				$('#game_view').hide();
				$('.game_main').css('visibility','hidden');
                Global.table.player_cards_list = [];
                game_data.player_card_list = [];
			}
		})
	},
	showWinnerPop:function(name){
		$('#pop').show(200);
		$('#winner_name').text(name);
	},
	hideWinnerPop:function(){
		$('#pop').hide(200);
	},
	updatePlayerShow: function(list) {
		Global.player_name_list = list;
		var curUserIndex = null;
		for (var i = 0; i < list.length; i++) {
			if (list[i].username == Global.username) {
				curUserIndex = i;
			}
		}
		// var curUserIndex=list.indexOf(Global.username);
		if (curUserIndex != -1) {
			var arr1 = list.slice(curUserIndex);
			var arr2 = list.slice(0, curUserIndex);
			list = arr1.concat(arr2);
		}
		console.log('do!!', list);

		var len = list.length;
		for (var i = 0; i < 4; i++) {
			if (i < len) {
				$('.player').eq(i).show();
			} else {
				$('.player').eq(i).hide();
			}
		}
		for (var i = 0; i < list.length; i++) {
			console.log('list:', list[i].username);
			$('.player').eq(i).attr('data-name', list[i].username);
			$('.player').eq(i).find('.name').text(list[i].username);
			if (i != 0) {
				if (list[i].ready == true) {
					$('.player').eq(i).find('.ready_info').text('玩家已准备');
				} else {
					$('.player').eq(i).find('.ready_info').text('玩家没有准备');
				}

			}
		}
	}
}
$(function() {
	main.init();
});