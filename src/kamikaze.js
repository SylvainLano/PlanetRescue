/*
//	This file is originaly part of the Planet Rescue Project
//	It was first made in 2010 by Sylvain Lano ( https://sylvainlano.github.io/ )
//	This project page is : https://github.com/SylvainLano/PlanetRescue
//  The old project page was : https://sourceforge.net/projects/planetrescue/
//
//	This program is distributed in the hope that it will be fun and useful,
//	but WITHOUT ANY WARRANTY. If it doesn't work well, contact us
//	or improve the code and share it alike !
*/


// The kamikazes : small ships the player sends from the planet with a click (or a touch) on an asteroid, or with the F key
// to the asteroid the cannon aims at ; each one flies
// ahead of its asteroid, turns back and rams it head-on, against its way, and stops it, for the cannon to hit it at last ; one is
// ready at the start, and a new one is built in its building time once one is sent (the shop brings more of them, built one
// after the other, and a shorter time : shop.js)
var kamikazeSpeed	= 2.5;		// its speed, in game units per turn (a basic shot's : 1 to 5),
var kamikazeTurn	= 0.15;		// how much it turns toward where it goes at each turn at most, in radians,
var kamikazeAhead	= 30;		// how far it goes ahead of its asteroid, beyond the room it needs to turn back, to come facing it,
var kamikazeCarrot	= 30;		// how much closer to its asteroid than itself it aims on the asteroid's way, to join it and run along it,
var kamikazeBrake	= 0.9;		// the part of its speed an asteroid of the usual mass loses when rammed (less for a heavier one),
var kamikazeReach	= 12;		// and how far from an asteroid's edge a click still picks it, in game units

// the kamikazes of the game : the ones ready, the most there can be, their building time in seconds and the turns until
// the next one is built ; the ships flying, each one with its asteroid (or going back home, its asteroid destroyed before)
var kamikazes		= { ready : 1, most : 1, building : 30, timer : 0 };
var kamikazeList	= [];

// function to start a game with its kamikazes, by initDefault (parameters.js)
function newKamikazes () {
	kamikazes = { ready : gameValues.kamikazes, most : gameValues.kamikazes, building : gameValues.kamikazeBuilding, timer : 0 };
	kamikazeList = [];
}

// a click (or a touch) on the game sends a kamikaze to the asteroid under it, while playing, if one is ready
// (the page reads it, the game's canvas not being there yet when this file is read)
document.addEventListener ( "pointerdown", function ( e ) {
	if ( e.target.id != "mainArea" || state != "playing" || pause != 0 || kamikazes.ready <= 0 ) {
		return;
	}
	var place = spacePlace ( e.clientX, e.clientY );
	var target = pickAsteroid ( place.x, place.y );
	if ( target ) {
		launchKamikaze ( target );
		e.preventDefault();
	}
} );

// function to send a kamikaze to the asteroid the main cannon aims at, circled on screen, with the F key (changeKey in functions.js)
function aimedKamikaze () {
	if ( state == "playing" && pause == 0 && kamikazes.ready > 0 && aimedA && aimedA.life > 0 ) {
		launchKamikaze ( aimedA );
	}
}

// function to know the place in space under a point of the screen, as the camera shows space (boss.js)
function spacePlace ( clientX, clientY ) {
	var area = document.getElementById ( "mainArea" ).getBoundingClientRect();
	var view = cameraView ( camera.share );
	var x = ( clientX - area.left ) / area.width * gameSize;
	var y = ( clientY - area.top ) / area.height * gameSize;
	return { x : MyPlanet.x + ( x - view.x ) / view.zoom, y : MyPlanet.y + ( y - view.y ) / view.zoom };
}

// function to find the asteroid under a place in space : the closest one, a little beyond its edge too (false : none)
function pickAsteroid ( x, y ) {
	var best = false, bestGap = 0;
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		var gap = Math.sqrt ( Math.pow ( asteroid.x - x, 2 ) + Math.pow ( asteroid.y - y, 2 ) ) - asteroid.radius;
		if ( asteroid.life > 0 && gap < kamikazeReach && ( best === false || gap < bestGap ) ) {
			best = asteroid;
			bestGap = gap;
		}
	}
	return best;
}

// function to send a kamikaze to an asteroid, from the planet's side facing it ; the next one is built from now on
function launchKamikaze ( target ) {
	var angle = Math.atan2 ( target.y - MyPlanet.y, target.x - MyPlanet.x );
	kamikazeList.push ( { x : MyPlanet.x + ( MyPlanet.radius + 4 ) * Math.cos ( angle ), y : MyPlanet.y + ( MyPlanet.radius + 4 ) * Math.sin ( angle ),
		heading : angle, target : target, facing : false, home : false } );
	if ( kamikazes.ready == kamikazes.most ) {
		kamikazes.timer = kamikazes.building * framesPerSecond;
	}
	kamikazes.ready--;
	try {
		localStorage["kamikazeSent"] = "yes";		// (the hint to click an asteroid has done its job : drawKamikazeGauge)
	} catch ( e ) {}
	playSound ( "kamikaze" );
}

