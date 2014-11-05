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
	client.hgetall('history', function(err, replies) {
		console.log('history', replies);
		socket.emit('history', replies);
	});
		/*
	client.hkeys('history', function(err, replies) {
		console.log('history', replies);
		replies.forEach(function(reply, i) {
			console.log("   " + i + reply, reply[i]);
			client.hget('history', reply, function(err, msg) {
				console.log('msg', msg);
				socket.emit('history', msg);
			});	
		});
	});
*/
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat message', function(msg){ //listening for event
		console.log('message: ' + msg);
		socket.broadcast.emit('chat message', msg);
		client.incr('msg_id', function(err, msg_id) {
			console.log('msg_id', msg_id);
			client.hset('history', msg_id, msg);
		});
		//client.hset("history", "hashtest 1", "some value")
		client.set('last message', msg);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});