/**
 * Generated from the Phaser Sandbox
 *
 * //phaser.io/sandbox/fqpTrlTi
 *
 * This source requires Phaser 2.6.2
 */


/**

nNew challenge: conceive and write a game on a flight :)

Concept: feed fish.

Fish swim, eat each other, eat food.

*/
var fish, feeder, feedButton, eddyButton, bubbler, hand;
var startTime = new Date()
var scoreboard

var current, eddy
const SCREENSIZE = [900,600]
const TANKTOP = 80
//const WORLDSIZE = [3600,3600]


var fishColors = [
    {normal:0xf44335,
     hungry:0xffcdd2,
     sick:0x8dc1c,
    },
    {normal: 0xe91e63,
     hungry: 0xf8bbd0,
     sick: 0xafb42b},
    {normal: 0x9c27b0,
     hungry: 0xe1bee7,
     sick: 0x9e9d24},
    {normal: 0x2196f3,
     hungry: 0xe3f2fd,
     sick: 0xafb42b},
    {normal: 0xff6f00,
     hungry:0xffecb3,
     sick: 0xafb42b},
    {normal:0x0091ea,
     hungry:0xe1f5fe,
     sick: 0xafb42b},
]

const nfish = 25;
var spawned = 0;

var game = new Phaser.Game( SCREENSIZE[0], SCREENSIZE[1], Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

    //game.stage.backgroundColor = '#85b5e1';
    game.load.image('tank','sprites/tank.png')
    //game.load.baseURL = 'http://examples.phaser.io/assets/';
    game.load.baseURL = './';
    game.load.crossOrigin = 'anonymous';

    game.load.spritesheet('fish', 'sprites/fishsheet.png',50,50);
    game.load.spritesheet('explosion', 'sprites/explosion.png',50,50);
    game.load.image('bullet', 'sprites/bullet.png');
    //game.load.image('food','sprites/fishfood.png');
    game.load.spritesheet('food','sprites/foodsheet.png',30,30);
    game.load.image('bubble','sprites/bubble.png');
    game.load.image('hand','sprites/hand.png');
    game.world.setBounds(0,0,SCREENSIZE[0],SCREENSIZE[1]);


}

var player;
var cursors = {};
var jumpButton;
var hero;
var fishies


function getCurrentMagnitude (d,magProps) {
    var maxMag = magProps.max ? magProps.max : 75;
    var peakDistance = magProps.distance ? magProps.distance : 150;
    var shallowness = magProps.shallowness ? magProps.shallowness : 100;
    return maxMag * Math.E ** (-0.5 * ((d-peakDistance)/shallowness)**2)
}

function getCurrentVelocityForCurrent (pos, cc, clockwise, magProps) {
    var angle = Math.atan2(pos.y-cc.y,pos.x-cc.x)
    // The current is going to look a gaussian curve...
    var distanceFromCenter = Math.sqrt((pos.x - cc.x)**2+(pos.y-cc.y)**2) // pythagorean theorem :)
    var mag = getCurrentMagnitude(distanceFromCenter,magProps)
    return {
	// velocity is at a tangent to the circle
	// so the sin/cos are swapped x/y 
	x : (clockwise ? -1 : 1) * (Math.sin(angle)*mag),
	y : (clockwise ? 1: -1) * (Math.cos(angle)*mag)
    }
}

function getCurrentVelocity (pos) {
    // Get a current velocity for a given space...
    //var cc = {x:450,y:300} // current center
    //var magnitude = 40
    //return getCurrentVelocityForCurrent(pos,cc,magnitude,false);

    // Let's do two of these...
    var c1 = getCurrentVelocityForCurrent(
	pos,{x:300,y:300},current.clockwise1,{max:current.max}
    )
    var c2 = getCurrentVelocityForCurrent(
	pos,{x:600,y:300},current.clockwise2,{max:current.max}
    )
    if (eddy.active) {
	var c3 = getCurrentVelocityForCurrent(
	    pos,{x:eddy.x,y:eddy.y},eddy.clockwise,eddy
	)
    }
    else {var c3 = {x:0,y:0}}
    
    return {x:c1.x+c2.x+c3.x,
	    y:c1.y+c2.y+c3.y}
}
    

