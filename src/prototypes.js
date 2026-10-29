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


Planet.prototype.Draw=Draw;
Planet.prototype.ShowLife=ShowLife;

Asteroid.prototype.Draw=DrawRock;
Asteroid.prototype.ShowLife=ShowLife;

// the images already loaded, by file (until 2026, every drawing loaded its image again)
var skins = {};

// function to get the image of a skin, loaded the first time only
function skinImage ( file ) {
	if ( !skins[file] ) {
		skins[file] = new Image();
		skins[file].src = file;
	}
	return skins[file];
}

function Draw() {
	this.context.drawImage(skinImage(this.skin),(this.x-this.radius),(this.y-this.radius),(this.radius*2),(this.radius*2));
}

// function to draw an asteroid : its rock turns on itself, while its shading stays lit from the top left, like the planet
function DrawRock() {
	var ctx = this.context;
	var half = this.rockHalf;
	ctx.save();
	ctx.translate(this.x,this.y);
	ctx.rotate(this.spin);
	ctx.drawImage(this.rock,-half,-half,half*2,half*2);
	ctx.clip(this.outline);
	ctx.rotate(-this.spin);
	ctx.fillStyle = this.shade;
	ctx.fillRect(-half,-half,half*2,half*2);
	ctx.restore();
}

function ShowLife() {
	this.context.fillStyle    = '#fff';
	this.context.font         = 'italic 10px sans-serif';
	this.context.textBaseline = 'bottom';
	this.context.fillText  (this.life, (this.x - 5), (this.y - 5) );
}

// function to give an asteroid its own rock : an irregular outline, a texture drawn once, a slow spin and its shading
// (its radius is still the one used for the collisions)
function shapeRock ( asteroid ) {
	var r = asteroid.radius;
	asteroid.rockHalf = r * 1.2;
	asteroid.outline = rockOutline ( r );
	asteroid.rock = rockTexture ( asteroid.outline, asteroid.rockHalf, r, asteroid.context );
	asteroid.spin = Math.random() * 2 * Math.PI;
	asteroid.spinSpeed = ( 0.01 + Math.random() * 0.03 ) * ( Math.random() < 0.5 ? -1 : 1 );
	asteroid.shade = rockShade ( r, asteroid.context );
}

// function to get an irregular outline around the center, a bit stretched, with some sharp corners
function rockOutline ( r ) {
	var points = 9 + Math.floor ( Math.random() * 5 );
	var stretch = Math.random() * 0.15;
	var stretchAngle = Math.random() * Math.PI;
	var corners = [];
	for ( var n = 0; n < points; n++ ) {
		var angle = ( n + Math.random() * 0.5 - 0.25 ) * 2 * Math.PI / points;
		var d = r * ( 0.85 + Math.random() * 0.15 + stretch * Math.cos ( 2 * ( angle - stretchAngle ) ) );
		corners.push ( { x : d * Math.cos ( angle ), y : d * Math.sin ( angle ) } );
	}
	// the outline goes through the middle of each side, rounding most corners
	var path = new Path2D();
	var last = corners[points - 1];
	path.moveTo ( ( last.x + corners[0].x ) / 2, ( last.y + corners[0].y ) / 2 );
	for ( var n = 0; n < points; n++ ) {
		var corner = corners[n];
		var next = corners[( n + 1 ) % points];
		var middleX = ( corner.x + next.x ) / 2;
		var middleY = ( corner.y + next.y ) / 2;
		if ( Math.random() < 0.3 ) {
			path.lineTo ( corner.x, corner.y );
			path.lineTo ( middleX, middleY );
		} else {
			path.quadraticCurveTo ( corner.x, corner.y, middleX, middleY );
		}
	}
	path.closePath();
	return path;
}

