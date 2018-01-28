/****************SETTING AREA***************/
var table_Width = 60;
var table_Height = 40;
var speed = 80; // Higher = Slower
var maxSpeed = 30; // Lower = Faster
/*******************************************/
var socket = io();

var headSnake = Math.floor((Math.random() * 60 * 40 - 1));
var bodySize = [headSnake - 1, headSnake - 2, headSnake - 3, headSnake - 4];

var enemyArr = [];
var enemyHead = 0;
var enemyBody = [];

var max_Cells = table_Width * table_Height;
var cell_Id = 0; // Counter ID For tableCreate()
var arr = [];
var loopMovement;
var direction;
var appelScore = 0;
var appel;

function tableCreate() {

	document.getElementById("tabl").innerHTML = "";
	var tab = document.getElementById("tabl");

	for (i = 0; i < table_Height; i++) {
		var trtr = document.createElement("tr");

		for (j = 0; j < table_Width; j++) {
			var a = document.createElement("td");
			a.setAttribute("id", "ta" + cell_Id);
			arr.push(a);
			cell_Id++;
			trtr.appendChild(a);
		}
		tab.appendChild(trtr);
	}
}

function rese() {
	cell_Id = 0;

	arr[headSnake].style.backgroundColor = "white";
	for (i = 0; i < bodySize.length; i++) {
		arr[bodySize[i]].style.backgroundColor = "white";
	}

	headSnake = Math.floor((Math.random() * 60 * 40 - 1));
	bodySize = [headSnake - 1, headSnake - 2, headSnake - 3, headSnake - 4];
	appelScore = 0;
	speed = 100;
}




function movement(side) {
	if (side + direction == 0) {
		return;
	}
	clearInterval(loopMovement);

	loopMovement = setInterval(function () {
		arr[appel].style.backgroundColor = "red";

		arr[headSnake].style.backgroundColor = "white";
		for (i = 0; i < bodySize.length; i++) {
			arr[bodySize[i]].style.backgroundColor = "white";
		}

		for (i = bodySize.length - 1; i > 0; i--) {
			bodySize[i] = bodySize[i - 1];
		}

		bodySize[0] = headSnake;
		headSnake += side;

		if (headSnake % table_Width == 0 && side == 1) {
			headSnake -= table_Width;
		} else if ((headSnake + 1) % table_Width == 0 && side == -1) {
			headSnake += table_Width;
		} else if (headSnake < 0) {
			headSnake += max_Cells;
		} else if (headSnake > max_Cells) {
			headSnake -= max_Cells;
		}

		// Check Eating
		if (appel == headSnake) {
			appelScore++;
			if (speed >= maxSpeed) {
				speed -= 10;
			}
			document.getElementById('score').innerHTML = "Apple Score: " + appelScore;
			bodySize.push(bodySize[1]);
			bodySize.push(bodySize[1]);
			bodySize.push(bodySize[1]);

			socket.emit("eat Apple");

			arr[appel].style.backgroundColor = "red";
		}

		// Check Enemy Hit
		for (i = 0; i < enemyArr.length; i++) {

			for (j = 0; j < enemyArr[i].body.length; j++) {
				if (headSnake == enemyArr[i].body[j]) {
					clearInterval(loopMovement);

					socket.emit('dead', {
						id: socket.id,
						head: headSnake,
						body: bodySize
					});

					rese();
					return;
				}
			}
		}

		// Print My Snake
		arr[headSnake].style.backgroundColor = "green";
		for (i = 0; i < bodySize.length; i++) {
			arr[bodySize[i]].style.backgroundColor = "yellow";
		}

		// Emit My Position
		socket.emit('myPosition', {
			id: socket.id,
			head: headSnake,
			body: bodySize
		});

	}, speed);

	direction = side;
}

socket.on('enemy Position', function (data) {

	var head;
	var body = [];

	// Find The Enemy That Move
	for (i = 0; i < enemyArr.length; i++) {
		if (enemyArr[i].id == data.id) {

			head = data.head;
			for (j = 0; j < data.body.length; j++) {
				body.push(data.body[j]);
			}


			// Delete The Last Position
			arr[enemyArr[i].head].style.backgroundColor = "white";
			for (j = 0; j < enemyArr[i].body.length; j++) {
				arr[enemyArr[i].body[j]].style.backgroundColor = "white";
			}
			enemyArr[i].body.splice(0, enemyArr[i].body.length);


			// Print The New Position
			enemyArr[i].head = head;
			for (j = 0; j < body.length; j++) {
				enemyArr[i].body.push(body[j]);
			}

			arr[head].style.backgroundColor = "orange";
			for (i = 0; i < body.length; i++) {
				arr[body[i]].style.backgroundColor = "black";
			}
			break;
		}
	}
});


socket.on('get Apple', function (data) {
	appel = data;
});

socket.on('enemy Dead', function (data) {
	arr[data.head].style.backgroundColor = "white";
	for (i = 0; i < data.body.length; i++) {
		arr[data.body[i]].style.backgroundColor = "white";
	}
});

socket.on('new Enemy', function (data) {
	enemyArr.splice(0, enemyArr.length);

	for (i = 0; i < data.length; i++) {
		if (data[i].id != socket.id) {
			enemyArr.push(data[i]);
		}
	}
});



function keyListen(event) {
	switch (event.keyCode) {
		case 37: //left
			movement(-1);
			break;
		case 38: //up
			movement(-table_Width);
			break;
		case 39: //right
			movement(1);
			break;
		case 40: //down
			movement(table_Width);
			break;
		case 80: //down
			clearInterval(loopMovement);
			break;
	}
}

$('#border').click(function () {
	$('#tabl').attr('border', '2');
})



tableCreate();
