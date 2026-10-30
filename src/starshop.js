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


// The bonuses of the Adventure, bought with its stars : five tracks of three levels, the first level of a track costing a star,
// the second two and the third three (30 stars for all of them, as many as the first world has) ; they help in every level,
// and the stars can be taken back at any time, to be spent again. The browser remembers them.
//	- each track : its name, its tile (its picture in tilePictures, tiles.js, and its unit), what it does,
//	  its bonus at each level, and how it changes the start of a level (applyStarBonuses, called by engine.js)
var starTracks = [
	// (a bigger store, too : the mat given doesn't fill it, which would stop the Gravitron's harvest)
	{ id : "reserve", name : "Reserve", picture : "crate", unit : "starting mat", text : "More mat at the start of every level, and as much more room to store it.",
		bonus : [0, 20, 40, 60], apply : function ( b ) { MyPlanet.mat += b; MyPlanet.maxMat += b; } },
	{ id : "population", name : "Population", picture : "people", unit : "M inhabitants", text : "More inhabitants on your planet in every level.",
		bonus : [0, 5, 10, 15], apply : function ( b ) { MyPlanet.maxLife += b; MyPlanet.life += b; } },
	{ id : "cannon", name : "Cannon", picture : "flame", unit : "fire power", text : "A stronger basic cannon from the start of every level.",
		bonus : [0, 1, 2, 3], apply : function ( b ) { mainCannon.power += b; } },
	{ id : "gravitron", name : "Gravitron", picture : "pull", unit : "gravity", text : "A stronger Gravity Generator from the start of every level, pulling the debris faster.",
		bonus : [0, 1, 2, 3], apply : function ( b ) { MyGravitron.power = Math.min ( MyGravitron.power + b, maxUpgrade ( "gravPower" ) ); } },
	{ id : "luck", name : "Luck", picture : "dice", unit : "critical shots", suffix : "%", text : "More critical shots in every level.",
		bonus : [0, 5, 10, 15], apply : function ( b ) { critChance = ( Math.round ( critChance * 100 ) + b ) / 100; } }
];
var starBonuses = loadStarBonuses();	// the level bought in each track, by its id

// function to read the bonuses bought, saved by the browser
function loadStarBonuses () {
	try {
		var saved = JSON.parse ( localStorage["adventureBonuses"] || "{}" );
		return ( saved && typeof saved == "object" ) ? saved : {};
	} catch ( e ) {
		return {};
	}
}

// function to save the bonuses bought
function saveStarBonuses () {
	localStorage["adventureBonuses"] = JSON.stringify ( starBonuses );
}

// function to know the level bought in a track
function trackLevel ( track ) {
	return starBonuses[track.id] || 0;
}

// function to count the stars spent on the bonuses : 1, then 2, then 3 for each level of a track
function starsSpent () {
	var spent = 0;
	for ( var t in starTracks ) {
		var level = trackLevel ( starTracks[t] );
		spent += level * ( level + 1 ) / 2;
	}
	return spent;
}

// function to count the stars left to spend
function starsLeft () {
	return starsCount() - starsSpent();
}

// function to buy the next level of a track, when the stars left pay for it
function buyStarBonus ( t ) {
	var track = starTracks[t];
	var level = trackLevel ( track );
	if ( level + 1 < track.bonus.length && starsLeft() >= level + 1 ) {
		starBonuses[track.id] = level + 1;
		saveStarBonuses();
	}
	showStarShop ( document.getElementById("starShop") );
	starTip ( false, t );
}

// function to take back every star spent, to spend them again
function resetStarBonuses () {
	starBonuses = {};
	saveStarBonuses();
	hideTooltip();
	showStarShop ( document.getElementById("starShop") );
}

// function to give its bonuses to a level of the Adventure, at its start (engine.js, after initDefault)
function applyStarBonuses () {
	for ( var t in starTracks ) {
		var level = trackLevel ( starTracks[t] );
		if ( level > 0 ) {
			starTracks[t].apply ( starTracks[t].bonus[level] );
		}
	}
}

// function to write a track's bonus at a level : +20, +10%…
function bonusText ( track, level ) {
	return "+" + track.bonus[level] + ( track.suffix || "" );
}

