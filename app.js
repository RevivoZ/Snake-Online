var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});

var users = [];
var appel = Math.ceil(Math.random() * 2399);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));
serv.listen(80);

console.log('server Started');





io.sockets.on('connection', function (socket) {

	console.log('New User !');

	users.push({
		id: socket.id,
		head: 0,
		body: []
	});

	socket.emit('get Apple', appel);
	io.emit('new Enemy', users);

	socket.on('myPosition', function (data) {
		for (i = 0; i < users.length; i++) {

			if (users[i].id == data.id) {
				users[i].head = data.head;

				users[i].body.splice(0, data.body.length);
				for (j = 0; j < data.body.length; j++) {
					users[i].body.push(data.body[j]);
				}
				break;
			}
		}

		socket.broadcast.emit('enemy Position', data)
	});

	socket.on('dead', function (data) {

		io.emit('enemy Dead', data);

		for (i = 0; i < users.length; i++) {
			if (users[i].id == data.id) {
				users[i].head = 0;
				users[i].body = [0];
				break;
			}
		}
		io.emit('new Enemy', users);
	});


	socket.on('eat Apple', function () {
		appel = Math.ceil(Math.random() * 2399);
		io.emit('get Apple', appel);
	});


	socket.on('disconnect', function () {
		console.log('Got disconnect!');

		for (i = 0; i < users.length; i++) {
			if (users[i].id == socket.id) {

				console.log(users[i]);
				io.emit('enemy Dead', users[i]);
				users.splice(i, 1);
				io.emit('new Enemy', users);
				break;
			}
		}
		io.emit('new Enemy', users);

	});


});
