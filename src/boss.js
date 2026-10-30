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


// The boss of the Adventure's first world, and its duel : the camera pulls back and slides, the planet going to a corner
// of the game area and the boss's side to the opposite one, where everything comes from

// THE DUEL'S CAMERA : what the game shows of space, moving from the usual view (the planet in the middle) to the duel's ;
// the game goes on in its own units, only its drawing and the limits of space change
var duelZoom	= 0.8;		// the zoom of the duel's view (1 : the usual one),
var duelCorner	= 0.25;		// where the planet goes, as a share of the game area from the sides of its corner,
var duelSlide	= 2.5;		// the seconds the camera takes to get there,
var duelArc		= 30;		// and how far from the boss's side its comets may come, in degrees on each side

// the camera : the boss's side (in radians around the planet, a diagonal), the turn the duel began (false : not yet),
// and how far it has gone to the duel's view (0 : the usual one, 1 : the duel's, drawn between two turns : movingParts, functions.js)
var camera		= { side : 0, from : false, share : 0 };
// how far from the planet's center things are still in the game : the game area's size, more in the duel, to its farthest corner
var fieldReach	= 600;

// function to start a game with the usual view and no boss, by initDefault (parameters.js)
function newDuel () {
	camera = { side : 0, from : false, share : 0 };
	fieldReach = gameSize;
	colossus = false;
	bossPhase = 0;
	colossusClosest = gameSize;
}

// function to start the duel : the camera goes to the planet's corner, opposite the boss's side
function startDuel ( side ) {
	camera.side = side;
	camera.from = gameTime;
}

// function to know if the game is a duel, its camera gone or going to its view
function inDuel () {
	return camera.from !== false;
}

// function to move the camera, at each turn of the game (not during the pause), and the limits of space with it
function advanceCamera () {
	if ( !inDuel() ) {
		return;
	}
	var time = Math.min ( 1, ( gameTime - camera.from ) / ( duelSlide * framesPerSecond ) );
	camera.share = time * time * ( 3 - 2 * time );		// (slow at the start and at the end)
	var edges = viewEdges();
	var corners = [ [edges.left, edges.top], [edges.right, edges.top], [edges.left, edges.bottom], [edges.right, edges.bottom] ];
	for ( var c in corners ) {
		fieldReach = Math.max ( fieldReach, distanceToPlanet ( corners[c][0], corners[c][1] ) + 40 );
	}
}

// function to know the view of the camera, gone that far to the duel's : its zoom, and where the planet's center is in the game area
function cameraView ( share ) {
	var away = share * ( 0.5 - duelCorner ) * gameSize * Math.SQRT2;
	return { zoom : 1 + ( duelZoom - 1 ) * share, x : MyPlanet.x - away * Math.cos ( camera.side ), y : MyPlanet.y - away * Math.sin ( camera.side ) };
}

// function to draw what follows as the camera sees it (drawGame, engine.js)
function aimCamera ( ctx ) {
	var view = cameraView ( camera.share );
	ctx.translate ( view.x, view.y );
	ctx.scale ( view.zoom, view.zoom );
	ctx.translate ( - MyPlanet.x, - MyPlanet.y );
}

// function to know the edges of what the camera shows, in the game's units : the game area itself in the usual view
// (the rebound shots bounce on them : secondary.js)
function viewEdges () {
	var view = cameraView ( camera.share );
	return { left : MyPlanet.x - view.x / view.zoom, top : MyPlanet.y - view.y / view.zoom,
		right : MyPlanet.x + ( gameSize - view.x ) / view.zoom, bottom : MyPlanet.y + ( gameSize - view.y ) / view.zoom };
}

// function to know how far from the planet's center the edge of what the camera shows is, in a direction (in radians)
function edgeDistance ( angle ) {
	var edges = viewEdges();
	var cos = Math.cos ( angle ), sin = Math.sin ( angle );
	var across = cos > 0 ? ( edges.right - MyPlanet.x ) / cos : cos < 0 ? ( edges.left - MyPlanet.x ) / cos : Infinity;
	var down = sin > 0 ? ( edges.bottom - MyPlanet.y ) / sin : sin < 0 ? ( edges.top - MyPlanet.y ) / sin : Infinity;
	return Math.min ( across, down );
}

