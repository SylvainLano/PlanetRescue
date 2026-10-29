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


// Function to create a pulse
function emitPulse(ctx,pulseList) {
	var item = new Pulse(ctx,MyGravitron.angle,MyGravitron.wideness,MyGravitron.charge,MyGravitron.radius);
	MyGravitron.charge = 0;
	pulseList.push(item);
	return pulseList;
}

// Function to create the debris
function addDebris(ctx,nb,x,y,vx,vy,debrisList) {
	
	var velocity = Math.sqrt(Math.pow(vx,2)+Math.pow(vy,2));
	
	// Calculating angle
	if ( vy != 0 || vx > 0) {
		var angle = 2 * Math.atan(vy/(vx+velocity));
	} else {
		var angle = Math.PI;
	}
	
	for(d=1;d<=nb;d++){
		var tempAngle = angle - Math.PI / 4 + Math.random() * Math.PI / 2;
		var tempVelocity = Math.random() * velocity / 2;
		var vx = velocity * Math.cos(tempAngle);
		var vy = velocity * Math.sin(tempAngle);
		var item = new Debris(ctx,x,y,vx,vy);
		debrisList.push(item);
	}
	return debrisList;
}

// Function to resolve the pulses : they spread until their charge is spent
function resolvePulses (pulseList,ctx) {
	var tempList = new Array();
	for (p in pulseList) {
		if ( pulseList[p].charge > 0 ) {
			// Keeping pulse
			tempList.push(pulseList[p]);
			pulseList[p].radius++;
		}
	}
	return tempList;
}

// Function to draw the pulses, colored by their charge
function drawPulses (ctx) {
	for (var p in pulseList) {
		var oneStep = 10;
		var red = 66;
		var green = 66;
		var blue = 66;
		if ( pulseList[p].charge <= oneStep ) {
			var colorStep = Math.floor( pulseList[p].charge * 190 / oneStep ) + 66;
			red=green=blue=colorStep;
		} else if ( pulseList[p].charge <= (2*oneStep) ) {
			var colorStep = Math.floor( (pulseList[p].charge-oneStep) * 255 / oneStep );
			red=255;
			green=blue=255-colorStep;
		} else if ( pulseList[p].charge <= (3*oneStep) ) {
			var colorStep = Math.floor( (pulseList[p].charge-(2*oneStep)) * 255 / oneStep );
			red=255;
			blue=0;
			green=colorStep;
		} else if ( pulseList[p].charge <= (4*oneStep) ) {
			var colorStep = Math.floor( (pulseList[p].charge-(3*oneStep)) * 255 / oneStep );
			red=255-colorStep;
			blue=0;
			green=255;
		} else if ( pulseList[p].charge <= (5*oneStep) ) {
			var colorStep = Math.floor( (pulseList[p].charge-(4*oneStep)) * 255 / oneStep );
			red=0;
			blue=colorStep;
			green=255-colorStep;
		}
		ctx.strokeStyle = 'rgba('+red+','+green+','+blue+',0.5)';
		ctx.lineWidth = Math.floor ( ( pulseList[p].radius - MyGravitron.radius ) / 20 ) ;
		ctx.lineCap = 'square';
		ctx.beginPath();
		ctx.arc(MyPlanet.x,MyPlanet.y,pulseList[p].radius,(pulseList[p].angle + pulseList[p].wideness),pulseList[p].angle,false);
		ctx.arc(MyPlanet.x,MyPlanet.y,pulseList[p].radius,pulseList[p].angle,(pulseList[p].angle + pulseList[p].wideness),true);
		ctx.closePath();
		ctx.stroke();
	}
}

// Function to resolve the debris
function resolveDebris (debrisList,ctx,MyPlanet,pause,gravSuction,gravPower,gravSort,debrisColor) {
	var tempList = new Array();
	for (i in debrisList) {
		// a var to know if we're gonna keep this debris into the array
		var keepit = 1;
		
		if ( pause == 0 || pause == 2) {
			// distance to the player's planet
			var distance = distanceToPlanet(debrisList[i].x,debrisList[i].y);
			
			// resolving gravitron's gravity !
				// Calculating angle around the planet to the debris
				var angle = angleAroundPlanet(debrisList[i].x,debrisList[i].y);
				
				// Testing if debris is into the gravitron's field
				if ( pause == 0 ) {
					if ( intoArcField(angle,MyGravitron) == true ) {
						// Yes it is !
						debrisList[i].vx -= gravSuction * gravPower * Math.cos(angle);
						debrisList[i].vy -= gravSuction * gravPower * Math.sin(angle);
						
					} else if ( MyGravitron.repulsion > 0 ) {
							debrisList[i].vx += gravSuction / Math.pow(gravSort, gravPower) * Math.cos(angle);
							debrisList[i].vy += gravSuction / Math.pow(gravSort, gravPower) * Math.sin(angle);
					}
				}
			
			
			// Calculating positions
			debrisList[i].x += debrisList[i].vx;
			debrisList[i].y += debrisList[i].vy;
			
			// Testing if debris still in game 
			if ( distance > gameSize ){
				
				// Debris outta game, destroying it
				keepit = 0;
				
			// Testing if debris still in game 		
			} else if ( distance < MyPlanet.radius ) {
				
				// Debris collected, adding material and destroying it
				if ( pause == 0 ) {
					if ( MyPlanet.maxMat > MyPlanet.mat ){
						MyPlanet.mat++;
						MyPlanet.totalMat++;
					}
				}
				keepit = 0;
				
			}
		}
		
		if( keepit == 1){
			// Keeping debris
			tempList.push(debrisList[i]);
		}
	}
	return tempList;
}

