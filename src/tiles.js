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


// The upgrades of the pause menu shown as tiles : a square with their picture, darkened, and their value written over it,
// framed in green when one more can be bought, in red when it can't, in gold at its maximum ; a click buys one more,
// and the tooltip tells what the upgrade does, what a click changes and its price (upgrades, shop.js ; the tooltip, menu.js)
var shopTiles = [];		// each tile, with the parts refreshTiles() writes
var tipTile = false;	// the upgrade whose tile the tooltip tells about, rewritten after a purchase

// the pictures of the tiles, drawn like the medals' (achievements.js) : in a 64 x 64 square, with lines of the color "INK"
var tilePictures = {
	// the Gravitron
	sort		: '<path d="M12 16h40L37 34v11l-10 5V34z"/><circle fill="INK" stroke="none" cx="24" cy="9" r="2.5"/><circle fill="INK" stroke="none" cx="37" cy="8" r="2"/>',
	pull		: '<circle fill="INK" stroke="none" cx="32" cy="32" r="5"/><path d="M21 21a16 16 0 0 0 0 22M43 21a16 16 0 0 1 0 22" stroke-width="2.5"/><path d="M14 15a25 25 0 0 0 0 34M50 15a25 25 0 0 1 0 34" stroke-width="2" stroke-dasharray="3 3"/>',
	push		: '<circle cx="32" cy="32" r="6"/><path d="M32 22V10M32 42v12M22 32H10M42 32h12"/><path d="M27 15l5-5 5 5M27 49l5 5 5-5M15 27l-5 5 5 5M49 27l5 5-5 5"/>',
	shield		: medalPictures.shield,
	pulse		: '<circle fill="INK" stroke="none" cx="32" cy="32" r="4"/><circle cx="32" cy="32" r="11" stroke-width="2.5"/><circle cx="32" cy="32" r="19" stroke-width="2" stroke-dasharray="4 4"/>',
	eye			: '<path d="M10 32q22-20 44 0-22 20-44 0z"/><circle cx="32" cy="32" r="6"/><circle fill="INK" stroke="none" cx="32" cy="32" r="2"/>',
	crystal		: medalPictures.crystal,
	press		: '<rect x="23" y="26" width="18" height="12" rx="2"/><path d="M32 8v13M26 15l6 6 6-6M32 56V43M26 49l6-6 6 6"/>',
	// the weapons
	turn		: '<path d="M47 24A16 16 0 1 0 48 38"/><path d="M48 14v10H38"/><circle fill="INK" stroke="none" cx="32" cy="32" r="3"/>',
	chip		: medalPictures.chip,
	weapons		: '<rect x="10" y="18" width="20" height="11" rx="3"/><path d="M30 23.5h12"/><rect x="22" y="35" width="20" height="11" rx="3"/><path d="M42 40.5h12"/>',
	dice		: '<rect x="16" y="16" width="32" height="32" rx="6"/><g fill="INK" stroke="none"><circle cx="24" cy="24" r="3"/><circle cx="40" cy="40" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="40" cy="24" r="3"/><circle cx="24" cy="40" r="3"/></g>',
	burst		: medalPictures.burst,
	cannons		: medalPictures.cannons,
	bolt		: medalPictures.lightning,
	flame		: '<path d="M32 51c-9 0-15-6-15-14 0-9 8-12 9-22 5 4 7 9 6 13 3-2 5-6 4-10 7 5 11 11 11 19 0 8-6 14-15 14z"/>',
	speed		: '<path d="M18 32h30M40 23l9 9-9 9"/><path d="M8 24h12M8 40h12" stroke-width="2"/>',
	slow		: '<path d="M10 32h24M26 24l8 8-8 8"/><path d="M44 18v28M51 18v28"/>',
	spread		: '<path d="M32 52V20M32 52L16 24M32 52l16-28"/><g fill="INK" stroke="none"><circle cx="32" cy="15" r="3"/><circle cx="13.5" cy="20" r="3"/><circle cx="50.5" cy="20" r="3"/></g>',
	blast		: '<circle cx="32" cy="32" r="19" stroke-width="2" stroke-dasharray="4 4"/><polygon fill="INK" stroke="none" points="32,21 34.5,28.5 42,26 37.5,32 42,38 34.5,35.5 32,43 29.5,35.5 22,38 26.5,32 22,26 29.5,28.5"/>',
	hourglass	: medalPictures.hourglass,
	beam		: '<circle cx="15" cy="45" r="5"/><path d="M19 42l32-22" stroke-width="5"/>',
	cold		: '<path d="M32 12v40M14.7 22l34.6 20M14.7 42l34.6-20"/><path d="M26 16l6 5 6-5M26 48l6-5 6 5" stroke-width="2"/>',
	pinball		: medalPictures.pinball,
	// the planet
	heal		: '<rect x="15" y="21" width="34" height="26" rx="4"/><path d="M26 21v-5h12v5"/><path d="M32 28v12M26 34h12" stroke-width="4"/>',
	healFactor	: '<path d="M32 48C19 39 14 33 14 26a9 9 0 0 1 18-4 9 9 0 0 1 18 4c0 7-5 13-18 22z"/><path d="M32 28v10M27 33h10" stroke-width="2.5"/>',
	crews		: '<path d="M10 34l14-12 14 12v14H10z"/><path d="M20 48v-8h8v8" stroke-width="2"/><path d="M36 32l14-14" stroke-width="3"/><path d="M45 13l9 9" stroke-width="6"/>',
	people		: '<circle cx="25" cy="23" r="6"/><path d="M13 46c0-8 5-13 12-13s12 5 12 13"/><circle cx="42" cy="21" r="5"/><path d="M40 31c6 0 11 4 11 12"/>',
	crate		: '<path d="M14 24l18-8 18 8v18l-18 8-18-8z"/><path d="M14 24l18 8 18-8M32 32v18" stroke-width="2"/>',
	autoHeal	: '<path d="M44.7 26.1A14 14 0 0 0 19.3 26.1M19.3 37.9A14 14 0 0 0 44.7 37.9"/><path d="M15 23l4.3 3.1 2-5M49 41l-4.3-3.1-2 5"/><path d="M32 27v10M27 32h10" stroke-width="2.5"/>',
	recovery	: '<path d="M14 21l4-6.5 6.5-1 5 4.5-.5 7-5 4.5-7-.5-3-4.5z"/><path d="M39 35.5h9l4 5-8.5 10-8.5-10z"/><path d="M31 23q11 0 12 8" stroke-dasharray="3 3" stroke-width="2"/><path d="M39.5 28.5l3.5 4 3-4.5" stroke-width="2"/>',
	warning		: '<path d="M32 14L52 48H12z"/><path d="M32 26v10" stroke-width="4"/><circle fill="INK" stroke="none" cx="32" cy="42" r="2.5"/>',
	lab			: medalPictures.flask
};
var tileInk = "#9fb3cf";	// their color, darkened by the tile (css/main.css)

