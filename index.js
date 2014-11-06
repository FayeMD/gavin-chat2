var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nicknames = [];

var redis = require("redis"),
		client = redis.createClient();

	client.on("error", function (err) {
		console.log("Error " + err);
	});

	client.set("app name", "gavin-chat2", redis.print);
	
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use("/style.css", express.static(__dirname + '/style.css'));

io.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if (nicknames.indexOf(data) != -1){
			callback(false);
		} else{
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNicknames();
		}
	});

	function updateNicknames(){
		io.sockets.emit('usernames', nicknames);
	}

	client.get('app name', function(err, reply){
		console.log('app name is', reply);
	});
	client.hgetall('history', function(err, replies) {
		console.log('history', replies);
		socket.emit('history', replies);
	});

	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat message', function(msg){ //listening for event
		console.log('message: ' + msg);
		io.emit('chat message', {msg: msg, nick: socket.nickname});
		client.incr('msg_id', function(err, msg_id) {
			console.log('msg_id', msg_id);
			client.hset('history', msg_id,socket.nickname+":"+ msg);
		});
		//client.hset("history", "hashtest 1", "some value")
		client.set('last message', msg);
	});

	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

