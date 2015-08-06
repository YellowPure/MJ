var CardBox = require('./CardBox');
var Table = require("./Table");
var Global = require("./Global");
var Machine = require("./Machine");
var Global = require('./Global');

function GameMain(option) {
    this.playerList = option.playerList || null;
    this.roomId = option.roomId || null;
    this.GAME_STATE = "NOT_BEGIN";
    this.table = null;
    this.cardBox = null;
    this.machine = Object.create(Machine);
    this.curPlayerIndex = 0;
    this.curPlayer = null;
    //上一个操作的玩家索引
    this.lastPlayerIndex = null;
    this.insertList = [];
    this.recordPlayer = null;
    //    this.nextPlayerState = "NOT_BEGIN";
}
GameMain.prototype.startGame = function () {
    var self = this;
    this.GAME_STATE = 'GAME_START';
    this.table = new Table();
    this.cardBox = new CardBox();
    this.playerList.forEach(function (ele, index) {
        var _num = 13;
        if (index == 0) {
            _num = 14;
        }
        var cards = self.cardBox.dealCards(_num);
        ele.cardList = cards;
        ele.socket.emit('start game', {
            card_list: cards
        });
    });
};
GameMain.prototype.endGame = function () {
    this.GAME_STATE = "GAME_END";
    this.table = null;
    this.cardBox = null;
    this.playerList = null;
    Global.rooms[this.roomId].resetGame();
}
/**
 * 初始化时发牌
 */
GameMain.prototype.dealCardsToPlayers = function () {
    var self = this;
    this.playerList.forEach(function (ele) {
        var cards = self.cardBox.dealCards(13);
        ele.cardList = cards;
        ele.socket.emit('deal card', {
            card_list: cards
        });
    });
};
GameMain.prototype.checkChiTableLastCard = function () {
    var chi_result = this.machine.chi(this.playerList[this.curPlayerIndex].cardList, this.table.lastCard());
    if (chi_result) {
        this.recordPlayer = this.playerList[this.curPlayerIndex];
        console.log('cur player waiting', this.recordPlayer.username);
        this.GAME_STATE = "WAIT_CHI";
    }
};
/**
 * 获取throw的牌
 */