// Function to draw the debris, all at once
function drawDebris (ctx) {
	ctx.fillStyle = debrisColor;
	ctx.beginPath();
	for (var i in debrisList) {
		ctx.moveTo(debrisList[i].x + 1,debrisList[i].y);
		ctx.arc(debrisList[i].x,debrisList[i].y,1,0,2*Math.PI,false);
	}
	ctx.fill();
}

// Function to resolve the GRAVITRON
function resolveGravitron (ctx,pause,MyGravitron,gravFriction,key,gravMinSize,gravMaxSize,gravColor,gravWidth,MyPlanet,gravRadius) {
	if(pause==0) {
		// Resizing GRAVITRON
		MyGravitron.vg *= (100 - gravFriction) / 100;
		if( key[2] && !key[3]) {
			MyGravitron.vg -= Math.PI / 128;
		} else if ( key[3] && !key[2] ) {
			MyGravitron.vg += Math.PI / 128;
		}
		if( Math.abs(MyGravitron.vg) < Math.PI / 256 ){
			MyGravitron.vg = 0;
		}
		MyGravitron.wideness += MyGravitron.vg;
		
		if ( MyGravitron.wideness < gravMinSize ) {
			MyGravitron.wideness = gravMinSize;
			MyGravitron.vg = 0;
		} else if ( MyGravitron.wideness > gravMaxSize ) {
			MyGravitron.wideness = gravMaxSize;
			MyGravitron.vg = 0;
		}
		
		// Moving GRAVITRON
		MyGravitron.va *= (100 - gravFriction) / 100;
		if( key[0] && !key[1]) {
			MyGravitron.va -= Math.PI / 128;
		} else if ( key[1] && !key[0] ) {
			MyGravitron.va += Math.PI / 128;
		}
		if( Math.abs(MyGravitron.va) < Math.PI / 256 ){
			MyGravitron.va = 0;
		}
		MyGravitron.angle += MyGravitron.va - MyGravitron.vg / 2;
		if( MyGravitron.angle < (0 - Math.PI) ) {
			MyGravitron.angle += 3*Math.PI;
		}else{
			MyGravitron.angle += Math.PI;
		}
		MyGravitron.angle = MyGravitron.angle % ( 2 * Math.PI );
		MyGravitron.angle -= Math.PI;
	}
}

// Function to draw the GRAVITRON : an arc around the planet, in the color of its shield's charge
function drawGravitron (ctx,width) {
	ctx.strokeStyle = gravColor;
	ctx.lineWidth = width;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.arc(MyPlanet.x,MyPlanet.y,MyGravitron.radius,(MyGravitron.angle + MyGravitron.wideness),MyGravitron.angle,false);
	ctx.arc(MyPlanet.x,MyPlanet.y,MyGravitron.radius,MyGravitron.angle,(MyGravitron.angle + MyGravitron.wideness),true);
	ctx.closePath();
	ctx.stroke();
}

// where the game area's sky is : the size of its picture's pixels in game units, and its corner from the game area's (placeSky)
var sky = { scale : 1, x : 0, y : 0 };

// Function to get where a point of the game area's sky is, in game units
function backgroundPlace(x,y) {
	return [ sky.x + x * sky.scale, sky.y + y * sky.scale ];
}

// the twinkles of the sky's stars, made at their first drawing, and again when the sky moves
var starTwinkles = false;

