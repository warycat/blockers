var socket = io.connect('http://localhost:8080');

	// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
});

socket.on('news',function(news){
  console.log(news);
});

socket.on('updatelobby',function(lobby){
  console.log('updatelobby',lobby);
  $('#players').text(lobby + '个人正在进行游戏');
});

$(function(){
  socket.emit('lobby');
});