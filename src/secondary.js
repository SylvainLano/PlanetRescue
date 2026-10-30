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
// The fourth one is the rebound cannon : its shots ricochet on the asteroids, the edges of space and the planet's atmosphere

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
	playSound ( "missile" );
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
		if ( distanceToPlanet ( missile.x, missile.y ) > fieldReach ) {
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
			var damage = armorDamage ( asteroid, ( asteroid == touched ) ? missile.power : Math.ceil ( missile.power / 2 ), asteroid.x, asteroid.y );	// (threats.js)
			addDebris ( ctx, damage, asteroid.x, asteroid.y, asteroid.vx, asteroid.vy, debrisList, asteroid.metal );
			asteroid.life -= damage;
			if ( asteroid.life <= 0 ) {
				allPassed = 1;
			}
		}
	}
	blastList.push ( { x : missile.x, y : missile.y, size : 0, age : 0, blast : missile.blast } );
	playSound ( "blast" );
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
			playSound ( "capsule" );
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
// for the player to have time to steer it (never the Colossus, much too big : boss.js)
function bombTarget () {
	var target = false, best = 0;
	for ( var a in asteroidList ) {
		var distance = distanceToPlanet ( asteroidList[a].x, asteroidList[a].y );
		if ( asteroidList[a].life > 0 && !asteroidList[a].colossus && distance < gameSize / 2 - 20 && distance > best ) {
			target = asteroidList[a];
			best = distance;
		}
	}
	return target;
}

// function to move the capsules : each one turns the first asteroid it touches into a bomb, or gets lost in space
function resolveCapsules ( ctx ) {
	var kept = [];
	for ( var c in capsuleList ) {
		var capsule = capsuleList[c];
		capsule.x += capsule.vx;
		capsule.y += capsule.vy;
		if ( distanceToPlanet ( capsule.x, capsule.y ) > fieldReach ) {
			continue;
		}
		var hit = false;
		for ( var a in asteroidList ) {
			var asteroid = asteroidList[a];
			if ( asteroid.life > 0 && Math.sqrt ( Math.pow ( asteroid.x - capsule.x, 2 ) + Math.pow ( asteroid.y - capsule.y, 2 ) ) < asteroid.radius + 2 ) {
				hit = asteroid;
			}
		}
		if ( hit && hit.colossus ) {
			// (the Colossus is too big to be a bomb : the capsule explodes against it at once, as a bomb would : boss.js)
			explodeBomb ( ctx, { x : capsule.x, y : capsule.y, bomb : { power : capsule.power, blast : capsule.blast, family : { destroyed : 0 } } } );
		} else if ( hit ) {
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
	addDebris ( ctx, bomb.life, bomb.x, bomb.y, bomb.vx, bomb.vy, debrisList, bomb.metal );
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
			addDebris ( ctx, power, asteroid.x, asteroid.y, asteroid.vx, asteroid.vy, debrisList, asteroid.metal );
			asteroid.life -= power;
			if ( asteroid.life <= 0 ) {
				allPassed = 1;
				family.destroyed++;
			} else if ( chained > 0 && !asteroid.bomb && !asteroid.colossus ) {
				asteroid.bomb = { power : chained, blast : blast, family : family };
			}
		}
	}
	bestBomb = Math.max ( bestBomb, family.destroyed );
	blastList.push ( { x : bomb.x, y : bomb.y, size : 0, age : 0, blast : blast } );
	playSound ( "bomb" );
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
		addDebris ( ctx, 1, target.x, target.y, target.vx, target.vy, debrisList, target.metal );
		target.life--;
		if ( target.life <= 0 ) {
			allPassed = 1;
			giantSlain = giantSlain || target.giant;
		}
	}
	// once the Piercing Beam is researched, every other asteroid on its way burns at half power, before and behind its target
	if ( laserCannon.smart >= 1 ) {
		laserCannon.pierceHeat += laserCannon.power / 2 / framesPerSecond;
		while ( laserCannon.pierceHeat >= 1 ) {
			laserCannon.pierceHeat--;
			for ( var a in asteroidList ) {
				var asteroid = asteroidList[a];
				if ( asteroid.life > 0 && beamCrosses ( asteroid ) ) {
					addDebris ( ctx, 1, asteroid.x, asteroid.y, asteroid.vx, asteroid.vy, debrisList, asteroid.metal );
					asteroid.life--;
					if ( asteroid.life <= 0 ) {
						allPassed = 1;
						giantSlain = giantSlain || asteroid.giant;
					}
				}
			}
		}
	}
}

