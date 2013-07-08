var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , expressValidator = require('express-validator')
  , _ = require('underscore');
server.listen(8080);

Object.defineProperty(global, '__stack', {
get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__', {
get: function() {
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
get: function() {
        return __stack[1].getFunctionName();
    }
});

app.set('views', __dirname + '/views')
app.set('view engine', 'jade');
//app.use(express.logger('dev'));
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/public',express.static(__dirname + '/public'));
app.use('/controllers',express.static(__dirname + '/controllers'));
app.use(express.bodyParser());
app.use(express.cookieParser('larry'));
//app.use(express.session({secret:'fantasy',store: new DynamoDBStore(options)}));
app.use(express.session({secret:'fantasy'}));
// app.use(express.csrf());
app.use(expressValidator());
// app.use(function csrf(req, res, next) {
//   res.locals.token = req.session._csrf;
//   next();
// });

app.locals.navs = [{name:'注册',link:'signup'},{name:'登录', link:'login'}];

var rooms = {};

var colors = ['red','yellow','green','blue','purple'];

// routing
app.get('/', function (req, res) {
	res.render('chat');
});

app.get('/lobby', function(req, res){
  res.render('lobby');
});

app.post('/create', function(req, res){
  req.assert('room', 'Please enter a 3 digit number').len(3,3).isNumeric();
  
  var errors = req.validationErrors();
  if(errors){
    res.redirect('/lobby');
  }else{
	rooms = _.union(rooms, [req.body.room]);
	console.log(rooms);
    res.redirect('/desktop/'+req.body.room);
  }
});

app.get('/desktop/:room',function(req, res){
  res.locals.room = req.params.room;
  res.render('desktop');
});

app.get('/hand/:room',function(req, res){
  res.locals.room = req.params.room;
  res.render('hand');
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var news = 'welcome to blockers';

io.sockets.on('connection', function (socket) {

  socket.emit('news',news);
  
  socket.on('lobby', function(){
    socket.join('');
    var clients = io.sockets.clients('');   
    io.sockets.in('').emit('updatelobby',clients.length); 
  });
  
  socket.on('play',function(room_id){
    socket.join(room_id);
    var room = rooms[room_id];
    if(!_.isObject(room)){
      room = {players:[null,null,null,null,null],colors:['red','yellow','green','blue','purple']}
      rooms[room_id] = room;
    }
    console.log(room.players);
    for(var i = 0;i<5; i++){
      if(!room.players[i]){
        room.players[i] = socket;
        socket.color = room.colors[i];
        socket.player = i;
        socket.isPlayer = true;
        socket.room = room;
        socket.emit('color',socket.color);
        break;
      }
    }
  });
  
  socket.on('watch',function(room_id){
    socket.join(room_id);
    var room = rooms[room_id];
    socket.emit('desktop',room.desktop);
  });
  
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join('');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'room1');
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
		socket.leave('');
		if(socket.isPlayer) {
		  console.log(socket);
		  socket.room.players[socket.player] = null;
		}
		var clients = io.sockets.clients('');   
    	io.sockets.in('').emit('updatelobby',clients.length); 
	});
});