// Function to make a twinkle for each star of the game area's background (img/stars.js), with its own pace
function makeTwinkles(ctx) {
	var twinkles = [];
	for ( var i in backgroundStars ) {
		var star = backgroundStars[i];
		var place = backgroundPlace ( star[0], star[1] );
		var radius = [0, 6, 14, 24][star[2]] * sky.scale;	// its light, as wide as the star in the picture
		if ( place[0] < -radius || place[0] > gameSize + radius || place[1] < -radius || place[1] > gameSize + radius ) {
			continue;	// out of the game area
		}
		var rgb = parseInt ( star[3].slice(1), 16 );
		var color = ( rgb >> 16 ) + "," + ( ( rgb >> 8 ) & 255 ) + "," + ( rgb & 255 );
		// its light, one unit wide around its center, stretched to its size when drawn
		var glow = ctx.createRadialGradient ( 0, 0, 0, 0, 0, 1 );
		glow.addColorStop ( 0, "rgba(" + color + ",1)" );
		glow.addColorStop ( 0.3, "rgba(" + color + ",0.35)" );
		glow.addColorStop ( 1, "rgba(" + color + ",0)" );
		twinkles.push ( {
			x : place[0],
			y : place[1],
			cross : star[2] > 1,					// the big ones shine with a cross, like in the picture
			radius : radius,
			strength : [0, 0.7, 0.8, 0.6][star[2]],
			glow : glow,
			// two waves at their own paces, in radians a second
			pace1 : 2 * Math.PI / ( 1.5 + Math.random() * 2.5 ),
			pace2 : 2 * Math.PI / ( 2.3 + Math.random() * 3.8 ),
			phase1 : Math.random() * 2 * Math.PI,
			phase2 : Math.random() * 2 * Math.PI
		} );
	}
	return twinkles;
}

// Function to make the stars of the game area's background twinkle : each one stays as the picture shows it most of the time,
// and shines now and then, when its two waves meet (it goes on in the menus and the pause, with the time of the clock)
function drawStars(ctx) {
	if ( starTwinkles == false ) {
		starTwinkles = makeTwinkles ( ctx );
	}
	var time = performance.now() / 1000;
	for ( var i in starTwinkles ) {
		var star = starTwinkles[i];
		var wave = 0.5 + 0.3 * Math.sin ( time * star.pace1 + star.phase1 ) + 0.2 * Math.sin ( time * star.pace2 + star.phase2 );
		var shine = wave * wave * wave;
		if ( shine < 0.02 ) {
			continue;
		}
		ctx.save();
		ctx.translate ( star.x, star.y );
		ctx.globalAlpha = shine * star.strength;
		ctx.fillStyle = star.glow;
		ctx.save();
		ctx.scale ( star.radius, star.radius );
		ctx.fillRect ( -1, -1, 2, 2 );
		ctx.restore();
		if ( star.cross ) {
			// its cross grows as it shines
			var length = star.radius * ( 1.5 + 1.5 * shine );
			ctx.save();
			ctx.scale ( length, star.radius * 0.12 );
			ctx.fillRect ( -1, -1, 2, 2 );
			ctx.restore();
			ctx.scale ( star.radius * 0.12, length );
			ctx.fillRect ( -1, -1, 2, 2 );
		}
		ctx.restore();
	}
}

// The moving parts of the objects : what changes from one turn of the engine to the next
// (the objects are drawn in between, so that they move at each refresh of the screen)
function movingParts() {
	return [
		{ objects : [MyPlanet], parts : ["spin"] },
		{ objects : [MyGravitron], parts : ["angle", "wideness"] },
		{ objects : asteroidList, parts : ["x", "y", "spin"] },
		{ objects : debrisList, parts : ["x", "y"] },
		{ objects : shotList, parts : ["x", "y"] },
		{ objects : missileList, parts : ["x", "y"] },
		{ objects : blastList, parts : ["size", "age"] },
		{ objects : pulseList, parts : ["radius"] },
		{ objects : weaponList, parts : ["angle"] },	// the Spiral & Orbital weapon's "angle" is a number of cannon, but it is not drawn
		{ objects : [banner], parts : ["y"] }
	];
}

// Function to remember where the moving objects are, before the engine moves them
function rememberPlaces() {
	var moving = movingParts();
	for ( var m in moving ) {
		for ( var i in moving[m].objects ) {
			var object = moving[m].objects[i];
			if ( typeof object != "object" ) {
				continue;	// the tutorial empties the places of its asteroid and its shot
			}
			object.before = object.before || {};
			for ( var p in moving[m].parts ) {
				object.before[moving[m].parts[p]] = object[moving[m].parts[p]];
			}
		}
	}
}

