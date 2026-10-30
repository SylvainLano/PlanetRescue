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


// The luck of the game, which the pause menu can raise : the critical shots, red, doing more damage,
// and the asteroids with a metal in their rock, whose debris made of it are worth more mat

// function to make some of the shots a main weapon has just fired critical (shoot, functions.js) : red, with more power
// (from the shot "from" of the list ; the Hammer's shots push the asteroids without damaging them)
function criticalShots ( weapon, from ) {
	if ( weapon.type == "HaBW" ) {
		return;
	}
	for ( var s = from; s < shotList.length; s++ ) {
		if ( Math.random() < critChance ) {
			shotList[s].power = Math.round ( shotList[s].power * critDamage );
			shotList[s].critical = true;
		}
	}
}

// function to show a critical shot hitting an asteroid : a red flash, and its sound
function criticalHit ( asteroid ) {
	flashList.push ( { x : asteroid.x, y : asteroid.y, radius : asteroid.radius, age : 0 } );
	playSound ( "critical" );
}

// function to make the flashes of the critical shots fade, at each turn of the game
function resolveFlashes () {
	var kept = [];
	for ( var f in flashList ) {
		flashList[f].age++;
		if ( flashList[f].age < 10 ) {
			kept.push ( flashList[f] );
		}
	}
	flashList = kept;
}

// function to draw the critical shots, bigger and red with a glow, and their flashes : a red ring growing around the asteroid hit
function drawCriticals ( ctx ) {
	ctx.save();
	for ( var i in shotList ) {
		if ( shotList[i].critical ) {
			ctx.fillStyle = 'rgba(255,60,60,0.35)';
			ctx.beginPath();
			ctx.arc ( shotList[i].x, shotList[i].y, 3.5, 0, 2 * Math.PI );
			ctx.fill();
			ctx.fillStyle = '#ff3c3c';
			ctx.beginPath();
			ctx.arc ( shotList[i].x, shotList[i].y, 1.8, 0, 2 * Math.PI );
			ctx.fill();
		}
	}
	for ( var f in flashList ) {
		var flash = flashList[f];
		ctx.strokeStyle = 'rgba(255,70,70,' + ( 1 - flash.age / 10 ) + ')';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc ( flash.x, flash.y, flash.radius + 2 + flash.age * 1.5, 0, 2 * Math.PI );
		ctx.stroke();
	}
	ctx.restore();
}

// function to choose the metal of a new asteroid, or none : the Prospector draws more of them
function asteroidMetal () {
	var roll = Math.random();
	var more = 1 + prospectorBonus * MyGravitron.prospector;
	for ( var metal in metals ) {
		roll -= metals[metal].chance * more;
		if ( roll < 0 ) {
			return metal;
		}
	}
	return false;
}

// function to draw the veins of its metal on an asteroid's rock, once (rockTexture, prototypes.js) : shining lines and specks
function drawVeins ( ctx, r, metal ) {
	var color = metals[metal].color;
	ctx.save();
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.lineCap = "round";
	var veins = 2 + Math.floor ( Math.random() * 2 );
	for ( var n = 0; n < veins; n++ ) {
		var angle = Math.random() * 2 * Math.PI;
		var x = Math.cos ( angle ) * r * 0.9;
		var y = Math.sin ( angle ) * r * 0.9;
		var bend = ( Math.random() * 2 - 1 ) * r;
		ctx.globalAlpha = 0.75 + Math.random() * 0.25;
		ctx.lineWidth = r * ( 0.08 + Math.random() * 0.06 );
		ctx.beginPath();
		ctx.moveTo ( x, y );
		ctx.quadraticCurveTo ( bend * Math.sin ( angle ), - bend * Math.cos ( angle ), - x * ( 0.3 + Math.random() * 0.6 ), - y * ( 0.3 + Math.random() * 0.6 ) );
		ctx.stroke();
	}
	for ( var n = 0; n < 8; n++ ) {
		ctx.globalAlpha = 0.6 + Math.random() * 0.4;
		ctx.beginPath();
		ctx.arc ( ( Math.random() * 2 - 1 ) * r * 0.8, ( Math.random() * 2 - 1 ) * r * 0.8, r * ( 0.04 + Math.random() * 0.05 ), 0, 2 * Math.PI );
		ctx.fill();
	}
	ctx.restore();
}

// function to know how much mat a debris is worth : one, or its metal's value
function debrisWorth ( debris ) {
	return debris.metal ? metals[debris.metal].value : 1;
}
