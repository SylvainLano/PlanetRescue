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


// The kamikazes : small ships the player sends from the planet with a click (or a touch) on an asteroid ; each one rams
// its asteroid head-on and stops it, for the cannon to hit it at last ; one is ready at the start, and a new one is built
// in its building time once one is sent (the shop brings more of them, built one after the other, and a shorter time : shop.js)
var kamikazeSpeed	= 2.5;	// its speed, in game units per turn (a basic shot's : 1 to 5),
var kamikazeTurn	= 0.15;		// how much it turns toward its target at each turn at most, in radians,
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
		heading : angle, target : target, home : false } );
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
// its asteroid and rams it, or goes back home if its asteroid is destroyed first, and is ready again once it lands
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
		var goal = ship.home ? MyPlanet : ship.target;
		var wanted = Math.atan2 ( goal.y - ship.y, goal.x - ship.x );
		var turn = ( ( wanted - ship.heading + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI;
		ship.heading += Math.max ( - kamikazeTurn, Math.min ( kamikazeTurn, turn ) );
		ship.x += kamikazeSpeed * Math.cos ( ship.heading );
		ship.y += kamikazeSpeed * Math.sin ( ship.heading );
		var gap = Math.sqrt ( Math.pow ( goal.x - ship.x, 2 ) + Math.pow ( goal.y - ship.y, 2 ) );
		if ( ship.home && gap < MyPlanet.radius ) {
			kamikazes.ready = Math.min ( kamikazes.most, kamikazes.ready + 1 );		// (landed : ready again)
			if ( kamikazes.ready == kamikazes.most ) {
				kamikazes.timer = 0;
			}
		} else if ( !ship.home && gap < goal.radius + 2 ) {
			ramAsteroid ( ship, goal );
		} else if ( distanceToPlanet ( ship.x, ship.y ) <= fieldReach ) {
			kept.push ( ship );
		}
	}
	kamikazeList = kept;
}

// function to ram an asteroid : it loses most of its speed (a heavy one less, the Colossus nearly nothing), with a small blast
function ramAsteroid ( ship, asteroid ) {
	var keep = 1 - kamikazeBrake * Math.min ( 1, asteroidBM / asteroid.mass );
	asteroid.vx *= keep;
	asteroid.vy *= keep;
	blastList.push ( { x : ship.x, y : ship.y, size : 0, age : 0, blast : 5 } );
	playSound ( "ram" );
}

// function to draw the ships flying : a small white arrow, its engine glowing behind it
function drawKamikazes ( ctx ) {
	ctx.save();
	for ( var k in kamikazeList ) {
		var ship = kamikazeList[k];
		ctx.save();
		ctx.translate ( ship.x, ship.y );
		ctx.rotate ( ship.heading );
		ctx.scale ( 0.6, 0.6 );
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
		ctx.restore();
	}
	ctx.restore();
}

// function to draw the kamikazes in the bottom left corner of the game : the ready ones bright, the one being built dim
// with its progress around it ; and until a first one is sent, the hint to click an asteroid
function drawKamikazeGauge ( ctx ) {
	ctx.save();
	for ( var n = 0; n < kamikazes.most; n++ ) {
		var x = 18 + n * 22, y = gameSize - 18;
		var ready = n < kamikazes.ready;
		ctx.save();
		ctx.translate ( x, y );
		ctx.rotate ( - Math.PI / 2 );
		ctx.globalAlpha = ready ? 0.95 : 0.3;
		ctx.fillStyle = "#f2f6fa";
		ctx.beginPath();
		ctx.moveTo ( 8, 0 );
		ctx.lineTo ( -6, -5 );
		ctx.lineTo ( -3, 0 );
		ctx.lineTo ( -6, 5 );
		ctx.closePath();
		ctx.fill();
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
		ctx.fillText ( "click an asteroid to send a kamikaze", 18 + kamikazes.most * 22, gameSize - 18 );
	}
	ctx.restore();
}
