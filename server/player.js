function Player(pData, pName){
    this.name = pName
    this.life = pData.life
    this.nbCard = pData.cardsInHand
    this.deck = this.createDeck(pData)
    this.hand = []
    this.choice = null
    this.hitCount
}

/*
    Ajoute les cartes au deck et les mélange
*/
Player.prototype.createDeck = function(pData){

    var lDeck = []
    var lType

    for(var i = 0; i < Object.keys(pData["cards"]).length; i++){
        lType = Object.keys(pData["cards"])[i]
        for(var j = 0; j < pData["cards"][lType].length; j++){
            for(var k = 0; k < pData["cards"][lType][j]["number"]; k++){
                lDeck.push({"type": lType, "power": pData["cards"][lType][j]["power"]})
            }
        }
    }

    lDeck.sort(function(pA, pB){
    return Math.random() < 0.5 ? -1 : 1
    })

    return lDeck

};

/*
    Pioche les cartes du tour
*/
Player.prototype.drawCard = function() {

    for(var i = 0; i < this.nbCard; i++){
        this.hand[i] = this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0]
    }

};

/*
    Assigne la carte selectionné par le joueur au paramètre correspondant
*/
Player.prototype.chooseCard = function(pSlot) {

    this.choice = this.hand[pSlot]
};

/*
    Reset la main du joueur à zéro
*/
Player.prototype.resetHand = function() {

    this.hand = []
    this.choice = null
    this.drawCard()

};

/*
    Met à jour les pv d'un joueur subissant une attaque
*/
Player.prototype.looseLife = function(pPower) {

    if(pPower > this.life){
        this.life = 0
    }
    else{
        this.life -= pPower
    }

};

module.exports.Player = Player;
