function Card(option) {
	this.x = option.x;
	this.y = option.y;
	this.width = option.width;
	this.height = option.height;
	this.name = option.name;
	this.card_id = option.card_id;
	this.card_view = new createjs.Container();
	this.card_view.x = option.x;
	this.card_view.y = option.y;
	this.bg=new createjs.Shape();
	this.text=new createjs.Text(option.text,"10px Microsoft Yahei", "#ff7000");
	this.text.lineWidth = this.width;
	this.text.visible=false;
	this.card_view.addChild(this.bg);
	this.card_view.addChild(this.text);
	this.info = option;
	this.draw();
	this.bindEvent();
}
Card.prototype.bindEvent = function() {
	var self = this;

	function handlerComplete() {
		self.info.side = 1;
		self.draw();
	};
	this.card_view.addEventListener('click', function(event) {
		// console.log(self.name,event);
		createjs.Tween.get(self.card_view).to({
			y: 200},1000
		).call(handlerComplete);
	});
}
Card.prototype.draw = function() {
	this.bg.graphics.clear();
	if (this.info.side == 1) { //正面
		this.bg.graphics.beginStroke("#000").drawRect(0, 0, this.width, this.height);
		this.text.visible=true;
	} else if (this.info.side == 2) { //反面
		this.bg.graphics.beginStroke('#000').drawRect(0, 0, this.width, this.height);

		this.bg.graphics.beginFill("#f00").drawRect(1, 1, this.width - 1, this.height - 1);
		this.text.visible=false;
	}

}
var view = {

	init: function() {
		var stage = new createjs.Stage('game_view');
		for (var i = 0; i < 13; i++) {
			var card = new Card({
				name: 'card' + i,
				x: 100 + i * 32,
				y: 100,
				width: 30,
				height: 40,
				card_id: 1,
				text: '1 wam',
				side: 2
			});
			stage.addChild(card.card_view);
		};

		createjs.Ticker.addEventListener('tick', function() {
			stage.update();
		});

	}
}
view.init();