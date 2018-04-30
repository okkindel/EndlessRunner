var viewElement = document.getElementById("view");
var context = viewElement.getContext("2d")
var left = false;
var right = false;

var level = {
	density         : 30,
	levelLength     : 40,
	levelWidth      : 40,
	score           : 0,
	speed           : 0.1,
	looser 			: false
};

var screen = {
	width           : 800,
	height          : 800,
	xPos            : 0,
	yPos            : 0.5,
	zPos            : 0
};

//init
bindKeys();
createCubes();

//game loop
window.onload = function gameCycle() {

	//clear screen
	context.fillStyle = "#FFF";
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	context.fillStyle = "#000";

	if (!level.looser) {

		//matrix of cubes
		for (let i = 0; i < level.cubes.length; i = i + 1) {
			if (level.cubes[i][2] < screen.zPos) {
				level.cubes[i] = [Math.floor(Math.random() * level.levelWidth) - (level.levelWidth / 2), 0, 
				level.cubes[i][2] + level.levelLength, 1, 1, 1];
			}
		}

		//keys
		if (left && screen.xPos < level.levelWidth / 2)
			screen.xPos = screen.xPos + level.speed;

		if (right && screen.xPos > -level.levelWidth / 2)
			screen.xPos = screen.xPos - level.speed;

		//score and speed
		level.score = level.score + level.speed;
		level.speed = ((level.score >> 0) + 10) / (40 * Math.sqrt(level.score) >> 0);

		//print score
		context.font = "20px Arial";
		context.fillStyle = "#123"
		context.fillText("Score: " + (level.score >> 0), 10, 30);
	}

	//level will end when you die
	screen.zPos = screen.zPos + level.speed;
	//check for collisions
	collision(screen.xPos, screen.zPos, level.cubes);

	//draw cubes
	for (let i = 0; i < level.cubes.length; i = i + 1) {
		if (level.cubes[i][2] >= 0)
			cubes.drawCube(level.cubes[i][0], level.cubes[i][1], level.cubes[i][2], level.cubes[i][3], level.cubes[i][4], level.cubes[i][5]);
	}

	if (level.looser) {
		//if die
		context.textAlign = "center";
		context.fillStyle = "#123"
		context.font = "40px Arial";
		context.fillText("LOOSER!", context.canvas.width / 2, context.canvas.height / 2);
		context.fillText("score: " + (level.score >> 0), context.canvas.width / 2, context.canvas.height / 2 + 45);
		//reload after 4s
		setTimeout(function() { window.location.reload(1); }, 4000);
	}
	setTimeout(gameCycle, 5);
}

//--------------------------------------------------------------------------------------

function createCubes() {

	level.cubes = new Array(level.density);
	for (let i = 0; i < level.cubes.length; i = i + 1)
		level.cubes[i] = [Math.floor(Math.random() * level.levelWidth) - (level.levelWidth / 2.0), 
	0, Math.floor(Math.random() * level.levelLength), 1, 1, 1];
}

function collision(x, z, cubes) {

	for (let i = 0; i < cubes.length; i = i + 1) {
		let cMinX = cubes[i][0] - 0.5;
		let cMinZ = cubes[i][2] - 1;
		let cMaxX = cubes[i][0] + cubes[i][4] - 0.5;
		let cMaxZ = cubes[i][2] + cubes[i][5] - 1;

		if (x > cMinX && x < cMaxX && z > cMinZ && z < cMaxZ) {
			level.looser = true;
		}
	}
}

function bindKeys() {

	document.addEventListener('keydown', function (e) {
		const keyName = e.key;

		if (keyName === 'ArrowLeft') {
			left = true;
			right = false;
		} else if (keyName === 'ArrowRight') {
			left = false;
			right = true;
		}
	});
	document.addEventListener('keyup', function (e) {
		const keyName = e.key;
		if (keyName === 'ArrowLeft') {
			left = false;
		}
		if (keyName === 'ArrowRight') {
			right = false;
		}
	});
}

//--------------------------------------------------------------------------------------

var cubes = {

	drawCube: function(x, y, z, w, d, h) {
		
		//artifacts on screen
		if (z < screen.zPos + 0.5)
			return;

		let zClamp = Math.max(z, screen.zPos + 1);

		this.drawLine([x, y, zClamp], [x, y, z + d]);
		this.drawLine([x, y, z + d], [x + w, y, z + d]);
		this.drawLine([x + w, y, z + d], [x + w, y, zClamp]);
		this.drawLine([x + w, y, zClamp], [x, y, zClamp]);

		this.drawLine([x, y + h, zClamp], [x, y + h, z + d]);
		this.drawLine([x, y + h, z + d], [x + w, y + h, z + d]);
		this.drawLine([x + w, y + h, z + d], [x + w, y + h, zClamp]);
		this.drawLine([x + w, y + h, zClamp], [x, y + h, zClamp]);

		this.drawLine([x, y, zClamp], [x, y + h, zClamp]);
		this.drawLine([x, y, z + d], [x, y + h, z + d]);
		this.drawLine([x + w, y, zClamp], [x + w, y + h, zClamp]);
		this.drawLine([x + w, y, z + d], [x + w, y + h, z + d]);
	},

	drawLine: function(x, y) {

		let oX = this.relative(x[0], x[1], x[2]);
		let pxX = [(oX[0] + 1) / 2.0 * screen.width, ((-oX[1]) + 1) / 2.0 * screen.height];

		let oY = this.relative(y[0], y[1], y[2]);
		let pxY = [(oY[0] + 1) / 2.0 * screen.width, ((-oY[1]) + 1) / 2.0 * screen.height];

		let minZ = Math.min(x[2], y[2]);
		let transparency = 1 - (minZ - screen.zPos) / 30;
		context.strokeStyle = "rgba(1, 2, 3, " + transparency +")";

		//drawing path
		context.beginPath();
		context.moveTo(pxX[0], pxX[1]);
		context.lineTo(pxY[0], pxY[1]);
		context.stroke();
	},

	relative: function(x, y, z) {

		let viewMatrix = math.matrix([
			[1, 0, 0, -screen.xPos - 0.5],
			[0, 1, 0, -screen.yPos],
			[0, 0, 1, -screen.zPos - 1.0],
			[0, 0, 0, 1]
			]);

		let projection = math.matrix([
			[Math.tan(Math.PI / 4), 0, 0, 0],
			[0, Math.tan(Math.PI / 4), 0, 0],
			[0, 0, 1, -1],
			[0, 0, 2/100, 0]
			]);

		let posToCamera = math.multiply(viewMatrix, math.matrix([[x], [y], [z], [1]]));
		let posVector = math.matrix([[posToCamera._data[0][0], posToCamera._data[1][0], posToCamera._data[2][0], posToCamera._data[3][0]]]);
		let posToScreen = math.multiply(posVector, projection);

		return [-posToScreen._data[0][0] / posToScreen._data[0][2], -posToScreen._data[0][1] / posToScreen._data[0][2]];
	}
};

//--------------------------------------------------------------------------------------