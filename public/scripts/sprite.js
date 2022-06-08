define([

],function(){

  var animInterval = 83

  function Sprite(id, name, anim, nFrames, width, height) {
    this.id = $(id)
    this.name = name
    this.animation = anim
    this.nFrames = nFrames
    this.frame = 1
    this.width = width
    this.height = height
    this.backgroundPositionX = 0
    this.backgroundPositionY = 0
    this.interval
    this.loop
  }

  Sprite.prototype.display = function (param, loop) {
    this.loop = loop
    this.id.css({
      'background-image': 'url(assets/sources/' + this.name + '/' + this.animation + '.png)',
      'width': this.width,
      'height': this.height,
    })

    this.interval = setInterval(function () {
      if (param.frame % param.nFrames === 0 && param.loop) {
        param.backgroundPositionX = 0
        param.frame = 1
      }
      else if (param.frame % param.nFrames === 0 && !param.loop)
      {
        param.clear()
        param.animation = 'Idle'
        param.frame = 1
        param.nFrames = 7
        param.backgroundPositionX = 0
        param.display(param, true)
      }

      param.frame++
      
      param.id.css({
        'backgroundPositionX': param.backgroundPositionX + 'px',
      })
      if (param.animation !== 'Guard_High') {
          param.backgroundPositionX -= param.width
      }
      else if (param.animation === 'Guard_High' && param.frame < 2) {
          param.backgroundPositionX -= param.width
      }

    }, animInterval);
  }

 Sprite.prototype.clear = function () {
     clearInterval(this.interval);
 };

  return Sprite
})
