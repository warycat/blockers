var socket = io.connect('http://localhost:8080');

	// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
});

socket.on('news',function(news){
  console.log(news);
});

socket.on('color',function(color){
  $('h3').css('color',color);
});

function tag(i,j){
  var tags = [['slot1', 'up',    'slot2']
            , ['left',  'slot0', 'right']
            , ['slot3', 'down',  'slot4']];
  return tags[i][j];
}

function control(control)
{
  switch(control){
    case 'left':
      return '←';
    case 'right':
      return '→';
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '';
  }
}

function row(i){
  return String.fromCharCode(65 + i);
}

function col(j){
  return String.fromCharCode(49 + j);
}

$(function(){
  $('#hand').css({'position':'relative','width':240,'height':240,'left':width + 80,'top':0});

  for(var i=0;i<3;i++){
    for(var j=0;j<3;j++){
      var height = i * 80;
      var width = j * 80;
      $('<div/>',{id:tag(i,j),'class':'unit'}).text(control(tag(i,j))).appendTo('#hand').css({
        'position':'absolute'
      , 'width':50
      , 'height':50
      , 'left':width
      , 'top': height
      , 'background-color': '#eeeeee'
      , 'padding': '10px'
      , 'border': '1px solid #000'
      , 'color': 'black'
      }).click(function(){
        socket.io('action',{'touch':tag(i,j)});
      });
    }
  }  
});