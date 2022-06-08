var express = require('express')
var fs = require('fs')
var http = require('http')
var app = express()
var server = http.Server(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

server.listen(port, function(){

    console.log(__dirname)
})

console.log('Server is running')

// Importation des fichiers nécéssaire au jeu
var config = JSON.parse(fs.readFileSync('./bin/config.json', 'utf8'))
var gameManager = require('./server/gamemanager.js')
var Player = require('./server/player.js').Player

var userCount = 0
var roomCount = 0
var roomList = [[]]

var playersAnims = [0, 0]

// Configuration des échanges entre le serveur et les clients
io.on('connection', function(socket){

    //Initialisation de partie
    socket.on('new game', function(pPlayerName){

        var roomName = 'room' + roomCount
        socket.join(roomName)

        roomList[roomCount].push(new Player(config, pPlayerName))
        socket.emit('assign number', userCount % 2 + 1, roomName)

        userCount++
        if (userCount % 2 === 0) {
            io.to(roomName).emit('init game', roomList[roomCount][0].name, roomList[roomCount][1].name)
            gameManager.start(config, roomList[roomCount][0], roomList[roomCount][1])

            io.to(roomName).emit('init data', {
                "room": roomCount,
                "player1": roomList[roomCount][0],
                "player2": roomList[roomCount][1],
            })
            roomCount++
            roomList.push([])
        }
    })

    // Disconnect
    socket.on('disconnect', function(roomName){
        io.to(roomName).emit('reset')
    })

    // Tchat box
    socket.on('message_send', function (pRoom, pPlayerNumber, pMessage) {
        io.to(pRoom).emit('message_received', pPlayerNumber, pMessage)
    })

    socket.on('clickOnCard', function (pData) {

        var lLoser
        if (roomList[pData["room"]][pData["player"]-1].choice === null) {

            roomList[pData["room"]][pData["player"]-1].chooseCard(pData["cardIndex"])
            playersAnims[pData["player"]-1] = roomList[pData["room"]][pData["player"]-1].choice.type
        }

        if (roomList[pData["room"]][0].choice !== null && roomList[pData["room"]][1].choice !== null) {
            var lPlayer1Anim
            var lPlayer2Anim
            var lResult = gameManager.checkCards(config, roomList[pData["room"]][0], roomList[pData["room"]][1])
            gameManager.getResultRound(config, lResult, roomList[pData["room"]][0], roomList[pData["room"]][1])

            if (lResult === 3) {
                lPlayer1Anim = 'guard'
                lPlayer2Anim = 'guard'
            }
            else if (lResult === 0) {
                console.log("METEOR SMASH");
                io.in('room' + pData["room"]).emit('setMeteorSmash', config.meteorTime)
                return
            }
            else if (lResult === 1) {
                console.log('player1 wins the turn');
                lLoser = 2
                lPlayer1Anim = playersAnims[0]
                lPlayer2Anim = (playersAnims[0] === "middle") ? "Hit_Middle" : "Hit_High_Low"
            }
            else if (lResult === -1) {
                console.log('player2 wins the turn');
                lLoser = 1
                lPlayer1Anim = (playersAnims[1] === "middle") ? "Hit_Middle" : "Hit_High_Low"
                lPlayer2Anim = playersAnims[1]
            }
            else {
                if(roomList[pData["room"]][0].choice["power"] > roomList[pData["room"]][1].choice["power"])
                {
                    console.log('player1 wins the turn');
                    lLoser = 2
                    lPlayer1Anim = playersAnims[0]
                    lPlayer2Anim = (playersAnims[0] === "middle") ? "Hit_Middle" : "Hit_High_Low"
                }
                else {
                    console.log('player2 wins the turn');
                    lLoser = 1
                    lPlayer1Anim = (playersAnims[1] === "middle") ? "Hit_Middle" : "Hit_High_Low"
                    lPlayer2Anim = playersAnims[1]
                }
            }

            if (lResult) {
                var lObjectToSend = {
                    "player1": lPlayer1Anim,
                    "player2": lPlayer2Anim,
                    "whoLoseLife": lLoser,
                }
                if(lLoser != undefined){
                    lObjectToSend.lifeRemaining = (roomList[pData["room"]][lLoser - 1].life / config.life * 100) + "%"
                }
                io.in('room' + pData["room"]).emit('selectCard', lObjectToSend)

                lLoser = undefined
            }

            playersAnims = []
            gameManager.goToNextRound(roomList[pData["room"]][0], roomList[pData["room"]][1])

            if (gameManager.getResultGame(roomList[pData["room"]][0], roomList[pData["room"]][1]) === -1) {
                io.to('room' + pData["room"]).emit('win', "player1")
            }
            else if (gameManager.getResultGame(roomList[pData["room"]][0], roomList[pData["room"]][1]) === 1) {
                io.to('room' + pData["room"]).emit('win', "player2")
            }
        }
    })

    socket.on('turnEnd', function(pRoom){
        socket.to("room" + pRoom).emit("nextTurn", {
            "room": pRoom,
            "player1": roomList[pRoom][0],
            "player2": roomList[pRoom][1],
        })
    })

    socket.on('meteorSmashResult', function (pData) {

        var lRoom = roomList[pData["room"]]
        lRoom[pData["player"]-1].hitCount = pData["score"]

        if (lRoom[0].hitCount != undefined && lRoom[1].hitCount != undefined) {
            var lPlayer1 = lRoom[0]
            var lPlayer2 = lRoom[1]

            var lLoser = gameManager.getMeteorSmashResult(config, lPlayer1, lPlayer2)
            var lObjectToSend = {}

            if (lLoser == 1) {
                console.log('Player2 wins the turn');
                lObjectToSend.player1 = "Hit_Middle"
                lObjectToSend.player2 = "middle"
                lObjectToSend.whoLoseLife = 1
            }
            else if (lLoser == 2) {
                console.log('Player1 wins the turn');
                lObjectToSend.player1 = "middle"
                lObjectToSend.player2 = "Hit_Middle"
                lObjectToSend.whoLoseLife = 2
            }
            else {
                console.log("Draw");
                lObjectToSend.player1 = "guard"
                lObjectToSend.player2 = "guard"
                lObjectToSend.whoLoseLife = 0
            }

            if(lLoser != 0){
                lObjectToSend.lifeRemaining = (roomList[pData["room"]][lLoser - 1].life / config.life * 100) + "%"
            }

            io.in('room' + pData["room"]).emit('selectCard', lObjectToSend)
            gameManager.goToNextRound(lPlayer1, lPlayer2)

            if (gameManager.getResultGame(lPlayer1, lPlayer2) === -1) {
                io.to('room' + pData["room"]).emit('win', "player1")
            }
            else if (gameManager.getResultGame(lPlayer1, lPlayer2) === 1) {
                io.to('room' + pData["room"]).emit('win', "player2")
            }

            lRoom[0].hitCount = undefined
            lRoom[1].hitCount = undefined
        }
    })
})