// function to show the screen of the bonuses, from the map : its bar, a tile for each track (as the pause menu's, tiles.js),
// and the button taking the stars back
function showStarShop ( holder ) {
	var left = starsLeft();
	var html = "<div class='bar'><a href='#' class='level' onClick='hideTooltip(); state=\"map\";'>&lsaquo; Map</a>"
		+ "<span class='world'>Upgrades</span><span class='count'>&#9733; " + left + " to spend</span></div>"
		+ "<div class='intro'>Bought with the stars won in the Adventure, they help in every level.<br>You can take your stars back at any time, to spend them again.</div>"
		+ "<div class='tileGrid'>";
	for ( var t = 0; t < starTracks.length; t++ ) {
		var track = starTracks[t];
		var level = trackLevel ( track );
		var maxed = ( level + 1 >= track.bonus.length );
		var value = bonusText ( track, level );
		html += "<div class='tile " + ( maxed ? "max" : ( left >= level + 1 ? "ok" : "no" ) ) + "'"
			+ " onmouseenter='starTip(event," + t + ");' onmouseleave='hideTooltip();' onClick='buyStarBonus(" + t + ");'>"
			+ "<div class='square'>" + tileSVG ( track.picture )
			+ "<div class='value' style='font-size:" + tileFontSize ( value ) + "px'>" + value + "</div>"
			+ "<div class='unit'>" + track.unit + "</div></div>"
			+ ( maxed ? "" : "<div class='price'>" + ( level + 1 ) + " &#9733;</div>" )
			+ "<div class='name'>" + track.name + "<span class='pips'>" + levelPips ( level, track.bonus.length - 1 ) + "</span></div></div>";
	}
	html += "</div>";
	if ( starsSpent() > 0 ) {
		html += "<div class='buttons'><a href='#' class='button' onClick='resetStarBonuses();'>Take back my stars</a></div>";
	}
	holder.innerHTML = html;
}

// function to write the levels of a track as pips : the ones bought full
function levelPips ( level, max ) {
	var pips = "";
	for ( var p = 1; p <= max; p++ ) {
		pips += ( p <= level ) ? "●" : "○";
	}
	return pips;
}

// function to fill the tooltip with a track : what it does, and what its next level brings for how many stars
// (placed under the mouse when it comes on the tile, left where it is after a purchase)
function starTip ( e, t ) {
	var track = starTracks[t];
	var level = trackLevel ( track );
	shopTooltip.innerHTML = "";
	newElement ( "h3", "", shopTooltip ).textContent = track.name;
	newElement ( "div", "", shopTooltip ).textContent = track.text;
	var buys = newElement ( "div", "buys", shopTooltip );
	if ( level + 1 >= track.bonus.length ) {
		buys.innerHTML = "<span class='gold'>Maximum reached: " + bonusText ( track, level ) + " " + track.unit + ".</span>";
	} else {
		var enough = ( starsLeft() >= level + 1 );
		buys.innerHTML = "<span class='" + ( enough ? "green" : "red" ) + "'>" + ( level + 1 ) + " &#9733;: " + bonusText ( track, level ) + " &rarr; " + bonusText ( track, level + 1 ) + " " + track.unit + "</span>"
			+ ( enough ? "" : "<br>You have " + starsLeft() + " &#9733; to spend." );
	}
	shopTooltip.style.display = "block";
	if ( e ) {
		placeTooltip ( e );
	}
}

// function to show the bonuses bought under the start menu's Adventure button : their pictures, small, with their level
// (written again only when they change : the start menu calls it at each turn)
var bonusIconsHTML = false;
function showBonusIcons () {
	var html = "";
	for ( var t in starTracks ) {
		var level = trackLevel ( starTracks[t] );
		if ( level > 0 ) {
			html += "<span class='bonusIcon' title='" + starTracks[t].name + ": " + bonusText ( starTracks[t], level ) + " " + starTracks[t].unit + "'>"
				+ tileSVG ( starTracks[t].picture ) + "<b>" + level + "</b></span>";
		}
	}
	if ( html != bonusIconsHTML ) {
		bonusIconsHTML = html;
		document.getElementById("adventureBonuses").innerHTML = html;
	}
}
