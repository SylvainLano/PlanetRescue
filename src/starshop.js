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


// The tree of the Adventure's stars : the Earth in the middle, and cells growing around it, each one an upgrade kept for good,
// every level starting with it ; the four cells next to the Earth can be bought first, and a cell bought opens the ones linked to
// it, further in its direction or on a side (a cell between two directions opens from either one). A cell of plain numbers has
// levels, dearer and dearer, the ones it opens coming with its first one ; a cell changing the way to play has one. The cells bought
// can all be taken back at any time, for their stars to be spent again ; the browser remembers them.
//	- each cell : its place (in columns and rows from the Earth, the north up), its price in stars (a list for its levels), the cells
//	  it opens from ("earth" : at once), its name, its tile (tilePictures, tiles.js) and the value written on it (one for each level),
//	  what it does, what the Adventure must have shown first for it to be seen (an upgrade sold in an open level of the path, or
//	  brought by a bonus level won : metInAdventure, adventure.js), the weapon it builds or upgrades (not in the simulation testing
//	  that weapon's prototype), and how it changes the start of a level, with its levels bought (applyStarBonuses, engine.js)
// (the first world's tree costs 74 stars, the world giving 33 at most : the player chooses ; the next worlds will grow it outward)
var starTree = [
	// north, the basic cannon : its power, then its AI and its turning, or its critical shots and its cooldown
	{ id : "power", at : [0, -1], cost : [1, 2, 3], from : ["earth"], name : "Fire Power", picture : "flame", value : ["+1", "+2", "+3"],
		text : "Your basic cannon starts every level with more Fire Power: one more point at each level.", apply : function ( level ) { mainCannon.power += level; } },
	{ id : "smart", at : [0, -2], cost : 2, from : ["power"], name : "SMART AI 2", picture : "chip", value : "AI 2", seen : "SMART",
		text : "Your basic cannon starts every level with SMART AI level 2: it aims ahead of the asteroids, where they will be.",
		apply : function () { mainCannon.smart = Math.max ( mainCannon.smart, 2 ); } },
	{ id : "speed", at : [0, -3], cost : 4, from : ["smart"], name : "Move Speed", picture : "turn", value : "+1", seen : "mCMSpeed",
		text : "Your main structure starts every level turning one level faster.", apply : function () { mainCanMovSpeed++; } },
	{ id : "crit", at : [1, -2], cost : [1, 2, 3], from : ["smart"], name : "Critical Chance", picture : "dice", value : ["+5%", "+10%", "+15%"], seen : "critChance",
		text : "More of your shots are critical in every level: 5% more at each level.", apply : function ( level ) { critChance = ( Math.round ( critChance * 100 ) + 5 * level ) / 100; } },
	{ id : "cool", at : [1, -3], cost : 4, from : ["crit"], name : "Cooldown", picture : "bolt", value : "0.8 s", seen : "mCFireRate",
		text : "Your basic cannon starts every level with a cooldown a fifth shorter: 0.8 second instead of 1.", apply : function () { shortenCooldown ( mainCannon ); } },
	// east, the Gravitron : its sorting first (a stronger pull alone draws the asteroids in too), then its pull, and its width
	// or its shield
	{ id : "sort", at : [1, 0], cost : 1, from : ["earth"], name : "Sorting", picture : "sort", value : "+1", seen : "gravSort",
		text : "Your Gravitron starts every level with one more level of Sorting: it pulls the asteroids less, and the debris more.",
		apply : function () { MyGravitron.sort = Math.min ( MyGravitron.sort + 1, maxUpgrade ( "gravSort" ) ); } },
	{ id : "grav", at : [2, 0], cost : 2, from : ["sort"], name : "Gravity Generator", picture : "pull", value : "+1", seen : "gravPower",
		text : "Your Gravitron starts every level with one more level of Gravity Generator, pulling the debris faster.",
		apply : function () { MyGravitron.power = Math.min ( MyGravitron.power + 1, maxUpgrade ( "gravPower" ) ); } },
	{ id : "width", at : [3, 0], cost : 4, from : ["grav"], name : "Field Width", picture : "opening", value : "90°", seen : "gravOpening",
		text : "Your Gravitron starts every level able to open to 90°.",
		apply : function () { MyGravitron.opening++; gravMaxSize = gravitronWidest ( MyGravitron.opening ); } },
	{ id : "shield", at : [2, 1], cost : [2, 4], from : ["grav"], name : "Gravitron Shield", picture : "shield", value : ["1", "2"], seen : "gravShield",
		text : "Your Gravitron starts every level with its shield, one level stronger at each level.", apply : function ( level ) { MyGravitron.shield += level; } },
	// south, the planet's people : more of them, then their Auto-Healing and their evacuation, or the kamikazes they build
	{ id : "pop", at : [0, 1], cost : [1, 2, 3], from : ["earth"], name : "Population", picture : "people", value : ["+5M", "+10M", "+15M"],
		text : "More inhabitants on your planet in every level: five million more at each level.", apply : function ( level ) { MyPlanet.maxLife += 5 * level; MyPlanet.life += 5 * level; } },
	{ id : "heal", at : [0, 2], cost : [2, 4], from : ["pop"], name : "Auto-Healing", picture : "autoHeal", value : ["1", "2"], seen : "autoHeal",
		text : "Your planet starts every level with Auto-Healing: an inhabitant healed for every 10 mat gathered, then every 8 at its second level.",
		apply : function ( level ) { planetAutoHeal += level; } },
	{ id : "warn", at : [0, 3], cost : 4, from : ["heal"], name : "Early Warning", picture : "warning", value : "10%", seen : "earlyWarning",
		text : "In every level, 10% of the inhabitants an asteroid's crash would take away are evacuated in time.", apply : function () { MyPlanet.warning++; } },
	{ id : "kami", at : [-1, 1], cost : 2, from : ["pop"], name : "Kamikazes", picture : "kamikaze", value : "+1", seen : "kamikazeNbr",
		text : "One more kamikaze ready at the start of every level.", apply : function () { kamikazes.most++; kamikazes.ready++; } },
	{ id : "build", at : [-2, 1], cost : 4, from : ["kami"], name : "Kamikaze Building", picture : "hourglass", value : "-10 s", seen : "kamikazeBuilding",
		text : "Your planet builds its kamikazes ten seconds faster in every level.",
		apply : function () { kamikazes.building = Math.max ( maxUpgrade ( "kamikazeBuilding" ), kamikazes.building - 10 ); } },
	// west, the planet's mat : its store, then what the crashes give back
	{ id : "mat", at : [-1, 0], cost : [1, 2, 3], from : ["earth"], name : "Reserve", picture : "crate", value : ["+20", "+40", "+60"],
		text : "More mat at the start of every level, and as much more room to store it: 20 more at each level.",
		apply : function ( level ) { MyPlanet.mat += 20 * level; MyPlanet.maxMat += 20 * level; } },
	{ id : "recov", at : [-2, 0], cost : 4, from : ["mat"], name : "Recovery", picture : "recovery", value : "50%", seen : "recovery",
		text : "In every level, your citizens get back as mat half of the inhabitants an asteroid's crash takes.", apply : function () { planetRecovery++; } },
	// between the north and the west, the Spiral, once its bonus level is won : built at the start, then stronger and faster
	{ id : "spiral", at : [-1, -1], cost : 3, from : ["power", "mat"], name : "Spiral", picture : "spiral", value : "built", seen : "SaOW", weapon : "SaOW",
		text : "Your Spiral is built at the start of every level, and active.", apply : function () { spiralCannon.cannonNbr = Math.max ( spiralCannon.cannonNbr, 1 ); activate ( "SaOW" ); } },
	{ id : "spiralPow", at : [-1, -2], cost : 2, from : ["spiral"], name : "Spiral Fire Power", picture : "spiral", value : "+1", seen : "SaOPow", weapon : "SaOW",
		text : "Your Spiral starts every level with one more point of Fire Power.", apply : function () { spiralCannon.power++; } },
	{ id : "spiralCool", at : [-2, -2], cost : 2, from : ["spiralPow"], name : "Spiral Cooldown", picture : "spiral", value : "0.8 s", seen : "SaOCFireRate", weapon : "SaOW",
		text : "Your Spiral starts every level with a cooldown a fifth shorter.", apply : function () { shortenCooldown ( spiralCannon ); } }
];
var treePitch	= 56;		// the room of a cell on the screen, in pixels, from one to the next
var treeCell	= 44;		// and its size, its frame included
var treeEarth	= { radius : 20, skin : earthMap, spin : 0.6, globe : false };		// the Earth in the middle, painted as the scenes' (menuscenes.js)
var starBonuses = loadStarBonuses();	// the levels bought in each cell, by its id

