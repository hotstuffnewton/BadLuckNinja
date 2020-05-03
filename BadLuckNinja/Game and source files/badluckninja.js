////////////////////////////////////////////////////////////////////USED TO CREATE CANVAS///////////////////////////////////////////////////////////////////////////////////////////////
var boxWidth; 
var boxHeight; 
var rightBoundary;
var bottomBoundary;
var leftBoundary;
var topBoundary;
var ctx;
var canvas;
////////////////////////////////////////////////////////////////////USED TO CREATE CANVAS////////////////////////////////////////////////////////////////////////////////////////////////

var intervalID;  // interval time limit

var background = new Image();              // puts an image under a name to be used in the code as a variable 
var startScreen = new Image();
var ninjarunImg = new Image();
var ninjajumpImg = new Image();
var boxImg = new Image();
var rain = new Image();
var checkpointImg = new Image();
var clouds = new Image();

// puts a sound file under a name that can use in code
var backgroundsound;
var checkpointsound;
var menusound;
var jumpsound;
var deathsound;

var rainScrollY = -1400;  // used to make the rain effect
var boxScrollX = 0;  // moves the boxes as the player moves
var moneybagScrollX = 0; // moves money bags
var cloudsScrollX = 0; 

var gravity = 0.58;         // speed of falling 
var jumpLimit = false;    // limits jumping after a certain point has been met
var start = false;       // menu screen on and off switch
var winner = false;     // winning on and off switch

var spawnpointY;  // used when player dies to reset level and start point, checkpoint changes this
var spawnpointX;

var ninjaanimationFrames = [0,1,2,3,4,5,6];  // each number is a diffrent  ninjapicture. the number changes when a button is pressed 
var ninjaframeIndex = 0;

var checkpointanimationFrames = [0,1,2,3,4,5,6];  // each number is a diffrent  checkpoint picture. the number changes constantly till it is picked up 
var checkpointframeIndex = 0;

var boxes = []; // used with the box function, every time a box is made it is given the same image and collistion dectection. this done through using [key]

var timer = 0;  // used in scoring system, records game time

var ninja = {
    x: 30, // the starting point of the ninja's x and y
	y: 400,                    
	size: 108,       // size of area the sprite image is in         
	width: 60,
	height: 70,      // actual size of the ninja in game
	faceLeft: true,
	faceRight: false,
	moving: false,     // used to tell what image to draw at certain times
	up: false,
	jump: 0,        // used to limit max height of jumps
	jumpcount: 0,   // used to stop jumping in mid air
	deaths: 0,    //counts deaths
	score: 0   // keeps track of score
}

function box(x, y, width, height){   // an array that makes boxes, var key is implented also so every box has the same image and collisition dectection.
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.boxlanded = false; // tells the computer if the ninja has landed or not
}

var checkpoint = {  // this is an object called checkpoint, it is an in game item that when picked up respawns the player at its location
    x: 4250,
	y: 450,
	size: 132,  // size of area the sprite image is in
	width: 66,
	height: 101,
	taken: false   // player has activated it or not, if player has animation stops
} 

var KEY = {
	UP: 87,                // key bindings to be used in game assigned under a name each number represents a key, the name e.g. UP can be anything 
	LEFT: 65,
	RIGHT: 68,
	ENTER: 13
}

var pressedKeys = [];

