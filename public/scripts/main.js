var socket = io()

require.config({
    baseUrl: 'scripts',
})

require([
'sprite',
'cardManager',
'soundManager',
'meteorSmashManager',
'tools'
], function (Sprite, cardManager, soundManager, meteorSmashManager, tools){

  var body = $('body')
  var stage = $('#stage')
  var continueButton = $('#continueButton')
  var selectorMenu = $('#selectorMenu')
  var optionMenu = $('#optionMenu')
  var sprite1 = new Sprite('#player1', 'Masamune','Idle', 7, 433, 342 )
  sprite1.display(sprite1)
  var sprite2 = new Sprite('#player2', 'Nemusama','Idle', 7, 433, 342 )
  sprite2.display(sprite2)

  var dataServer
  var roomName
  var whichPlayer
  var username

  var triggerMenu = false
  var canTalk = true

  function init(){
    soundManager.soundOption()
    soundManager.updateBGSound(null, '#SoundMainMenu')
  }

  function updatingCSS(){
    username = $('.usernameInput').val()

    soundManager.updateBGSound('#SoundMainMenu','#SoundIG')

    // Initialisation pseudonyme
    socket.emit('new game', username)
    if(username !== ""){
        $("#hudPlayer1").find(".playerName").html(username)
    }

    socket.on('assign number', function(pPlayerNumber, pRoomName){
        whichPlayer = pPlayerNumber
        roomName = pRoomName
    })

    $("#HomeTemplate").css({
        'display': 'none',
    })

    tools.brightnessUpDown($("#gamePlane"),1.5, 900, function(){
        $("#gamePlane").css({
            'height': '75%',
        })
    })

    socket.on('init game', function(pPlayer1Name, pPlayer2Name){
        var lOpponentUsername = whichPlayer == 1 ? pPlayer2Name : pPlayer1Name
        if(lOpponentUsername !== ""){
            $("#hudPlayer2").find(".playerName").html(lOpponentUsername)
        }
        setTimeout(function(){
            $("#hudTop").css({"display": "block"})
            $("#inputText").css({"display": "block"})
            $("#groundRight").css({"display": "block"})
            $("#messageSystem").css({"display": "none"})
            $("#hudCard").css("display", "block")
        }, 5000)
    })

    initData(initTurn);

    // Tchat box
    socket.on('message_received', function(pPlayerNumber, pMessage){

        var target = "#tchatP" + (pPlayerNumber == whichPlayer ? 1 : 2)
        $(target).append(pMessage)
        $(target).css('display', 'block')
        setTimeout(function(){
            $(target).css('display', 'none')
            $(target).children().last().remove()
            if(pPlayerNumber == whichPlayer)
            {
                $('#inputText').val("")
                canTalk = true
            }
        }, 5000)

    })

    $("body").keydown(function(pEvent){
        if(pEvent.which == 13 && canTalk)
        {
            var text = '<span>' + $('#inputText').val() + '</span>'
            socket.emit('message_send', roomName, whichPlayer, text)
            $('#inputText').val("")
            canTalk = false
        }
        else if(pEvent.which == 13 && !canTalk){
            $('#inputText').val("You have to wait 5s")
        }
    })
  }

  // Mise à jour des donnés client
  function initData(pCallBack) {
      socket.on('init data', function(pData){
          console.log(pData);
          dataServer = pData
          pCallBack()
      })
  }

  // Tire les cartes
  function initTurn(pData) {
      cardManager.updateCards(dataServer["player"+whichPlayer].hand)
      setTimeout(function(){
          for(var i = dataServer["player" + whichPlayer].nbCard - 1; i >= 0; i--){
              cardManager.allCardsDraw(dataServer["player" + whichPlayer].hand[i], i, dataServer["player" + whichPlayer].nbCard - 1)
              soundManager.playSound('#Shuffle')
          }
      }, 5000)
      cardManager.getCardId(dataServer["room"], whichPlayer, dataServer["player"+(whichPlayer == 1 ? 2 : 1)]["hand"])
  }

  function getCardsType(pCards) {

    var lType = []
    for(var i = 0; i < 3; i++) {
      lType.push(pCards.hand[i]["type"])
    }
    return lType
  }

  function returnToMenu(){
    stage.css({
      'display':'none'
    })

    body.css({
        'background-image': 'url(../assets/HomeScreen.jpg)'

    })

    continueButton.css({
      'display': 'none'
    })

    $('#HomeTemplate').css({
      'display': 'block'
    })

    soundManager.updateBGSound('#SoundIG','#SoundMainMenu')

  }

  function goToWin(){
    stage.css({
      'display':'none'
    })
    body.css({
        'background-image': 'url(../assets/winScreen.png)',
        'background-size': 'cover',
        'background-position-x': 'center'
    })
    continueButton.css({
      'display': 'block'
    })

  }

  function goToLose(){
    stage.css({
      'display':'none'
    })
    body.css({
        'background-image': 'url(../assets/losingScreen.png)',
        'background-size': 'cover',
        'background-position-x': 'center'
    })
    continueButton.css({
      'display': 'block'
    })
  }

  socket.on('win', function (pPlayer) {
      setTimeout(function(){
          if (pPlayer === 'player' + whichPlayer) {
              goToWin()
          }
          else {
              goToLose()
          }
      }, 15000)
  })

  socket.on('setMeteorSmash', function(pDuration){
      meteorSmashManager.initMeteorSmash(dataServer.room, whichPlayer, 4, pDuration)
      soundManager.playSound('#BeginningMeteor')
  })

    function updateAnimation(pAnimation){

        var currentAnimation

        switch (pAnimation) {
            case 'high':
                currentAnimation = 'Slash_High'
                break;
            case 'middle':
                currentAnimation = 'Slash_Middle'
                break;
            case 'low':
                currentAnimation = 'Slash_Low'
                break;
            case 'guard':
                currentAnimation = 'Guard_High'
                break;
            case 'Hit_Middle':
                currentAnimation = 'Hit_Middle'
                break;
            case 'Hit_High_Low':
                currentAnimation = 'Hit_High_Low'
                break;
        }

      return currentAnimation
    }

    socket.on('selectCard', function(pData){

        setTimeout(function(){
            cardManager.resetCardPosition()
        }, 5000)

        setTimeout(function(){

            soundManager.playSound('#RockPaperScissor')

            setTimeout(function(){
                if (whichPlayer === 1) {
                    updatePlayerAnimation(pData["player1"])
                    updateEnemyAnimation(pData["player2"])
                }
                else {
                    updatePlayerAnimation(pData["player2"])
                    updateEnemyAnimation(pData["player1"])
                }
                console.log(pData);
                soundManager.playSound('#SwordSlash')
                $("#hudPlayer" + (whichPlayer == pData.whoLoseLife ? 1 : 2)).find(".lifeBar").css("width", pData.lifeRemaining)
            }, 4000)
        }, 5000)

        setTimeout(function(){
            socket.emit('turnEnd', dataServer.room)
        }, 5000)
    })

    socket.on('nextTurn', function(pData){
        console.log("on pas au prochain tour");
        dataServer = pData
        initTurn()
    })



    function updatePlayerAnimation(pAnimation) {

        var lAnimation = updateAnimation(pAnimation)
        var lFrames = 16

        switch (lAnimation) {
            case 'Hit_Middle':
                lFrames = 9
                break;
            case 'Hit_High_Low':
                lFrames = 10
                break;
        }

        sprite1.clear()
        sprite1 = new Sprite('#player1', 'Masamune', lAnimation, lFrames, 433, 342 )
        sprite1.display(sprite1)
    }

    function updateEnemyAnimation(pAnimation) {

        var lAnimation = updateAnimation(pAnimation)
        var lFrames = 16

        switch (lAnimation) {
            case 'Hit_Middle':
                lFrames = 9
                break;
            case 'Hit_High_Low':
                lFrames = 10
                break;
        }

        sprite2.clear()
        sprite2 = new Sprite('#player2', 'Nemusama', lAnimation, lFrames, 433, 342 )
        sprite2.display(sprite2)
    }

  $('#NextButton').click(function(){
    updatingCSS();
  })

  continueButton.click(function(){
      returnToMenu();
  })

//BOUTONS A REMPLACER PAR CONDITIONS
  $('#GoToWinScreen').click(function(){
      goToWin();
  })
  $('#GoToLoseScreen').click(function(){
    goToLose();
  })

  $('#surrendBanner').click(function(){
      goToLose();
  })

  $('#tutorial').on('click touchstart',function(){
      alert("Hight Slash > Low Slash \n Low Slash > Middle Slash \n Middle Slash > Hight Slash \n Guard Block & Rispost");
  })

  $('#StartMeteor').click(function(){
    meteorSmashManager.initMeteorSmash(5, dataServer.room, whichPlayer);
  })

  selectorMenu.click(function(){
      if (triggerMenu ==false){
          selectorMenu.css({
              'transition': 'left 2s',
              'left': '89%'
          })
          optionMenu.css({
              'transition': 'left 2s',
              'left': '91%'
          })
          triggerMenu = true
      } else if (triggerMenu) {
          selectorMenu.css({
              'transition': 'left 2s',
              'left': '98%'
          })
          optionMenu.css({
              'transition': 'left 2s',
              'left': '100%'
          })
          triggerMenu = false
      }
  })

  socket.on('reset', function(){
      var dataServer = undefined
      var roomName = undefined
      var whichPlayer = undefined
      var username = undefined
      var triggerMenu = false
      var canTalk = true
      $("div").removeAttr('style')
  })

  $(init);

})
