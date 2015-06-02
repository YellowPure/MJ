var game_data={
	player_card_list:null,
	setCardData:function(card_list){
		if(!this.player_card_list){
			this.player_card_list = new Array();
		}
		this.player_card_list=this.player_card_list.concat(card_list);
	},
	getCardNameByIndex:function(index){
		if(this.player_card_list[index]!=undefined){
			return this.player_card_list[index];
		}
	}
}