///////////////////////////////////////////////////////////// CREATES THE CANVAS AND SETS THE BOUNDARYS////////////////////////////////////////////////////////////////////
$(function(){ 
    canvas = document.getElementById('canvas'); // makes the canvas in the webpage and sets its limits
	ctx = canvas.getContext('2d');
	boxWidth = ctx.canvas.width;
	boxHeight = ctx.canvas.height;
	rightBoundary = 350;                      // rightBoundary is used to stop the ninja running to the edge of the screen whilst scrolling through the level 
	bottomBoundary = 500; 
	leftBoundary = 10;
	topBoundary = 10;	
	
	startScreen.src = "startScreen.png"; // loads pictures from file
	background.src = "background.png";
	ninjarunImg.src = "ninjarun.png";
	ninjajumpImg.src = "ninjajump.png";
	boxImg.src = "box.png";
	rain.src = "rain.png"
	checkpointImg.src = "checkpoint.png";
	clouds.src = "clouds.png";
	
	backgroundsound = new Audio("theme.mp3");        // loads the sound files under allocated name
	checkpointsound = new Audio("checkpoint.mp3");
	deathsound = new Audio("death.ogg");
	jumpsound = new Audio("jump.mp3");
	menusound = new Audio("menu.mp3");
	
	
	backgroundsound.volume = 0.4; // sets the volume for each sound
	checkpointsound.volume = 1;
	deathsound.volume = 1;
	jumpsound.volume = 1;
	menusound.volume = 1;
	
	background.onload = function(){
		intervalID = setInterval(gameLoop,30);		// frame rate in red
	}
	
	$(document).keydown(function(e){
		pressedKeys[e.which] = true;
	});                               // used to detect when buttons are being pushed 
	$(document).keyup(function(e){
		pressedKeys[e.which] = false;
	});
	
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function gameLoop(){
	clear();                   // always being used
	
    if (start == false){
	menu();                    // start up screen 
	}
    else if (start == true){
	backgroundsound.play(); // plays sound in constant loop
	jumping();
    running();	            // used in game to keep it working
	falling();
	loadlevels();
	collisions();
	drawlevel();
	drawplayer();
	if (winner == false && start == true){
	timer++;  // +1 keeps the timer going
	}
	}
	if (winner == true && start == true){
	win();
	}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function menu(){
    ctx.drawImage(startScreen,0,0);     // start screen image
    if (pressedKeys[KEY.ENTER]){   // press enter to start game as prompted
	menusound.play();
	start = true;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function clear() {	
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); // clears the page and refreshes
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function jumping(){
    if (jumpLimit == false){  // limit hasnt been reached
	if (pressedKeys[KEY.UP]){
	jumpsound.play();  // plays sound
	ninja.y -= 35;                // everytime the key is pressed 30 is added to main jump limit, this allows the button to be held down for high jumps or shorter
    ninja.jump += 35;
	ninja.up = true;
	} 
    else 
    ninja.jumpcount++;	 // once the buttons is let go +1 is added to jumpcount to stop double jumping
  }

else if (jumpLimit == true){
     if (pressedKeys[KEY.UP]){    // limit is on, pressing up does nothing
    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function running(){
	if (pressedKeys[KEY.LEFT]){
		ninja.x -= 12;
		ninjaframeIndex++;  // adds one and so changes the picture
		ninja.moving = true;
		ninja.faceLeft = true;  // used to dermin the right image
		ninja.faceRight = false;
	}
	else if (pressedKeys[KEY.RIGHT]){
		ninja.x += 12;
		ninjaframeIndex++;  // adds one and so changes the picture
		ninja.moving = true;
		ninja.faceRight = true;  // used to dermin the right image
		ninja.faceLeft = false;
	}
	else
		ninja.moving = false;         // used to dermin the right image       
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function falling(){
    if (ninja.jump >= 250){
    ninja.jump = 250;
	jumpLimit = true;      // jump limit on because max jump height has been reached
	}
	else if (ninja.jumpcount > 1){   // jump limit on because you can't double jump
	jumpLimit = true;
	ninja.up = true; // changes image to a falling one
	}
for (var key in boxes) {      // the [key] part is now valid in this function and can be used for gravity on every box made within in the box function.
     if (boxes[key] != undefined) {
   
   if (boxes[key].boxlanded == false){
   ninja.y += gravity;   // causes falling if ninja isnt on a box
   }
   else if (boxes[key].boxlanded == true){
   ninja.up = false;   // all jump attributes are reset so the ninja can jump again
   ninja.jump = 0;
   jumpsound.currentTime = 0; // resets the sound quickly so next jump has sound
   jumpLimit = false;   // jump limit off switch
   ninja.jumpcount = 0;  // used for double jump limitations
   }
  }
 }  
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function loadlevels(){

rainScrollY += 7;   // scroll speed of the rain image
    if (rainScrollY >=0) {
        rainScrollY = -1400;   // keeps the image looping
    }
cloudsScrollX -=20;
	if (cloudsScrollX <= -2300){
	    cloudsScrollX = 0;
		}
	
boxes.length = 0;  // clears all boxes in array
boxes.push(new box(0, 550, 400, 50)); // makes a new box at set x,y,width,height
boxes.push(new box(100, 400, 50, 50));
boxes.push(new box(200, 300, 50, 50));
boxes.push(new box(300, 400, 50, 50));
boxes.push(new box(600, 550, 400, 50));   // for every box added to the game the gravity to needs to be lowered due to the way landing is detected within in the code
boxes.push(new box(1000, 550, 400, 50));
boxes.push(new box(1000, 400, 50, 50));
boxes.push(new box(1200, 300, 50, 50));
boxes.push(new box(1400, 400, 50, 50));
boxes.push(new box(1400, 550, 400, 50));
boxes.push(new box(2000, 550, 700, 50));
boxes.push(new box(2700, 400, 70, 50));
boxes.push(new box(3000, 350, 70, 50));
boxes.push(new box(3000, 500, 70, 50));
boxes.push(new box(3300, 550, 70, 50));
boxes.push(new box(3300, 250, 70, 50));
boxes.push(new box(3600, 150, 70, 50));
boxes.push(new box(3900, 550, 600, 50));

if(ninja.x + ninja.width >= rightBoundary && ninja.moving == true && ninja.faceRight == true){  // if the ninja reaches a certain point on the screen everything moves left to make it look like the ninja is progressing.
   boxScrollX += 12;  // speed the boxes move left must be same as speed ninja runs
   checkpoint.x -= 12; // speed the checkpoint moves left
   moneybagScrollX += 12; //speed bags move left
   }
   for (var key in boxes) {      // the [key] part is now valid in this function 
        if (boxes[key] != undefined) {
	        boxes[key].x -= boxScrollX;  // moves the boxes when player moves, beacuse i use [key] i can't take away a number from the boxes.x so i made a new var that equals a number instead
	    }
    }
   
   if(checkpoint.taken == false){
      checkpointframeIndex++;  // keeps image looping
	  spawnpointY = 400;
	  spawnpointX = 30;     // spawn point
	  }
   if(checkpoint.taken == true){
	  spawnpointY = checkpoint.y;  // checkpoint spawnpoint
	  spawnpointX = checkpoint.x;
	  }
 }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function death(){
deathsound.currentTime = 0; // resets the sound quickly so next death has sound
deathsound.play(); // plays sound
ninja.deaths++;  // life count

    if(checkpoint.taken == false){  // resets the level at begining
       boxScrollX = 0;
	   moneybagScrollX = 0;
       checkpoint.x = 4250;
    }
	else if(checkpoint.taken == true){  // resets the level at checkpoint
            boxScrollX = 1670;
			moneybagScrollX = 1670;
            checkpoint.x = 30;
		}
		ninja.x = spawnpointX;   // respawn point
        ninja.y = spawnpointY;
	    backgroundsound.currentTime = 0;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function win(){
backgroundsound.volume = 0;
ninja.score = ninja.deaths + timer * 100;
ctx.drawImage(background,0,0);   // draws the background

        ctx.textAlign = "left"; // sets allinement
		ctx.font = "32pt Calibri";  // font
		ctx.fillStyle = "purple"; // colour
		ctx.fillText("WINNER: ", 300, 50);
		ctx.fillText("Deaths: " +ninja.deaths+ "", 25, 400); // writes "blahblahblah" at x/y 
		ctx.fillText("Time: " +timer+ "", 550, 400);
		ctx.fillText("Score: " +ninja.score+ "", 300, 500);

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function collisions(){ 
	if (ninja.x > rightBoundary) {  // right boundary
	    ninja.x = rightBoundary;
		}                                   
	else if (ninja.x < leftBoundary) {  // left boundary
		ninja.x = leftBoundary;
	    }
    if (ninja.y >= 600){
	    death();    //player falls to there death 
        }

	
	for (var key in boxes) {   // the var key can now be used instead of [0] [1] ect meaning all boxes share the same code for detecting the ninja.
            if (boxes[key] != undefined) {
			
	// the bottom of the ninja image is equal or less than the boxes top side and the top of the ninja needs to be higher up than the top of the box by its own height +10 (this stops the ninja from flicking to the top of the box if he hits the side.
	if(ninja.y >= boxes[key].y - boxes[key].height - 20 && ninja.y - ninja.height < boxes[key].y - boxes[key].height - 10 - ninja.height && ninja.x + ninja.width >= boxes[key].x && ninja.x <= boxes[key].x + boxes[key].width){   // top of the box
	ninja.y = boxes[key].y - boxes[key].height - 20;
	boxes[key].boxlanded = true;  // ninja has landed on top box no need to fall.
	}
	else
	boxes[key].boxlanded = false;   // if the ninja isnt standing on top of a box he falls due to gravity
	
	if(ninja.y - ninja.height + 35 <= boxes[key].y && ninja.y > boxes[key].y && ninja.x + ninja.width >= boxes[key].x && ninja.x < boxes[key].x + boxes[key].width){  // bottom of box
	ninja.y = boxes[key].y + ninja.height;
	jumpLimit = true;
    }
	if(ninja.x + ninja.width >= boxes[key].x && ninja.x < boxes[key].x && ninja.y <= boxes[key].y && ninja.y > boxes[key].y - boxes[key].height){  // right side of the box 
	ninja.x = boxes[key].x - ninja.width;
	}
	if(ninja.x <= boxes[key].x + boxes[key].width && ninja.x + ninja.width > boxes[key].x + boxes[key].width && ninja.y <= boxes[key].y && ninja.y > boxes[key].y - boxes[key].height){ //left side of the box
	ninja.x = boxes[key].x + boxes[key].width;
   }
  }
 }                         //////////////////////////////////// checkpoint////////////////////////////////////
    if(ninja.y >= checkpoint.y - checkpoint.height && ninja.x + ninja.width >= checkpoint.x && ninja.x <= checkpoint.x + checkpoint.width && checkpoint.taken == false){   // if the ninja is with in the checkpoint image he picks it up
	checkpointsound.play();  // plays sound
	checkpoint.taken = true;  // checkpoint reached new spawn point set
	winner = true;
	} 
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function drawlevel(){
ctx.drawImage(background,0,0);   // draws the background
ctx.drawImage(clouds,cloudsScrollX,0);
ctx.drawImage(rain, 0, rainScrollY, 800, 2000);  // draws the rain at a constantly moving y coordinate 

for (var key in boxes) {      // the var key can now be used instead of [0] [1] ect meaning all boxes share the same image
if (boxes[key] != undefined) {  
ctx.drawImage(boxImg, boxes[key].x, boxes[key].y, boxes[key].width, boxes[key].height); 
    }
   }  
   
if (checkpointframeIndex == checkpointanimationFrames.length-1 && checkpoint.taken == false) {  // keeps the loop going for the checkpoint
	checkpointframeIndex = 1; // image reset
	}	
if (checkpoint.taken == true){     // if its been taken it stops moving
    frameIndex = 0;
	}
	var sourceX = Math.floor(checkpointanimationFrames[checkpointframeIndex]) * checkpoint.size;
	if (checkpoint.taken == false){
    	ctx.drawImage(checkpointImg, sourceX, 0, checkpoint.size, checkpoint.size, checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height); // draws the image moving
    }
	if (checkpoint.taken == true){
    	ctx.drawImage(checkpointImg, sourceX, 0, checkpoint.size, checkpoint.size, checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height); // draws the image still
    }

	    ctx.textAlign = "left"; // sets allinement
		ctx.font = "14pt Calibri";  // font
		ctx.fillStyle = "purple"; // colour
		ctx.fillText("Deaths: " +ninja.deaths+ "", 50, 20); // writes "blahblahblah" at x/y 
		ctx.fillText("Time: " +timer+ "", 350, 20);
		ctx.fillText("Score: " +ninja.score+ "", 600, 20);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function drawplayer(){ 
if (ninjaframeIndex == ninjaanimationFrames.length-1 && ninja.moving == true && ninja.up == false) {      // do the annimation for running on the ground
		ninjaframeIndex = 1;
	}
if (ninjaframeIndex == ninjaanimationFrames.length-1 && ninja.up == true && ninja.moving == false) {      // do the annimation for jumping straight up.
		ninjaframeIndex = 1;
	}
if (ninjaframeIndex == ninjaanimationFrames.length-1 && ninja.up == true && ninja.moving == true) {      // do the anninmation for moving through the air.
		ninjaframeIndex = 1;
	}
	
if (ninja.moving == false && ninja.up == false){      // button has been released picture dosent change. unless told otherwise e.g. standing still
		ninjaframeIndex = 0;
	}
	
	var sourceX = Math.floor(ninjaanimationFrames[ninjaframeIndex]) * ninja.size;
	
	if (ninja.faceLeft == true && ninja.up == false){
    	ctx.drawImage(ninjarunImg, sourceX, 0, ninja.size, ninja.size, ninja.x, ninja.y, ninja.width, ninja.height);  // running left
		}
	else if (ninja.faceRight == true && ninja.up == false){
		ctx.drawImage(ninjarunImg, sourceX, 108, ninja.size, ninja.size, ninja.x, ninja.y, ninja.width, ninja.height); // running right
		}
	else if (ninja.faceLeft == true && ninja.up == true && ninja.moving == true){
	    ctx.drawImage(ninjajumpImg, sourceX, 0, ninja.size, ninja.size, ninja.x, ninja.y, ninja.width, ninja.height); //facing left moving through the air
	    }
	else if (ninja.faceRight == true && ninja.up == true && ninja.moving == true){
		ctx.drawImage(ninjajumpImg, sourceX, 108, ninja.size, ninja.size, ninja.x, ninja.y, ninja.width, ninja.height); // facing right moving through the air
		}
	else if (ninja.faceLeft == true && ninja.up == true){
	    ctx.drawImage(ninjajumpImg, sourceX, 0, ninja.size, ninja.size, ninja.x, ninja.y, ninja.width, ninja.height);  // facing left and jumping
	    }
	else if (ninja.faceRight == true && ninja.up == true){
		ctx.drawImage(ninjajumpImg, sourceX, 108, ninja.size, ninja.size, ninja.x, ninja.y, ninja.width, ninja.height); // facing right and jumping
		}	
}