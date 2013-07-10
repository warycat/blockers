var _ = require('underscore')
  , app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

var colors = ['red','yellow','green','blue','purple']
  , names =  ['1','2','3','4','5','6','7','8','9'
             ,'A','B','C','D','E','F','G','H','I'
             ,'♡','♖','♢','♗','♕','♙','♤','♘','♧'
             ,'♔']
  , games = {};

io.sockets.on('connection',function(socket){
  socket.emit('news',news);
  socket.on('lobby',function(){
    socket.join('');
    var guests = io.sockets.clients('');
    io.sockets.emit('update lobby', guests.length);
  });
  
  socket.on('player',function(room){
    socket.join(room);
    socket.room = room;
    var playerRoom = 'player'+room;
    socket.playerRoom = playerRoom;
    socket.join(playerRoom);
    var players = playersIn(room)
    var watchers = watchersIn(room);
    if(players.length == 5){
      init(room);
    }
  });
  
  socket.on('watcher',function(room){
    socket.join(room);
    socket.room = room;
    var watcherRoom = 'watcher' + room;
    socket.watcherRoom = watcherRoom;
    socket.join('watcher'+room);
  });
  
  socket.on('disconnect', function(){
    console.log(socket.manager);
    socket.leave('');
    var guests = io.sockets.clients('');
    io.sockets.emit('update lobby',guests.length);
    if(socket.room) socket.leave(socket.room);
    if(socket.playerRoom) socket.leave(socket.playerRoom);
    if(socket.watcherRoom) socket.leave(socket.watcherRoom);
  });
});

function playersIn(room){
  return io.sockets.clients('player' + room);
}

function watchersIn(room){
  return io.sockets.clients('watcher' + room);
}

function init(room){
  games[room] = {
    board:  [ ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
            , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
            , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
            , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
            , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
            , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
            , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
            , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
            , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',] ]
  , col: 5
  , row: 5
  , current: 0
  };
  var players = playersIn(room);
  _.each(players, function(player,index){
    player.emit('color',colors[index]);
  });
}



// Blockers.prototype.play = function (socket) {
//   if(this.players.length < 5){
//     var color = this.colors[this.players.length];
//     this.players.push(socket);
//     socket.room = this;
//     socket.color = color;
//     socket.emit('color',color); 
//     if(this.players.length == 5){
//       console.log(this.players.length);
//       this.begin();
//       this.draw();
//     }
//   }
// }
// 
// Blockers.prototype.begin = function(){
//   console.log('begin');
//   this.currentPlayer = this.players[0];
//   this.row = 5;
//   this.col = 5;
//   this.board = [];
//   this.board =  [ ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
//                 , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
//                 , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
//                 , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
//                 , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
//                 , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
//                 , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
//                 , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
//                 , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',] ];
// 
// 
//   var self = this;
//   _.chain(this.players).each(function(player){
//     player.bag = _.chain(self.names).shuffle().map(function(name){return {c:player.color, n:name}}).value();
//     console.log(player.bag);
//     player.hand = [];
//     self.currentPlayer = player;
//     self.draw();
//     self.draw();
//     self.draw();
//     self.draw();
//     self.draw();
//   });
//   this.currentPlayer = this.players[0];
// }
// 
// Blockers.prototype.draw = function(){
//   console.log('draw');
//   this.currentPlayer.hand.push(this.currentPlayer.bag.pop());
//   console.log(this.currentPlayer);
// }
// 
// Blockers.prototype.place = function(index){
//   console.log('place');
//   var card = this.currentPlayer.hand[index];
//   this.currentPlayer.hand.splice(index,1);
//   this.board[this.row][this.col] = card;
//   console.log(this.board);
// }
// 
// Blockers.prototype.move = function(control){
//   
//   switch(control){
//     case 'left': 
//       this.col = (this.col + 8) % 9;
//       break;
//     case 'right':
//       this.col = (this.col + 1) % 9;
//       break;
//     case 'up':
//       this.row = (this.row + 8) % 9;
//       break;
//     case 'down':
//       this.row = (this.row + 1) % 9;
//       break;
//     default:
//       break;
//   }
//   
// }

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var news = 'welcome to blockers';

// io.sockets.on('connection', function (socket) {
// 
//   socket.emit('news',news);
//   
//   socket.on('lobby', function(){
//     socket.join('');
//     var clients = io.sockets.clients('');   
//     io.sockets.in('').emit('updatelobby',clients.length); 
//   });
//   
//   socket.on('play',function(room_id){
//     socket.join(room_id);
//     var room = rooms[room_id];
//     if(!_.isObject(room)){
//       rooms[room_id] = room = new blockers();
//     }
//     room.play(socket);
//   });
//   
//   socket.on('watch',function(room_id){
//     socket.join(room_id);
//     var room = rooms[room_id];
//     socket.emit('desktop',room.desktop);
//   });
//   
//   socket.on('move',function(control)){
//     
//   }
//   
// 	// when the client emits 'adduser', this listens and executes
// 	socket.on('adduser', function(username){
// 		// store the username in the socket session for this client
// 		socket.username = username;
// 		// store the room name in the socket session for this client
// 		socket.room = 'room1';
// 		// add the client's username to the global list
// 		usernames[username] = username;
// 		// send client to room 1
// 		socket.join('');
// 		// echo to client they've connected
// 		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
// 		// echo to room 1 that a person has connected to their room
// 		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
// 		socket.emit('updaterooms', rooms, 'room1');
// 	});
// 
// 	// when the client emits 'sendchat', this listens and executes
// 	socket.on('sendchat', function (data) {
// 		// we tell the client to execute 'updatechat' with 2 parameters
// 		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
// 	});
// 
// 	socket.on('switchRoom', function(newroom){
// 		// leave the current room (stored in session)
// 		socket.leave(socket.room);
// 		// join new room, received as function parameter
// 		socket.join(newroom);
// 		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
// 		// sent message to OLD room
// 		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
// 		// update socket session room title
// 		socket.room = newroom;
// 		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
// 		socket.emit('updaterooms', rooms, newroom);
// 	});
// 
// 	// when the user disconnects.. perform this
// 	socket.on('disconnect', function(){
// 		// remove the username from global usernames list
// 		delete usernames[socket.username];
// 		// update list of users in chat, client-side
// 		io.sockets.emit('updateusers', usernames);
// 		// echo globally that this client has left
// 		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
// 		socket.leave(socket.room);
// 		socket.leave('');
// 		if(socket.isPlayer) {
// 		  console.log(socket);
// 		  socket.room.players[socket.player] = null;
// 		}
// 		var clients = io.sockets.clients('');   
//     	io.sockets.in('').emit('updatelobby',clients.length); 
// 	});
// });

// module.exports = Blockers;

