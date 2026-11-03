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


// The Hammer & Broom : a weapon of the pause menu, bought once the Cryo is (shop.js), sending waves : arcs of a ring growing from
// the planet up to their reach, fading as they go, which damage a little each asteroid they cross, once, and slow down the ones
// coming closer, keeping their way aside ; the debris go through. By default they leave through the GRAVITRON's opening, to slow
// down the asteroids it pulls in while the debris come (its other modes : following the main cannon, or turning on itself :
// engine.js). A wave is translucent : the sky behind it ripples, under a white, diaphanous crest. (Sent all around with their
// power growing and no end, the waves let nothing through : 6 million inhabitants lost in ten minutes, with a bot)
var waveList		= [];		// the waves going,
var waveSpeed		= 3;		// how fast they grow, in game units per turn,
var waveDepth		= 7;		// half their thickness, in game units,
var waveBrake		= 0.5;		// the part of its speed toward the planet an asteroid keeps when one hits it,
var waveShift		= 8;		// and how far the sky seems moved under them, in game units
var skyPicture		= new Image();		// the game area's sky (css/main.css), drawn again under the waves
skyPicture.src		= "img/background1.jpg";

// function to know the width of the Hammer's waves, in radians : 30° at first, 10° more with each level of its Fire Spread
function waveWidth ( weapon ) {
	return ( 20 + 10 * weapon.speed ) * Math.PI / 180;
}

// function to send the Hammer's waves, one by cannon, all around from where it points (shoot, functions.js)
function sendWaves ( weapon ) {
	for ( var w = 0; w < weapon.cannonNbr; w++ ) {
		waveList.push ( { angle : weapon.angle + 2 * Math.PI / weapon.cannonNbr * w, width : waveWidth ( weapon ), radius : MyPlanet.radius + 6,
			start : MyPlanet.radius + 6, reach : weapon.reach, power : weapon.power, hit : [] } );
	}
}

// function to make the waves grow up to their reach, at each turn of the game : each one damages the asteroids it crosses, once,
// and slows down the ones coming closer to the planet (not the Colossus : boss.js)
function resolveWaves ( ctx ) {
	var kept = [];
	for ( var w = 0; w < waveList.length; w++ ) {
		var wave = waveList[w];
		wave.radius += waveSpeed;
		for ( var a = 0; a < asteroidList.length; a++ ) {
			var rock = asteroidList[a];
			if ( rock.life <= 0 || wave.hit.indexOf ( rock ) >= 0 ) {
				continue;
			}
			var d = distanceToPlanet ( rock.x, rock.y );
			var aside = ( ( angleAroundPlanet ( rock.x, rock.y ) - wave.angle + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI;
			if ( Math.abs ( d - wave.radius ) > waveDepth + rock.radius || Math.abs ( aside ) > wave.width / 2 + rock.radius / d ) {
				continue;
			}
			wave.hit.push ( rock );
			var damage = armorDamage ( rock, wave.power, rock.x, rock.y );
			addDebris ( ctx, damage, rock.x, rock.y, rock.vx, rock.vy, debrisList, rock.metal );
			rock.life -= damage;
			if ( rock.life <= 0 ) {
				allPassed = 1;
			}
			if ( !rock.colossus ) {
				slowDown ( rock, d );
			}
		}
		if ( wave.radius < wave.reach ) {
			kept.push ( wave );
		}
	}
	waveList = kept;
}

// function to slow down an asteroid hit by a wave, if it comes closer to the planet : it keeps a part of its speed toward it
// (waveBrake), and its way aside
function slowDown ( rock, d ) {
	var ux = ( rock.x - MyPlanet.x ) / d;
	var uy = ( rock.y - MyPlanet.y ) / d;
	var away = rock.vx * ux + rock.vy * uy;
	if ( away < 0 ) {
		rock.vx -= ( 1 - waveBrake ) * away * ux;
		rock.vy -= ( 1 - waveBrake ) * away * uy;
	}
}

// function to draw the waves, under the asteroids and the debris (engine.js) : in each one, the sky again, moved a little outward
// as if seen through moving water, a soft white glow, and a crest along its front, fading at its ends and as it nears its reach
function drawWaves ( ctx ) {
	if ( waveList.length == 0 ) {
		return;
	}
	var scale = ctx.canvas.width / gameSize;		// (the device's pixels in a game unit, the camera's transform aside : boss.js)
	for ( var w = 0; w < waveList.length; w++ ) {
		var wave = waveList[w];
		var fade = Math.max ( 0, 1 - ( wave.radius - wave.start ) / ( wave.reach - wave.start ) );
		var from = wave.angle - wave.width / 2, to = wave.angle + wave.width / 2;
		ctx.save();
		ctx.beginPath();
		ctx.arc ( MyPlanet.x, MyPlanet.y, wave.radius + waveDepth, from, to );
		ctx.arc ( MyPlanet.x, MyPlanet.y, Math.max ( 1, wave.radius - waveDepth ), to, from, true );
		ctx.closePath();
		ctx.clip();
		if ( skyPicture.complete && skyPicture.naturalWidth > 0 ) {
			// the band's box on the screen, in game units : where the sky is drawn again, moved outward
			var camera = ctx.getTransform();
			var box = { x0 : Infinity, y0 : Infinity, x1 : - Infinity, y1 : - Infinity };
			for ( var s = 0; s <= 8; s++ ) {
				var t = from + ( to - from ) * s / 8;
				for ( var r = -1; r <= 1; r += 2 ) {
					var p = camera.transformPoint ( { x : MyPlanet.x + ( wave.radius + r * waveDepth ) * Math.cos ( t ), y : MyPlanet.y + ( wave.radius + r * waveDepth ) * Math.sin ( t ) } );
					box.x0 = Math.min ( box.x0, p.x / scale );
					box.y0 = Math.min ( box.y0, p.y / scale );
					box.x1 = Math.max ( box.x1, p.x / scale );
					box.y1 = Math.max ( box.y1, p.y / scale );
				}
			}
			var shiftX = waveShift * fade * Math.cos ( wave.angle ), shiftY = waveShift * fade * Math.sin ( wave.angle );
			ctx.setTransform ( scale, 0, 0, scale, 0, 0 );
			ctx.drawImage ( skyPicture, ( box.x0 - shiftX - sky.x ) / sky.scale, ( box.y0 - shiftY - sky.y ) / sky.scale,
				( box.x1 - box.x0 ) / sky.scale, ( box.y1 - box.y0 ) / sky.scale, box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0 );
			ctx.setTransform ( camera );
		}
		ctx.fillStyle = "rgba(220,235,255," + ( 0.07 * fade ) + ")";
		ctx.fill();
		ctx.restore();
		// the crest, in a few pieces, brighter in its middle
		ctx.save();
		ctx.lineCap = "round";
		for ( var c = 0; c < 6; c++ ) {
			var a1 = from + ( to - from ) * c / 6, a2 = from + ( to - from ) * ( c + 1 ) / 6;
			var shine = Math.sin ( Math.PI * ( c + 0.5 ) / 6 );
			ctx.strokeStyle = "rgba(255,255,255," + ( 0.45 * shine * fade ) + ")";
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.arc ( MyPlanet.x, MyPlanet.y, wave.radius + waveDepth - 1, a1, a2 );
			ctx.stroke();
			ctx.strokeStyle = "rgba(255,255,255," + ( 0.12 * shine * fade ) + ")";
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.arc ( MyPlanet.x, MyPlanet.y, wave.radius + waveDepth - 3, a1, a2 );
			ctx.stroke();
		}
		ctx.restore();
	}
}
