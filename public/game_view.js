
var view = {
	stage: null,
	last_card_pos: { x: 0, y: 0 },
	animation_list: null,
	table: null,
	init: function () {
		var canvas = document.getElementById('game_view');
		canvas.width = $('.game_main').width();
		canvas.height = $('.game_main').height();

		var stage = new createjs.Stage('game_view');
		Global.canvas = canvas;
		this.table = new Table();
		Global.table = this.table;

		stage.addChild(this.table.table_view);
		stage.enableMouseOver(10);
		this.stage = stage;
		this.bindEvent();
	},
	bindEvent: function () {
		var self = this;
		window.addEventListener('resize', function () {
			var canvas = document.getElementById('game_view');
			canvas.width = $('.game_main').width();
			canvas.height = $('.game_main').height();
		});

		createjs.Ticker.addEventListener('tick', function () {
			self.stage.update();
		});
	},
	setData: function (data) {
		if (data.card_list) {
			this.table.cards_name_list = data.card_list;
			this.table.dealCards();
		}
	}
}