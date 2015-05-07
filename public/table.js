function Table() {
	this.table_view=new createjs.Container();
	this.cards_list=[];
	this.player_cards_list=[];
	this.animat_index=0;
	this.last_pos={x:0,y:0};
	this.cards_name_list=[];
	this.throw_card_count=0;

	this.table_hide_view=new createjs.Container();
	this.table_view.addChild(this.table_hide_view);
	this.table_show_view= new createjs.Container();
	this.table_show_view.y=80;
	this.table_view.addChild(this.table_show_view);
	this.table_player_view=new createjs.Container();
	this.table_player_view.y=300;

	this.table_view.addChild(this.table_player_view);

	this.init();
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
		console.log(val,val.getInfo(),'ffffffffffff');
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
	this.player_cards_list.splice(_index,1);
	this.playerSortCards();
	this.table_show_view.addChild(_card.card_view);
	this.throw_card_count++;
}
Table.prototype.playerSortCards=function(){
	console.log(this.player_cards_list);
	for (var i = 0; i < this.player_cards_list.length; i++) {
		this.player_cards_list[i].card_view.x=i*62;
	}
}