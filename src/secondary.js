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
// The second one is the nitroglycerine launcher : its capsule turns an asteroid into a bomb, for the player to steer into the others
// The third one is the laser : its beam burns the most dangerous asteroid for a while, then cools down

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
		blast : missileLauncher.blast,
		target : target
	} );
}

// function to get the asteroid nearest to a point, still in game
function nearestAsteroid ( x, y ) {
	var nearest = false, best = gameSize * 2;
	for ( var a in asteroidList ) {
		var distance = Math.sqrt ( Math.pow ( asteroidList[a].x - x, 2 ) + Math.pow ( asteroidList[a].y - y, 2 ) );
		if ( asteroidList[a].life > 0 && distance < best ) {
			nearest = asteroidList[a];
			best = distance;
		}
	}
	return nearest;
}

// function to make a homing missile turn toward its target, a little at each turn ; if its target is gone, it takes the nearest asteroid
function steerMissile ( missile ) {
	if ( !missile.target || missile.target.life <= 0 || asteroidList.indexOf ( missile.target ) < 0 ) {
		missile.target = nearestAsteroid ( missile.x, missile.y );
		if ( !missile.target ) {
			return;
		}
	}
	var speed = Math.sqrt ( missile.vx * missile.vx + missile.vy * missile.vy );
	var heading = Math.atan2 ( missile.vy, missile.vx );
	var wanted = Math.atan2 ( missile.target.y - missile.y, missile.target.x - missile.x );
	var turn = ( ( wanted - heading + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI;
	heading += Math.max ( - homingTurn, Math.min ( homingTurn, turn ) );
	missile.vx = speed * Math.cos ( heading );
	missile.vy = speed * Math.sin ( heading );
}

// function to move the missiles : each one explodes on the first asteroid it touches, or gets lost in space
// (once the Homing Missiles are researched, they steer toward their target)
function resolveMissiles ( ctx ) {
	var kept = [];
	for ( var m in missileList ) {
		var missile = missileList[m];
		if ( missileLauncher.smart >= 1 ) {
			steerMissile ( missile );
		}
		missile.x += missile.vx;
		missile.y += missile.vy;
		if ( distanceToPlanet ( missile.x, missile.y ) > gameSize ) {
			continue;
		}
		var hit = false;
		for ( var a in asteroidList ) {
			var asteroid = asteroidList[a];
			if ( asteroid.life > 0 && Math.sqrt ( Math.pow ( asteroid.x - missile.x, 2 ) + Math.pow ( asteroid.y - missile.y, 2 ) ) < asteroid.radius + 2 ) {
				hit = asteroid;
			}
		}
		if ( hit ) {
			explodeMissile ( ctx, missile, hit );
		} else {
			kept.push ( missile );
		}
	}
	missileList = kept;
}

// function to make a missile explode : the asteroid it touched takes its whole power, the others in its blast half of it,
// and every one of them leaves debris
function explodeMissile ( ctx, missile, touched ) {
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		var distance = Math.sqrt ( Math.pow ( asteroid.x - missile.x, 2 ) + Math.pow ( asteroid.y - missile.y, 2 ) );
		if ( asteroid.life > 0 && distance < missile.blast + asteroid.radius ) {
			var damage = ( asteroid == touched ) ? missile.power : Math.ceil ( missile.power / 2 );
			addDebris ( ctx, damage, asteroid.x, asteroid.y, asteroid.vx, asteroid.vy, debrisList );
			asteroid.life -= damage;
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

// function to make the nitroglycerine launcher fire, once researched : one bomb at a time, its delay counted once the bomb before is gone
// (and the ones its Chain Reaction made)
function fireCapsules () {
	if ( nitroLauncher.cannonNbr < 1 || capsuleList.length > 0 || bombInPlay() ) {
		return;
	}
	nitroLauncher.currentDelay++;
	if ( nitroLauncher.currentDelay >= nitroLauncher.fireRate ) {
		var target = bombTarget();
		if ( target ) {
			nitroLauncher.currentDelay = 0;
			var speed = nitroLauncher.speed;
			var angle = interception ( target, speed, MyPlanet.radius + 5 + speed );
			capsuleList.push ( {
				x : MyPlanet.x + ( MyPlanet.radius + 5 ) * Math.cos ( angle ),
				y : MyPlanet.y + ( MyPlanet.radius + 5 ) * Math.sin ( angle ),
				vx : speed * Math.cos ( angle ),
				vy : speed * Math.sin ( angle ),
				power : nitroLauncher.power,
				blast : nitroLauncher.blast
			} );
		}
	}
}

// function to know if a bomb is in game
function bombInPlay () {
	for ( var a in asteroidList ) {
		if ( asteroidList[a].bomb ) {
			return true;
		}
	}
	return false;
}

// function to choose the asteroid to turn into a bomb : the one farthest from the planet, still in view,
// for the player to have time to steer it
function bombTarget () {
	var target = false, best = 0;
	for ( var a in asteroidList ) {
		var distance = distanceToPlanet ( asteroidList[a].x, asteroidList[a].y );
		if ( asteroidList[a].life > 0 && distance < gameSize / 2 - 20 && distance > best ) {
			target = asteroidList[a];
			best = distance;
		}
	}
	return target;
}

// function to move the capsules : each one turns the first asteroid it touches into a bomb, or gets lost in space
function resolveCapsules () {
	var kept = [];
	for ( var c in capsuleList ) {
		var capsule = capsuleList[c];
		capsule.x += capsule.vx;
		capsule.y += capsule.vy;
		if ( distanceToPlanet ( capsule.x, capsule.y ) > gameSize ) {
			continue;
		}
		var hit = false;
		for ( var a in asteroidList ) {
			var asteroid = asteroidList[a];
			if ( asteroid.life > 0 && Math.sqrt ( Math.pow ( asteroid.x - capsule.x, 2 ) + Math.pow ( asteroid.y - capsule.y, 2 ) ) < asteroid.radius + 2 ) {
				hit = asteroid;
			}
		}
		if ( hit ) {
			// (its family, shared with the bombs of its Chain Reaction, counts the asteroids they destroy)
			hit.bomb = { power : capsule.power, blast : capsule.blast, family : { destroyed : 0 } };
		} else {
			kept.push ( capsule );
		}
	}
	capsuleList = kept;
}

// function to make a bomb explode against the asteroid it touched
// (an asteroid destroyed by a bomb the GRAVITRON sent its way makes a Bank Shot)
function touchBomb ( ctx, bomb, touched ) {
	var before = touched.life;
	detonateBomb ( ctx, bomb );
	if ( before > 0 && touched.life <= 0 && bomb.turned >= bankShotTurn ) {
		bankShot = true;
	}
}

// function to make a bomb explode by itself, against an asteroid or once the planet is in its blast, which spares the planet :
// the bomb is spent, its life left turned into debris
function detonateBomb ( ctx, bomb ) {
	addDebris ( ctx, bomb.life, bomb.x, bomb.y, bomb.vx, bomb.vy, debrisList );
	bomb.life = 0;
	explodeBomb ( ctx, bomb );
}

// function to make a bomb explode, by itself or destroyed :
// every other asteroid in its blast takes its whole power, and leaves debris ; once the Chain Reaction is researched,
// the ones it doesn't destroy become bombs with half its power, until it is too weak to go on
function explodeBomb ( ctx, bomb ) {
	var power = bomb.bomb.power, blast = bomb.bomb.blast, family = bomb.bomb.family;
	var chained = ( nitroLauncher.smart >= 1 ) ? Math.floor ( power / 2 ) : 0;
	bomb.bomb = false;
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		var distance = Math.sqrt ( Math.pow ( asteroid.x - bomb.x, 2 ) + Math.pow ( asteroid.y - bomb.y, 2 ) );
		if ( asteroid != bomb && asteroid.life > 0 && distance < blast + asteroid.radius ) {
			addDebris ( ctx, power, asteroid.x, asteroid.y, asteroid.vx, asteroid.vy, debrisList );
			asteroid.life -= power;
			if ( asteroid.life <= 0 ) {
				allPassed = 1;
				family.destroyed++;
			} else if ( chained > 0 && !asteroid.bomb ) {
				asteroid.bomb = { power : chained, blast : blast, family : family };
			}
		}
	}
	bestBomb = Math.max ( bestBomb, family.destroyed );
	blastList.push ( { x : bomb.x, y : bomb.y, size : 0, age : 0, blast : blast } );
}

// function to draw the bombs' glow under their rock, with the reach of their blast
// (the ones of a Chain Reaction, weaker, glow less)
function drawBombs ( ctx ) {
	var beat = 0.5 + 0.5 * Math.sin ( performance.now() / 120 );
	ctx.save();
	for ( var a in asteroidList ) {
		var bomb = asteroidList[a];
		if ( !bomb.bomb ) {
			continue;
		}
		var strength = Math.min ( 1, 0.4 + 0.6 * bomb.bomb.power / nitroLauncher.power );
		var reach = bomb.radius * ( 2 + 0.5 * beat );
		var glow = ctx.createRadialGradient ( bomb.x, bomb.y, bomb.radius * 0.5, bomb.x, bomb.y, reach );
		glow.addColorStop ( 0, 'rgba(255,240,120,' + ( ( 0.6 + 0.3 * beat ) * strength ) + ')' );
		glow.addColorStop ( 1, 'rgba(255,200,40,0)' );
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc ( bomb.x, bomb.y, reach, 0, 2 * Math.PI );
		ctx.fill();
		ctx.strokeStyle = 'rgba(255,224,102,0.35)';
		ctx.lineWidth = 1;
		ctx.setLineDash ( [4, 4] );
		ctx.beginPath();
		ctx.arc ( bomb.x, bomb.y, bomb.bomb.blast, 0, 2 * Math.PI );
		ctx.stroke();
		ctx.setLineDash ( [] );
	}
	ctx.restore();
}

// function to draw the capsules, blinking
function drawCapsules ( ctx ) {
	var beat = 0.5 + 0.5 * Math.sin ( performance.now() / 80 );
	ctx.save();
	for ( var c in capsuleList ) {
		var capsule = capsuleList[c];
		var glow = ctx.createRadialGradient ( capsule.x, capsule.y, 0, capsule.x, capsule.y, 7 );
		glow.addColorStop ( 0, 'rgba(255,240,120,' + ( 0.5 + 0.4 * beat ) + ')' );
		glow.addColorStop ( 1, 'rgba(255,200,40,0)' );
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc ( capsule.x, capsule.y, 7, 0, 2 * Math.PI );
		ctx.fill();
		ctx.fillStyle = nitroLauncher.color;
		ctx.beginPath();
		ctx.arc ( capsule.x, capsule.y, 2.5, 0, 2 * Math.PI );
		ctx.fill();
	}
	ctx.restore();
}

// function to make the laser burn its target, once researched : once cooled down, it fires for a while,
// and takes a new target if the one it burns is destroyed
function fireLaser ( ctx ) {
	if ( laserCannon.cannonNbr < 1 ) {
		return;
	}
	if ( laserCannon.firing == 0 ) {
		laserCannon.currentDelay++;
		if ( laserCannon.currentDelay < laserCannon.fireRate ) {
			return;
		}
		laserCannon.target = laserTarget();
		if ( !laserCannon.target ) {
			return;
		}
		laserCannon.firing = laserCannon.duration;
		laserCannon.currentDelay = 0;
	}
	laserCannon.firing--;
	if ( laserCannon.target.life <= 0 || asteroidList.indexOf ( laserCannon.target ) < 0 ) {
		laserCannon.target = laserTarget();
		if ( !laserCannon.target ) {
			laserCannon.firing = 0;
			return;
		}
	}
	// its power is per second, done a point of damage at a time
	var target = laserCannon.target;
	laserCannon.heat += laserCannon.power / framesPerSecond;
	while ( laserCannon.heat >= 1 && target.life > 0 ) {
		laserCannon.heat--;
		addDebris ( ctx, 1, target.x, target.y, target.vx, target.vy, debrisList );
		target.life--;
		if ( target.life <= 0 ) {
			allPassed = 1;
			giantSlain = giantSlain || target.giant;
		}
	}
}

// function to choose the laser's target among the asteroids in view : the giants first, the closest one, then the asteroids
// going to crash on the planet, the soonest crash first, or else the closest asteroid
function laserTarget () {
	var best = false, bestRank = 0, bestScore = 0;
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		var distance = distanceToPlanet ( asteroid.x, asteroid.y );
		if ( asteroid.life <= 0 || distance > gameSize / 2 - 20 ) {
			continue;
		}
		var rank = 0, score = distance;
		if ( asteroid.giant ) {
			rank = 2;
		} else {
			var crash = crashTime ( asteroid );
			if ( crash !== false ) {
				rank = 1;
				score = crash;
			}
		}
		if ( best === false || rank > bestRank || ( rank == bestRank && score < bestScore ) ) {
			best = asteroid;
			bestRank = rank;
			bestScore = score;
		}
	}
	return best;
}

// function to draw the laser's beam, flickering, from the planet to the asteroid it burns
function drawLaser ( ctx ) {
	var target = laserCannon.target;
	if ( laserCannon.firing <= 0 || !target || target.life <= 0 ) {
		return;
	}
	var angle = Math.atan2 ( target.y - MyPlanet.y, target.x - MyPlanet.x );
	var x0 = MyPlanet.x + MyPlanet.radius * Math.cos ( angle );
	var y0 = MyPlanet.y + MyPlanet.radius * Math.sin ( angle );
	var flicker = 0.75 + 0.25 * Math.sin ( performance.now() / 25 );
	ctx.save();
	ctx.lineCap = 'round';
	// its glow, then its core
	ctx.strokeStyle = 'rgba(255,51,85,' + ( 0.3 * flicker ) + ')';
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.moveTo ( x0, y0 );
	ctx.lineTo ( target.x, target.y );
	ctx.stroke();
	ctx.strokeStyle = 'rgba(255,190,200,' + flicker + ')';
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo ( x0, y0 );
	ctx.lineTo ( target.x, target.y );
	ctx.stroke();
	// the burn on the asteroid
	var burn = ctx.createRadialGradient ( target.x, target.y, 0, target.x, target.y, target.radius + 5 );
	burn.addColorStop ( 0, 'rgba(255,230,230,' + ( 0.9 * flicker ) + ')' );
	burn.addColorStop ( 1, 'rgba(255,51,85,0)' );
	ctx.fillStyle = burn;
	ctx.beginPath();
	ctx.arc ( target.x, target.y, target.radius + 5, 0, 2 * Math.PI );
	ctx.fill();
	ctx.restore();
}
