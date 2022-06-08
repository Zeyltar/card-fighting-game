define(['tools'

],function (tools) {

    function setTime(pTimeInSec, pType) {
      var meteorSmashStat = false;

      if (pType !== "flash" ) document.getElementById('timeLine').style.display = 'block';

      tools.brightnessUpDown($("#gamePlane"),90, 200, function(){
          $("#gamePlane").css({
              'height': '100%',
          })})

      if ( pType === "animVersus"){
        $("#gamePlane").css({
          'background-image' : 'url(../assets/artworked.gif)',
          'background-size' : 'cover',
          'background-position-y': 'top'
        })

        $("#hudPlayer1").css("display","none")
        $("#hudPlayer2").css("display","none")
      }

      var start = Date.now();
      console.log("Launch CoolDown");
      $('.timeBar').css({
        transitionDuration: pTimeInSec + "s"
      })
      updateTransition();



      setTimeout(function() {

            var millis = Date.now() - start;
            console.log("Cela fait " + pTimeInSec + " secondes");

            document.getElementById('timeLine').style.display = 'none'
            $("#gamePlane").css({
              'background-image' : '',
              'background-size' : '',
              'background-position-y': ''
            })

            $("#meteorContainer").css({
              'display' : 'block'
            })

            $("#hudPlayer1").css("display","block")
            $("#hudPlayer2").css("display","block")
            $("#timeLine").css("display","block")
            updateTransition();
            meteorSmashStat = true

            tools.brightnessUpDown($("#gamePlane"),90, 220, function(){
                $("#gamePlane").css({
                    'height': '100%',
                })
            })

            console.log('ready');
            setTimeout(function(){
              tools.brightnessUpDown($("#gamePlane"),60, 500, function(){
                  $("#gamePlane").css({
                      'height': '75%',
                  })})

                  $("#gamePlane").css({
                    'background-image' : 'url(../assets/images/ingame-bg.jpg)'
                  })



            }, (pTimeInSec+4)*1000)



          }, (pTimeInSec+2) * 1000);

        }

//timeBar est la timeLine qui change de propriété css en timeBar1 en fonction
//de la transition

      function updateTransition () {
        var el = document.querySelector("div#timeLine");

        if (el.className === 'timeBar') {
          el.className = "timeBar1";

        } else {
          el.className = "timeBar";
        }
        return el;
      }

    return setTime;

  }
)