// Function to put the moving objects between their places at the engine's last two turns, "blend" going from 0 to 1 until the next turn
// (where they really are is kept aside, and put back by unblendPlaces once the game is drawn)
function blendPlaces ( blend ) {
	var moving = movingParts();
	for ( var m in moving ) {
		for ( var i in moving[m].objects ) {
			var object = moving[m].objects[i];
			if ( typeof object != "object" || !object.before ) {
				continue;	// just born : it is drawn where it is
			}
			object.after = object.after || {};
			for ( var p in moving[m].parts ) {
				var part = moving[m].parts[p];
				var change = object[part] - object.before[part];
				object.after[part] = object[part];
				if ( part == "angle" ) {
					// the angles go round from -PI to PI : taking the short way, and staying in that range
					change = ( ( change + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI;
					object[part] = ( ( object.before[part] + change * blend + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI;
				} else {
					object[part] = object.before[part] + change * blend;
				}
			}
			object.blended = true;
		}
	}
}

// Function to put the moving objects back where they really are
function unblendPlaces() {
	var moving = movingParts();
	for ( var m in moving ) {
		for ( var i in moving[m].objects ) {
			var object = moving[m].objects[i];
			if ( typeof object == "object" && object.blended ) {
				for ( var p in moving[m].parts ) {
					object[moving[m].parts[p]] = object.after[moving[m].parts[p]];
				}
				object.blended = false;
			}
		}
	}
}

// Function to take care of the keyboard events : the keys with a name are read by it (the numeric keypad's ones too),
// the letters by their place on the keyboard, so that W A S D on a QWERTY keyboard are Z Q S D on an AZERTY one
// (until 2026, the letters were read as letters)
function changeKey(e, to){
	var name = e.key;
	var place = e.code;
	if ( name == "ArrowLeft" || place == "KeyA" ) {
		key[0]=to;		// left
	} else if ( name == "ArrowRight" || place == "KeyD" ) {
		key[1]=to;		// right
	} else if ( name == "ArrowUp" || place == "KeyW" ) {
		key[2]=to;		// up
	} else if ( name == "ArrowDown" || place == "KeyS" ) {
		key[3]=to;		// down
	} else if ( name == " " || place == "Space" ) {
		key[4]=to;		// space bar
	} else if ( name == "Delete" || place == "KeyT" ) {
		key[5]=to;		// delete, or T (Target), for the keyboards without these keys
	} else if ( name == "End" || place == "KeyR" ) {
		key[6]=to;		// end, or R (Reset)
	}
}

// function to write on the Infos page the letters as the player's keyboard has them (Z Q S D on an AZERTY one),
// when the browser can tell them : a note tells it otherwise
function showKeyLabels() {
	if ( !navigator.keyboard || !navigator.keyboard.getLayoutMap ) {
		return;
	}
	navigator.keyboard.getLayoutMap().then( function ( layout ) {
		var keys = document.querySelectorAll("#infoText kbd[data-code]");
		for ( var k = 0; k < keys.length; k++ ) {
			var letter = layout.get(keys[k].getAttribute("data-code"));
			if ( letter ) {
				keys[k].textContent = letter.toUpperCase();
			}
		}
		document.getElementById("keysNote").style.display = "none";
	} ).catch( function () {} );
}

// Function to test if an object is into the GRAVITRON field from is angle
function intoArcField(angle,arc) {
	var gravAngle2 = ((arc.angle + arc.wideness + Math.PI) % (2 * Math.PI)) - Math.PI;
	if (( arc.angle <= angle && angle <= gravAngle2 && arc.angle < gravAngle2) || (arc.angle > gravAngle2 && (arc.angle <= angle || angle <= gravAngle2))) {
		return true;
	} else {
		return false;
	}
}

// Function to get the GRAVITRON's acceleration on an asteroid, along the line from the planet's center to the asteroid
// (negative when the asteroid is pulled toward the planet, positive when the repulsion pushes it away)
function gravitronAcceleration(angle,mass) {
	if (intoArcField(angle,MyGravitron) == true) {
		return - gravSuction * MyGravitron.power / Math.pow(MyGravitron.sort, MyGravitron.power) / mass;
	} else if ( MyGravitron.repulsion > 0 ) {
		return gravSuction * Math.pow(MyGravitron.sort, MyGravitron.power) / mass;
	}
	return 0;
}

// Function to show the limits of the GRAVITRON's field (Field Scanner level 1) : the field has no end, so they go to the edge of the game area
function drawFieldLimits(ctx) {
	var limits = [MyGravitron.angle, MyGravitron.angle + MyGravitron.wideness];
	ctx.strokeStyle = 'rgba(255,255,255,0.3)';
	ctx.lineWidth = 1;
	ctx.setLineDash([4,6]);
	ctx.beginPath();
	for ( var l in limits ) {
		ctx.moveTo(MyPlanet.x + (MyGravitron.radius + 6) * Math.cos(limits[l]), MyPlanet.y + (MyGravitron.radius + 6) * Math.sin(limits[l]));
		ctx.lineTo(MyPlanet.x + gameSize * Math.cos(limits[l]), MyPlanet.y + gameSize * Math.sin(limits[l]));
	}
	ctx.stroke();
	ctx.setLineDash([]);
}

// Function to tint an asteroid with the GRAVITRON's effect on it (Field Scanner level 2) : red when pulled in, green when pushed away
function drawFieldTint(ctx,asteroid) {
	var pull = gravitronAcceleration(angleAroundPlanet(asteroid.x,asteroid.y), asteroid.mass);
	if ( pull == 0 ) {
		return;
	}
	ctx.fillStyle = ( pull < 0 ) ? 'rgba(255,40,40,0.3)' : 'rgba(60,255,60,0.3)';
	// following the rock's outline
	ctx.save();
	ctx.translate(asteroid.x,asteroid.y);
	ctx.rotate(asteroid.spin);
	ctx.fill(asteroid.outline);
	ctx.restore();
}

// Function to get the number of turns to wait before the next asteroid : the interval shrinks as time passes
function spawnInterval() {
	var seconds = gameTime / framesPerSecond;
	var interval = gameValues.spawnMin + ( gameValues.spawnStart - gameValues.spawnMin ) * Math.exp( - seconds / gameValues.spawnSlowness );
	return Math.round( interval * framesPerSecond );
}

// Function to get the asteroids' speed factor, which grows as time passes
function asteroidSpeedFactor() {
	return 1 + gameTime / framesPerSecond / gameValues.speedGrowth;
}

// Function to get the life the asteroids get as time passes, over their base life
function asteroidExtraLife() {
	return Math.floor( gameTime / framesPerSecond / gameValues.lifeGrowth );
}

// Calculating angle around the player's planet
function angleAroundPlanet(x,y) {
	if ( MyPlanet.y != y || x > MyPlanet.x) {
		return (2 * Math.atan((y-MyPlanet.y)/((x-MyPlanet.x)+distanceToPlanet(x,y))));
	} else {
		return Math.PI;
	}
}

// Calculating distance to the player's planet
function distanceToPlanet(x,y) {
	return Math.sqrt( Math.pow((x - MyPlanet.x),2) + Math.pow((y - MyPlanet.y),2) );
}

// function to create shoots depending on the weapon type and number of cannons
function shoot(ctx,weapon){
	// counting the shots really fired, for the accuracy statistic
	var shotsBefore = shotList.length;
	switch ( weapon.type ) {
		case "basicW" :
			if ( weapon.cannonNbr % 2 == 1 ) {
				// lauching shot right through
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle);
				var vx = weapon.speed * Math.cos(weapon.angle);
				var vy = weapon.speed * Math.sin(weapon.angle);
				
				// let's create a shot
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
			} else {
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle - 0.04);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle - 0.04);
				var vx = weapon.speed * Math.cos(weapon.angle - 0.04);
				var vy = weapon.speed * Math.sin(weapon.angle - 0.04);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
				
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle + 0.04);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle + 0.04);
				var vx = weapon.speed * Math.cos(weapon.angle + 0.04);
				var vy = weapon.speed * Math.sin(weapon.angle + 0.04);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
			}
			// the shots fired right toward the target are the ones the SMART AI counts on to destroy it
			for ( var s = shotsBefore; s < shotList.length; s++ ) {
				shotList[s].target = weapon.target;
			}
			if ( weapon.cannonNbr >= 3 ) {
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle - 0.08);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle - 0.08);
				var vx = weapon.speed * Math.cos(weapon.angle - 0.08);
				var vy = weapon.speed * Math.sin(weapon.angle - 0.08);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
				
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle + 0.08);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle + 0.08);
				var vx = weapon.speed * Math.cos(weapon.angle + 0.08);
				var vy = weapon.speed * Math.sin(weapon.angle + 0.08);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);	
			}
			if ( weapon.cannonNbr >= 5 ) {
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle - 0.16);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle - 0.16);
				var vx = weapon.speed * Math.cos(weapon.angle - 0.16);
				var vy = weapon.speed * Math.sin(weapon.angle - 0.16);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
				
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle + 0.16);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle + 0.16);
				var vx = weapon.speed * Math.cos(weapon.angle + 0.16);
				var vy = weapon.speed * Math.sin(weapon.angle + 0.16);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);	
			}
			break;
		case "SaOW" :
			if ( weapon.smart == 0 ) {
				for ( it=0; it<weapon.cannonNbr; it++ ) {
				
					var t = 2*Math.PI/weapon.cannonNbr*it;
					
					item = new Shot2( ctx, weapon.power, weapon.color, t, weapon.speed/5, (weapon.speed/Math.PI/20) );
					shotList.push(item);
					
				}
			} else {
				
				var t = 2*Math.PI/weapon.cannonNbr*weapon.angle;
				
				item = new Shot2( ctx, weapon.power, weapon.color, t, weapon.speed/5, (weapon.speed/Math.PI/20) );
				shotList.push(item);
				
				weapon.angle++;
				if ( weapon.angle >= weapon.cannonNbr ) {
					weapon.angle = 0;
				}
				
			}
			break;
		case "magneticW" :
			for ( ik = 0; ik < weapon.cannonNbr; ik++ ) {
				var tempAngle = ( ( Math.random() * 2 ) - 1 ) / 10;
			
				// lauching shot right through
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle+tempAngle);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle+tempAngle);
				var vx = 10 * Math.cos(weapon.angle+tempAngle);
				var vy = 10 * Math.sin(weapon.angle+tempAngle);
				
				// let's create a shot
				item = new Shot3(ctx,weapon.power * 2,weapon.color,x,y,vx,vy);
				shotList.push(item);
			}
			break;
		case "HaBW" :
			for ( ik = 0; ik < weapon.cannonNbr; ik++ ) {
				var t = 2 * Math.PI / weapon.cannonNbr * ik + weapon.angle;
				if ( t > Math.PI ) { t -= Math.PI * 2; }
				
				// let's create a shot
				item = new Shot4( ctx, weapon.power, weapon.color, t, 5, weapon.speed );
				shotList.push(item);
			}
			break;
	}
	nbrShots += shotList.length - shotsBefore;
}

