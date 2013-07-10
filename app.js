var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , expressValidator = require('express-validator')
  , _ = require('underscore');

app.listen(3000);

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

