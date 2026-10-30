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


// The scenes drawn behind the start menu's two pages, sliding with them (adventure.js, css/main.css) : for the Adventure,
// the Earth rising at the bottom, turning calmly ; for the Arcade, a rain of asteroids bursting before they reach the Earth.
// They show once the Adventure is ready ; until then, the start menu stays as it was.
var sceneTime		= 0;		// the clock of the last frame drawn, in milliseconds
var sceneSlide		= 0;		// how far the pages have slid, from the Adventure's (0) to the Arcade's (1)
var slideTime		= 0.45;		// the seconds of a slide, as the pages' (css/main.css)
var sceneEarth		= { radius : 380, x : 300, y : 880, skin : earthMap, spin : 0.3, globe : false };	// the Adventure's Earth, rising
var rainEarth		= { radius : 40, x : 300, y : 548, skin : earthMap, spin : 1.8, globe : false };	// the Arcade's, at the bottom
var rainRocks		= [];		// the asteroids of the rain,
var rainBits		= [];		// and the bits of the ones bursting
var rainCount		= 7;
var sceneEarthMost	= 1600;		// the widest globe of a scene, in pixels, for a very big screen

// function to draw the start menu's scenes, at each refresh of the screen in the menu (drawGame, engine.js) :
// the one of the page shown, and both while they slide
function drawMenuScenes ( ctx ) {
	if ( !adventureReady ) {
		return;
	}
	var now = performance.now();
	var seconds = Math.min ( 0.05, ( now - sceneTime ) / 1000 );	// (a frame after a long wait doesn't jump)
	sceneTime = now;
	var target = ( menuPage == "arcade" ) ? 1 : 0;
	sceneSlide += Math.max ( - seconds / slideTime, Math.min ( seconds / slideTime, target - sceneSlide ) );
	var eased = sceneSlide * sceneSlide * ( 3 - 2 * sceneSlide );
	if ( eased < 1 ) {
		ctx.save();
		ctx.translate ( - eased * gameSize, 0 );
		drawEarthScene ( ctx, seconds );
		ctx.restore();
	}
	if ( eased > 0 ) {
		ctx.save();
		ctx.translate ( ( 1 - eased ) * gameSize, 0 );
		drawRainScene ( ctx, seconds );
		ctx.restore();
	}
}

// function to draw a scene's Earth, turned a bit more, at the screen's resolution (sceneEarthMost pixels wide at most) :
// only the lines of its globe over the game area's bottom are painted, the big one rising there being mostly out of sight
function drawSceneEarth ( ctx, earth, seconds, turn ) {
	earth.spin -= seconds * 2 * Math.PI / turn;
	var size = Math.min ( sceneEarthMost, Math.ceil ( earth.radius * 2 * ctx.canvas.width / gameSize ) );
	var seen = Math.min ( 1, ( gameSize - ( earth.y - earth.radius ) ) / ( earth.radius * 2 ) );
	var globe = paintGlobe ( earth, planetGlobe ( earth, size, Math.ceil ( size * seen ) + 1 ) );
	if ( globe ) {
		ctx.drawImage ( globe.canvas, 0, 0, size, globe.lines,
			earth.x - earth.radius, earth.y - earth.radius, earth.radius * 2, earth.radius * 2 * globe.lines / size );
	}
}

// function to draw the Adventure's scene : the Earth rising at the bottom, a turn in four minutes
function drawEarthScene ( ctx, seconds ) {
	drawSceneEarth ( ctx, sceneEarth, seconds, 240 );
}

// function to draw the Arcade's scene : the asteroids coming from the top toward the Earth, and bursting into bits on their way,
// a new one coming after each one gone
function drawRainScene ( ctx, seconds ) {
	drawSceneEarth ( ctx, rainEarth, seconds, 60 );
	while ( rainRocks.length < rainCount ) {
		rainRocks.push ( newRainRock ( ctx, rainRocks.length == 0 && rainBits.length == 0 ) );
	}
	var kept = [];
	for ( var r in rainRocks ) {
		var rock = rainRocks[r];
		if ( rock.wait > 0 ) {
			rock.wait -= seconds;		// (not come yet : the rain comes one asteroid at a time)
			kept.push ( rock );
			continue;
		}
		rock.x += rock.vx * seconds;
		rock.y += rock.vy * seconds;
		rock.spin += rock.spinSpeed * seconds * framesPerSecond;
		var distance = Math.sqrt ( Math.pow ( rock.x - rainEarth.x, 2 ) + Math.pow ( rock.y - rainEarth.y, 2 ) );
		if ( distance < rock.burst ) {
			burstRainRock ( rock );
		} else if ( distance < 600 ) {		// (one gone by, far away, is replaced)
			rock.Draw();
			kept.push ( rock );
		}
	}
	rainRocks = kept;
	drawRainBits ( ctx, seconds );
}

// function to make a new asteroid of the rain : from above, beyond the edges, flying toward the Earth (a bit aside), to burst on its way
function newRainRock ( ctx, first ) {
	var angle = - Math.PI * ( 0.15 + Math.random() * 0.7 );
	var x = rainEarth.x + 520 * Math.cos ( angle );
	var y = rainEarth.y + 520 * Math.sin ( angle );
	var aim = angle + Math.PI + ( Math.random() - 0.5 ) * 0.4;
	var speed = 40 + Math.random() * 50;
	var rock = new Asteroid ( ctx, 10, 7 + Math.random() * 7, 1, x, y, speed * Math.cos ( aim ), speed * Math.sin ( aim ), Math.random() < 0.08, asteroidMetal() );
	rock.burst = 80 + Math.random() * 160;					// where it bursts, from the Earth
	rock.wait = first ? 0 : Math.random() * 6;				// and when it starts its way
	return rock;
}

// function to make an asteroid of the rain burst into bits, flying apart and fading
function burstRainRock ( rock ) {
	for ( var b = 0; b < 10; b++ ) {
		var angle = Math.random() * 2 * Math.PI;
		var speed = 20 + Math.random() * 50;
		rainBits.push ( { x : rock.x, y : rock.y, vx : rock.vx * 0.3 + speed * Math.cos ( angle ), vy : rock.vy * 0.3 + speed * Math.sin ( angle ),
			life : 0.6 + Math.random() * 0.6, color : rock.metal ? metals[rock.metal].color : "#aab0b8" } );
	}
}

// function to draw the bits of the asteroids burst, fading as they fly
function drawRainBits ( ctx, seconds ) {
	var kept = [];
	for ( var b in rainBits ) {
		var bit = rainBits[b];
		bit.life -= seconds;
		if ( bit.life <= 0 ) {
			continue;
		}
		bit.x += bit.vx * seconds;
		bit.y += bit.vy * seconds;
		ctx.globalAlpha = Math.min ( 1, bit.life * 2 );
		ctx.fillStyle = bit.color;
		ctx.fillRect ( bit.x - 1, bit.y - 1, 2, 2 );
		kept.push ( bit );
	}
	ctx.globalAlpha = 1;
	rainBits = kept;
}