// function to read the cells bought at the Adventure's difficulty level, saved by the browser (adventureKey, adventure.js ; the
// bonuses of the tracks before the tree, saved under another name, are forgotten : their stars come back to be spent ; a cell saved
// as bought before the levels has its first one)
function loadStarBonuses () {
	try {
		delete localStorage["adventureBonuses"];
		var saved = JSON.parse ( localStorage[adventureKey ( "adventureTree" )] || "{}" );
		if ( !saved || typeof saved != "object" ) {
			return {};
		}
		for ( var id in saved ) {
			saved[id] = Number ( saved[id] ) || 0;
		}
		return saved;
	} catch ( e ) {
		return {};
	}
}

// function to save the cells bought
function saveStarBonuses () {
	try {
		localStorage[adventureKey ( "adventureTree" )] = JSON.stringify ( starBonuses );
	} catch ( e ) {}
}

// function to find a cell by its id
function treeCellOf ( id ) {
	for ( var c in starTree ) {
		if ( starTree[c].id == id ) {
			return starTree[c];
		}
	}
	return false;
}

// function to know the levels bought in a cell (the Earth : always one)
function cellLevel ( id ) {
	return ( id == "earth" ) ? 1 : ( starBonuses[id] || 0 );
}

// function to know if a cell is bought, its first level at least
function cellBought ( id ) {
	return cellLevel ( id ) > 0;
}