// function to display the current weapon
function displayWeapon(ctx,weapon) {
	switch ( weapon.type ) {
		case "basicW" :
			if ( weapon.cannonNbr % 2 == 1 ) {
				var sx = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle);
				var sy = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle);
				var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle);
				var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle);
				// Displaying weapon
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx,sy);
				ctx.lineTo(ex,ey);
				ctx.closePath();
				ctx.stroke();
			} else {
				var sx1 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle-0.04);
				var sy1 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle-0.04);
				var ex1 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle-0.04);
				var ey1 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle-0.04);
				var sx2 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle+0.04);
				var sy2 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle+0.04);
				var ex2 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle+0.04);
				var ey2 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle+0.04);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx1,sy1);
				ctx.lineTo(ex1,ey1);
				ctx.moveTo(sx2,sy2);
				ctx.lineTo(ex2,ey2);
				ctx.closePath();
				ctx.stroke();
			}
			if ( weapon.cannonNbr >= 3 ) {
				var sx1 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle-0.08);
				var sy1 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle-0.08);
				var ex1 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle-0.08);
				var ey1 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle-0.08);
				var sx2 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle+0.08);
				var sy2 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle+0.08);
				var ex2 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle+0.08);
				var ey2 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle+0.08);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx1,sy1);
				ctx.lineTo(ex1,ey1);
				ctx.moveTo(sx2,sy2);
				ctx.lineTo(ex2,ey2);
				ctx.closePath();
				ctx.stroke();
			}
			if ( weapon.cannonNbr >= 5 ) {
				var sx1 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle-0.16);
				var sy1 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle-0.16);
				var ex1 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle-0.16);
				var ey1 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle-0.16);
				var sx2 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle+0.16);
				var sy2 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle+0.16);
				var ex2 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle+0.16);
				var ey2 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle+0.16);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx1,sy1);
				ctx.lineTo(ex1,ey1);
				ctx.moveTo(sx2,sy2);
				ctx.lineTo(ex2,ey2);
				ctx.closePath();
				ctx.stroke();
			}
			break;
		case "SaOW" :
			for ( iw=0; iw<weapon.cannonNbr; iw++ ) {
			
				var t = 2*Math.PI/weapon.cannonNbr*iw;
				var sx = MyPlanet.x + MyPlanet.radius * Math.cos(t);
				var sy = MyPlanet.y + MyPlanet.radius * Math.sin(t);
				var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(t+(4/Math.PI));
				var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(t+(4/Math.PI));
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx,sy);
				ctx.lineTo(ex,ey);
				ctx.closePath();
				ctx.stroke();
				
			}
			break;
		case "magneticW" :
			var sx = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle);
			var sy = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle);
			var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle);
			var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle);
			// Displaying weapon
			ctx.strokeStyle = weapon.color;
			ctx.beginPath();
			ctx.moveTo(sx,sy);
			ctx.lineTo(ex,ey);
			ctx.closePath();
			ctx.stroke();
			break;
		case "HaBW" :
			for ( iw=0; iw<weapon.cannonNbr; iw++ ) {
			
				var t = 2*Math.PI/weapon.cannonNbr*iw + weapon.angle;
				var sx = MyPlanet.x + MyPlanet.radius * Math.cos(t);
				var sy = MyPlanet.y + MyPlanet.radius * Math.sin(t);
				var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(t);
				var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(t);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx,sy);
				ctx.lineTo(ex,ey);
				ctx.closePath();
				ctx.stroke();
				
			}
			break;
	}
}

