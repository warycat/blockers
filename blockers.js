var _ = require('underscore')
  , app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

var colors = ['red','yellow','green','blue','purple']
  , numbers = ['1','2','3','4','5','6','7','8','9']
  , letters = ['A','B','C','D','E','F','G','H','I']
  , squares = ['♡','♖','♢','♗','♕','♙','♤','♘','♧']
  , names =  ['1','2','3','4','5','6','7','8','9'
             ,'A','B','C','D','E','F','G','H','I'
             ,'♡','♖','♢','♗','♕','♙','♤','♘','♧'
             ,'♔']
  , games = {}
  , news = 'welcome to blockers';

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
      init();
    }
  });
  
  socket.on('watcher',function(room){
    socket.join(room);
    socket.room = room;
    var watcherRoom = 'watcher' + room;
    socket.watcherRoom = watcherRoom;
    socket.join('watcher'+room);
    socket.emit('game',games[room]);
  });
  
  socket.on('action',function(control){
    var game = games[socket.room];
    if(socket.color != game.currentColor()){
      socket.emit('status','not your turn!');
      return;
    }
    if(_.indexOf(['left','right','up','down'],control) != -1){
      move(control);
    }
    var index = _.indexOf(['slot0','slot1','slot2','slot3','slot4'],control);
    if(index != -1){
      place(index);
    }
  });
    
  socket.on('disconnect', function(){
    socket.leave('');
    var guests = io.sockets.clients('');
    io.sockets.emit('update lobby',guests.length);
    if(socket.room) socket.leave(socket.room);
    if(socket.playerRoom) socket.leave(socket.playerRoom);
    if(socket.watcherRoom) socket.leave(socket.watcherRoom);
  });
  
  function playersIn(room){
    return io.sockets.clients('player' + room);
  }

  function watchersIn(room){
    return io.sockets.clients('watcher' + room);
  }

  function game(){
    this.board = [ ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
                 , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
                 , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
                 , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
                 , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
                 , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
                 , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
                 , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
                 , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',] ];
    this.col = 5;
    this.row = 5;
    this.current = 0;
    this.currentColor = function(){
      return colors[this.current];
    }
  }

  function init(){
    var room = socket.room;
    games[room] = new game();
    var players = playersIn(room);
    _.each(players, function(player,index){
      player.color = colors[index];
      player.hand = [];
      player.bag = _.chain(names).shuffle().map(function(name){return {c:player.color, n:name}}).value();
      player.emit('color',colors[index]);
    });
    for(var i=0;i<25;i++){
      draw(room);
      next(room);
    }
    _.each(players,function(player){
      player.emit('cards',player.hand);
    });
  }

  function draw(){
    var room = socket.room;
    var players = playersIn(room);
    var game = games[room];
    var player = players[game.current];
    player.hand.push(player.bag.pop());
  }

  function next(){
    var room = socket.room;
    var game = games[room];
    game.current = (game.current + 1) % 5;
  }
  
  function componentsOfColor(color, board){
    var sum = 0;
    for(var i=0;i<9;i++){
      for(var j=0;j<9;j++){
        var card = board[i][j];
        if(!_.isString(card) && card.c == color ){
          card.mark = 0;
        }
      }
    }
    for(var i=0;i<9;i++){
      for(var j=0;j<9;j++){
        flood(i,j,0);
      }
    }
    for(var i=0;i<9;i++){
      for(var j=0;j<9;j++){
        var card = board[i][j];
        if(!_.isString(card) && card.c == color ){
          delete card['mark'];
        }
      }
    }
    return sum;
    
    function flood(row,col,mark){
      if(row<0||row>8||col<0||col>8)return;
      var card = board[row][col];
      if(_.isString(card) || card.c != color || card.mark != 0){
        return;
      }else{
        if(mark == 0) {
          sum++;
        }
        card.mark = sum;
        flood(row-1,col,sum);
        flood(row+1,col,sum);
        flood(row,col-1,sum);
        flood(row,col+1,sum);
      }
    }
  }

  function isDividingPlace(place,board)
  {
    var oldCard = board[place.row][place.col];
    var newCard = place.card;
    var oldColor = oldCard.c;
    var newColor = newCard.c;
    var willPlaceComponents = componentsOfColor(oldColor, board);
    oldCard.c = newColor;
    var didPlaceComponents = componentsOfColor(oldColor, board);
    oldCard.c = oldColor;
    console.log(willPlaceComponents,didPlaceComponents);
    if (didPlaceComponents > willPlaceComponents) return true;
    return false;
  }

  function isLegalPlace(place,board)
  {
    var row = _.indexOf(letters, place.card.n);
    if(row != -1 && row != place.row) return false;
    var col = _.indexOf(numbers, place.card.n);
    if(col != -1 && col != place.col) return false;
    var square = _.indexOf(squares, place.card.n);
    if(square != -1 &&  square != (Math.floor(place.row / 3) * 3 + Math.floor(place.col / 3)))return false;
    if(!_.isString(board[place.row][place.col]) &&  isDividingPlace(place,board))return false;
    return true;
  }

  function place(index){
    var room = socket.room;
    var game = games[room];
    var watchers = watchersIn(room);
    var players = playersIn(room);
    var player = players[game.current];
    var card = player.hand[index];
    if(!isLegalPlace({'card':card,'row':game.row,'col':game.col},game.board)){
      socket.emit('status','illegal place');
      return;
    }
    game.board[game.row][game.col] = card;
    player.hand.splice(index, 1);
    draw(room);
    io.sockets.in('watcher'+room).emit('place',{'card':card,'row':game.row,'col':game.col});
    next(room);
    io.sockets.in('watcher'+room).emit('cursor',{'row':game.row,'col':game.col,'color':game.currentColor()});
    socket.emit('cards',socket.hand);
  }

  function move(direction){
    var room = socket.room;
    var game = games[room];
    var players = playersIn(room);
    var player = players[game.current];
    switch(direction){
      case 'left': 
        game.col = (game.col + 8) % 9;
        break;
      case 'right':
        game.col = (game.col + 1) % 9;
        break;
      case 'up':
        game.row = (game.row + 8) % 9;
        break;
      case 'down':
        game.row = (game.row + 1) % 9;
        break;
    }
    io.sockets.in('watcher' + room).emit('cursor',{'row':game.row,'col':game.col,'color':game.currentColor()});
  };
  
});


