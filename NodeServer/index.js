var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const uuidv4 = require('uuid/v4');

let users = new Map();

function initializeSections(socket) {
  let m = new Map();
  m.set("flowers", [148,507]);
  m.set("produce1", [148,388]);
  m.set("produce2", [148,212]);
  m.set("bakery", [148,87]);
  m.set("dairy1", [285,87]);
  m.set("dairy2", [451,87]);
  m.set("meat1", [627,87]);
  m.set("meat2", [878,87]);
  m.set("seafood", [1088,87]);
  m.set("pharmacy", [1088,255]);
  m.set("grab", [1088,390]);
  m.set("deli", [1088,521]);
  m.set("aisle1", [242,272]);
  m.set("aisle2", [323,272]);
  m.set("aisle3", [392,272]);
  m.set("aisle4", [469,272]);
  m.set("aisle5", [528,272]);
  m.set("aisle6", [608,272]);
  m.set("aisle7", [660,272]);
  m.set("aisle8", [741,272]);
  m.set("aisle9", [791,272]);
  m.set("aisle10", [870,272]);
  socket.emit('sections', JSON.stringify(Array.from(m)));
}

io.on('connection', function(socket){
  var id;
  var disconnected = false;
  console.log('a user connected');
  socket.emit('id', uuidv4());
  initializeSections(socket);
  socket.on('user', function(user) 
  {
	if(user.id != null && !disconnected) {
		id = user.id;
		users[user.id] = user.pos;
	}
  });
  socket.on('disconnect', function () {
	 disconnected = true;
	 delete users[id];
  });
  setInterval(function() {
	var pos = [];
    for(let value of Object.values(users)) {
		pos.push(value);
	}
	socket.emit('message', {positions: pos});
	}, 100);
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});