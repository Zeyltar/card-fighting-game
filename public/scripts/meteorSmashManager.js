define([
  'tools',
  'cardManager',
  'soundManager'
], function(tools, cardManager, soundManager) {

  function initMeteorSmash(pRoom, pPlayer, pIntroDuration, pClickDuration) {

    var meteorContainer = $("<div id='meteorContainer'></div>")

    tools.brightnessUpDown($("#gamePlane"), 90, 200, function() {
      $("#gamePlane").css({
          "transition": "height 0.5s",
          "height": "100%",
      })
    })

    $("#gamePlane").css({
        "background-image": "url(../assets/artworked.gif)",
        "background-size": "cover",
        "background-position-y": "top"
    })

    $("#hudPlayer1").css("display", "none")
    $("#hudPlayer2").css("display", "none")
    cardManager.resetCardPosition()
    $("#hudCard").css("display", "none")

    var start = Date.now();

    setTimeout(function() {

      var meteorAnnonce = $("<marquee scrollamount='35px'> METEOR SMASH !</marquee>")

      soundManager.playSound('#MeteorSmash')

      meteorAnnonce.css({
          'font-family': 'Jockey One',
          'font-size': '40px',
          'color': 'red',
          'width': '100%',
          'height': '50px',
          'top': '25%',
          'position': 'absolute'
      })


      var millis = Date.now() - start;

      tools.brightnessUpDown($("#gamePlane"), 90, 220, function() {
        $("#gamePlane").css({
            "height": "100%",
        })
      })

      $("#gamePlane").css({
          "background-image": "",
          "background-size": "",
          "background-position-y": ""
      })

      $("#hudTimer").css("display", "block")
      $("#gamePlane").append(meteorContainer)
      $("#gamePlane").prepend(meteorAnnonce)

      $(".timeBar").css({
          "transition": "width " + pClickDuration + "s",
          "width": "0%",
      })

      setMeteorSmash(pRoom, pPlayer, pClickDuration)

      setTimeout(function() {
        tools.brightnessUpDown($("#gamePlane"), 60, 500, function() {

            $("#hudPlayer1").css("display", "")
            $("#hudPlayer2").css("display", "")
            $("#hudCard").css("display", "block")

          $("#gamePlane").css({
              "transition": "",
              "height": "75%",
          })

          $("#hudTimer").css("display", "")

          $(".timeBar").css({
              "transition": "",
              "width": "",
          })
        })

        meteorContainer.remove()
        meteorAnnonce.remove()

      }, pClickDuration * 1000)

    }, pIntroDuration * 1000)

  }

  function setMeteorSmash(pRoom, pPlayer, pDuration) {

    setTimeout(function() {
      socket.emit('meteorSmashResult', {
          "room": pRoom,
          "player": pPlayer,
          "score": hitScore.value
      })

      $("#hits").css({
          "display": "",
          "font-size": ""
      })
      $("#hits").html(0)
      $("body").off()
    }, pDuration * 1000)

    $('#hits').css({
        "display": "block",
    })

    var points = 1

    // Utiliser le hitScore pour le server
    var hitScore = {
      value: 0,
      update: function(amount) {
        this.value += amount
        $("#hits").html(this.value)
      }
    }

    $("body").on('click touchstart', function() {
      hitScore.update(points)
      $("#hits").css({
          "font-size": (5 + 0.05 * hitScore.value) + "em",
      })

      $("#body").css({
          "animation": "shake 0.5s"
      })
    })
  }

  return {
      "initMeteorSmash": initMeteorSmash,
      "setMeteorSmash": setMeteorSmash
  }

})