function createFish () {
    var fish = fishies.create(Math.random()*SCREENSIZE[0],TANKTOP+50+(Math.random()*(SCREENSIZE[1]-TANKTOP-50)),'fish') // global
    fish.animations.add('left',[0,1,2,3],10,true,true);
    fish.animations.add('right',[4,5,6,7],10,true,true);
    fish.animations.add('pop',[8,9,10,11,12,13,14,15,16],10,false,true);
    fish.colorScheme = fishColors[Math.floor(Math.random()*fishColors.length)]
    fish.tint = fish.colorScheme.normal
    fish.scale.x = 0.8 + Math.random()*0.4
    fish.scale.y = fish.scale.x
    fish.shrinkrate = 0.999 + 0.001 * Math.random()
    game.physics.arcade.enable(fish);
    var initialSwim = 1 // set to 0 to stop them from swimming :)
    fish.body.swimming = {x:-100,y:0}
    fish.body.velocity.x = 0
    fish.body.bounce.setTo(1, 1);
    spawned += 1;
    return fish;
}

function create() {
    game.add.sprite(0,0,'tank');
    scoreboard = game.add.text(25,25);
    
    
    current = {max:50, clockwise1:true, clockwise2:false}
    eddy = {x:0,y:0,vx:5,vy:5,clockwise:true,max:200,distance:25,shallowness:150}

    fishies = game.add.group();
    fishies.physicsBodyType = Phaser.Physics.ARCADE;
    
    for (var i=0; i<nfish; i++ ) {
        createFish();
    }
    feeder = game.add.weapon(20,'food');
    feeder.setBulletFrames(0,8,true);
    feeder.bulletCollideWorldBounds = true;
    feeder.bullets.forEach(function (b) {b.dropSpeed = 25 + Math.random()*75});
    feeder.bulletSpeed = 0;
    feeder.fireRate = 100;
    //feeder.trackSprite(fish);
    feedButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    eddyButton = this.input.keyboard.addKey(Phaser.KeyCode.E);
    cursors.left = this.input.keyboard.addKey(Phaser.KeyCode.LEFT);
    cursors.right = this.input.keyboard.addKey(Phaser.KeyCode.RIGHT);
    

    //bubbler = game.add.weapon(100,'bubble');
    bubbles = game.add.group()
    for (var i=0; i<250; i++ ) {
	var b = bubbles.create(
	    SCREENSIZE[0]*Math.random(),
	    SCREENSIZE[1]+Math.random()*SCREENSIZE[1],
	    'bubble');
	b.scale.x = Math.random()
	b.scale.y = b.scale.x
	game.physics.arcade.enable(b);
	
	b.physicsBodyType = Phaser.Physics.ARCADE;
    }

    hand = game.add.sprite(SCREENSIZE[0]/2,0,'hand');
    game.physics.arcade.enable(hand);    
    feeder.trackSprite(hand);
    feeder.trackOffset.y = 70
    feeder.trackOffset.x = 25
    feeder.fireAngle = Phaser.ANGLE_DOWN


    console.log('setup input in render');
    game.input.onDown.add(function (p) {
	console.log('touch - move! %s',p.x)
	hand.position.x = p.x
	feeder.fire();
    })
    game.input.onHold.add(function (p) {
	console.log('Fire - onHold %s',p);

    })


}

const MINSIZE = 0.3
const MAXSIZE = 3

const VERTICAL_JITTER = 4;
const HOR_JITTER = 18;

function getElapsed () {
    t = new Date();
    return (t.getTime() - startTime.getTime())/1000
}