GameMain.prototype.throwCard = function (cardName, socket) {
    console.log('gameMain get throw Card', this.GAME_STATE);


    var _player = this.getPlayerByName(socket.username);
    var _index = _player.cardList.indexOf(cardName);
    
    //    判断如果出牌的不是当前允许出牌的玩家
    if (_player.username != this.playerList[this.curPlayerIndex].username) {
        _player.socket.emit('throw', {
            result: -1,
            msg: 'error : not cur action player!'
        });
        return;
    }
    //    //    通知room中其他玩家throw的牌 到table中
    //    socket.broadcast.to(this.roomId).emit('table add card', {
    //        card_name: cardName
    //    });
    //    this.table.addCard(cardName);
    //    检查
    this.check();
    //    如果有玩家可操作 等待玩家操作
    if (this.GAME_STATE == 'WAIT_ACTION') {
        this.waitPlayerAction();
        if (this.recordPlayer.username != _player.username) {
            _player.socket.emit('throw', {
                result: -1,
                msg: 'error : game state wait!'
            });
            return;
        }
    }
    
    
    //    this.checkCurPlayerChi();
    if (this.GAME_STATE == "WAIT_CHI") {
        _player.socket.emit('throw', {
            result: -1,
            msg: 'error : game state wait!'
        });
        return;
    }
    
    //    从玩家手中删掉要throw的牌
    if (_index != -1) {
        _player.cardList.splice(_index, 1);
    }
    //    通知前端throw的牌
    socket.emit('throw', {
        result: 0,
        card_name: cardName
    });
    this.table.addCard(cardName);
    //    下一位玩家操作
    this.turnPlayer();
};
//  检查下一位操作玩家是否可吃牌 如可吃 修改游戏状态 停止发牌
GameMain.prototype.checkCurPlayerChi = function () {
    var chi_result = this.machine.chi(this.playerList[this.curPlayerIndex].cardList, this.table.lastCard());
    if (chi_result) {
        this.recordPlayer = this.playerList[this.curPlayerIndex];
        console.log('cur player waiting', this.recordPlayer.username);
        this.GAME_STATE = "WAIT_CHI";
    }
};
//  检查相关内容
GameMain.prototype.check = function () {
    //    检查其他三位玩家是否可以碰当前桌上最后一张牌
    this.checkNotCurPlayerAblePeng();
    console.log('this.insertList.length1', this.insertList.length);
    //    检查其他三位玩家是否可以杠当前桌上最后一张牌
    this.checkNotCurPlayerAbleGang();
    console.log('this.insertList.length2', this.insertList.length);
    //    检查其他三位玩家是否可以胡当前桌上最后一张牌
    this.checkNotCurPlayerAbleHu();
    console.log('this.insertList.length3', this.insertList.length);
    if (this.insertList.length > 0) {
        this.GAME_STATE = "WAIT_ACTION";
    }
};
//  清空insertlist
GameMain.prototype.clearInsertList = function () {
    this.insertList = [];
};
//  等待玩家操作
GameMain.prototype.waitPlayerAction = function () {
    //  通过获取insertList获取可以操作的玩家index
    this.curPlayerIndex = this.playerList.indexOf(this.insertList[0].player);
    //  获取玩家对象
    this.recordPlayer = this.playerList[this.curPlayerIndex];
    console.log(this.insertList[0]['player'].username, "is next player");
    //  告知该玩家 轮到他操作
    this.insertList[0]['player'].socket.emit('player turn', {
        index: this.curPlayerIndex
    });
    console.log('change game state');
    //    改变游戏状态
    //    this.GAME_STATE = "WAIT_ACTION";
    //    通知其他玩家当前操作玩家
    this.insertList[0]['player'].socket.broadcast.emit('wait player', {
        username: this.insertList[0].username
    });
};
GameMain.prototype.curPlayerGuo = function (username) {
    if (this.GAME_STATE == "WAIT_CHI" && this.recordPlayer.username != username) {
        return;
    }
    this.dealCardToPlayer(username);
    this.GAME_STATE = "GAME_START";
}
GameMain.prototype.insertListTurnNextPlayer = function (username) {
    if (this.GAME_STATE == "WAIT_ACTION" && this.recordPlayer.username != username) {
        return;
    }
    //    找到当前操作玩家 修改游戏状态  insertList
    var delIndex;
    for (var index = 0, len = this.insertList; index < len; index++) {
        if (this.insertList[i].username == username) {
            delIndex = i;
        }
    }
    this.insertList.splice(delIndex, 1);
    if (!this.insertList.length) {
        this.GAME_STATE = "GAME_START";
    } else {
        this.turnPlayer(this.insertList[0].player.username);
    }

};
GameMain.prototype.guo = function (username) {
    //    如果是等待操作 则从insertList中获取下一个操作玩家   或者是下一位玩家吃牌判断时 
    if (this.GAME_STATE == "WAIT_ACTION") {
        this.insertListTurnNextPlayer(username);
    } else if (this.GAME_STATE == "WAIT_CHI") {
        this.curPlayerGuo(username);
    }
};
//  通过name获取player对象
GameMain.prototype.getPlayerByName = function (username) {
    var result = null;
    this.playerList.forEach(function (ele, index) {
        if (ele.username == username) {
            result = ele;
        }
    });
    return result;
};
GameMain.prototype.waitActionStateTurnNext = function (username) {
    var _player = this.getPlayerByName(username);
    var _index = this.playerList.indexOf(_player);
    this.lastPlayerIndex = this.curPlayerIndex;
    this.curPlayerIndex = _index;
    
    var _name = this.playerList[this.curPlayerIndex].username;
    Global.io.to(this.roomId).emit('player turn', {
        name: _name
    });
};
GameMain.prototype.defaultStateTurnNext = function () {
    console.log(this.table.cardList,this.table.lastCard(),'----------');
    var nextIndex = 0;
    var _player = this.playerList[this.curPlayerIndex];
    var _index = this.playerList.indexOf(_player);
    //    如果当前玩家的index超过允许的长度 就回到第一个玩家操作
    if (_index >= this.playerList.length - 1) {
        nextIndex = 0;
    } else {
        nextIndex = _index + 1;
    }
    this.lastPlayerIndex = this.curPlayerIndex;
    this.curPlayerIndex = nextIndex;

    var _name = this.playerList[nextIndex].username;
    Global.io.to(this.roomId).emit('player turn', {
        name: _name
    });
    //    检查是否可吃桌上最新的一张牌
    this.checkChiTableLastCard();
    if (this.GAME_STATE == "WAIT_CHI") {

    }else {
        this.dealCardToPlayer(_name);
    }
};
//  下一位玩家操作
GameMain.prototype.turnPlayer = function (username) {
    var _username = username || null;
    if (_username && this.GAME_STATE == "WAIT_ACTION") {
    	this.waitActionStateTurnNext(_username);
    } else {
        this.defaultStateTurnNext();
    }


};
// GameMain.prototype.checkCurPlayerAbleHu = function(){
// 	var cardList = this.playerList[this.curPlayerIndex].cardList;
// 	var result = this.machine.hu(cardList);
// 	return result;
// }
GameMain.prototype.dealCardToPlayer = function (username) {
    var _player = this.getPlayerByName(username);
    var card = this.cardBox.dealCards(1);
    _player.addCard(card[0]);
    _player.socket.emit('deal card', {
        card_list: card
    });
};
GameMain.prototype.stopGame = function () {
    this.game_state = "GAME_STOP";
};
GameMain.prototype.chi = function (name) {
    // console.log('chi playername:', name);
    var _player = this.getPlayerByName(name);
    if (this.GAME_STATE != 'GAME_START' && this.recordPlayer && this.recordPlayer.username != name) {
        // console.log('game state :wait');
        _player.socket.emit('chi', {
            result: -1,
            msg: 'error : game state wait!'
        });
        return;
    }
    this.recordPlayer = null;
    var prevPlayerIndex = this.getPrevPlayerIndexByCurPlayerName(_player.username);
    // 检查上一张牌是否是从自己的上家打出的
    if (prevPlayerIndex != this.lastPlayerIndex) {
        this.getPlayerByName(name).socket.emit('chi', {
            result: -1,
            msg: 'not from prev player'
        });
        return;
    }
    var card_name = this.table.lastCard();
    if (card_name) {
        var result = this.machine.chi(_player.cardList, card_name);
        if (result) {
            this.GAME_STATE = "GAME_START";

            _player.socket.emit('chi', {
                hand_list: [result[0], result[1]],
                table_card: result[2]
            });
            _player.holdListAdd(result[0], result[1]);
            _player.delCards(result[0], result[1]);
            this.table.delCard(result[2]);
            _player.socket.broadcast.to(this.roomId).emit('table remove card', {
                table_card: result[2]
            });
        } else {
            _player.socket.emit('chi', {
                result: -1,
                msg: 'card check error'
            });
        }
    } else {
        _player.socket.emit('chi', {
            result: -1,
            msg: 'card check error'
        });
    }

};
GameMain.prototype.peng = function (name) {
    var _player = this.getPlayerByName(name);
    // console.log('this.GAME_STATE::',this.GAME_STATE,this.recordPlayer.username,name);
    if (this.GAME_STATE == 'WAIT_ACTION' && this.recordPlayer && this.recordPlayer.username != name) {
        console.log('game state :wait');
        _player.socket.emit('peng', {
            result: -1,
            msg: 'error : game state wait!'
        });
        return;
    }
    this.recordPlayer = null;
    var result = this.checkPeng(_player);
    // console.log('result_peng:', result);
    if (result) {
        _player.onlyPeng = false;
        this.GAME_STATE = "GAME_START";
        _player.delCards(result[0], result[1]);
        _player.holdListAdd(result[0], result[1]);
        this.table.delCard(result[2]);
        this.clearInsertList();
        _player.socket.emit('peng', {
            result: 0,
            hand_list: [result[0], result[1]],
            table_card: result[2]
        });
    } else {
        _player.socket.emit('peng', {
            result: -1,
            msg: 'card check error'
        });
    }
};
GameMain.prototype.hu = function (name) {
    var _player = this.getPlayerByName(name);
    if (this.GAME_STATE == 'WAIT_ACTION' && this.recordPlayer && this.recordPlayer.username != name) {
        console.log('game state :wait');
        _player.socket.emit('hu', {
            result: -1,
            msg: 'error : game state wait!'
        });
        return;
    }
    this.recordPlayer = null;
    var result = this.checkHu(_player);
    if (result) {
        this.GAME_STATE = "GAME_START";
        this.clearInsertList();
        _player.socket.emit('hu', {
            result: 0,
            winner: _player.username
        });
        Global.io.to(this.roomId).emit('game end', { result: 0, winner: _player.username });
        this.endGame();
    } else {
        _player.socket.emit('hu', {
            result: -1,
            msg: 'card check error'
        });
    }
};
GameMain.prototype.checkPeng = function (_player) {
    var result = null;
    var card_name = this.table.lastCard();
    if (card_name) {
        var _result = this.machine.peng(_player.cardList, card_name);
        if (_result) {
            result = _result;
        }
    }
    return result;
}
GameMain.prototype.getPrevPlayerIndexByCurPlayerName = function (username) {
    var _index = -1;
    this.playerList.forEach(function (ele, index) {
        if (ele.username == username) {
            _index = index;
        }
    });
    if (_index != -1) {
        _index -= 1;
        if (_index < 0) {
            _index = this.playerList.length - 1;
        }
    }
    return _index;
};
GameMain.prototype.gang = function (name) {
    var _player = this.getPlayerByName(name);
    if (this.GAME_STATE == 'WAIT_ACTION' && this.recordPlayer && this.recordPlayer.username != name) {
        console.log('game state :wait');
        _player.socket.emit('gang', {
            result: -1,
            msg: 'error : game state wait!'
        });
        return;
    }
    this.recordPlayer = null;
    var card_name = this.table.lastCard();
    var result = this.machine.gang(_player.cardList, card_name);
    if (result.result) {
        this.GAME_STATE = "GAME_START";
        if (result.type == 1) {
            _player.delCards(result.result[0], result.result[1], result.result[2], result.result[3]);
            _player.holdListAdd(result.result[0], result.result[1], result.result[2], result.result[3]);
            _player.socket.emit('gang', {
                result: 0,
                hand_list: result.result
            });
        } else if (result.type == 2) {
            this.clearInsertList();
            _player.delCards(result.result[0], result.result[1], result.result[2]);
            _player.holdListAdd(result.result[0], result.result[1], result.result[2]);
            this.table.delCard(result.result[3]);
            _player.socket.emit('gang', {
                result: 0,
                hand_list: [result.result[0], result.result[1], result.result[2]],
                table_card: result.result[3]
            });
        }

    } else {
        _player.socket.emit('gang', {
            result: -1,
            msg: 'card check error'
        });
    }
};
GameMain.prototype.checkNotCurPlayerAblePeng = function () {
    // var results = [];
    var checkList = [];
    var tempList = this.playerList;
    var a_arr = tempList.slice(this.curPlayerIndex, this.playerList.length);
    var b_arr = tempList.slice(0, this.curPlayerIndex);
    checkList = a_arr.concat(b_arr);

    for (var i = 0; i < checkList.length; i++) {
        var _result = this.checkPeng(checkList[i]);
        if (_result) {
            // checkList[i].onlyPeng = true;
            // console.log('_result:', _result, checkList[i]);
            this.insertList.push({
                result: _result,
                player: checkList[i]
            });
        }
    }
};
GameMain.prototype.checkNotCurPlayerAbleGang = function () {
    var checkList = [];
    var tempList = this.playerList;
    var a_arr = tempList.slice(this.curPlayerIndex, this.playerList.length);
    var b_arr = tempList.slice(0, this.curPlayerIndex);
    checkList = a_arr.concat(b_arr);

    for (var i = 0; i < checkList.length; i++) {
        var _result = this.checkGang(checkList[i]);
        if (_result) {
            // checkList[i].onlyPeng = true;
            // console.log('_result:', _result, checkList[i]);
            this.insertList.push({
                result: _result,
                player: checkList[i]
            });
        }
    }
};
GameMain.prototype.checkNotCurPlayerAbleHu = function () {
    var checkList = [];
    var tempList = this.playerList;
    var a_arr = tempList.slice(this.curPlayerIndex, this.playerList.length);
    var b_arr = tempList.slice(0, this.curPlayerIndex);
    checkList = a_arr.concat(b_arr);

    for (var i = 0; i < checkList.length; i++) {
        var _result = this.checkHu(checkList[i]);
        if (_result) {
            // checkList[i].onlyPeng = true;
            // console.log('_result:', _result, checkList[i]);
            this.insertList.push({
                result: _result,
                player: checkList[i]
            });
        }
    }
};
GameMain.prototype.checkHu = function (_player) {
    var result = null;
    result = this.machine.hu(_player.cardList);
    return result;
};
GameMain.prototype.checkGang = function (_player) {
    var result = null;
    var card_name = this.table.lastCard();
    if (card_name) {
        var _result = this.machine.gang(_player.cardList, card_name);
        if (_result.result && _result.type == 2) {
            result = _result.result;
        }
    }
    return result;
};
GameMain.prototype.wait = function () {
    this.curPlayerIndex = -1;
}
module.exports = GameMain;