// function to reset the Hi-Scores of a difficulty level, from the hi-scores page, once the player confirms it
function resetHS(level) {
	if ( !confirm ( "Erase the hi-scores of the " + levelName(level) + " level?" ) ) {
		return;
	}
	// erasing only the scores : localStorage is shared with every page of the same site
	// ('score' is the record of the 2010 score, still erased with the others)
	var scoreKeys = ["survival","totalMat","accuracy","nbrCrashes","nbrDamage","nbrUpgrades","nbrCost","bestScore","score","playedGames"];
	for ( var k in scoreKeys ) {
		localStorage.removeItem(scoreKey(scoreKeys[k],level));
	}
	showHiScores(document.getElementById("gameOver"),level);
}

// function to choose the difficulty level, remembered by the browser
function chooseLevel(level) {
	difficulty = level;
	localStorage["difficulty"] = level;
	showLevel();
}

// function to highlight the chosen difficulty level in the start menu, and to tell what it changes
function showLevel() {
	for ( var level in difficultyLevels ) {
		document.getElementById("level_" + level).classList.toggle("current", level == difficulty);
	}
	document.getElementById("levelText").textContent = levelTexts[difficulty];
}

// function to get the name of the chosen difficulty level, as shown to the player
function levelName(level) {
	level = level || difficulty;
	return level.charAt(0).toUpperCase() + level.slice(1);
}

