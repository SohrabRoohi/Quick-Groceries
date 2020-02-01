var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
  var x = 950, y = 630;
  var a = 1200, b = 600;
  
  setInterval(function() {
	var pos = [
    {
      x: 800, 
      y: 300
    },
    {
      x: a, 
      y: 400
    },
    {
      x: 320, 
      y: 150
    },
    {
      x: 820, 
      y: 100
    },
    {
      x: 900, 
      y: b
    },
    {
      x: x,
      y: y
    }
  ];
    
	socket.emit('message', {positions: pos});
	x -= 1;
	y -= 1;
	a -= 1;
	b -= 1;
  }, 100);
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});