// function to know if the Piercing Beam reaches an asteroid other than the laser's target :
// the beam goes from the planet to its target, then spreads behind it in a cone, to the edge of space
function beamCrosses ( asteroid ) {
	var target = laserCannon.target;
	var dx = target.x - MyPlanet.x, dy = target.y - MyPlanet.y;
	var length = Math.sqrt ( dx * dx + dy * dy ) || 1;
	var ax = asteroid.x - MyPlanet.x, ay = asteroid.y - MyPlanet.y;
	var along = ( ax * dx + ay * dy ) / length;
	var across = Math.abs ( ax * dy - ay * dx ) / length;
	var reach = asteroid.radius + ( along > length ? ( along - length ) * Math.tan ( pierceCone ) : 0 );
	return asteroid != target && along > MyPlanet.radius && across < reach;
}

// function to choose the laser's target among the asteroids in view : the giants first, the closest one, then the asteroids
// going to crash on the planet, the soonest crash first, or else the closest asteroid
// (the Colossus as a giant, once its rock is in reach : boss.js)
function laserTarget () {
	var best = false, bestRank = 0, bestScore = 0;
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		var distance = distanceToPlanet ( asteroid.x, asteroid.y );
		if ( asteroid.life <= 0 || distance - ( asteroid.colossus ? asteroid.radius : 0 ) > gameSize / 2 - 20 ) {
			continue;
		}
		var rank = 0, score = distance;
		if ( asteroid.giant || asteroid.colossus ) {
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

// function to draw the laser's beam, flickering, from the planet to the asteroid it burns,
// and on to the edge of space, fainter and spreading in a cone, once the Piercing Beam is researched
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
	drawBeam ( ctx, x0, y0, target.x, target.y, flicker );
	burnMark ( ctx, target, flicker );
	if ( laserCannon.smart >= 1 ) {
		// the cone of light, fading away from its target
		var cone = ctx.createRadialGradient ( target.x, target.y, 0, target.x, target.y, gameSize / 2 );
		cone.addColorStop ( 0, 'rgba(255,51,85,' + ( 0.3 * flicker ) + ')' );
		cone.addColorStop ( 1, 'rgba(255,51,85,0)' );
		ctx.fillStyle = cone;
		ctx.beginPath();
		ctx.moveTo ( target.x, target.y );
		ctx.lineTo ( target.x + fieldReach * Math.cos ( angle + pierceCone ), target.y + fieldReach * Math.sin ( angle + pierceCone ) );
		ctx.lineTo ( target.x + fieldReach * Math.cos ( angle - pierceCone ), target.y + fieldReach * Math.sin ( angle - pierceCone ) );
		ctx.closePath();
		ctx.fill();
		drawBeam ( ctx, target.x, target.y, MyPlanet.x + fieldReach * Math.cos ( angle ), MyPlanet.y + fieldReach * Math.sin ( angle ), flicker / 2 );
		for ( var a in asteroidList ) {
			if ( asteroidList[a].life > 0 && beamCrosses ( asteroidList[a] ) ) {
				burnMark ( ctx, asteroidList[a], flicker / 2 );
			}
		}
	}
	ctx.restore();
}

// function to draw a part of the laser's beam : its glow, then its core
function drawBeam ( ctx, x0, y0, x1, y1, strength ) {
	ctx.strokeStyle = 'rgba(255,51,85,' + ( 0.3 * strength ) + ')';
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.moveTo ( x0, y0 );
	ctx.lineTo ( x1, y1 );
	ctx.stroke();
	ctx.strokeStyle = 'rgba(255,190,200,' + strength + ')';
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo ( x0, y0 );
	ctx.lineTo ( x1, y1 );
	ctx.stroke();
}

// function to draw the burn of the laser on an asteroid
function burnMark ( ctx, asteroid, strength ) {
	var burn = ctx.createRadialGradient ( asteroid.x, asteroid.y, 0, asteroid.x, asteroid.y, asteroid.radius + 5 );
	burn.addColorStop ( 0, 'rgba(255,230,230,' + ( 0.9 * strength ) + ')' );
	burn.addColorStop ( 1, 'rgba(255,51,85,0)' );
	ctx.fillStyle = burn;
	ctx.beginPath();
	ctx.arc ( asteroid.x, asteroid.y, asteroid.radius + 5, 0, 2 * Math.PI );
	ctx.fill();
}

// function to make the rebound cannon fire at the main cannon's target, once researched
// (once the Trick Shot is researched, it fires where its ricochets will hit the most asteroids)
function fireRebounds ( target ) {
	if ( reboundCannon.cannonNbr < 1 ) {
		return;
	}
	reboundCannon.currentDelay++;
	if ( reboundCannon.currentDelay >= reboundCannon.fireRate && target != false ) {
		reboundCannon.currentDelay = 0;
		var speed = reboundCannon.speed;
		var angle = interception ( target, speed, MyPlanet.radius + 5 + speed );
		if ( reboundCannon.smart >= 1 ) {
			angle = trickAngle ( angle );
		}
		reboundList.push ( {
			x : MyPlanet.x + ( MyPlanet.radius + 5 ) * Math.cos ( angle ),
			y : MyPlanet.y + ( MyPlanet.radius + 5 ) * Math.sin ( angle ),
			vx : speed * Math.cos ( angle ),
			vy : speed * Math.sin ( angle ),
			power : reboundCannon.power,
			rebounds : reboundCannon.rebounds,		// the rebounds it can still make
			trail : [],								// its last places, and the points where it ricocheted
			hit : [],								// the asteroids it has hit (Pinball achievement)
			last : null								// what it ricocheted on last : an asteroid, the planet or an edge
		} );
		playSound ( "rebound" );
	}
}

// function to move the rebound shots, in small steps not to go through an asteroid : each one ricochets
// until it has no rebound left
function resolveRebounds ( ctx ) {
	var kept = [];
	for ( var r in reboundList ) {
		var shot = reboundList[r];
		shot.trail.push ( { x : shot.x, y : shot.y } );
		var steps = Math.ceil ( Math.sqrt ( shot.vx * shot.vx + shot.vy * shot.vy ) / 3 );
		var going = true;
		for ( var s = 0; s < steps && going; s++ ) {
			shot.x += shot.vx / steps;
			shot.y += shot.vy / steps;
			going = ricochet ( ctx, shot );
		}
		shot.trail = shot.trail.slice ( -10 );
		if ( going ) {
			kept.push ( shot );
		}
	}
	reboundList = kept;
}

// function to make a rebound shot ricochet on what it meets : an asteroid, which takes its power, the planet's atmosphere,
// which it spares, or an edge of space ; returns false once it has no rebound left
function ricochet ( ctx, shot ) {
	var contact = contactOf ( shot, asteroidList );
	if ( !contact ) {
		return true;
	}
	var touched = contact.rock;
	var rock = touched && touched != MyPlanet;
	if ( rock ) {
		var damage = armorDamage ( touched, shot.power, shot.x, shot.y );		// (threats.js)
		addDebris ( ctx, damage, touched.x, touched.y, touched.vx, touched.vy, debrisList, touched.metal );
		touched.life -= damage;
		if ( shot.hit.indexOf ( touched ) < 0 ) {
			shot.hit.push ( touched );
			bestPinball = Math.max ( bestPinball, shot.hit.length );
		}
		if ( touched.life <= 0 ) {
			allPassed = 1;
			// (once the shot has ricocheted : sent back by the planet for Boomerang, on a giant for David and Goliath)
			boomerang = boomerang || shot.last == MyPlanet;
			goliath = goliath || ( touched.giant && shot.last !== null );
		}
	}
	shot.last = touched || "edge";
	shot.trail.push ( { x : shot.x, y : shot.y } );
	sparkList.push ( { x : shot.x, y : shot.y, age : 0 } );
	playSound ( "ricochet" );
	if ( shot.rebounds <= 0 ) {
		return false;
	}
	shot.rebounds--;
	turnAway ( shot, contact, rock && reboundCannon.smart < 1 );
	return true;
}

// function to find what a rebound shot meets : the first of the rocks it goes into (the asteroids, or none when the Trick Shot
// looks for the others itself), the planet's atmosphere, or an edge of space ; returns what it touched (false for an edge)
// and the way out of it, or false when it meets nothing (the edges of space being the ones the camera shows : boss.js)
function contactOf ( shot, rocks ) {
	var touched = false;
	var edges = viewEdges();
	for ( var r = 0; r < rocks.length; r++ ) {
		if ( rocks[r].life > 0 && bounceOn ( shot, rocks[r].x, rocks[r].y, rocks[r].radius + 2 ) ) {
			touched = rocks[r];
			break;
		}
	}
	if ( !touched && bounceOn ( shot, MyPlanet.x, MyPlanet.y, MyPlanet.radius + 2 ) ) {
		touched = MyPlanet;
	}
	if ( touched ) {
		// (bounceOn has put the shot on its surface, the way out)
		return { rock : touched, nx : ( shot.x - touched.x ) / ( touched.radius + 2 ), ny : ( shot.y - touched.y ) / ( touched.radius + 2 ) };
	} else if ( shot.x < edges.left && shot.vx < 0 ) {
		return { rock : false, nx : 1, ny : 0 };
	} else if ( shot.x > edges.right && shot.vx > 0 ) {
		return { rock : false, nx : -1, ny : 0 };
	} else if ( shot.y < edges.top && shot.vy < 0 ) {
		return { rock : false, nx : 0, ny : 1 };
	} else if ( shot.y > edges.bottom && shot.vy > 0 ) {
		return { rock : false, nx : 0, ny : -1 };
	}
	return false;
}

// function to turn a rebound shot's way over, as a light on a mirror ; on the rough rock of an asteroid, it can go astray
// (else a shot fired straight at it would go to and fro between it and the planet)
function turnAway ( shot, contact, astray ) {
	var along = shot.vx * contact.nx + shot.vy * contact.ny;
	shot.vx -= 2 * along * contact.nx;
	shot.vy -= 2 * along * contact.ny;
	if ( astray ) {
		var turn = ( Math.random() * 2 - 1 ) * ricochetScatter;
		var vx = shot.vx * Math.cos ( turn ) - shot.vy * Math.sin ( turn );
		var vy = shot.vx * Math.sin ( turn ) + shot.vy * Math.cos ( turn );
		if ( vx * contact.nx + vy * contact.ny > 0 ) {
			shot.vx = vx;
			shot.vy = vy;
		}
	}
}

// function to choose the Trick Shot's angle : the rebound cannon follows its shot's way for many angles around the planet,
// starting from the one aimed at its target, and takes the one hitting the most asteroids (the first one found on a tie)
function trickAngle ( aimed ) {
	var ways = futureWays();
	var best = aimed, bestHits = -1;
	for ( var n = 0; n < trickAngles; n++ ) {
		var angle = aimed + 2 * Math.PI * n / trickAngles;
		var hits = trickHits ( angle, ways );
		if ( hits > bestHits ) {
			best = angle;
			bestHits = hits;
		}
	}
	return best;
}

// function to foresee the places of the asteroids, turn by turn, moved as crashTime() moves them (functions.js)
function futureWays () {
	var ways = [];
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		if ( asteroid.life <= 0 ) {
			continue;
		}
		var x = asteroid.x - MyPlanet.x, y = asteroid.y - MyPlanet.y, vx = asteroid.vx, vy = asteroid.vy;
		var way = { asteroid : asteroid, radius : asteroid.radius, xs : [], ys : [] };
		for ( var n = 0; n < trickHorizon; n++ ) {
			way.xs.push ( MyPlanet.x + x );
			way.ys.push ( MyPlanet.y + y );
			var angle = Math.atan2 ( y, x );
			var pull = gravitronAcceleration ( angle, asteroid.mass );
			vx += pull * Math.cos ( angle );
			vy += pull * Math.sin ( angle );
			x += vx;
			y += vy;
		}
		ways.push ( way );
	}
	return ways;
}

