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


// The threats coming after the asteroids, one more each minute in the Arcade (arcadeThreats) : the comets first,
// each new one announced by the NAZA, with a countdown to get ready, and mat given by the inhabitants for the worst ones

// THE NAZA'S ANNOUNCES : a message at the top of the game, the seconds left before what it announces comes,
// and the mat the inhabitants give at once to get ready, if any ; once read, the message shrinks to a line with its title
// and the countdown, not to hide the asteroids coming from the top, and it stays a while once what it announced has come
var announces = [];			// the announces going on, the first one shown
var announceStay = 2;		// the seconds a message stays once what it announced has come
var announceTime = 30;		// the seconds between an announce and its threat, for the player to get ready
var announceRead = 6;		// the seconds the whole message shows, before it shrinks

// function to announce a threat : its title and message, the seconds before it comes, the mat given (can go over the store's room,
// not to be lost), and what to do when it comes
// (it gives the announce, for a threat to tell its side : swarms)
function announce ( title, text, seconds, gift, coming ) {
	if ( gift > 0 ) {
		MyPlanet.mat += gift;
	}
	var news = { title : title, text : text, from : gameTime, at : gameTime + seconds * framesPerSecond, gift : gift, coming : coming, done : false };
	announces.push ( news );
	return news;
}

// function to make the announces' countdowns go on, at each turn of the game (not during the pause) :
// what they announce comes when theirs ends
function advanceAnnounces ( ctx ) {
	var kept = [];
	for ( var a in announces ) {
		var news = announces[a];
		if ( !news.done && gameTime >= news.at ) {
			news.done = true;
			if ( news.coming ) {
				news.coming ( ctx );
			}
		}
		if ( gameTime < news.at + announceStay * framesPerSecond ) {
			kept.push ( news );
		}
	}
	announces = kept;
}

// function to draw the first announce at the top of the game : the whole message first, then its line, fading into each other
// (and the marks of the sides the threats announced will come from, under it)
function drawAnnounce ( ctx ) {
	if ( announces.length == 0 ) {
		return;
	}
	drawThreatSides ( ctx );
	var news = announces[0];
	var age = ( gameTime - news.from ) / framesPerSecond;
	var appear = Math.min ( 1, age * 2 );
	var fade = news.done ? Math.max ( 0, 1 - ( gameTime - news.at ) / ( announceStay * framesPerSecond ) ) : 1;
	var shrink = Math.max ( 0, Math.min ( 1, ( age - announceRead ) * 2 ) );		// (from the whole message to its line, in half a second)
	var countdown = news.done ? "Now!" : announceCountdown ( news );
	ctx.save();
	ctx.textBaseline = 'alphabetic';
	if ( shrink < 1 ) {
		ctx.globalAlpha = Math.min ( appear, fade ) * ( 1 - shrink );
		drawAnnounceMessage ( ctx, news, countdown );
	}
	if ( shrink > 0 ) {
		ctx.globalAlpha = fade * shrink;
		drawAnnounceLine ( ctx, news, countdown );
	}
	ctx.restore();
}

// function to write an announce's countdown : 0:21
function announceCountdown ( news ) {
	var left = Math.max ( 0, Math.ceil ( ( news.at - gameTime ) / framesPerSecond ) );
	return Math.floor ( left / 60 ) + ":" + ( left % 60 < 10 ? "0" : "" ) + left % 60;
}