// function to draw the rock once, at the resolution of the game's canvas : its color, its grain and its craters
function rockTexture ( outline, half, r, context ) {
	var rock = document.createElement ( "canvas" );
	rock.width = rock.height = Math.ceil ( half * 2 * Math.max ( 2, context.canvas.width / gameSize ) );
	var ctx = rock.getContext ( "2d" );
	ctx.scale ( rock.width / ( half * 2 ), rock.height / ( half * 2 ) );
	ctx.translate ( half, half );
	ctx.clip ( outline );

	// a brownish grey, different for each rock
	var hue = 20 + Math.random() * 20;
	ctx.fillStyle = "hsl(" + hue + "," + ( 8 + Math.random() * 12 ) + "%," + ( 30 + Math.random() * 10 ) + "%)";
	ctx.fill ( outline );

	// some lighter and darker patches, then the fine grain of the stone
	for ( var n = 0; n < 6; n++ ) {
		ctx.fillStyle = ( n % 2 ) ? "rgba(0,0,0,0.12)" : "rgba(255,235,210,0.06)";
		ctx.beginPath();
		ctx.arc ( ( Math.random() * 2 - 1 ) * r, ( Math.random() * 2 - 1 ) * r, r * ( 0.25 + Math.random() * 0.3 ), 0, 2 * Math.PI );
		ctx.fill();
	}
	for ( var n = 0; n < 150; n++ ) {
		ctx.fillStyle = ( Math.random() < 0.7 ) ? "rgba(0,0,0," + ( 0.1 + Math.random() * 0.15 ) + ")" : "rgba(255,235,210," + ( 0.06 + Math.random() * 0.08 ) + ")";
		ctx.beginPath();
		ctx.arc ( ( Math.random() * 2 - 1 ) * r, ( Math.random() * 2 - 1 ) * r, r * ( 0.015 + Math.random() * 0.04 ), 0, 2 * Math.PI );
		ctx.fill();
	}

	// the craters : a hollow in the shadow of its rim on the top left, its far side lit
	// (this light turns with the rock, which can't be seen at the asteroids' size)
	var craters = 2 + Math.floor ( Math.random() * 3 );
	for ( var n = 0; n < craters; n++ ) {
		var angle = Math.random() * 2 * Math.PI;
		var d = Math.random() * r * 0.6;
		var x = d * Math.cos ( angle );
		var y = d * Math.sin ( angle );
		var size = r * ( 0.1 + Math.random() * 0.16 );
		ctx.fillStyle = "rgba(255,235,210,0.18)";
		ctx.beginPath();
		ctx.arc ( x + size * 0.15, y + size * 0.15, size, 0, 2 * Math.PI );
		ctx.fill();
		ctx.fillStyle = "rgba(0,0,0,0.45)";
		ctx.beginPath();
		ctx.arc ( x - size * 0.1, y - size * 0.1, size * 0.9, 0, 2 * Math.PI );
		ctx.fill();
	}

	// darker toward the edges, to give it some volume whatever its spin
	var edge = ctx.createRadialGradient ( 0, 0, r * 0.5, 0, 0, r * 1.1 );
	edge.addColorStop ( 0, "rgba(0,0,0,0)" );
	edge.addColorStop ( 1, "rgba(0,0,0,0.35)" );
	ctx.fillStyle = edge;
	ctx.fill ( outline );
	return rock;
}

// function to get the shading of a rock, lit from the top left like the planet
function rockShade ( r, context ) {
	var shade = context.createRadialGradient ( -0.45 * r, -0.45 * r, 0, -0.45 * r, -0.45 * r, 1.7 * r );
	shade.addColorStop ( 0, "rgba(255,240,220,0.35)" );
	shade.addColorStop ( 0.3, "rgba(255,240,220,0)" );
	shade.addColorStop ( 0.55, "rgba(0,0,0,0.3)" );
	shade.addColorStop ( 0.85, "rgba(0,0,0,0.8)" );
	shade.addColorStop ( 1, "rgba(0,0,0,0.92)" );
	return shade;
}