// function to count the asteroids a rebound shot fired at an angle would hit before its rebounds are made,
// with the rules of ricochet() on the foreseen ways of the asteroids ; one it would destroy is no longer in its way
function trickHits ( angle, ways ) {
	var speed = reboundCannon.speed;
	var shot = {
		x : MyPlanet.x + ( MyPlanet.radius + 5 ) * Math.cos ( angle ),
		y : MyPlanet.y + ( MyPlanet.radius + 5 ) * Math.sin ( angle ),
		vx : speed * Math.cos ( angle ),
		vy : speed * Math.sin ( angle )
	};
	var rebounds = reboundCannon.rebounds, hits = 0;
	var steps = Math.ceil ( speed / 3 );
	for ( var w = 0; w < ways.length; w++ ) {
		ways[w].life = ways[w].asteroid.life;
	}
	for ( var turn = 0; turn < trickHorizon; turn++ ) {
		for ( var s = 0; s < steps; s++ ) {
			shot.x += shot.vx / steps;
			shot.y += shot.vy / steps;
			// the asteroids first, as contactOf() does, in a loop of their own : this one runs many times
			var contact = false;
			for ( w = 0; w < ways.length && !contact; w++ ) {
				var way = ways[w], x = way.xs[turn], y = way.ys[turn], reach = way.radius + 2;
				var dx = shot.x - x, dy = shot.y - y;
				if ( way.life > 0 && dx * dx + dy * dy < reach * reach && bounceOn ( shot, x, y, reach ) ) {
					contact = { rock : way, nx : ( shot.x - x ) / reach, ny : ( shot.y - y ) / reach };
				}
			}
			contact = contact || contactOf ( shot, [] );
			if ( contact ) {
				if ( contact.rock && contact.rock != MyPlanet ) {
					hits++;
					contact.rock.life -= reboundCannon.power;
				}
				if ( rebounds <= 0 ) {
					return hits;
				}
				rebounds--;
				turnAway ( shot, contact, false );
			}
		}
	}
	return hits;
}