// function to build the kamikazes and fly the ships, at each turn of the game (not during the pause) : each ship turns toward
// where it goes (kamikazeGoal) and rams its asteroid, or goes back home if its asteroid is destroyed first, and is ready again
// once it lands
function advanceKamikazes ( ctx ) {
	if ( kamikazes.ready < kamikazes.most ) {
		kamikazes.timer--;
		if ( kamikazes.timer <= 0 ) {
			kamikazes.ready++;
			kamikazes.timer = ( kamikazes.ready < kamikazes.most ) ? kamikazes.building * framesPerSecond : 0;
		}
	}
	var kept = [];
	for ( var k in kamikazeList ) {
		var ship = kamikazeList[k];
		if ( !ship.home && ( ship.target.life <= 0 || asteroidList.indexOf ( ship.target ) < 0 ) ) {
			ship.home = true;
		}
		var goal = ship.home ? MyPlanet : kamikazeGoal ( ship );
		var wanted = Math.atan2 ( goal.y - ship.y, goal.x - ship.x );
		var up = Math.atan2 ( ship.y - MyPlanet.y, ship.x - MyPlanet.x );
		if ( !ship.home && distanceToPlanet ( ship.x, ship.y ) < MyPlanet.radius + 10 + kamikazeSpeed / kamikazeTurn
			&& Math.cos ( wanted - up ) < 0 ) {
			wanted = up + ( Math.sin ( wanted - up ) > 0 ? 1 : -1 ) * Math.PI / 2;		// (around the planet, not over it)
		}
		var turn = ( ( wanted - ship.heading + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI;
		ship.heading += Math.max ( - kamikazeTurn, Math.min ( kamikazeTurn, turn ) );
		ship.x += kamikazeSpeed * Math.cos ( ship.heading );
		ship.y += kamikazeSpeed * Math.sin ( ship.heading );
		var other = ship.home ? MyPlanet : ship.target;
		var gap = Math.sqrt ( Math.pow ( other.x - ship.x, 2 ) + Math.pow ( other.y - ship.y, 2 ) );
		if ( ship.home && gap < MyPlanet.radius ) {
			kamikazes.ready = Math.min ( kamikazes.most, kamikazes.ready + 1 );		// (landed : ready again)
			if ( kamikazes.ready == kamikazes.most ) {
				kamikazes.timer = 0;
			}
		} else if ( !ship.home && gap < other.radius + 2 ) {
			ramAsteroid ( ship, other );
		} else if ( distanceToPlanet ( ship.x, ship.y ) <= fieldReach ) {
			kept.push ( ship );
		}
	}
	kamikazeList = kept;
}

// function to know where a ship flies, to ram its asteroid head-on, against its way (straight to it if it hardly moves) :
//	- once in front of it, far enough to turn back, or already turned back : a point of its way a little closer to it than
//	  the ship, to join its way and run along it to the asteroid (and so on, until the asteroid passes it)
//	- before, if behind it in its lane : beside it, not to ram it from behind
//	- else : a point ahead of it, beside its way, where it will be once the ship gets there
function kamikazeGoal ( ship ) {
	var asteroid = ship.target;
	var speed = Math.sqrt ( asteroid.vx * asteroid.vx + asteroid.vy * asteroid.vy );
	if ( speed < 0.05 ) {
		return asteroid;
	}
	var ux = asteroid.vx / speed, uy = asteroid.vy / speed;		// the asteroid's way
	var dx = ship.x - asteroid.x, dy = ship.y - asteroid.y;
	var along = dx * ux + dy * uy;			// how far ahead of the asteroid the ship is on its way (behind : less than 0),
	var aside = dx * uy - dy * ux;			// and how far aside, on one side or the other
	var room = 2 * kamikazeSpeed / kamikazeTurn;		// (the room a ship needs to turn back)
	var against = Math.cos ( ship.heading ) * ux + Math.sin ( ship.heading ) * uy < -0.7;
	var turnBack = asteroid.radius + room + kamikazeAhead / 2;		// (far enough ahead to turn back)
	if ( along < - asteroid.radius ) {
		ship.facing = false;
	} else if ( along > Math.abs ( aside ) + turnBack || ( along > turnBack && Math.abs ( aside ) < room * 1.2 )
		|| ( along > Math.abs ( aside ) && against ) ) {
		ship.facing = true;
	}
	if ( ship.facing ) {
		var closer = Math.max ( 0, along - kamikazeCarrot );
		return { x : asteroid.x + ux * closer, y : asteroid.y + uy * closer };
	}
	var side = ( aside < 0 ) ? -1 : 1;
	if ( along < asteroid.radius && Math.abs ( aside ) < asteroid.radius + 15 ) {
		return { x : asteroid.x + ux * asteroid.radius + side * uy * ( asteroid.radius + room ),
			y : asteroid.y + uy * asteroid.radius - side * ux * ( asteroid.radius + room ) };
	}
	// (on the ship's side of the way, for its turning back to bring it onto the way)
	var ahead = asteroid.radius + room + kamikazeAhead, offset = side * room * 0.75, time = 0, x = 0, y = 0;
	for ( var n = 0; n < 3; n++ ) {
		x = asteroid.x + asteroid.vx * time + ux * ahead + uy * offset;
		y = asteroid.y + asteroid.vy * time + uy * ahead - ux * offset;
		time = Math.sqrt ( Math.pow ( x - ship.x, 2 ) + Math.pow ( y - ship.y, 2 ) ) / kamikazeSpeed;
	}
	return { x : x, y : y };
}

// function to ram an asteroid : it loses most of its speed (a heavy one less, the Colossus nearly nothing), with a small blast
function ramAsteroid ( ship, asteroid ) {
	var keep = 1 - kamikazeBrake * Math.min ( 1, asteroidBM / asteroid.mass );
	asteroid.vx *= keep;
	asteroid.vy *= keep;
	blastList.push ( { x : ship.x, y : ship.y, size : 0, age : 0, blast : 5 } );
	playSound ( "ram" );
}

// function to draw the ships flying, each one heading where it goes
function drawKamikazes ( ctx ) {
	ctx.save();
	for ( var k in kamikazeList ) {
		var ship = kamikazeList[k];
		ctx.save();
		ctx.translate ( ship.x, ship.y );
		ctx.rotate ( ship.heading );
		ctx.scale ( 0.6, 0.6 );
		drawShip ( ctx );
		ctx.restore();
	}
	ctx.restore();
}

// function to draw a ship where the context is, heading right : a small white arrow, its engine glowing behind it
// (the ships flying, and the ones of the gauge : drawKamikazeGauge)
function drawShip ( ctx ) {
	var flame = ctx.createRadialGradient ( -5, 0, 0, -5, 0, 6 );
	flame.addColorStop ( 0, "rgba(255,200,90,0.9)" );
	flame.addColorStop ( 1, "rgba(255,120,40,0)" );
	ctx.fillStyle = flame;
	ctx.beginPath();
	ctx.arc ( -5, 0, 6, 0, 2 * Math.PI );
	ctx.fill();
	ctx.fillStyle = "#f2f6fa";
	ctx.beginPath();
	ctx.moveTo ( 6, 0 );
	ctx.lineTo ( -4, -3.5 );
	ctx.lineTo ( -2, 0 );
	ctx.lineTo ( -4, 3.5 );
	ctx.closePath();
	ctx.fill();
}

// function to draw the kamikazes in the bottom left corner of the game, the ships heading up : the ready ones bright,
// the one being built dim with its progress around it ; and until a first one is sent, the hint to click an asteroid
function drawKamikazeGauge ( ctx ) {
	ctx.save();
	for ( var n = 0; n < kamikazes.most; n++ ) {
		var x = 18 + n * 22, y = gameSize - 18;
		var ready = n < kamikazes.ready;
		ctx.save();
		ctx.translate ( x, y );
		ctx.rotate ( - Math.PI / 2 );
		ctx.globalAlpha = ready ? 0.95 : 0.3;
		ctx.translate ( 2.5, 0 );		// (its middle, flame included, on the gauge's place)
		drawShip ( ctx );
		ctx.restore();
		if ( n == kamikazes.ready && kamikazes.timer > 0 ) {
			var done = 1 - kamikazes.timer / ( kamikazes.building * framesPerSecond );
			ctx.strokeStyle = "rgba(255,190,90,0.9)";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc ( x, y, 10, - Math.PI / 2, - Math.PI / 2 + 2 * Math.PI * Math.max ( 0, done ) );
			ctx.stroke();
		}
	}
	var sent = false;
	try {
		sent = localStorage["kamikazeSent"] == "yes";
	} catch ( e ) {}
	if ( !sent ) {
		ctx.fillStyle = "rgba(220,230,240,0.7)";
		ctx.font = "10px Arial";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText ( "click an asteroid, or press F for the circled one, to send a kamikaze", 18 + kamikazes.most * 22, gameSize - 18 );
	}
	ctx.restore();
}