// function to know if an asteroid is gone in the duel : out of what the camera shows, and going away from the planet
// (behind the planet, space is too short to watch it come back)
function outOfDuel ( asteroid ) {
	if ( !inDuel() ) {
		return false;
	}
	var edges = viewEdges();
	var margin = asteroid.radius + 10;
	var out = asteroid.x < edges.left - margin || asteroid.x > edges.right + margin || asteroid.y < edges.top - margin || asteroid.y > edges.bottom + margin;
	return out && ( asteroid.x - MyPlanet.x ) * asteroid.vx + ( asteroid.y - MyPlanet.y ) * asteroid.vy > 0;
}

// function to announce the duel : the side of the boss, one of the four diagonals, the mat given, and the camera going to the duel
// once it comes
function announceDuel ( seconds ) {
	var side = ( Math.floor ( Math.random() * 4 ) * 2 + 1 ) * Math.PI / 4;
	var news = announce ( "Colossus from the " + compassSide ( side ), "The Colossus, an asteroid as big as a moon, is coming from the "
		+ compassSide ( side ) + "! Steel plates cover half of it, halving the shots under " + colossusArmor + " of power: "
		+ "aim when its bare rock faces you. Destroy it before it charges your planet!", seconds, colossusGift,
		function () { startDuel ( side ); } );
	news.side = side;
}

// THE COLOSSUS : an asteroid as big as a moon, coming to the corner opposite the planet once the duel begins ; it throws asteroids
// at the planet, from its second phase comets and swarms too, then charges the planet in its last one ; its crash ends the game,
// its end wins the level, its asteroids crumbling with it ; half of it is plated with steel, turning with it : a hit weaker than
// colossusArmor loses half its power on the plates (the main weapons' shots, the missiles and the rebound shots, as the armored
// asteroids' plates stop them : threats.js)
var bossArrive		= 35;			// the second the Colossus comes (announced before), the asteroids coming from everywhere until then,
var bossEvery		= 4;			// one every so many seconds
var colossusGift	= 60;			// the mat given with its announce
var colossusRadius	= 60;			// its size (an asteroid's : 8, a giant's : 12),
var colossusLife	= 240;			// its life,
var colossusPost	= 580;			// how far from the planet's center it settles,
var colossusArmor	= 8;			// the weakest hit its plates don't weaken,
var colossusTurn	= 20;			// the seconds it takes to turn on itself, its plates with it,
var colossusThrows	= [3.5, 3.5, 3];	// the seconds between two asteroids it throws, in each of its three phases,
var colossusSplit	= [0.15, 0.25, 0.3];	// the part of them splitting ones,
var colossusComets	= [8, 12];		// the seconds between two comets from its side, from its second phase, at least and at most,
var colossusSwarms	= 30;			// the seconds between two swarms it spits, from its second phase,
var colossusCharge	= 0.3;			// and its speed toward the planet in its last phase, in game units per turn
var colossusColors	= [ "#ffb347", "#ff7a3d", "#ff3b30" ];	// the color of its life around it, in each phase

// the Colossus of the game (false : not come yet), its phase (1 to 3 ; 4 once destroyed), the turns until its next asteroid,
// comet and swarm, and the closest it came to the planet's center (a challenge of the Adventure)
var colossus		= false;
var bossPhase		= 0;
var bossTimers		= { rock : 0, comet : 0, swarm : 0 };
var colossusClosest	= 600;

