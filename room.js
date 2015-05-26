function Room() {

};
Room.prototype.setX = function () {
	console.log('123');
};
var room = {
	init: function () {
		var _ = Object.create(new Room());
		_.setX();
		return _;
	}
};
module.exports = room;