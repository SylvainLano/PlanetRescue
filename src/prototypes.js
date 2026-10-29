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


Planet.prototype.Draw=DrawPlanet;
Planet.prototype.Turn=TurnPlanet;
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

// function to make the planet turn on itself, at each turn of the engine while the game runs, not during the pause or once destroyed
function TurnPlanet() {
	if ( pause == 0 ) {
		this.spin -= planetTurn;
	}
}

// function to draw the planet : its map (its skin) wrapped around a sphere turning on itself, lit from the top left
function DrawPlanet() {
	var globe = planetGlobe ( this );
	if ( globe == false ) {
		return;		// its map is still loading
	}
	// each pixel of the globe takes its color on the map, shifted by the spin
	// (the shift falls between two columns of the map : both are mixed, so that the Earth glides instead of jumping a pixel at a time)
	var turn = this.spin / ( 2 * Math.PI ) * globe.width;
	var shift = Math.floor ( turn );
	var next = Math.round ( ( turn - shift ) * 256 );	// the share of the next column, out of 256
	var left = 256 - next;
	shift %= globe.width;
	if ( shift < 0 ) {
		shift += globe.width;
	}
	for ( var n = 0; n < globe.count; n++ ) {
		var column = globe.columns[n] + shift;
		if ( column >= globe.width ) {
			column -= globe.width;
		}
		var after = ( column + 1 == globe.width ) ? 0 : column + 1;
		var a = globe.map[globe.rows[n] + column];
		var b = globe.map[globe.rows[n] + after];
		// red and blue are mixed together, then green, then the opacity of the globe's edge is added
		var color = ( ( ( ( a & 0xFF00FF ) * left + ( b & 0xFF00FF ) * next ) >>> 8 ) & 0xFF00FF )
			| ( ( ( ( a & 0xFF00 ) * left + ( b & 0xFF00 ) * next ) >>> 8 ) & 0xFF00 );
		globe.pixels[globe.places[n]] = color | ( globe.alphas[n] << 24 );
	}
	var ctx = globe.context;
	ctx.putImageData ( globe.image, 0, 0 );
	// its atmosphere at the edge, then the night on the bottom right
	ctx.globalCompositeOperation = "source-atop";
	ctx.fillStyle = globe.air;
	ctx.fillRect ( 0, 0, globe.size, globe.size );
	ctx.fillStyle = globe.shade;
	ctx.fillRect ( 0, 0, globe.size, globe.size );
	ctx.globalCompositeOperation = "source-over";
	this.context.drawImage ( globe.canvas, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2 );
}

