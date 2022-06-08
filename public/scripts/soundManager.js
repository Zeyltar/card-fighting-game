define([

], function(){

    var soundChanger = $('#soundChanger')
    var soundSettings = $('.backgroundSound')
    var gameSound = $('.gameSound')
    var soundOff = false
    var mute = false

    var backgroundSound
    var currentSound

    function soundOption() {
        soundChanger.click(function(){
            if (!mute) {
                soundSettings.prop('volume', '0')
                $('#soundChanger').css({
                    'background-image': 'url(../assets/Volume_Off.png)',
                    'top': '0%',
                    'height': '58%'
                })
                soundOff = true
                mute = true
            } else if (mute) {
                soundSettings.prop('volume', '0.05')
                $('#soundChanger').css({
                    'background-image': 'url(../assets/Volume_On.png)',
                    'top': '7%',
                    'height': '41%'
                })
                soundOff = false
                mute = false
            }
        })
    }

    function updateBGSound(oldSoundId,newSoundId){
        if (soundOff == false){
            soundSettings.prop('volume', '0.05')
        }
        backgroundSound = $(oldSoundId)
        soundSettings.prop('currentTime', '0')
        backgroundSound.trigger('pause')
        backgroundSound = $(newSoundId)
        backgroundSound.trigger('play')
    }

    function playSound(soundName){
        if (soundOff == false){
            gameSound.prop('volume', '0.05')
        }
        currentSound = $(soundName)
        gameSound.prop('volume', '0.3')
        currentSound.trigger('play')
    }

    return {
        "soundOption": soundOption,
        "updateBGSound": updateBGSound,
        "playSound": playSound,
    }

})
