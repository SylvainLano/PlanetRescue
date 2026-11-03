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


// The Cryo cannon : a weapon of the pause menu, bought once the Harvester is (shop.js), whose ice shards fly to the asteroid
// nearest to the planet not frozen yet, and freeze it : stopped at once, out of the Gravitron's pull, a shock only making it slide
// a little, as on brakes ; once thawed, it stays where it is, without any speed, and without brakes any more. Destroyed while
// frozen, its debris are frost, worth no more than rock (metals, parameters.js : worth 2, it made the Cryo far too strong)
var shardList		= [];		// the ice shards flying,
var shardSpeed		= 4;		// their speed, in game units per turn,
var shardTurn		= 0.12;		// how much they turn toward their asteroid at each turn at most, in radians,
var frozenBrake		= 0.85;		// and the part of its speed a frozen asteroid keeps at each turn, once a shock has moved it

// function to know the asteroids the shards fly to : not frozen, nor chased by a shard already, the nearest to the planet first
// (never the Colossus : boss.js)
function cryoTargets () {
	return asteroidList.filter ( function ( a ) {
		return a.life > 0 && !a.frozen && !a.colossus && !shardList.some ( function ( s ) { return s.target == a; } );
	} ).sort ( function ( a, b ) { return distanceToPlanet ( a.x, a.y ) - distanceToPlanet ( b.x, b.y ); } );
}

// function to fire the Cryo's shards, one by cannon, each one to its own asteroid (shoot, functions.js) : how many were fired
function fireShards ( weapon ) {
	var targets = cryoTargets();
	var fired = Math.min ( weapon.cannonNbr, targets.length );
	for ( var s = 0; s < fired; s++ ) {
		var heading = Math.atan2 ( targets[s].y - MyPlanet.y, targets[s].x - MyPlanet.x );
		shardList.push ( { x : MyPlanet.x + ( MyPlanet.radius + 5 ) * Math.cos ( heading ), y : MyPlanet.y + ( MyPlanet.radius + 5 ) * Math.sin ( heading ),
			heading : heading, target : targets[s], power : weapon.power, freeze : weapon.freeze } );
	}
	return fired;
}

// function to move the shards, at each turn of the game : toward their asteroid (another one once theirs is gone or frozen),
// freezing it when they touch it
function resolveShards ( ctx ) {
	var kept = [];
	for ( var s = 0; s < shardList.length; s++ ) {
		var shard = shardList[s];
		if ( shard.target && ( shard.target.life <= 0 || shard.target.frozen || asteroidList.indexOf ( shard.target ) < 0 ) ) {
			shard.target = cryoTargets()[0] || false;
		}
		if ( shard.target ) {
			var wanted = Math.atan2 ( shard.target.y - shard.y, shard.target.x - shard.x );
			var turn = ( ( wanted - shard.heading + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI;
			shard.heading += Math.max ( - shardTurn, Math.min ( shardTurn, turn ) );
		}
		shard.x += shardSpeed * Math.cos ( shard.heading );
		shard.y += shardSpeed * Math.sin ( shard.heading );
		if ( shard.target && Math.sqrt ( Math.pow ( shard.target.x - shard.x, 2 ) + Math.pow ( shard.target.y - shard.y, 2 ) ) < shard.target.radius + 2 ) {
			freezeRock ( ctx, shard.target, shard );
		} else if ( distanceToPlanet ( shard.x, shard.y ) < fieldReach ) {
			kept.push ( shard );
		}
	}
	shardList = kept;
}

// function to freeze the asteroid a shard touches : its damage (none on an armored one too strong for it : threats.js), and the
// asteroid stopped for its time of freezing, its debris made of frost until it thaws
function freezeRock ( ctx, rock, shard ) {
	if ( !rock.frozen ) {
		rock.thawMetal = rock.metal;
	}
	rock.metal = "frost";
	var damage = armorDamage ( rock, shard.power, shard.x, shard.y );
	addDebris ( ctx, damage, rock.x, rock.y, rock.vx, rock.vy, debrisList, rock.metal );
	rock.life -= damage;
	if ( rock.life <= 0 ) {
		allPassed = 1;
	}
	rock.frozen = rock.frozenFor = shard.freeze * framesPerSecond;
	rock.vx = 0;
	rock.vy = 0;
	playSound ( "shield" );
}

// function to hold a frozen asteroid, at each turn of the game (engine.js, which keeps the GRAVITRON's pull off it) : braked after
// a shock, then thawed, left where it is without any speed, and with its rock again
function holdFrozen ( rock ) {
	rock.frozen--;
	rock.vx *= frozenBrake;
	rock.vy *= frozenBrake;
	if ( rock.frozen <= 0 ) {
		rock.frozen = 0;
		rock.vx = 0;
		rock.vy = 0;
		rock.metal = rock.thawMetal;
	}
}

// function to draw a frozen asteroid's ice over its rock : a pale blue frost, and a ring around it telling the time it stays frozen
function drawFrozen ( ctx, rock ) {
	ctx.save();
	ctx.translate ( rock.x, rock.y );
	ctx.save();
	ctx.rotate ( rock.spin );
	ctx.fillStyle = "rgba(190,235,255,0.55)";
	ctx.fill ( rock.outline );
	ctx.restore();
	ctx.strokeStyle = "rgba(160,220,255,0.8)";
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.arc ( 0, 0, rock.radius + 4, - Math.PI / 2, - Math.PI / 2 + 2 * Math.PI * rock.frozen / rock.frozenFor );
	ctx.stroke();
	ctx.restore();
}

// function to draw the shards : small slivers of ice, pale blue, with a white tip
function drawShards ( ctx ) {
	ctx.save();
	ctx.lineCap = "round";
	for ( var s = 0; s < shardList.length; s++ ) {
		var shard = shardList[s];
		var tailX = shard.x - 7 * Math.cos ( shard.heading ), tailY = shard.y - 7 * Math.sin ( shard.heading );
		ctx.strokeStyle = "rgba(160,220,255,0.9)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo ( tailX, tailY );
		ctx.lineTo ( shard.x, shard.y );
		ctx.stroke();
		ctx.fillStyle = "#ffffff";
		ctx.beginPath();
		ctx.arc ( shard.x, shard.y, 1.2, 0, 2 * Math.PI );
		ctx.fill();
	}
	ctx.restore();
}
