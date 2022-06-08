define([
"tools"
],function (tools) {

    // Change les faces des cartes et leur puissance
    function updateCards(pHand) {
        console.log(pHand);
        for(var i = 0; i < 3; i++)
        {

            $('#card' + i).find(".face").attr("src", './assets/images/player1_card_' + pHand[i].type + '.png')
            $('#card' + i).find("span").html(pHand[i].power)
        }
    }

    // Initialise le comportement au clique des cartes
    function getCardId(pRoom, pPlayer) {

        var lIndex
        var lCount = 1
        for (var i = 0; i < 3; i++) {
            $('#card'+ i).click(function () {
                lIndex = parseInt($(this).attr('id').split("card")[1], 10)
                socket.emit('clickOnCard', {
                    "room": pRoom,
                    "player": pPlayer,
                    "cardIndex": lIndex
                })

                for (var j = 0; j < 3; j++)
                {
                    if(parseInt($(this).attr('id').slice(-1)) !== j)
                    {
                        throwCard(j, 300 * lCount++)
                    }
                    else{
                        setSelectCardPos(j)
                        $("#card" + j).removeClass('cardAnimation')
                    }
                    $('#card'+ j).off()
                }
            })
        }
    }

    // Initialise les animations de tirage de carte
    function allCardsDraw (pCard, pNumber, cardMax) {
        setTimeout(function() {
            cardDraws(pCard, pNumber)
        }, 300 * (cardMax - pNumber + 1))
    }

    // Animation de tirage de carte
    function cardDraws(pCard, pNbCard){
        var lWidthOrigin = $("#card" + pNbCard).width()
        $("#card" + pNbCard).css("width", "lWidthOrigin")
        $("#card" + pNbCard).animate({"left": "0px"}, 600, 'swing', function(){
            flipCard(pNbCard, true)
        })

    }

    // Retourne une carte
    function flipCard(pNbCard, pClickable){
        if(tools.getRotationDegrees($("#card" + pNbCard).find(".face")) == 180)
        {
            $("#card" + pNbCard).find(".face").css("transform", "perspective(250px) rotateY(" + 0 + "deg)")
            $("#card" + pNbCard).find(".back").css("transform", "perspective(250px) rotateY(" + -180 + "deg)")
            $("#card" + pNbCard).find(".power").css("transform", "perspective(250px) rotateY(" + 0 + "deg)")

        }
        else{
            $("#card" + pNbCard).find(".face").css("transform", "perspective(250px) rotateY(" + 180 + "deg)")
            $("#card" + pNbCard).find(".back").css("transform", "perspective(250px) rotateY(" + 0 + "deg)")
            $("#card" + pNbCard).find(".power").css("transform", "perspective(250px) rotateY(" + 180 + "deg)")
        }
        if(pClickable || undefined)
        {
            $("#card" + pNbCard).addClass('cardAnimation')
        }
        else if(!pClickable || undefined){
            $("#card" + pNbCard).removeClass('cardAnimation')
        }
    }

    // Anime la carte choisis
    function setSelectCardPos(pNbCard, pwidth){
        $("#hand").css({
            "width": $("#hand").width(),
            "height": $("#hand").height(),
        })
        $("#card" + pNbCard).css({
            "position": "absolute",
            "left": (($("#card" + pNbCard).width() + parseInt($("#card2").css("margin-left").replace("px", "")) * 2) * pNbCard) + "px",
            "transform": "scale(1.2)",
            "z-index": "2",
        })
        setTimeout(function(){
            $("#hand").animate({"width": $("#card" + pNbCard).width(), "bottom": "60%"}, 600)
            $("#card" + pNbCard).animate({"left": 0}, 600)
        }, 1800)
    }

    // Jette les cartes non choisis
    function throwCard(pNbCard, pDelay){
            flipCard(pNbCard, false)
        setTimeout(function(){
            $("#card" + pNbCard).animate({"left": "100vw"}, 600, 'swing', function(){
                $("#card" + pNbCard).css('display', 'none')
            })
        }, pDelay)
    }

    // Animation de la carte victorieuse
    function winCard(){

    }

    // Animation de la carte perdante
    function loseCard(){

    }

    // Reset le style des cartes et de la main
    function resetCardPosition(){
        $("#hand").removeAttr('style')
        $("#card0").removeAttr('style')
        $("#card1").removeAttr('style')
        $("#card2").removeAttr('style')
        $("#card0").removeAttr('style')
        $(".face").removeAttr('style')
        $(".back").removeAttr('style')
        $(".power").removeAttr('style')
    }

    return {
        'updateCards': updateCards,
        'getCardId': getCardId,
        'allCardsDraw': allCardsDraw,
        'flipCard': flipCard,
        'setSelectCardPos': setSelectCardPos,
        'throwCard': throwCard,
        'winCard': winCard,
        'loseCard': loseCard,
        'resetCardPosition': resetCardPosition,
    }
})
