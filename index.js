var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var redis = require("redis"),
		client = redis.createClient();

	client.on("error", function (err) {
		console.log("Error " + err);
	});

	client.set("app name", "gavin-chat2", redis.print);
	
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	client.get('app name', function(err, reply){
		console.log('app name is', reply);
	});
	client.get('last message', function(err, reply) {
		console.log('last message', reply);
		socket.emit('history', reply);
	});
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat message', function(msg){ //listening for event
		console.log('message: ' + msg);
		socket.broadcast.emit('chat message', msg);
		client.set('last message', msg);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});