// function to get where a hi-score is saved : each difficulty level has its own, the normal one keeping the original names
// (the chosen level, unless another one is given)
function scoreKey(name,level) {
	level = level || difficulty;
	if ( level == "normal" ) {
		return name;
	}
	return name + "_" + level;
}

// function to read a hi-score of the chosen difficulty level (or of another one), with a dash when there is none yet
function savedRecord(name,level) {
	var value = localStorage[scoreKey(name,level)];
	if ( value === undefined || value === null ) {
		return "-";
	}
	return value;
}

// function to zoom the game area so that it fits the window, with a sharp canvas
function fitGameArea() {
	var gameArea = document.getElementById("gameArea");
	var main = document.getElementById("mainArea");
	// 610 is the game area with its borders
	var zoom = Math.min(window.innerWidth, window.innerHeight) * screenFill / 610;
	gameArea.style.transform = "translate(-50%, -50%) scale(" + zoom + ")";
	// giving the canvas as many pixels as the screen shows, to avoid any blur
	var pixels = Math.round(gameSize * zoom * (window.devicePixelRatio || 1));
	main.width = pixels;
	main.height = pixels;
	placeSky(main);
}

// function to place the game area's sky in line with the page's : the same picture, darker, as if the game area were a window on it
// (both pictures cover the whole window, centered : css/main.css ; until 2026, the zoom made the game area show a smaller copy of it)
function placeSky(main) {
	var width = document.documentElement.clientWidth;
	var height = document.documentElement.clientHeight;
	var scale = Math.max ( width / backgroundWidth, height / backgroundHeight );	// the size of the picture's pixels on the screen
	var area = main.getBoundingClientRect();
	var zoom = area.width / gameSize;
	// the picture's pixels in game units, and its corner from the game area's corner
	sky.scale = scale / zoom;
	sky.x = ( ( width - backgroundWidth * scale ) / 2 - area.left ) / zoom;
	sky.y = ( ( height - backgroundHeight * scale ) / 2 - area.top ) / zoom;
	main.style.backgroundSize = ( backgroundWidth * sky.scale ) + "px " + ( backgroundHeight * sky.scale ) + "px";
	main.style.backgroundPosition = sky.x + "px " + sky.y + "px";
	starTwinkles = false;	// its stars move with it
}

// function to display status as bars or digits
function displayStatus() {
	if ( displayS == "digits" ) {
		displayS = "bars";
	} else {
		displayS = "digits";
	}
	localStorage["displayS"] = displayS;
}

// function to anticipate asteroid's movement and intercept it ; returns an angle to shoot toward
// The first version (2010) was made with the help of Marc35 from the forum at ilephysique.net
function interception ( asteroid, Vp, r0 ) {
	var meeting = meetingPoint ( asteroid, Vp, r0 );
	if ( meeting != false ) {
		return meeting.angle;
	}

	// no way to catch it : shooting at its current position
	return Math.atan2( asteroid.y - MyPlanet.y, asteroid.x - MyPlanet.x );
}

