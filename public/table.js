function Table() {
	this.table_view=new createjs.Container();
	this.cards_list=[];
	this.player_cards_list=[];
	this.animat_index=0;
	this.last_pos={x:0,y:0};
	this.cards_name_list=[];
	this.throw_card_count=0;
	this.throw_card_list=[];

	this.table_hide_view=new createjs.Container();
	this.table_view.addChild(this.table_hide_view);
	this.table_show_view= new createjs.Container();
	this.table_show_view.y=80;
	this.table_view.addChild(this.table_show_view);
	this.table_player_view=new createjs.Container();
	this.table_player_view.y=300;

	this.table_view.addChild(this.table_player_view);

	this.init();
	this.initControls();
	this.bindEvent();
}
Table.prototype.init = function () {
	
	for (var i = 0; i < 26; i++) {
		var _x = 0;
		var _y = 0;
		if (i % 2 == 0) {
			_y = 0;
		} else {
			_y = 40;
		}
		_x = parseInt(i / 2) * 62;
		var card = new Card({
			name: 'card' + i,
			x: _x,
			y: _y,
			card_id: 1,
			txt: '1 wam',
			side: 2
		});
		this.last_pos.x=card.card_view.x;
		this.last_pos.y=card.card_view.y;
		this.table_hide_view.addChild(card.card_view);
	}
}
Table.prototype.initControls=function(){
	var self=this;
	this.control_view=new createjs.Container();
	this.control_view.x=750;
	this.control_view.y=260;
	this.table_view.addChild(this.control_view);
	
	
	this.initControl_items('chi',0,function(ev){
		console.log('chi!');
		socket.emit('chi',{card_name:self.throw_card_list[self.throw_card_list.length-1].txt});
	});
	this.initControl_items('peng',38,function(ev){
		console.log('peng');
	});
	this.initControl_items('gang',76,function(ev){
		console.log('gang');
	});
	this.initControl_items('hu',114,function(ev){
		console.log('hu');
	})
}
Table.prototype.initControl_items=function(txt,pos_x,callback){
	var  item=new createjs.Container();
	this.control_view.addChild(item);
	item.x=pos_x;
	var control_bg=new createjs.Shape();
	control_bg.graphics.beginStroke("#000").drawRect(0,0,36,36);
	control_bg.graphics.beginFill("#fff").drawRect(1,1,35,35);
	item.addChild(control_bg);
	var control_chi_txt=new createjs.Text(txt,"14px Microsoft Yahei","#ff7000");
	item.addChild(control_chi_txt);
	control_chi_txt.y=8;
	
	item.addEventListener('click',function(ev){
		if(typeof callback === 'function'){
			callback(ev);
		}
	});
}
Table.prototype.dealCards=function(){
	var self=this;
	self.cards_list=[];
	for (var index = 0; index < 13; index++) {
		var card=new Card({
			name:'card_'+index,
			x:this.last_pos.x,
			y:this.last_pos.y,
			card_id:index,
			txt:self.cards_name_list[index],
			side:2
		});
		self.cards_list.push(card);
		this.table_hide_view.addChild(card.card_view);
	}
	self.animationCards();
//	return arr;
}
Table.prototype.animationCards=function(){
	var self=this;
	var count=0;
	function handler(ev){
		if(count>12){
			self.dealCardsToPlayers();
			self.getCardFromMachine();
			return;
		}
		createjs.Tween.get(self.cards_list[count].card_view).to({
		x:62*count,
		y:300},200).call(handler);
		count++;
	}
	handler();
}
Table.prototype.dealCardsToPlayers=function(){
	var self=this;
	this.cards_list.forEach(function(val,index){
		val.side=1;

		val.y=0;
		val.x=62*index;
		var card=new Card(val.getInfo());
		self.table_player_view.addChild(card.card_view);
		self.table_hide_view.removeChild(val.card_view);
		self.player_cards_list.push(card);
		// val.draw();
	});
}
Table.prototype.bindEvent=function(){

}
Table.prototype.getCardFromPlayer=function(card){
	var info=card.getInfo();
	info.x=62*this.throw_card_count;
	info.y=100;
	var _card=new Card(info);
	this.table_player_view.removeChild(card.card_view);
	var _index=this.player_cards_list.indexOf(card);
	this.throw_card_list.push(this.player_cards_list[_index]);
	this.player_cards_list.splice(_index,1);
	this.playerSortCards();
	this.table_show_view.addChild(_card.card_view);
	this.throw_card_count++;
}
Table.prototype.getCardFromMachine=function(card_name){
	var self=this;
	socket.emit("player get one card",Global.username);
	socket.on("player get one card",function(data){
		console.log("player get one card",data);
		var info={x:0,y:0,txt:data.card,side:1,card_id:1000};
		var _card=new Card(info);
		self.player_cards_list.push(_card);
		self.table_player_view.addChild(_card.card_view);
		self.playerSortCards();
	});
	
}
Table.prototype.playerSortCards=function(){
	console.log(this.player_cards_list);
	for (var i = 0; i < this.player_cards_list.length; i++) {
		this.player_cards_list[i].card_view.x=i*62;
	}
}