// function to know how many levels a cell has, and the price of one of them (counted from 0)
function cellLevels ( cell ) {
	return Array.isArray ( cell.cost ) ? cell.cost.length : 1;
}
function cellCost ( cell, level ) {
	return Array.isArray ( cell.cost ) ? cell.cost[level] : cell.cost;
}

// function to know the value written on a cell : its levels bought's, or else its first level's
function cellValue ( cell ) {
	return Array.isArray ( cell.value ) ? cell.value[Math.max ( 0, cellLevel ( cell.id ) - 1 )] : cell.value;
}

// function to know if a cell can be bought : not bought yet, linked to a cell bought, and seen in the Adventure
function cellOpen ( cell ) {
	if ( cellBought ( cell.id ) || ( cell.seen && !metInAdventure ( cell.seen ) ) ) {
		return false;
	}
	for ( var f in cell.from ) {
		if ( cellBought ( cell.from[f] ) ) {
			return true;
		}
	}
	return false;
}

// function to know the price of what a click on a cell buys : its first level when it is open, or else its next one, once bought
// (false : nothing more to buy there)
function cellNextCost ( cell ) {
	var level = cellLevel ( cell.id );
	if ( level == 0 ) {
		return cellOpen ( cell ) ? cellCost ( cell, 0 ) : false;
	}
	return ( level < cellLevels ( cell ) ) ? cellCost ( cell, level ) : false;
}

// function to count the stars spent on the levels of the cells bought
function starsSpent () {
	var spent = 0;
	for ( var c in starTree ) {
		for ( var l = 0; l < cellLevel ( starTree[c].id ); l++ ) {
			spent += cellCost ( starTree[c], l );
		}
	}
	return spent;
}

// function to count the stars left to spend
function starsLeft () {
	return starsCount() - starsSpent();
}

