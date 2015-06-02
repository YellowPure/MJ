function Table() {
	this.table_view = new createjs.Container();
	this.cards_list = [];
	console.log('table init!!');
	this.player_cards_list = [];
	this.animat_index = 0;
	this.last_pos = {
		x: 0,
		y: 0
	};
	this.cards_list = [];
	this.throw_card_count = 0;
	this.throw_card_list = [];
	this.row_card_width = parseInt(Global.canvas.width * 0.04) + 2;
	this.row_card_height = parseInt(this.row_card_width * 4 / 3);

	this.table_hide_view = new createjs.Container();
	this.table_view.addChild(this.table_hide_view);
	this.table_hide_view.x = parseInt(Global.canvas.width - this.row_card_width) / 2;
	this.table_hide_view.y = parseInt(Global.canvas.height - this.row_card_height) / 2;
	this.table_show_view = new createjs.Container();
	this.table_show_view.y = 0;
	this.table_view.addChild(this.table_show_view);
	this.table_player_view = new createjs.Container();
	this.table_player_view.y = Global.canvas.height - this.row_card_height;
	this.table_player_view.x = (Global.canvas.width - this.row_card_width * 13) / 2;

	this.table_view.addChild(this.table_player_view);

	this.init();
	this.initControls();
	this.bindEvent();
}
Table.prototype.init = function() {
	var card = new Card({
		name: 'card_hide',
		x: 0,
		y: 0,
		card_id: 1,
		txt: 'kong',
		side: 2
	});
	this.last_pos.x = card.card_view.x;
	this.last_pos.y = card.card_view.y;
	this.table_hide_view.addChild(card.card_view);
}
Table.prototype.initControls = function() {
	var self = this;
	this.control_view = new createjs.Container();
	this.control_view.x = parseInt(Global.canvas.width - 4 * self.row_card_width);
	this.control_view.y = parseInt(Global.canvas.height * 9 / 10);
	this.table_view.addChild(this.control_view);


	this.initControl_items('chi', 0, function(ev) {
		console.log('chi!');
		socket.emit('chi', {
			card_name: self.throw_card_list[self.throw_card_list.length - 1].txt
		});
	});
	this.initControl_items('peng', 38, function(ev) {
		console.log('peng');
	});
	this.initControl_items('gang', 76, function(ev) {
		console.log('gang');
	});
	this.initControl_items('hu', 114, function(ev) {
		console.log('hu');
	})
}
Table.prototype.initControl_items = function(txt, pos_x, callback) {
	var item = new createjs.Container();
	this.control_view.addChild(item);
	item.x = pos_x;
	var control_bg = new createjs.Shape();
	control_bg.graphics.beginStroke("#000").drawRect(0, 0, 36, 36);
	control_bg.graphics.beginFill("#fff").drawRect(1, 1, 35, 35);
	item.addChild(control_bg);
	var control_chi_txt = new createjs.Text(txt, "14px Microsoft Yahei", "#ff7000");
	item.addChild(control_chi_txt);
	control_chi_txt.y = 8;

	item.addEventListener('click', function(ev) {
		if (typeof callback === 'function') {
			callback(ev);
		}
	});
}
Table.prototype.dealCards = function() {
	var self = this;
	self.cards_list = [];
	for (var index = 0; index < game_data.player_card_list.length; index++) {
		var card = new Card({
			name: 'card_' + index,
			x: this.last_pos.x,
			y: this.last_pos.y,
			card_id: index,
			txt: game_data.getCardNameByIndex(index),
			side: 2
		});
		self.cards_list.push(card);
		this.table_hide_view.addChild(card.card_view);
	}
	self.animationCards();
}
Table.prototype.animationCards = function() {
	var self = this;
	var count = 0;
	var half_cards_list_width = parseInt(self.cards_list.length * this.row_card_width / 2);

	function handler(ev) {
		if (count > self.cards_list.length - 1) {
			self.dealCardsToPlayers();
			return;
		}
		createjs.Tween.get(self.cards_list[count].card_view).to({
			x: self.row_card_width * count - half_cards_list_width,
			y: self.table_player_view.y - self.table_hide_view.y
		}, 200).call(handler);
		count++;
	}
	handler();
}
Table.prototype.dealCardsToPlayers = function() {
	var self = this;

	this.cards_list.forEach(function(val, index) {
		val.side = 1;

		val.y = 0;
		val.x = self.row_card_width * index;
		var card = new Card(val.getInfo());
		self.table_player_view.addChild(card.card_view);
		self.table_hide_view.removeChild(val.card_view);
		self.player_cards_list.push(card);
	});
}
Table.prototype.bindEvent = function() {
	var self = this;
	//	socket.emit("player get one card", Global.username);
	socket.on("player get one card", function(data) {
		console.log("player get one card", data);
		var info = {
			x: 0,
			y: 0,
			txt: data.card,
			side: 1,
			card_id: 1000
		};
		var _card = new Card(info);
		self.player_cards_list.push(_card);
		self.table_player_view.addChild(_card.card_view);
		self.playerSortCards();
	});
}
Table.prototype.playerThrowCard = function(card_name) {
	this.throwListAddCard(card_name);
	var self = this;
	var _index = -1;
	this.player_cards_list.forEach(function(element, index) {
		if (element.txt == card_name) {
			_index = index;
		}
	});
	self.table_player_view.removeChild(self.player_cards_list[_index].card_view);
	self.player_cards_list.splice(_index, 1);
	self.playerSortCards();
}
Table.prototype.playerAddCards = function(card_list) {
	var self = this;
	card_list.forEach(function(ele){
		var _card = new Card({
			name:'card_0',
			x:0,
			y:0,
			card_id:0,
			txt:ele,
			side:1
		});
		self.player_cards_list.push(_card);
		self.table_player_view.addChild(_card.card_view);
	});
	console.log('player addCards!!');
	// var _card = new Card(info);
	// self.player_cards_list.push(_card);
	// self.table_player_view.addChild(_card.card_view);
	self.playerSortCards();
};
Table.prototype.throwListAddCard = function(card_name) {
	var _index;
	var _card = null;

	_card = new Card({
		name: 'card_0',
		x: this.last_pos.x,
		y: this.last_pos.y,
		card_id: 0,
		txt: card_name,
		side: 1
	});

	var info = _card.getInfo();
	info.x = this.row_card_width * this.throw_card_count;
	var __card = new Card(info);
	this.throw_card_list.push(__card);
	this.table_show_view.addChild(__card.card_view);
	this.throw_card_count++;
}
Table.prototype.playerSortCards = function() {
	console.log(this.player_cards_list, "length:", this.player_cards_list.length);
	for (var i = 0; i < this.player_cards_list.length; i++) {
		this.player_cards_list[i].card_view.x = i * this.row_card_width;
	}
}