// the font of the values, as css/main.css writes it, its biggest size and the room it has in a tile, in pixels ;
// a canvas measures the values with it
var tileFont = { family : "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", size : 34, room : 64 };
var tileMeasure = document.createElement ( "canvas" ).getContext ( "2d" );

// function to draw a tile's picture, darkened behind its value (the Adventure's bonuses use it too : starshop.js)
function tileSVG ( picture ) {
	return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
		+ '<g fill="none" stroke="' + tileInk + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'
		+ tilePictures[picture].replace ( /INK/g, tileInk ) + '</g></svg>';
}

// function to add the tiles of a list of upgrades
function addTiles ( parent, list ) {
	var grid = newElement ( "div", "tileGrid", parent );
	for ( var u in list ) {
		addTile ( grid, list[u] );
	}
}

// function to add the tile of an upgrade : the mouse on it shows its tooltip, a click buys one more
function addTile ( grid, thing ) {
	var tile = newElement ( "div", "tile", grid );
	tile.setAttribute ( "data-upgrade", thing );
	var square = newElement ( "div", "square", tile );
	square.innerHTML = tileSVG ( upgrades[thing].picture );
	shopTiles.push ( { element : tile, thing : thing, value : newElement ( "div", "value", square ), unit : newElement ( "div", "unit", square ),
		price : newElement ( "div", "price mat", tile ) } );
	newElement ( "div", "name", tile ).textContent = upgrades[thing].name;
	tile.addEventListener ( "mouseenter", function ( e ) {
		showTileTip ( thing );
		placeTooltip ( e );
	} );
	tile.addEventListener ( "mouseleave", function () {
		hideTooltip();
		tipTile = false;
	} );
	tile.addEventListener ( "click", function () { upgrade ( thing ); } );
	menuAppearing.push ( { element : tile, appears : function () { return thingAppears ( { upgrade : thing } ); } } );
}

// function to write the tiles' values and frames at each refresh() (shop.js), and the tooltip of the one under the mouse
function refreshTiles () {
	for ( var t in shopTiles ) {
		var tile = shopTiles[t];
		var unit = upgrades[tile.thing].unit;
		var value = String ( tileValue ( tile.thing ) );
		tile.element.className = "tile " + tileState ( tile.thing );
		tile.value.textContent = value;
		tile.value.style.fontSize = tileFontSize ( value ) + "px";
		tile.unit.textContent = ( typeof unit == "function" ) ? unit() : unit;
		// the price of one more over its corner, none at the maximum (healing : the price of an inhabitant)
		var price = thingPrice ( { upgrade : tile.thing } );
		tile.price.textContent = ( price === false ) ? "" : price;
		tile.price.style.display = ( price === false ) ? "none" : "";
	}
	if ( tipTile && shopTooltip.style.display == "block" ) {
		showTileTip ( tipTile );
	}
}