// function to draw an announce's whole message : the NAZA's name, the countdown, the message and the mat given, in a panel
function drawAnnounceMessage ( ctx, news, countdown ) {
	ctx.font = '12px Arial';
	var lines = wrapText ( ctx, news.text, 396 );
	var bottom = 72 + lines.length * 15;	// (the mat given under the message)
	drawAnnouncePanel ( ctx, 90, 34, 420, bottom - 34 + ( news.gift > 0 ? 15 : 0 ) );
	ctx.textAlign = 'left';
	ctx.fillStyle = '#8fc4ff';
	ctx.font = '20px MirageRegular';
	ctx.fillText ( "NAZA", 102, 57 );
	drawAnnounceCountdown ( ctx, news, countdown, 498, 57, 20 );
	ctx.textAlign = 'left';
	ctx.fillStyle = '#dde6f0';
	ctx.font = '12px Arial';
	for ( var l = 0; l < lines.length; l++ ) {
		ctx.fillText ( lines[l], 102, 76 + l * 15 );
	}
	if ( news.gift > 0 ) {
		ctx.textAlign = 'right';
		ctx.fillStyle = '#5df45d';
		ctx.fillText ( "+" + news.gift + " mat from your inhabitants", 498, bottom + 4 );
	}
}

// function to draw an announce's line, once its message is read : the NAZA's name, its title and the countdown
function drawAnnounceLine ( ctx, news, countdown ) {
	drawAnnouncePanel ( ctx, 200, 34, 200, 24 );
	ctx.textAlign = 'left';
	ctx.fillStyle = '#8fc4ff';
	ctx.font = '13px MirageRegular';
	ctx.fillText ( "NAZA", 208, 51 );
	ctx.textAlign = 'center';
	ctx.fillStyle = '#dde6f0';
	ctx.font = '12px Arial';
	ctx.fillText ( news.title, 300, 50 );
	drawAnnounceCountdown ( ctx, news, countdown, 393, 51, 15 );
}

// function to draw an announce's panel : dark, framed in the NAZA's blue
function drawAnnouncePanel ( ctx, x, y, width, height ) {
	ctx.fillStyle = 'rgba(10,16,30,0.85)';
	ctx.strokeStyle = 'rgba(120,180,255,0.8)';
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.rect ( x, y, width, height );
	ctx.fill();
	ctx.stroke();
}

// function to draw an announce's countdown, right-aligned, in the tiles' font (tiles.js) whose digits read better ; in red once come
function drawAnnounceCountdown ( ctx, news, countdown, x, y, size ) {
	ctx.textAlign = 'right';
	ctx.fillStyle = news.done ? '#ff6b6b' : '#ffffff';
	ctx.font = size + "px " + tileFont.family;
	ctx.fillText ( countdown, x, y );
}