// function to buy a cell, or its next level, when the stars left pay for it
function buyStarBonus ( id ) {
	var cell = treeCellOf ( id );
	var cost = cell ? cellNextCost ( cell ) : false;
	if ( cost !== false && starsLeft() >= cost ) {
		starBonuses[id] = cellLevel ( id ) + 1;
		saveStarBonuses();
		playSound ( "research" );
	}
	showStarShop ( document.getElementById("starShop") );
	starTip ( false, id );
}

// function to take back every star spent, to spend them again
function resetStarBonuses () {
	starBonuses = {};
	saveStarBonuses();
	hideTooltip();
	showStarShop ( document.getElementById("starShop") );
}

// function to give its cells bought to a level of the Adventure, at its start (engine.js, after initDefault) : in the order of the
// tree, the Spiral built before it is upgraded ; not the weapon a simulation tests, there as its prototype (adventure.js)
function applyStarBonuses () {
	var level = adventureLevels[adventure.level];
	for ( var c in starTree ) {
		var cell = starTree[c];
		if ( cellBought ( cell.id ) && !( cell.weapon && cell.weapon == level.prototype ) ) {
			cell.apply ( cellLevel ( cell.id ) );
		}
	}
}

// function to know where a cell is on the screen : the left and top of its frame, in the pixels of the tree's area
function cellPlace ( at, area ) {
	return { left : area.width / 2 + at[0] * treePitch - treeCell / 2, top : area.height / 2 + at[1] * treePitch - treeCell / 2 };
}

// function to show the tree, from the map : its bar, the links between the cells shown, the Earth in the middle, the cells (lit in
// the Earth's blue once bought, all of them once all is bought, a cell of one level at once ; their levels as pips, and the price of
// what a click buys, in red when the stars left don't pay for it), and the button taking the stars back ; the cells further stay
// unknown, as the next levels on the map
function showStarShop ( holder ) {
	var left = starsLeft();
	var area = { width : 566, height : 392 };
	var shown = [];
	for ( var c in starTree ) {
		if ( cellBought ( starTree[c].id ) || cellOpen ( starTree[c] ) ) {
			shown.push ( starTree[c] );
		}
	}
	var html = "<div class='bar'><a href='#' class='level' onClick='hideTooltip(); state=\"map\";'>&lsaquo; Map</a>"
		+ "<span class='world'>Upgrades</span><span class='count'>&#9733; " + left + " to spend</span></div>"
		+ "<div class='tree'><svg class='links' viewBox='0 0 " + area.width + " " + area.height + "'>";
	// the links, from the cells bought to the cells shown they open (under the cells)
	for ( var s in shown ) {
		var to = cellPlace ( shown[s].at, area );
		for ( var f in shown[s].from ) {
			var id = shown[s].from[f];
			if ( cellBought ( id ) ) {
				var from = cellPlace ( id == "earth" ? [0, 0] : treeCellOf ( id ).at, area );
				html += "<line class='" + ( cellBought ( shown[s].id ) ? "bought" : "open" ) + "' x1='" + ( from.left + treeCell / 2 ) + "' y1='" + ( from.top + treeCell / 2 )
					+ "' x2='" + ( to.left + treeCell / 2 ) + "' y2='" + ( to.top + treeCell / 2 ) + "'/>";
			}
		}
	}
	html += "</svg>";
	var earth = cellPlace ( [0, 0], area );
	html += "<div class='cell earth' style='left:" + earth.left + "px;top:" + earth.top + "px'><canvas width='80' height='80'></canvas></div>";
	for ( var s in shown ) {
		var cell = shown[s];
		var place = cellPlace ( cell.at, area );
		var bought = cellBought ( cell.id );
		var cost = cellNextCost ( cell );
		html += "<div class='cell" + ( bought ? " bought" : "" ) + ( cost === false ? " max" : "" ) + "' style='left:" + place.left + "px;top:" + place.top + "px'"
			+ " onmouseenter='starTip(event,\"" + cell.id + "\");' onmousemove='placeTooltip(event);' onmouseleave='hideTooltip();' onClick='buyStarBonus(\"" + cell.id + "\");'>"
			+ tilePicture ( cell.picture ) + "<div class='value'>" + cellValue ( cell ) + "</div>"
			+ ( cellLevels ( cell ) > 1 ? "<div class='pips'>" + levelPips ( cellLevel ( cell.id ), cellLevels ( cell ) ) + "</div>" : "" )
			+ ( cost === false ? "" : "<div class='price" + ( left >= cost ? "" : " short" ) + "'>" + cost + " &#9733;</div>" ) + "</div>";
	}
	html += "</div><div class='foot'><span>Kept for good, they help in every level. Each one bought opens the next ones.</span>"
		+ ( starsSpent() > 0 ? "<a href='#' class='level' onClick='resetStarBonuses();'>Take back my stars</a>" : "" ) + "</div>";
	holder.innerHTML = html;
	paintTreeEarth ( holder.querySelector ( ".earth canvas" ) );
}

