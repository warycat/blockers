var socket = io.connect('http://localhost:8080');

	// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
});

socket.on('news',function(news){
  console.log(news);
});

socket.on('game',function(game){
  if(!game)return;
  $('#'+tag(game.row, game.col)).css('border-color',game.currentColor);
  for(var i=0;i<9;i++){
    for(var j=0;j<9;j++){
      var color = game.board[i][j].c;
      if(color){
        $(tag(i,j)).css('background-color',color);
      }  
    }
  }
});

socket.on('place',function(place){
  var card = place.card;
  $('#'+tag(place.row,place.col)).text(card.n).css({'background-color':card.c,color:'#FFFFFF'});
});

socket.on('cursor',function(cursor){
  if(!cursor)return;
  console.log(tag(cursor.row,cursor.col));
  $('.unit').css({'border-color':'#000','border-width':1,'border-radius':0});
  $('#' + tag(cursor.row,cursor.col)).css({'border-color':cursor.color,'border-width':4,'border-radius':4});
});

function symbol(i,j)
{
  var symbols = [ ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
                , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
                , ['♡','♡','♡','♖','♖','♖','♢','♢','♢',]
                , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
                , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
                , ['♗','♗','♗','♕','♕','♕','♙','♙','♙',]
                , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
                , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',]
                , ['♤','♤','♤','♘','♘','♘','♧','♧','♧',] ];
  return symbols[i][j];
}  

function tag(i,j){
  return String.fromCharCode(65 + i) + String.fromCharCode(49 + j);
}

function row(i){
  return String.fromCharCode(65 + i);
}

function col(j){
  return String.fromCharCode(49 + j);
}

$(function(){
  $('#board').css({'position':'relative','width':800,'height':800,'left':width + 80,'top':0});
  for(var j=0;j<9;j++){
    var width = j * 80;
    $('<div/>',{id:col(j)}).text(col(j)).appendTo('#board').css({
      'position':'absolute','width':80,'height':80,'left':width + 80,'top':0
    });
  }
  
  for(var i=0;i<9;i++){
    var height = i * 10;
    $('<div/>',{id:row(i)}).text(row(i)).appendTo('#board').css({
      'position':'absolute','width':'10%','height':'10%','left':'0%','top': height + '%'
    });
  }

  for(var i=0;i<9;i++){
    for(var j=0;j<9;j++){
      var height = i * 80;
      var width = j * 80;
      $('<div/>',{id:tag(i,j),'class':'unit'}).text(symbol(i,j)).appendTo('#board').css({
        'position':'absolute'
      , 'width':50
      , 'height':50
      , 'left':width + 80
      , 'top': height + 80
      , 'background-color': '#eeeeee'
      , 'padding': '10px'
      , 'border': '1px solid #000'
      , 'color': '#ff0000'
      , 'font': 'bold large serif'
      });
    }
  }
  $('.unit').css('color','grey');
});