function Table() {
	
	this.cards_list=[];
	this.animat_index=0;
	this.last_pos={x:0,y:0};
	this.init();
	this.cards_name_list=[];
}
Table.prototype.init = function () {
	this.table_view=new createjs.Container();
	for (var i = 0; i < 26; i++) {
		var _x = 0;
		var _y = 0;
		if (i % 2 == 0) {
			_y = 100;
		} else {
			_y = 140;
		}
		_x = 100 + parseInt(i / 2) * 62;
		var card = new Card({
			name: 'card' + i,
			x: _x,
			y: _y,
			card_id: 1,
			text: '1 wam',
			side: 2
		});
		this.last_pos.x=card.card_view.x;
		this.last_pos.y=card.card_view.y;
		this.table_view.addChild(card.card_view);
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
			text:self.cards_name_list[index],
			side:2
		});
		self.cards_list.push(card);
		this.table_view.addChild(card.card_view);
	}
	self.animationCards();
//	return arr;
}
Table.prototype.animationCards=function(){
	var self=this;
	var count=0;
	function handler(){
		if(count>12){
			self.dealCardsToPlayers();
			return;
		}
		createjs.Tween.get(self.cards_list[count].card_view).to({
		x:100+62*count,
		y:300},200).call(handler);
		count++;
	}
	handler();
}
Table.prototype.dealCardsToPlayers=function(){
	this.cards_list.forEach(function(val){
		val.info.side=1;
		val.y=300;
		val.draw();
	});
}