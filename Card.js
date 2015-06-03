function Card(name,type){
	this.name = name;
	this.type = type;
	this.txt = name +'_'+type;
}
module.exports = Card;