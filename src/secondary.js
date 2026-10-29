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


// The secondary weapons, planned in 2010 : they take no place among the active weapons, and come from the research tree (researches.js)
// The first one is the missile launcher : its missiles fly to the main cannon's target, and explode on the first asteroid they touch

// function to make the missile launcher fire at the main cannon's target, once researched
function fireMissiles ( ctx, target ) {
	if ( missileLauncher.cannonNbr < 1 ) {
		return;
	}
	missileLauncher.currentDelay++;
	if ( missileLauncher.currentDelay >= missileLauncher.fireRate && target != false ) {
		missileLauncher.currentDelay = 0;
		launchMissile ( target );
	}
}

// function to launch a missile, aiming where its target will be (as the main cannon does)
function launchMissile ( target ) {
	var speed = missileLauncher.speed;
	var angle = interception ( target, speed, MyPlanet.radius + 5 + speed );
	missileList.push ( {
		x : MyPlanet.x + ( MyPlanet.radius + 5 ) * Math.cos ( angle ),
		y : MyPlanet.y + ( MyPlanet.radius + 5 ) * Math.sin ( angle ),
		vx : speed * Math.cos ( angle ),
		vy : speed * Math.sin ( angle ),
		power : missileLauncher.power,
		blast : missileLauncher.blast
	} );
}

// function to move the missiles : each one explodes on the first asteroid it touches, or gets lost in space
function resolveMissiles ( ctx ) {
	var kept = [];
	for ( var m in missileList ) {
		var missile = missileList[m];
		missile.x += missile.vx;
		missile.y += missile.vy;
		if ( distanceToPlanet ( missile.x, missile.y ) > gameSize ) {
			continue;
		}
		var hit = false;
		for ( var a in asteroidList ) {
			var asteroid = asteroidList[a];
			if ( asteroid.life > 0 && Math.sqrt ( Math.pow ( asteroid.x - missile.x, 2 ) + Math.pow ( asteroid.y - missile.y, 2 ) ) < asteroid.radius + 2 ) {
				hit = true;
			}
		}
		if ( hit ) {
			explodeMissile ( ctx, missile );
		} else {
			kept.push ( missile );
		}
	}
	missileList = kept;
}

// function to make a missile explode : every asteroid in its blast is damaged, and leaves debris
function explodeMissile ( ctx, missile ) {
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		var distance = Math.sqrt ( Math.pow ( asteroid.x - missile.x, 2 ) + Math.pow ( asteroid.y - missile.y, 2 ) );
		if ( asteroid.life > 0 && distance < missile.blast + asteroid.radius ) {
			addDebris ( ctx, missile.power, asteroid.x, asteroid.y, asteroid.vx, asteroid.vy, debrisList );
			asteroid.life -= missile.power;
			if ( asteroid.life <= 0 ) {
				allPassed = 1;
			}
		}
	}
	blastList.push ( { x : missile.x, y : missile.y, size : 0, age : 0, blast : missile.blast } );
}

// function to make the blasts spread, then fade
function resolveBlasts () {
	var kept = [];
	for ( var b in blastList ) {
		var blast = blastList[b];
		blast.age++;
		blast.size = blast.blast * Math.min ( 1, blast.age / 5 );
		if ( blast.age < 14 ) {
			kept.push ( blast );
		}
	}
	blastList = kept;
}

// function to draw the missiles with their trail, and the blasts
function drawMissiles ( ctx ) {
	ctx.save();
	ctx.lineCap = 'round';
	for ( var m in missileList ) {
		var missile = missileList[m];
		var speed = Math.sqrt ( missile.vx * missile.vx + missile.vy * missile.vy ) || 1;
		var dx = missile.vx / speed, dy = missile.vy / speed;
		// its trail of fire
		var trail = ctx.createLinearGradient ( missile.x - dx * 16, missile.y - dy * 16, missile.x, missile.y );
		trail.addColorStop ( 0, 'rgba(255,140,40,0)' );
		trail.addColorStop ( 1, 'rgba(255,170,60,0.9)' );
		ctx.strokeStyle = trail;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo ( missile.x - dx * 16, missile.y - dy * 16 );
		ctx.lineTo ( missile.x, missile.y );
		ctx.stroke();
		// its body
		ctx.strokeStyle = '#eee';
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo ( missile.x - dx * 3, missile.y - dy * 3 );
		ctx.lineTo ( missile.x + dx * 3, missile.y + dy * 3 );
		ctx.stroke();
	}
	for ( var b in blastList ) {
		var blast = blastList[b];
		var fade = Math.max ( 0, 1 - blast.age / 14 );
		var glow = ctx.createRadialGradient ( blast.x, blast.y, 0, blast.x, blast.y, Math.max ( 1, blast.size ) );
		glow.addColorStop ( 0, 'rgba(255,220,150,' + ( 0.7 * fade ) + ')' );
		glow.addColorStop ( 0.6, 'rgba(255,120,40,' + ( 0.35 * fade ) + ')' );
		glow.addColorStop ( 1, 'rgba(255,80,20,0)' );
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc ( blast.x, blast.y, Math.max ( 1, blast.size ), 0, 2 * Math.PI );
		ctx.fill();
		ctx.strokeStyle = 'rgba(255,200,120,' + fade + ')';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc ( blast.x, blast.y, Math.max ( 1, blast.size ), 0, 2 * Math.PI );
		ctx.stroke();
	}
	ctx.restore();
}
