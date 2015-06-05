
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
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener('tick', function () {
			self.stage.update();
		});
	},
	countDown:function (callback){
		var num = 3;
		var _countDown = function(num) {
			if ($('.count_down').length == 0) {
				$('body').append('<h1 class="count_down">' + num.toString() + '</h1>');
			}
			setTimeout(function () {
				$('.count_down').remove();
			}, 950);
		};
		_countDown(num);
		var timeId = setInterval(function () {
			num--;
			_countDown(num);
			console.log(num);
			if (num == 0) {
				clearInterval(timeId);
				$('.count_down').remove();
				if(typeof callback== 'function'){
					callback();
				}
			}
		}, 1000);
	}
}