// function to write the levels of a cell as pips, one on top of the other, as a gauge : the ones bought full, from the bottom
function levelPips ( level, levels ) {
	var pips = "";
	for ( var p = levels; p >= 1; p-- ) {
		pips += "<span>" + ( ( p <= level ) ? "●" : "○" ) + "</span>";
	}
	return pips;
}

// function to paint the Earth in the middle of the tree, on its canvas (again a moment later while its map is loading)
function paintTreeEarth ( canvas ) {
	var globe = paintGlobe ( treeEarth, planetGlobe ( treeEarth, canvas.width ) );
	if ( !globe ) {
		setTimeout ( function () { if ( canvas.isConnected ) { paintTreeEarth ( canvas ); } }, 200 );
		return;
	}
	canvas.getContext ( "2d" ).drawImage ( globe.canvas, 0, 0, canvas.width, canvas.height );
}

// function to fill the tooltip with a cell : its name, what it does, and the price of what a click buys, or that it is all bought
// (placed under the mouse when it comes on the cell, left where it is after a purchase)
function starTip ( e, id ) {
	var cell = treeCellOf ( id );
	var level = cellLevel ( id );
	var levels = cellLevels ( cell );
	var cost = cellNextCost ( cell );
	shopTooltip.innerHTML = "";
	newElement ( "h3", "", shopTooltip ).textContent = cell.name + ( levels > 1 ? " · level " + level + " of " + levels : "" );
	newElement ( "div", "", shopTooltip ).textContent = cell.text;
	var buys = newElement ( "div", "buys", shopTooltip );
	if ( cost === false ) {
		buys.innerHTML = "<span class='gold'>" + ( levels > 1 ? "All yours: " + cellValue ( cell ) + ", in every level." : "Yours, in every level." ) + "</span>";
	} else {
		var enough = ( starsLeft() >= cost );
		buys.innerHTML = "<span class='" + ( enough ? "green" : "red" ) + "'>" + cost + " &#9733;"
			+ ( levels == 1 ? " to buy it" : level == 0 ? ": " + cell.value[0] : ": " + cellValue ( cell ) + " &rarr; " + cell.value[level] ) + "</span>"
			+ ( enough ? "" : "<br>You have " + starsLeft() + " &#9733; to spend." );
	}
	shopTooltip.style.display = "block";
	if ( e ) {
		placeTooltip ( e );
	}
}

// function to show the cells bought under the start menu's Adventure button : their pictures, small, with their values
// (written again only when they change : the start menu calls it at each turn)
var bonusIconsHTML = false;
function showBonusIcons () {
	var html = "";
	for ( var c in starTree ) {
		var cell = starTree[c];
		if ( cellBought ( cell.id ) ) {
			html += "<span class='bonusIcon' title='" + cell.name + " " + cellValue ( cell ) + "'>" + tilePicture ( cell.picture ) + "</span>";
		}
	}
	if ( html != bonusIconsHTML ) {
		bonusIconsHTML = html;
		document.getElementById("adventureBonuses").innerHTML = html;
	}
}