// function to get the planet's globe at the canvas' resolution : where each of its pixels takes its color on the map
// (computed once, then again only when the zoom changes)
function planetGlobe ( planet ) {
	var size = Math.ceil ( planet.radius * 2 * planet.context.canvas.width / gameSize );
	if ( planet.globe && planet.globe.size == size && planet.globe.skin == planet.skin ) {
		return planet.globe;
	}
	var skin = skinImage ( planet.skin );
	if ( !skin.complete || skin.naturalWidth == 0 || size < 2 ) {
		return false;
	}
	var globe = { size : size, skin : planet.skin };
	var radius = size / 2;

	// the map, with about one of its pixels for one of the screen's at the globe's center
	globe.width = Math.round ( 2 * Math.PI * radius );
	var height = Math.round ( globe.width / 2 );
	var texture = document.createElement ( "canvas" );
	texture.width = globe.width;
	texture.height = height;
	var ctx = texture.getContext ( "2d" );
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage ( skin, 0, 0, globe.width, height );
	globe.map = new Uint32Array ( ctx.getImageData ( 0, 0, globe.width, height ).data.buffer );

	// for each pixel of the globe : its place, the row and column of its color on the map, and its opacity at the edge
	var places = [], rows = [], columns = [], alphas = [];
	for ( var py = 0; py < size; py++ ) {
		for ( var px = 0; px < size; px++ ) {
			// the pixel's center, from the globe's center, in radii
			var sx = ( px + 0.5 - radius ) / radius;
			var sy = ( py + 0.5 - radius ) / radius;
			var d = Math.sqrt ( sx * sx + sy * sy );
			var cover = ( 1 - d ) * radius + 0.5;
			if ( cover <= 0 ) {
				continue;
			}
			if ( d > 1 ) {
				sx /= d;
				sy /= d;
			}
			// standing its axis upright (x to the east, y to the north, z toward us), then looking from above the equator
			var x = sx * Math.cos ( planetTilt ) + sy * Math.sin ( planetTilt );
			var y = sx * Math.sin ( planetTilt ) - sy * Math.cos ( planetTilt );
			var z = Math.sqrt ( Math.max ( 0, 1 - x * x - y * y ) );
			var north = y * Math.cos ( planetView ) + z * Math.sin ( planetView );
			var front = z * Math.cos ( planetView ) - y * Math.sin ( planetView );
			var latitude = Math.asin ( Math.max ( -1, Math.min ( 1, north ) ) );
			var longitude = Math.atan2 ( x, front );
			places.push ( py * size + px );
			rows.push ( Math.min ( height - 1, Math.floor ( ( 0.5 - latitude / Math.PI ) * height ) ) * globe.width );
			columns.push ( Math.floor ( ( longitude / ( 2 * Math.PI ) + 0.5 ) * globe.width ) % globe.width );
			alphas.push ( Math.round ( Math.min ( 1, cover ) * 255 ) );
		}
	}
	globe.count = places.length;
	globe.places = new Int32Array ( places );
	globe.rows = new Int32Array ( rows );
	globe.columns = new Int32Array ( columns );
	globe.alphas = new Uint8Array ( alphas );

	// the globe's own canvas, with its atmosphere and its shading
	globe.canvas = document.createElement ( "canvas" );
	globe.canvas.width = globe.canvas.height = size;
	globe.context = globe.canvas.getContext ( "2d" );
	globe.image = globe.context.createImageData ( size, size );
	globe.pixels = new Uint32Array ( globe.image.data.buffer );
	globe.air = globe.context.createRadialGradient ( radius, radius, radius * 0.8, radius, radius, radius );
	globe.air.addColorStop ( 0, "rgba(120,170,255,0)" );
	globe.air.addColorStop ( 1, "rgba(120,170,255,0.45)" );
	var light = radius * 0.55;
	globe.shade = globe.context.createRadialGradient ( light, light, 0, light, light, radius * 1.7 );
	globe.shade.addColorStop ( 0, "rgba(255,245,230,0.15)" );
	globe.shade.addColorStop ( 0.35, "rgba(255,245,230,0)" );
	globe.shade.addColorStop ( 0.55, "rgba(0,0,0,0.35)" );
	globe.shade.addColorStop ( 0.8, "rgba(0,0,0,0.88)" );
	globe.shade.addColorStop ( 1, "rgba(0,0,0,0.95)" );
	planet.globe = globe;
	return globe;
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
	asteroid.rock = rockTexture ( asteroid.outline, asteroid.rockHalf, r, asteroid.context, asteroid.giant );
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
function rockTexture ( outline, half, r, context, giant ) {
	var rock = document.createElement ( "canvas" );
	rock.width = rock.height = Math.ceil ( half * 2 * Math.max ( 2, context.canvas.width / gameSize ) );
	var ctx = rock.getContext ( "2d" );
	ctx.scale ( rock.width / ( half * 2 ), rock.height / ( half * 2 ) );
	ctx.translate ( half, half );
	ctx.clip ( outline );

	// a brownish grey, different for each rock ; a dark rusty red for the giants, to see them coming
	if ( giant ) {
		ctx.fillStyle = "hsl(" + ( 5 + Math.random() * 10 ) + "," + ( 30 + Math.random() * 15 ) + "%," + ( 22 + Math.random() * 6 ) + "%)";
	} else {
		ctx.fillStyle = "hsl(" + ( 20 + Math.random() * 20 ) + "," + ( 8 + Math.random() * 12 ) + "%," + ( 30 + Math.random() * 10 ) + "%)";
	}
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