// function to mark at the edge of the game the side each threat announced will come from, until it comes :
// a red arrow pointing at the planet, beating
function drawThreatSides ( ctx ) {
	var beat = 0.6 + 0.4 * Math.sin ( performance.now() / 1000 * 2 * Math.PI );
	ctx.save();
	for ( var a in announces ) {
		var news = announces[a];
		if ( news.done || news.side === undefined ) {
			continue;
		}
		ctx.save();
		ctx.translate ( MyPlanet.x + sideMark * Math.cos ( news.side ), MyPlanet.y + sideMark * Math.sin ( news.side ) );
		ctx.rotate ( news.side + Math.PI );
		ctx.globalAlpha = beat;
		ctx.fillStyle = '#ff4a3a';
		ctx.beginPath();
		ctx.moveTo ( 14, 0 );
		ctx.lineTo ( -8, -10 );
		ctx.lineTo ( -3, 0 );
		ctx.lineTo ( -8, 10 );
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	ctx.restore();
}
var sideMark = 265;		// how far from the planet's center the side of a threat is marked

// function to name a side around the planet, as a compass would (the north at the top) : "north-east"
function compassSide ( angle ) {
	var sides = [ "east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east" ];
	return sides[( ( Math.round ( angle / ( Math.PI / 4 ) ) % 8 ) + 8 ) % 8];
}

// function to cut a text into lines no wider than the width given, with the canvas' font
function wrapText ( ctx, text, width ) {
	var words = text.split ( " " );
	var lines = [];
	var line = "";
	for ( var w in words ) {
		var longer = line ? line + " " + words[w] : words[w];
		if ( line && ctx.measureText ( longer ).width > width ) {
			lines.push ( line );
			line = words[w];
		} else {
			line = longer;
		}
	}
	lines.push ( line );
	return lines;
}

// THE COMETS : small, three times faster than the asteroids, fragile, often grazing the planet ; a crash takes few inhabitants,
// but their debris are ice, worth much mat (the "ice" of metals, parameters.js, which no asteroid gets by chance)
var cometLife		= 4;
var cometRadius		= 5;
var cometSpeed		= 3;		// times an asteroid's speed
var cometHit		= 2;		// the inhabitants a comet's crash takes away, at most
var cometAside		= 0.5;		// how far aside from the planet's center it may aim, in radians
var cometGap		= [30, 60];	// seconds between two comets in the Arcade, at least and at most
var cometTimer		= 0;		// turns left before the next comet in the Arcade

// function to launch a comet from the edge, toward the planet or grazing it
function launchComet ( ctx ) {
	var angle = Math.random() * Math.PI * 2;
	var x = MyPlanet.x + gameSize / 2 * Math.cos ( angle );
	var y = MyPlanet.y + gameSize / 2 * Math.sin ( angle );
	var aim = angle + ( Math.random() * 2 - 1 ) * cometAside;
	var velocity = ( Math.random() + 1.5 ) * asteroidSpeedFactor() * asteroidBS * cometSpeed;
	var comet = new Asteroid ( ctx, cometLife, cometRadius, asteroidBM, x, y, - velocity * Math.cos ( aim ), - velocity * Math.sin ( aim ), false, "ice" );
	comet.comet = true;
	comet.flyBy = true;		// (gone for good once far away, not sent back : engine.js)
	comet.Draw = drawComet;
	asteroidList.push ( comet );
}

// function to get what an asteroid's crash takes away : its life, or a few inhabitants for a comet (before the Early Warning)
function crashLife ( asteroid ) {
	return asteroid.comet ? Math.min ( cometHit, asteroid.life ) : asteroid.life;
}

// function to draw a comet : its tail behind it, then its glowing head
function drawComet () {
	var ctx = this.context;
	var speed = Math.sqrt ( this.vx * this.vx + this.vy * this.vy );
	var length = 14 * speed + 10;
	var tailX = this.x - this.vx / speed * length;
	var tailY = this.y - this.vy / speed * length;
	ctx.save();
	var tail = ctx.createLinearGradient ( this.x, this.y, tailX, tailY );
	tail.addColorStop ( 0, 'rgba(170,225,255,0.75)' );
	tail.addColorStop ( 1, 'rgba(170,225,255,0)' );
	ctx.strokeStyle = tail;
	ctx.lineCap = 'round';
	ctx.lineWidth = this.radius * 1.6;
	ctx.beginPath();
	ctx.moveTo ( this.x, this.y );
	ctx.lineTo ( tailX, tailY );
	ctx.stroke();
	var glow = ctx.createRadialGradient ( this.x, this.y, 0, this.x, this.y, this.radius * 2.4 );
	glow.addColorStop ( 0, 'rgba(255,255,255,1)' );
	glow.addColorStop ( 0.35, 'rgba(190,235,255,0.9)' );
	glow.addColorStop ( 1, 'rgba(120,200,255,0)' );
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc ( this.x, this.y, this.radius * 2.4, 0, 2 * Math.PI );
	ctx.fill();
	ctx.restore();
}

// THE SPLITTING ASTEROIDS : bigger than the others (not as big as a giant), cracked, their cracks glowing red, in a red halo
// beating slowly, not to be mistaken for the ones with a metal ; destroyed, they burst into three small fast rocks
// going on toward the planet, a bit apart (they are broken far from the planet best)
var splitterSize	= 1.25;		// a splitting asteroid's size and mass, from an asteroid's (a giant's are 1.5 : parameters.js)
var splitterBeat	= 1.2;		// the seconds of a beat of its halo
var splitParts		= 3;
var splitLife		= 3;		// a part's life,
var splitSize		= 0.55;		// its size and mass, from an asteroid's,
var splitSpeed		= 1.5;		// its speed, from the asteroid burst's,
var splitSpread		= 0.35;		// and how far apart the parts go, in radians

// function to make an asteroid a splitting one : bigger, its rock cracked, drawn in its halo
function makeSplitter ( asteroid ) {
	asteroid.splitter = true;
	asteroid.radius *= splitterSize;
	asteroid.mass *= splitterSize;
	shapeRock ( asteroid );		// (its rock again, with the cracks : prototypes.js)
	asteroid.Draw = drawSplitter;
}

// function to draw a splitting asteroid : its red halo, beating softly with the clock, then its rock
function drawSplitter () {
	var ctx = this.context;
	var beat = 0.5 + 0.5 * Math.sin ( performance.now() / 1000 * 2 * Math.PI / splitterBeat );
	var halo = ctx.createRadialGradient ( this.x, this.y, this.radius * 0.8, this.x, this.y, this.radius * 2 );
	halo.addColorStop ( 0, 'rgba(255,50,40,' + ( 0.18 + 0.22 * beat ) + ')' );
	halo.addColorStop ( 1, 'rgba(255,50,40,0)' );
	ctx.fillStyle = halo;
	ctx.beginPath();
	ctx.arc ( this.x, this.y, this.radius * 2, 0, 2 * Math.PI );
	ctx.fill();
	DrawRock.call ( this );
}

// function to burst a splitting asteroid destroyed into its parts, added to the asteroids kept (engine.js)
function splitRock ( ctx, asteroid, kept ) {
	var speed = Math.sqrt ( asteroid.vx * asteroid.vx + asteroid.vy * asteroid.vy ) * splitSpeed;
	var heading = Math.atan2 ( asteroid.vy, asteroid.vx );
	for ( var p = 0; p < splitParts; p++ ) {
		var way = heading + ( p - ( splitParts - 1 ) / 2 ) * splitSpread;
		var part = new Asteroid ( ctx, splitLife, asteroidBR * splitSize, asteroidBM * splitSize,
			asteroid.x + Math.cos ( way ) * asteroid.radius, asteroid.y + Math.sin ( way ) * asteroid.radius,
			speed * Math.cos ( way ), speed * Math.sin ( way ), false, false );
		kept.push ( part );
	}
}

// function to draw the cracks of a splitting asteroid on its rock's texture (rockTexture, prototypes.js) : jagged lines glowing red,
// a color no metal has
function drawCracks ( ctx, r ) {
	ctx.save();
	ctx.strokeStyle = "#ff5040";
	ctx.shadowColor = "#ff2010";
	ctx.shadowBlur = r * 0.6;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.lineWidth = r * 0.09;
	var cracks = 3;
	var start = Math.random() * 2 * Math.PI;
	for ( var c = 0; c < cracks; c++ ) {
		var angle = start + c * 2 * Math.PI / cracks + ( Math.random() - 0.5 ) * 0.6;
		ctx.beginPath();
		ctx.moveTo ( ( Math.random() - 0.5 ) * r * 0.3, ( Math.random() - 0.5 ) * r * 0.3 );
		for ( var s = 1; s <= 3; s++ ) {
			var d = r * s / 3;
			var bend = angle + ( Math.random() - 0.5 ) * 0.8;
			ctx.lineTo ( d * Math.cos ( bend ), d * Math.sin ( bend ) );
		}
		ctx.stroke();
	}
	ctx.restore();
}

// THE SWARMS : a cloud of small pebbles coming together from one side, announced with that side and with mat given to get ready
// (a fire rate, the shield turned to them, the Spiral…) ; each pebble takes its life away when it crashes
var swarmSize		= 12;		// the pebbles of a swarm,
var swarmLife		= 2;		// their life, at most (1 or 2),
var swarmRadius		= 3.5;		// their size,
var swarmArc		= 20;		// how far from its side each one may come, in degrees on each side,
var swarmDepth		= 60;		// and how far behind the edge, for the cloud to come in a while
var swarmGift		= 60;		// the mat given with its announce
var swarmGap		= [60, 90];	// seconds between two swarms in the Arcade, at least and at most
var swarmAt			= 0;		// the turn the next swarm comes in the Arcade (0 : not planned yet)

// function to announce a swarm, coming from a side chosen now, with the mat given
function announceSwarm ( seconds ) {
	var side = Math.random() * 2 * Math.PI;
	var news = announce ( "Swarm from the " + compassSide ( side ), "An asteroid swarm is coming from the " + compassSide ( side )
		+ "! A cloud of small rocks: raise your fire rate, turn your shield to them, or use your Spiral.", seconds, swarmGift,
		function ( ctx ) { launchSwarm ( ctx, side ); } );
	news.side = side;
}

// function to launch a swarm from a side : its pebbles beyond the edge, a bit apart, all flying toward the planet
function launchSwarm ( ctx, side ) {
	for ( var p = 0; p < swarmSize; p++ ) {
		var angle = side + ( Math.random() * 2 - 1 ) * swarmArc * Math.PI / 180;
		var d = gameSize / 2 + Math.random() * swarmDepth;
		var aim = angle + ( Math.random() * 2 - 1 ) * 0.12;
		var velocity = ( Math.random() * 0.5 + 1.5 ) * asteroidSpeedFactor() * asteroidBS;
		var pebble = new Asteroid ( ctx, 1 + Math.floor ( Math.random() * swarmLife ), swarmRadius, asteroidBM * 0.3,
			MyPlanet.x + d * Math.cos ( angle ), MyPlanet.y + d * Math.sin ( angle ), - velocity * Math.cos ( aim ), - velocity * Math.sin ( aim ), false, false );
		pebble.flyBy = true;		// (a pebble missing the planet is gone for good)
		asteroidList.push ( pebble );
	}
}

// THE ARCADE'S THREATS, one more each minute : at each turn of an Arcade game (engine.js), the ones whose time has come
//	- the comets, from cometFrom, announced announceTime seconds before the first one
//	- the splitting asteroids, from splitFrom, announced too (arcadeKind makes them)
//	- the swarms, from swarmFrom, each one announced with its side and with mat given
function arcadeThreats ( ctx ) {
	if ( swarmAt == 0 ) {
		swarmAt = gameValues.swarmFrom * framesPerSecond;
	}
	if ( gameTime == swarmAt - announceTime * framesPerSecond ) {
		announceSwarm ( announceTime );
		swarmAt += Math.round ( ( swarmGap[0] + Math.random() * ( swarmGap[1] - swarmGap[0] ) ) * framesPerSecond );
	}
	if ( gameTime == ( gameValues.cometFrom - announceTime ) * framesPerSecond ) {
		announce ( "Comets", "Comets ahead! Fast and fragile, they hit lightly, and their ice is worth a lot of mat.", announceTime, 0 );
	}
	if ( gameTime == ( gameValues.splitFrom - announceTime ) * framesPerSecond ) {
		announce ( "Splitting asteroids", "Splitting asteroids ahead! Bigger, cracked and glowing red, they burst into three small fast rocks: "
			+ "break them far from your planet.", announceTime, 0 );
	}
	if ( gameTime >= gameValues.cometFrom * framesPerSecond ) {
		cometTimer--;
		if ( cometTimer <= 0 ) {
			launchComet ( ctx );
			cometTimer = Math.round ( ( cometGap[0] + Math.random() * ( cometGap[1] - cometGap[0] ) ) * framesPerSecond );
		}
	}
}

// function to make an asteroid just launched in the Arcade one of the threats whose time has come, now and then :
// a splitting one (the giants are chosen before : engine.js)
function arcadeKind ( asteroid ) {
	if ( !asteroid.giant && gameTime >= gameValues.splitFrom * framesPerSecond && Math.random() < gameValues.splitChance ) {
		makeSplitter ( asteroid );
	}
}
