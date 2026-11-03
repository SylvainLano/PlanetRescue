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


// THE HINTS OF THE ARCADE (until 0.53.0, a tutorial of its own) : each one shown once, at the moment it helps, in a frame at the
// bottom left of the game area (over the kamikazes' gauge, the research corner keeping the right), the game going on, and never while an
// achievement is told there (achievements.js) ; the "Hints" box of the Arcade's page of the start menu turns them off, or on again,
// every one of them to be shown again (all of them seen : the Graduate achievement)
var hintTime	= 8;		// the seconds a hint is shown,
var hintGap		= 3;		// and the seconds at least between two of them

// each hint : its text (the letters as kbd with their place on the keyboard, written as the player's keyboard has them : showKeyLabels,
// functions.js), and its test, read every few turns while it is not seen yet
var hints = [
	{ id : "turn", text : "Your weapons fire on their own. Turn your Gravitron with <kbd>&larr;</kbd><kbd>&rarr;</kbd> or <kbd data-code='KeyA'>A</kbd><kbd data-code='KeyD'>D</kbd>.",
		test : function () { return gameTime >= 2 * framesPerSecond; } },
	{ id : "gather", text : "Debris! Turn the Gravitron's opening toward them, and widen it with <kbd>&darr;</kbd> or <kbd data-code='KeyS'>S</kbd>: they become mat.",
		test : function () { return debrisList.length >= 3; } },
	{ id : "pull", text : "Careful: the opening pulls the asteroids in too. Narrow it with <kbd>&uarr;</kbd> or <kbd data-code='KeyW'>W</kbd>, or turn it away.",
		test : function () { return asteroidList.some ( function ( a ) { return a.life > 0 && distanceToPlanet ( a.x, a.y ) < 250 && intoArcField ( angleAroundPlanet ( a.x, a.y ), MyGravitron ); } ); } },
	{ id : "shop", text : "You have the mat for an upgrade: <kbd>Space</kbd> opens the pause menu, where you spend it.",
		test : function () { return MyPlanet.mat >= priceToPay ( "mainPow" ); } },
	{ id : "kamikaze", text : "An asteroid is about to crash: click it to send a kamikaze, or press <kbd data-code='KeyF'>F</kbd> for the one your cannon aims at.",
		test : function () { return kamikazes.ready > 0 && asteroidList.some ( function ( a ) { var t = a.life > 0 ? crashTime ( a ) : false; return t !== false && t < 4 * framesPerSecond; } ); } },
	{ id : "crash", text : "A crash takes as many million inhabitants as the asteroid had life left. Heal them in the pause menu.",
		test : function () { return nbrDamage > 0; } },
	{ id : "target", text : "A giant! <kbd data-code='KeyT'>T</kbd> makes your cannon aim at it, <kbd data-code='KeyR'>R</kbd> lets it choose again.",
		test : function () { return asteroidList.some ( function ( a ) { return a.giant && a.life > 0; } ); } },
	{ id : "lab", text : "A Research Lab, in your planet's upgrades, opens the research tree: a research costs time, not mat.",
		test : function () { return !research.lab && anyBranchOpen() && MyPlanet.mat >= priceToPay ( "lab" ); } }
];

// the hints on or off, the ones seen, saved by the browser, and the one shown : the turns it has been shown, and since the last one
var hintsOn		= localStorage["hints"] != "off";
var hintsSeen	= loadHintsSeen();
var hintShown	= { id : false, turns : 0, rest : 0 };

// function to read the hints seen
function loadHintsSeen () {
	try {
		var seen = JSON.parse ( localStorage["hintsSeen"] || "{}" );
		return ( seen && typeof seen == "object" ) ? seen : {};
	} catch ( e ) {
		return {};
	}
}

// function to turn the hints on or off, from the start menu : on again, they are all to be shown again
function toggleHints ( on ) {
	hintsOn = on;
	hintsSeen = {};
	try {
		localStorage["hints"] = on ? "on" : "off";
		localStorage.removeItem ( "hintsSeen" );
	} catch ( e ) {}
}

// function to know if every hint has been seen
function allHintsSeen () {
	for ( var h in hints ) {
		if ( !hintsSeen[hints[h].id] ) {
			return false;
		}
	}
	return true;
}

// function to show the hints, at each turn of the engine : in an Arcade's game being played only, hidden while it is paused or
// while an achievement is told (their time standing still), one at a time, the first one of the list whose moment has come
function advanceHints () {
	var box = document.getElementById ( "hint" );
	if ( state != "playing" || inAdventure() || !hintsOn ) {
		hintShown.id = false;
		box.classList.remove ( "shown" );
		return;
	}
	var free = ( pause == 0 && achievementQueue.length == 0 );
	box.classList.toggle ( "shown", hintShown.id !== false && free );
	if ( !free ) {
		return;
	}
	if ( hintShown.id !== false ) {
		hintShown.turns++;
		if ( hintShown.turns >= hintTime * framesPerSecond ) {
			hintShown.id = false;
			hintShown.rest = 0;
		}
		return;
	}
	hintShown.rest++;
	if ( hintShown.rest < hintGap * framesPerSecond || gameTime % 5 != 0 ) {
		return;
	}
	for ( var h in hints ) {
		if ( !hintsSeen[hints[h].id] && hints[h].test() ) {
			showHint ( box, hints[h] );
			return;
		}
	}
}

// function to show a hint, seen for good
function showHint ( box, hint ) {
	hintShown = { id : hint.id, turns : 0, rest : 0 };
	hintsSeen[hint.id] = true;
	try {
		localStorage["hintsSeen"] = JSON.stringify ( hintsSeen );
	} catch ( e ) {}
	box.innerHTML = "<span class='label'>Hint</span>" + hint.text;
	showKeyLabels ( box );
	box.classList.add ( "shown" );
}
