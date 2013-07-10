var socket = io.connect('http://localhost:8080');

	// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
});

socket.on('news',function(news){
  console.log(news);
});

socket.on('update lobby',function(lobby){
  console.log('updatelobby',lobby);
  $('#players').text(lobby + '玩家正在进行游戏');
});

socket.on('updaterooms',function(rooms){
  console.log(rooms);
});

$(function(){
  socket.emit('lobby');
});