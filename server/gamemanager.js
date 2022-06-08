module.exports = {

    /*
        Initialise les decks des joueurs et lance le premier tour
    */
    start: function(pData, pPlayer1, pPlayer2){

        this.goToNextRound(pPlayer1, pPlayer2)

    },

    /*
        2: Joueur 1 se protège de l'attaque adverse
        1: Le joueur 1 gagne
        0: Egalité
        -1: Le joueur 2 gagne
        -2: Joueur 2 se protège de l'attaque adverse
    */
    checkCards: function (pData, pPlayer1, pPlayer2) {

        return pData.cardWeakness[pPlayer1.choice["type"]][pPlayer2.choice["type"]]

    },

    /*
        Reçoit les résultats du round et effectue leurs effets
    */
    getResultRound: function(pData, pResult, pPlayer1, pPlayer2) {

        switch(pResult){
            case -2:
                if(pPlayer1.choice["power"] < pPlayer2.choice["power"])
                {
                    pPlayer1.looseLife(pPlayer2.choice["power"] / 2)
                }
                else {
                    pPlayer2.looseLife(pPlayer1.choice["power"] - pPlayer2.choice["power"])
                }
                break


            case -1:
                pPlayer1.looseLife(pPlayer2.choice["power"])
                break


            case 0:
                // this.getMeteorSmashResult(pData, pPlayer1, pPlayer2)
                break


            case 1:
                pPlayer2.looseLife(pPlayer1.choice["power"])
                break


            case 2:
                if(pPlayer2.choice["power"] < pPlayer1.choice["power"])
                {
                    pPlayer2.looseLife(pPlayer1.choice["power"] / 2)
                }
                else {
                    pPlayer1.looseLife(pPlayer2.choice["power"] - pPlayer1.choice["power"])
                }
                break


            case 3:
                console.log("GUARD")
                break


            default:
                break
        }

    },

    /*
        Reçoit les résultats du meteor smash et effectue ses effets
        retourne le perdant
    */
    getMeteorSmashResult: function(pData, pPlayer1, pPlayer2){

        if(pPlayer1.hitCount > pPlayer2.hitCount)
        {
            pPlayer2.looseLife(pPlayer1.choice["power"])
            return 2
        }
        else if(pPlayer1.hitCount < pPlayer2.hitCount)
        {
            pPlayer1.looseLife(pPlayer2.choice["power"])
            return 1
        }
        else
        {
            this.getResultRound(pData, 3, pPlayer1, pPlayer2)
            return 0
        }

    },

    /*
        Initialise un nouveau tour
    */
    goToNextRound: function(pPlayer1, pPlayer2){

        pPlayer1.resetHand()

        pPlayer2.resetHand()
    },

    /*
        Vérifie l'état des joueurs pour déterminer la suite du jeu
    */
        getResultGame: function(pPlayer1, pPlayer2){

        if(!pPlayer1.life)
        {
            this.endGame(pPlayer2, pPlayer1)
            return 1
        }
        else if(!pPlayer2.life)
        {
            this.endGame(pPlayer1, pPlayer2)
            return -1
        }
        else
        {
            this.goToNextRound(pPlayer1, pPlayer2)
            return 0
        }

    },

    /*
        Met fin au jeu
    */
    endGame: function(pWinner, pLoser){

        console.log(pWinner.name + " a vaincu " + pLoser.name)

    },
};
