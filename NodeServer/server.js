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
  m.set("aisle11", [923,272]);
  m.set("aisle12", [987,272]);
  
  socket.emit('sections', JSON.stringify(Array.from(m)));
}

function itemToSection(socket) {
  let m = new Map();
  m.set("roses", "flowers");
  m.set("apples", "produce1");
  m.set("bananas", "produce1");
  m.set("carrots", "produce2");
  m.set("potatoes", "produce2");
  m.set("bread", "bakery");
  m.set("cookies", "bakery");
  m.set("milk", "dairy1");
  m.set("eggs", "dairy2");
  m.set("chicken", "meat1");
  m.set("turkey", "meat1");
  m.set("beef", "meat2");
  m.set("pork", "meat2");
  m.set("shrimp", "seafood");
  m.set("crab", "seafood");
  m.set("advil", "pharmacy");
  m.set("sub sandwich", "grab");
  m.set("breakfast sandwich", "deli");
  m.set("shampoo", "aisle1");
  m.set("body wash", "aisle1");
  m.set("paper towels", "aisle2");
  m.set("detergent", "aisle2");
  m.set("cream of mushroom soup", "aisle3");
  m.set("chicken broth", "aisle4");
  m.set("noodles", "aisle5");
  m.set("rice", "aisle5");
  m.set("pop tarts", "aisle6");
  m.set("soda", "aisle6");
  m.set("chips", "aisle7");
  m.set("salsa", "aisle7");
  m.set("candy", "aisle8");
  m.set("crackers", "aisle8");
  m.set("pasta", "aisle9");
  m.set("pasta sauce", "aisle9");
  m.set("peanut butter", "aisle10");
  m.set("jelly", "aisle10");
  m.set("ice cream", "aisle11");
  m.set("frozen vegetables", "aisle11");
  m.set("frozen waffles", "aisle12");
  m.set("frozen meals", "aisle12");
  
  socket.emit('itemToSection', JSON.stringify(Array.from(m)));
}

io.on('connection', function(socket){
  var id;
  var disconnected = false;
  console.log('a user connected');
  socket.emit('id', uuidv4());
  initializeSections(socket);
  itemToSection(socket);
  
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

const port_num = process.env.PORT || 3000;

http.listen(port_num, function() {
  console.log(`listening on ${port_num}`);
});