// function to find where a shot can meet an asteroid ; returns the angle to shoot toward and the turns
// before they meet, or false if no shot can catch it
// A shot leaves the planet radially : it is at the distance r0 from the planet's center after its
// first move, then goes Vp further at each turn. The asteroid is followed turn by turn, moved
// like the engine does with the GRAVITRON's pull, until the shot's distance catches up with its own.
function meetingPoint ( asteroid, Vp, r0 ) {
	// asteroid's position relative to the planet, and speed
	var x = asteroid.x - MyPlanet.x;
	var y = asteroid.y - MyPlanet.y;
	var vx = asteroid.vx;
	var vy = asteroid.vy;

	// how far the asteroid is beyond the shot
	var gap = Math.sqrt(x*x + y*y) - r0;

	for ( var n = 1; gap > 0 && ( r0 + n*Vp ) <= gameSize; n++ ) {
		// moving the asteroid one turn ahead, as if the GRAVITRON stays where it is
		var angle = Math.atan2(y, x);
		var pull = gravitronAcceleration(angle, asteroid.mass);
		vx += pull * Math.cos(angle);
		vy += pull * Math.sin(angle);
		var nextGap = Math.sqrt((x+vx)*(x+vx) + (y+vy)*(y+vy)) - ( r0 + n*Vp );
		if ( nextGap <= 0 ) {
			// the shot catches up during this turn : aiming at the matching point of the asteroid's move
			var share = gap / ( gap - nextGap );
			return { angle : Math.atan2( y + share*vy, x + share*vx ), turns : n - 1 + share };
		}
		x += vx;
		y += vy;
		gap = nextGap;
	}

	// the shot gets out of the game first
	return false;
}

// function to know if an asteroid is going to crash on the planet ; returns the turns before the crash, or false
// The asteroid is followed turn by turn like in meetingPoint, as if the GRAVITRON stays where it is.
function crashTime ( asteroid ) {
	var x = asteroid.x - MyPlanet.x;
	var y = asteroid.y - MyPlanet.y;
	var vx = asteroid.vx;
	var vy = asteroid.vy;
	var crash = MyPlanet.radius + asteroid.radius;

	// looking 40 seconds ahead at most
	for ( var n = 0; n < 1000; n++ ) {
		var distance = Math.sqrt(x*x + y*y);
		if ( distance < crash ) {
			return n;
		}
		if ( distance > gameSize ) {
			return false;
		}
		var angle = Math.atan2(y, x);
		var pull = gravitronAcceleration(angle, asteroid.mass);
		vx += pull * Math.cos(angle);
		vy += pull * Math.sin(angle);
		x += vx;
		y += vy;
	}
	return false;
}

// function to choose the main cannon's target with its SMART AI, from level 3 ; returns false when no asteroid is worth a shot
//	- SMART 3 skips the asteroids that the shots on their way will destroy, and the ones no shot can catch, then takes the closest
//	- SMART 4 takes the asteroid it can hit the soonest, counting the time to turn toward it and the time for the shot to fly
//	- SMART 5 takes first the asteroids going to crash on the planet, the soonest crash first
function smartTarget ( cannon ) {
	// damages already on their way to each asteroid
	for ( var a in asteroidList ) {
		asteroidList[a].incoming = 0;
	}
	for ( var s in shotList ) {
		if ( shotList[s].target ) {
			shotList[s].target.incoming += shotList[s].power;
		}
	}

	var r0 = MyPlanet.radius + 5 + cannon.speed;
	var turnSpeed = mainCanMovSpeed * Math.PI / 256;
	var best = false;
	var bestScore = 0;
	var bestThreat = false;
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		if ( asteroid.pass == 1 || asteroid.incoming >= asteroid.life ) {
			continue;
		}
		var meeting = meetingPoint ( asteroid, cannon.speed, r0 );
		if ( meeting == false ) {
			continue;
		}
		var threat = false;
		var score = distanceToPlanet ( asteroid.x, asteroid.y );
		if ( cannon.smart >= 4 ) {
			var turn = Math.abs ( meeting.angle - cannon.angle );
			if ( turn > Math.PI ) {
				turn = 2 * Math.PI - turn;
			}
			score = turn / turnSpeed + meeting.turns;
		}
		if ( cannon.smart >= 5 ) {
			var crash = crashTime ( asteroid );
			if ( crash !== false ) {
				threat = true;
				score = crash;
			}
		}
		// a threat always comes before the others, then the lowest score wins
		if ( best === false || ( threat && !bestThreat ) || ( threat == bestThreat && score < bestScore ) ) {
			best = asteroid;
			bestScore = score;
			bestThreat = threat;
		}
	}
	return best;
}