// function to play the boss's level, at each turn of the game (not during the pause) : asteroids from everywhere until the Colossus
// comes, announced, then the Colossus, until it is destroyed (or the planet)
function advanceBoss ( ctx, level ) {
	if ( gameTime == 1 ) {
		adventure.banner = { text : "Boss: the Colossus!", from : gameTime, time : 2.5 };
	}
	if ( gameTime == ( bossArrive - announceTime ) * framesPerSecond ) {
		announceDuel ( announceTime );
	}
	if ( !inDuel() ) {
		adventure.timer--;
		if ( adventure.timer <= 0 ) {
			adventure.timer = bossEvery * framesPerSecond;
			launchAsteroid ( ctx, Math.random() * 2 * Math.PI, false );
		}
		return;
	}
	if ( colossus === false ) {
		bringColossus ( ctx );
		return;
	}
	if ( colossus.life <= 0 ) {
		if ( colossus.crashed ) {
			// (crushed by the Colossus, the planet is lost, whatever was healing it)
			MyPlanet.life = 0;
			planetHealPend = 0;
		} else if ( bossPhase < 4 ) {
			breakColossus ( ctx );
		}
		return;
	}
	moveColossus();
	// its phase, as it breaks : a new one is told
	var phase = ( colossus.life * 3 > colossusLife * 2 ) ? 1 : ( colossus.life * 3 > colossusLife ) ? 2 : 3;
	if ( phase > bossPhase ) {
		bossPhase = phase;
		bossTimers.swarm = 3 * framesPerSecond;
		bossTimers.comet = colossusComets[0] * framesPerSecond;
		adventure.banner = { text : ( phase == 2 ) ? "It's cracking!" : "It's charging!", from : gameTime, time : 2.5 };
	}
	if ( !colossus.settled ) {
		return;
	}
	// what it throws : asteroids, then comets and swarms from its second phase
	bossTimers.rock--;
	if ( bossTimers.rock <= 0 ) {
		bossTimers.rock = Math.round ( colossusThrows[bossPhase - 1] * framesPerSecond );
		throwRock ( ctx );
	}
	if ( bossPhase >= 2 ) {
		bossTimers.comet--;
		if ( bossTimers.comet <= 0 ) {
			bossTimers.comet = Math.round ( ( colossusComets[0] + Math.random() * ( colossusComets[1] - colossusComets[0] ) ) * framesPerSecond );
			var angle = camera.side + ( Math.random() * 2 - 1 ) * duelArc * Math.PI / 180;
			launchComet ( ctx, angle, edgeDistance ( angle ) + 10 );
		}
		bossTimers.swarm--;
		if ( bossTimers.swarm <= 0 ) {
			bossTimers.swarm = colossusSwarms * framesPerSecond;
			var d = distanceToPlanet ( colossus.x, colossus.y );
			launchSwarm ( ctx, Math.atan2 ( colossus.y - MyPlanet.y, colossus.x - MyPlanet.x ),
				d - colossus.radius - swarmDepth - 10, colossus.radius * 0.6 / d * 180 / Math.PI );
		}
	}
}

// function to bring the Colossus : beyond the corner of the view, on its way to its post, its rock dark red and half plated,
// turning slowly on itself
function bringColossus ( ctx ) {
	var d = colossusPost + 320;
	colossus = new Asteroid ( ctx, colossusLife, colossusRadius, asteroidBM * 2000,
		MyPlanet.x + d * Math.cos ( camera.side ), MyPlanet.y + d * Math.sin ( camera.side ), 0, 0, true, false );
	colossus.giant = false;		// (its rock has a giant's color, but it is more than a giant)
	colossus.colossus = true;
	colossus.settled = false;
	colossus.spinSpeed = 2 * Math.PI / ( colossusTurn * framesPerSecond );
	plateColossus ( colossus );
	colossus.Draw = drawColossus;
	asteroidList.push ( colossus );
	fieldReach = Math.max ( fieldReach, d + colossusRadius + 40 );		// (not to be gone for good before it comes)
	bossPhase = 1;
	bossTimers = { rock : 0, comet : 0, swarm : 0 };
}

// function to plate half of the Colossus's rock with steel, on its texture (the side its spin turns to : drawPlates, threats.js)
function plateColossus ( asteroid ) {
	var half = asteroid.rockHalf;
	var ctx = asteroid.rock.getContext ( "2d" );
	ctx.save();
	ctx.setTransform ( asteroid.rock.width / ( half * 2 ), 0, 0, asteroid.rock.height / ( half * 2 ), 0, 0 );
	ctx.translate ( half, half );
	ctx.clip ( asteroid.outline );
	ctx.beginPath();
	ctx.rect ( 0, - half, half, half * 2 );
	ctx.clip();
	drawPlates ( ctx, asteroid.radius );
	// and the edge of the plates, across the rock
	ctx.strokeStyle = "rgba(25,30,40,0.95)";
	ctx.lineWidth = asteroid.radius * 0.08;
	ctx.beginPath();
	ctx.moveTo ( 0, - half );
	ctx.lineTo ( 0, half );
	ctx.stroke();
	ctx.restore();
}

// function to move the Colossus : to its post, slowing down as it gets there, still there, then charging the planet in its last phase
function moveColossus () {
	var dx = MyPlanet.x - colossus.x, dy = MyPlanet.y - colossus.y;
	var d = Math.sqrt ( dx * dx + dy * dy );
	colossusClosest = Math.min ( colossusClosest, d );
	var speed = 0;
	if ( bossPhase == 3 ) {
		speed = colossusCharge;
	} else if ( d > colossusPost ) {
		speed = Math.min ( 4, 0.3 + ( d - colossusPost ) * 0.04 );
	} else {
		colossus.settled = true;
	}
	colossus.vx = dx / d * speed;
	colossus.vy = dy / d * speed;
}