function update () {

    var score = {
	fish : 0,
	sick : 0,
	hungry: 0,
	healthy : 0,
        spawned : spawned,
	time : getElapsed()
    }


    // update animations for direction...
    fishies.children.forEach( function (fish) {
	if (!fish.alive) {return}
	score.fish += 1;
	// wiggle the fish :)

	// Apply current to fish :)
	var vel = getCurrentVelocity(fish.body.position)
	//console.log('Calculating velocity for fish @ %s: %s,%s',fish.body.position,vel.x,vel.y);

	    fish.body.velocity.x = vel.x + fish.body.swimming.x;
	    fish.body.velocity.y = vel.y + fish.body.swimming.y;
	if (!fish.popping) {
	    fish.scale.x *= fish.shrinkrate;
	    fish.scale.y *= fish.shrinkrate;
	}
	if (fish.scale.x < 0.75) {
	    //fish.tint = rgb(128*fish.scale,255*fish.scale,128*fish.scale)
	    fish.tint = fish.colorScheme.hungry;
	    score.hungry += 1;
	}
	else if (fish.scale.x > 1.25) {
	    fish.tint = fish.colorScheme.sick;
	    score.sick += 1
	}
	else {
	    score.healthy += 1
	    fish.tint = fish.colorScheme.normal;
	}
	if (fish.scale.x < 0.5) {
	    fish.kill();
	}
	
	if (true) { // do bouncing?
	    // Let's handle bouncing on our own :)
	    if (fish.body.x < 0 || fish.body.x > SCREENSIZE[0]) {
		if (fish.body.x < 0) { fish.body.x = 10;}
		else {fish.body.x = SCREENSIZE[0]-10}
		fish.body.swimming.x *= -1
		//fish.body.velocity.x = 0;
		//console.log('Switch velocity! %s',fish.body.velocity.x);
	    }
	    if (fish.body.y < TANKTOP || fish.body.y > SCREENSIZE[1]) {
		fish.body.velocity.y *= -1;
		if (fish.body.y < TANKTOP) {fish.body.y = TANKTOP}
		//fish.body.velocity.y = 0;
	    }
	    
	    if (fish.body.swimming.x > 0) {
		if (fish.animations.currentAnim.name != 'right') {
		    //console.log('switch to right!');
		    if (!fish.popping) {
			fish.animations.stop()
			fish.play('right');
		    }
		}
	    }
	    else {
		if (fish.animations.currentAnim.name != 'left') {
		    //console.log('switch to left!');

		    if (!fish.popping) {
			fish.animations.stop();
			fish.play('left');
		    }
		}
	    }
	    if (fish.popping && fish.animations.currentAnim.isFinished) {
		fish.body.swimming.y = -150;
		fish.body.swimming.x = 0;
		if (fish.body.y <= (TANKTOP+5)) { // float to the top
		    fish.kill();
		}
	    }
	}


	
	//var magnitude = Math.sqrt(fish.body.velocity.x**2+fish.body.velocity.y**2); // velocity
	
	//console.log('MAGNITUDE=%s',magnitude);
	//console.log('Check animations.');
	
	//fish.body.rotation += Math.random() * 10 - 5 // Rotate us somewhat :)
	//var rotInRad = (fish.body.rotation * Math.PI) / 180;
	//if (fish.animations.currentAnim.name == 'right') {
	//    fish.body.velocity.x = -Math.cos(rotInRad) * magnitude // set rotation with trig :)
	//}
	//else {
	//    fish.body.velocity.x = Math.cos(rotInRad) * magnitude // set rotation with trig :)
	//}
	//fish.body.velocity.y = Math.sin(rotInRad) * magnitude // set rotation with trig :)

    }); // end each fish
    // Update Scoreboard !

    
    if (score.fish==0) {
	scoreboard.text = 'You killed all the fish. WHHHHHHHHHYYYYYYY??!?!?!?!?!';
    }
    else {
	scoreboard.text = `Alive: ${score.fish}\nDead: ${spawned-score.fish} (${((spawned-score.fish)*100/spawned).toFixed(0)}%)\nHealthy: ${score.healthy}\nSick: ${score.sick}\nHungry: ${score.hungry}\nTime: ${(score.time).toFixed(2)}\nDeaths/Second: ${((spawned-score.fish)/score.time).toFixed(2)}`
    }

    if (score.healthy > 2 && Math.random()>.995) {
	createFish();
    }

    if (eddyButton.isDown) {
	eddy.active = true;
    }
    
    if (eddy.active) {
	
	eddy.x += eddy.vx;
	eddy.y += eddy.vy;
	console.log('Eddy @ %s,%s',eddy.x,eddy.y)
	if (eddy.x < 0 || eddy.x > SCREENSIZE[0]) {
	    console.log('Done with eddy - reset!')
	    eddy.active = false;
	    eddy.x = Math.random()*SCREENSIZE[0]
	    eddy.y = Math.random()*SCREENSIZE[0]
	    eddy.vx = Math.random() * 10 - 5
	    eddy.vy = Math.random() * 10 - 5
	    eddy.clockwise = Math.random() > 0.5 && true || false;
	}
	
    }

    if (false) { // do jitter stuff ?
	
	// random jitter...
	if (Math.random()>0.8) {
	    console.log('jitter!')
	    if (!fish.popping) {
		fish.body.swimming.y += (Math.random()*VERTICAL_JITTER)-(VERTICAL_JITTER/2)
		fish.body.swimming.x += (Math.random()*HOR_JITTER)-(HOR_JITTER/2)
	    }
	}
	if (!fish.popping && Math.random()>0.95) {
	    console.log('switch!');
	    fish.body.swimming.x *= -1
	    fish.body.swimming.y *= -1
	}
    }
    
    if (feedButton.isDown) {
	
	//var target = fishies.children[Math.floor(Math.random()*fishies.length)]
	
	feeder.fire()
    }



    // Make our bubbler bubble :)
    bubbles.forEach(function (b) {
	vel = getCurrentVelocity(b);
	b.body.velocity.x = vel.x*0.03
	b.body.velocity.y = vel.y*0.03 -2
	b.body.x += b.body.velocity.x;
	b.body.y += b.body.velocity.y;
	if (b.body.y < TANKTOP) {
	    b.body.y = SCREENSIZE[1]
	    b.body.x = SCREENSIZE[0]*Math.random()
	}
	
    })

    // Adjust our current
    if (Math.random() > 0.95) {
	current.max *= (Math.random()*0.2 + 0.9)
	//console.log('Adjust current: %s',current.max);
	if (current.max > 200) {
	    current.max = 45;
	}
	if (current.max < 20) {
	    current.max = 100;
	}
    }
    if (Math.random() > 0.999) {
	//console.log('Reverse current!');
	current.clockwise1 = !current.clockwise1
	current.clockwise2 = !current.clockwise2
    }


    //game.physics.arcade.collide(fishies,fishies);//,function (f1,f2) {
	//f1.body.swimming.x *= -1
    ////f2.body.swimming.x *= -1
    //});

    feeder.bullets.forEach( function (b) {
	var curv = getCurrentVelocity(b.body.position)
	b.body.velocity.x = curv.x
	b.body.velocity.y = curv.y + b.dropSpeed
	if (b.body.position.y > SCREENSIZE[1]-100) {b.kill(); console.log('re-use food')}
    })

    game.physics.arcade.overlap(feeder.bullets,fishies,function (feed,fish) {
	
	console.log('we got a collision: %s %s',feed,fish)
	if (fish.popping) {return}
	fish.scale.x *= 1.1
	fish.scale.y *= 1.1
	fish.body.velocity.x *= 1.1
	fish.body.velocity.y *= 1.1
	if (fish.scale.x > 2) {
	    console.log('We should explode!!!!!!!!!!');
	    fish.popping = true;
	    fish.play('pop')
	    //fish.kill();
	}
	    feed.kill();
    });
    
    if (cursors.left.isDown) {
	hand.body.position.x -= 5
    }

    if (cursors.right.isDown) {
	hand.body.position.x += 5
    }

    

}


function render () {


    
}

console.log('Start tracking!');
gyro.startTracking (function (o) {
    console.log('tracking!');
    console.log(JSON.stringify(o));
    scoreboard.text = 'MOTION: '+JSON.stringify(o);
    hand.body.position.x += o.x
    
});



//setInterval(updateWind,500);