// function to know if a rebound shot hits a round thing, going into it ; if so, it is put back on its surface
function bounceOn ( shot, x, y, radius ) {
	var dx = shot.x - x, dy = shot.y - y;
	var distance = Math.sqrt ( dx * dx + dy * dy );
	if ( distance >= radius || distance == 0 || dx * shot.vx + dy * shot.vy >= 0 ) {
		return false;
	}
	shot.x = x + dx / distance * radius;
	shot.y = y + dy / distance * radius;
	return true;
}

// function to make the sparks of the ricochets fade
function resolveSparks () {
	var kept = [];
	for ( var s in sparkList ) {
		sparkList[s].age++;
		if ( sparkList[s].age < 8 ) {
			kept.push ( sparkList[s] );
		}
	}
	sparkList = kept;
}

// function to draw the rebound shots with their trail, bent where they ricocheted, and the sparks of their ricochets
function drawRebounds ( ctx ) {
	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for ( var r in reboundList ) {
		var shot = reboundList[r];
		var trail = shot.trail.concat ( [ { x : shot.x, y : shot.y } ] );
		for ( var t = 1; t < trail.length; t++ ) {
			ctx.strokeStyle = 'rgba(199,125,255,' + ( 0.7 * t / trail.length ) + ')';
			ctx.lineWidth = 1 + t / trail.length;
			ctx.beginPath();
			ctx.moveTo ( trail[t-1].x, trail[t-1].y );
			ctx.lineTo ( trail[t].x, trail[t].y );
			ctx.stroke();
		}
		var glow = ctx.createRadialGradient ( shot.x, shot.y, 0, shot.x, shot.y, 7 );
		glow.addColorStop ( 0, 'rgba(230,200,255,0.9)' );
		glow.addColorStop ( 1, 'rgba(199,125,255,0)' );
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc ( shot.x, shot.y, 7, 0, 2 * Math.PI );
		ctx.fill();
		ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.arc ( shot.x, shot.y, 2, 0, 2 * Math.PI );
		ctx.fill();
	}
	for ( var s in sparkList ) {
		var spark = sparkList[s];
		ctx.strokeStyle = 'rgba(230,200,255,' + ( 1 - spark.age / 8 ) + ')';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc ( spark.x, spark.y, 2 + spark.age, 0, 2 * Math.PI );
		ctx.stroke();
	}
	ctx.restore();
}