// function to get the size of a tile's value : as big as the tiles' font goes, smaller when it is too wide for its square
function tileFontSize ( value ) {
	tileMeasure.font = tileFont.size + "px " + tileFont.family;
	var width = tileMeasure.measureText ( value ).width;
	return ( width > tileFont.room ) ? Math.floor ( tileFont.size * tileFont.room / width ) : tileFont.size;
}

// function to know the frame of a tile : "ok" when one more can be bought, "no" when the mat is lacking, "max" at its maximum
function tileState ( thing ) {
	if ( maxReached ( thing ) ) {
		return "max";
	}
	var price = thingPrice ( { upgrade : thing } );		// (healing : the price of a single inhabitant)
	return ( price !== false && price <= MyPlanet.mat ) ? "ok" : "no";
}

// function to read the value of an upgrade as its tile writes it : its own, or else its level (two decimals at most)
function tileValue ( thing ) {
	var value = upgrades[thing].value ? upgrades[thing].value() : translate ( thing );
	return ( typeof value == "number" ) ? Math.round ( value * 100 ) / 100 : value;
}

// function to tell what one more of an upgrade does : in its own words, or else its value going up (or down) by a step
function tileChange ( thing ) {
	var item = upgrades[thing];
	if ( item.change ) {
		return item.change();
	}
	var now = tileValue ( thing );
	var next = item.next ? item.next() : now + ( item.step || ( item.decreasing ? -1 : 1 ) );
	var gap = Math.round ( ( next - now ) * 100 ) / 100;
	return ( gap > 0 ? "+" : "" ) + gap + " " + item.what + " (" + now + " → " + Math.round ( next * 100 ) / 100 + ")";
}

// function to fill the tooltip with the upgrade of a tile : its name and text, then what a click buys and its price
function showTileTip ( thing ) {
	var item = upgrades[thing];
	var cut = item.tip.indexOf ( " - " );
	shopTooltip.innerHTML = "";
	newElement ( "h3", "", shopTooltip ).textContent = item.name;
	newElement ( "div", "", shopTooltip ).textContent = ( cut >= 0 ) ? item.tip.substring ( cut + 3 ) : item.tip;
	var buys = newElement ( "div", "buys", shopTooltip );
	if ( maxReached ( thing ) ) {
		buys.innerHTML = "<span class='gold'>" + ( thing == "healing" ? "Your planet is whole: nothing to heal." : "Maximum reached." ) + "</span>";
	} else if ( thing == "healing" ) {
		buys.innerHTML = healingInfo();
	} else {
		var price = priceToPay ( thing );
		var enough = ( price <= MyPlanet.mat );
		buys.innerHTML = "<span class='" + ( enough ? "green" : "red" ) + "'>" + price + " mat: " + tileChange ( thing ) + "</span>"
			+ ( enough ? "" : "<br>You have " + MyPlanet.mat + " mat." );
	}
	shopTooltip.style.display = "block";
	tipTile = thing;
}

// function to tell what a click on the healing's tile does : heal every inhabitant missing, or as many as the mat in store pays for
function healingInfo () {
	var missing = upgrades.healing.toPay();
	var each = healCost();
	var healed = Math.min ( missing, Math.floor ( MyPlanet.mat / each ) );
	if ( healed == 0 ) {
		return "<span class='red'>" + each + " mat per inhabitant</span><br>You have " + MyPlanet.mat + " mat.";
	}
	return "<span class='green'>" + ( healed * each ) + " mat to heal " + ( healed < missing ? healed + " of the " : "the " ) + missing
		+ " million inhabitants missing</span> (" + each + " mat each)";
}

// the values some tiles show, read from how the game uses their upgrade

// function to get how much of the Gravitron's pull the asteroids feel, compared to the debris, in percents (gravitronAcceleration, functions.js)
function rockPull ( sort, power ) {
	return Math.round ( 100 / Math.pow ( sort, power ) );
}

// function to get the seconds the Gravitron's shield takes to charge a point, at a level (shieldTurns, functions.js)
function shieldSeconds ( level ) {
	return Math.round ( shieldTurns ( level ) / framesPerSecond * 10 ) / 10;
}

// function to get how fast the main structure turns, in degrees per second, at a level (engine.js : a 256th of half a turn by turn)
function turnSpeed ( level ) {
	return Math.round ( level * 180 / 256 * framesPerSecond );
}

// function to get the shots per second of a weapon once its fire rate is raised, firing a few turns sooner (as its level, shop.js)
function fireRateAfter ( weapon, sooner ) {
	return Math.floor ( 2500 / ( weapon.fireRate - sooner ) ) / 100;
}
