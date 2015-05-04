function Card(x, y, width, height, ctx, text) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.ctx = ctx;
	this.text = text;
	this.draw();
}
Card.prototype.draw = function () {
	var roundedRect = function (ctx, x, y, width, height, radius) {
		ctx.beginPath();
		ctx.moveTo(x, y + radius);
		ctx.lineTo(x, y + height - radius);
		ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
		ctx.lineTo(x + width - radius, y + height);
		ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
		ctx.lineTo(x + width, y + radius);
		ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
		ctx.lineTo(x + radius, y);
		ctx.quadraticCurveTo(x, y, x, y + radius);
		
	}
	roundedRect(this.ctx, this.x, this.y, this.width, this.height, 2);
	var textField_x = this.x + this.width / 2;
	var textField_y = this.y + this.height / 2 - 2;
	this.ctx.font = "10px Arial";;
	this.ctx.textAlign = "center";
//	this.ctx.fillStyle = "#f00";
	for (var index = 0; index < this.text.length; index++) {
		var element = this.text.charAt(index);
		this.ctx.fillText(element, textField_x, textField_y + (index) * 10);
	}
	this.ctx.stroke();
//	console.log(this.width);
	
//	this.ctx.fill();
	
}
var view = {
	canvas: null,
	ctx: null,
	init: function () {
		this.canvas = document.getElementById('game_view');
		this.ctx = this.canvas.getContext('2d');
		this.bindEvent();
		this.render();
	},
	bindEvent: function () {
		var self=this;
		this.canvas.addEventListener('click', function (ev) {
			var pos=self.getEventPosition(ev);
			console.log(pos);
			if(self.ctx.isPointInPath(pos.x,pos.y)){
				console.log('click!!')
			}
		}, false);
	},
	getEventPosition: function (ev) {
		var x, y;
		if (ev.layerX || ev.layerX == 0) {
			x = ev.layerX;
			y = ev.layerY;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
			x = ev.offsetX;
			y = ev.offsetY;
		}
		return { x: x, y: y };
	},
	render: function () {
		//		this.renderOneCard();
		for (var index = 0; index < 13; index++) {
			var a = new Card(100 + index * 40, 100, 30, 40, this.ctx, "一万");
		}

	},
	renderOneCard: function (x, y) {
		this.roundedRect(this.ctx, 100, 100, 30, 40, 2);
		this.ctx.font = "10px Arial";
		this.ctx.textAlign = 'left';
		this.ctx.fillStyle = '#f00';
		this.ctx.fillText('yi_wan', 0, 20);
	},


}
view.init();