// function to make the Colossus throw an asteroid at the planet, from its face, a splitting one now and then
function throwRock ( ctx ) {
	var d = distanceToPlanet ( colossus.x, colossus.y );
	var angle = Math.atan2 ( colossus.y - MyPlanet.y, colossus.x - MyPlanet.x ) + ( Math.random() * 2 - 1 ) * colossus.radius * 0.7 / d;
	var rock = launchAsteroid ( ctx, angle, false, 1, d - colossus.radius - asteroidBR * 1.5 );
	if ( Math.random() < colossusSplit[bossPhase - 1] ) {
		makeSplitter ( rock );
	}
}

// function to know what a hit does to the Colossus : half of it on its plates when too weak, with a spark (armorDamage, threats.js)
function plateDamage ( asteroid, power, x, y ) {
	if ( power >= colossusArmor || Math.cos ( Math.atan2 ( y - asteroid.y, x - asteroid.x ) - asteroid.spin ) <= 0 ) {
		return power;
	}
	flashList.push ( { x : x, y : y, radius : 1, age : 0, color : "225,235,245" } );
	playSound ( "ricochet" );
	return Math.floor ( power / 2 );
}

// function to break the Colossus, its life gone : a huge blast, its debris everywhere, the asteroids it threw crumbling,
// and the level won a few seconds later
function breakColossus ( ctx ) {
	var kept = [];
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		if ( asteroid == colossus || asteroid.life <= 0 ) {
			kept.push ( asteroid );
			continue;
		}
		blastList.push ( { x : asteroid.x, y : asteroid.y, size : 0, age : 0, blast : asteroid.radius * 1.5 } );
		addDebris ( ctx, Math.min ( 3, asteroid.life ), asteroid.x, asteroid.y, asteroid.vx, asteroid.vy, debrisList, asteroid.metal );
		asteroid.life = 0;
	}
	asteroidList = kept;
	blastList.push ( { x : colossus.x, y : colossus.y, size : 0, age : 0, blast : colossus.radius * 2.5 } );
	for ( var q = 0; q < 4; q++ ) {
		var angle = ( q + 0.5 ) * Math.PI / 2;
		addDebris ( ctx, 15, colossus.x, colossus.y, 2 * Math.cos ( angle ), 2 * Math.sin ( angle ), debrisList, false );
	}
	playSound ( "giant" );
	bossPhase = 4;
	adventure.ending = levelEnd * framesPerSecond;
	adventure.banner = { text : "Colossus destroyed!", from : gameTime, time : levelEnd };
}

// function to draw the Colossus : a red glow beating fast around it when it charges, its rock, and its life around it,
// with marks where its phases change
function drawColossus () {
	var ctx = this.context;
	var ring = this.radius * 1.3;
	ctx.save();
	if ( bossPhase == 3 ) {
		var beat = 0.5 + 0.5 * Math.sin ( performance.now() / 1000 * 2 * Math.PI * 2 );
		var halo = ctx.createRadialGradient ( this.x, this.y, this.radius * 0.8, this.x, this.y, this.radius * 1.8 );
		halo.addColorStop ( 0, "rgba(255,40,20," + ( 0.25 + 0.25 * beat ) + ")" );
		halo.addColorStop ( 1, "rgba(255,40,20,0)" );
		ctx.fillStyle = halo;
		ctx.beginPath();
		ctx.arc ( this.x, this.y, this.radius * 1.8, 0, 2 * Math.PI );
		ctx.fill();
	}
	ctx.restore();
	DrawRock.call ( this );
	ctx.save();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "rgba(255,255,255,0.15)";
	ctx.beginPath();
	ctx.arc ( this.x, this.y, ring, 0, 2 * Math.PI );
	ctx.stroke();
	ctx.strokeStyle = colossusColors[Math.min ( 3, Math.max ( 1, bossPhase ) ) - 1];
	ctx.beginPath();
	ctx.arc ( this.x, this.y, ring, - Math.PI / 2, - Math.PI / 2 + 2 * Math.PI * Math.max ( 0, this.life ) / colossusLife );
	ctx.stroke();
	ctx.strokeStyle = "rgba(255,255,255,0.6)";
	ctx.lineWidth = 1.5;
	for ( var m = 1; m <= 2; m++ ) {
		var angle = - Math.PI / 2 + m * 2 * Math.PI / 3;
		ctx.beginPath();
		ctx.moveTo ( this.x + ( ring - 4 ) * Math.cos ( angle ), this.y + ( ring - 4 ) * Math.sin ( angle ) );
		ctx.lineTo ( this.x + ( ring + 4 ) * Math.cos ( angle ), this.y + ( ring + 4 ) * Math.sin ( angle ) );
		ctx.stroke();
	}
	ctx.restore();
}
