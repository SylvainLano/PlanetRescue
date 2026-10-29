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


// The achievements, saved by the browser for good, whatever the difficulty level (planned in 2010, to unlock the research tree later)
// each one : its name, what it asks, its medal (its picture, and its metal for how hard it is), and its test,
// read at each turn of the engine until it is achieved ; they are shown in this order, six by row
var achievements = {
	// the four ones of 2010, and the tutorial
	firstContact	: { name : "First Contact", text : "Play your first game.", picture : "planet", metal : "bronze",
						test : function () { return state == "playing"; } },
	timeOut			: { name : "Time Out", text : "Open the pause menu.", picture : "pause", metal : "bronze",
						test : function () { return state == "playing" && pause == 1; } },
	firstStrike		: { name : "First Strike", text : "Destroy your first asteroid.", picture : "burst", metal : "bronze",
						test : function () { return state == "playing" && nbrDestroyed >= 1; } },
	upgraded		: { name : "Upgraded", text : "Buy your first upgrade.", picture : "arrow", metal : "bronze",
						test : function () { return state == "playing" && nbrUpgrades >= 1; } },
	graduate		: { name : "Graduate", text : "Finish the tutorial.", picture : "cap", metal : "bronze",
						test : function () { return state == "tutorialSteps" && countdownValue >= 345; } },
	// surviving
	survivor		: { name : "Survivor", text : "Survive 2 minutes.", picture : "hourglass", metal : "bronze",
						test : function () { return survived ( 120 ); } },
	veteran			: { name : "Veteran", text : "Survive 4 minutes.", picture : "hourglass", metal : "silver",
						test : function () { return survived ( 240 ); } },
	legend			: { name : "Legend", text : "Survive 6 minutes.", picture : "hourglass", metal : "gold",
						test : function () { return survived ( 360 ); } },
	// destroying and gathering, in a single game
	demolisher		: { name : "Demolisher", text : "Destroy 25 asteroids in a game.", picture : "rock", metal : "silver",
						test : function () { return state == "playing" && nbrDestroyed >= 25; } },
	exterminator	: { name : "Exterminator", text : "Destroy 100 asteroids in a game.", picture : "rock", metal : "gold",
						test : function () { return state == "playing" && nbrDestroyed >= 100; } },
	collector		: { name : "Collector", text : "Gather 250 mat in a game.", picture : "crystal", metal : "silver",
						test : function () { return state == "playing" && MyPlanet.totalMat >= 250; } },
	hoarder			: { name : "Hoarder", text : "Gather 1000 mat in a game.", picture : "crystal", metal : "gold",
						test : function () { return state == "playing" && MyPlanet.totalMat >= 1000; } },
	// skill
	sharpshooter	: { name : "Sharpshooter", text : "End a game of 2 minutes or more with 90% accuracy.", picture : "target", metal : "silver",
						test : function () { return state == "playing" && pause == 2 && gameTime >= 120 * framesPerSecond && nbrShots > 0 && Math.floor ( ( 1 - nbrLostShots / nbrShots ) * 100 ) >= 90; } },
	untouchable		: { name : "Untouchable", text : "Keep your planet unhit for 2 minutes in a row.", picture : "shield", metal : "silver",
						test : function () { return state == "playing" && pause != 2 && gameTime - calmSince >= 120 * framesPerSecond; } },
	bankShot		: { name : "Bank Shot", text : "Deflect an asteroid with your Gravitron into another one, and destroy it.", picture : "billiards", metal : "gold",
						test : function () { return state == "playing" && bankShot; } },
	fullArsenal		: { name : "Full Arsenal", text : "Own all four weapons.", picture : "cannons", metal : "silver",
						test : function () { return state == "playing" && ownedWeapons() == 4; } },
	genius			: { name : "Genius", text : "Raise your cannon's SMART AI to level 5.", picture : "chip", metal : "gold",
						test : function () { return state == "playing" && mainCannon.smart >= 5; } },
	hardRock		: { name : "Hard Rock", text : "Survive 3 minutes in Hard.", picture : "lightning", metal : "gold",
						test : function () { return difficulty == "hard" && survived ( 180 ); } },
	// the research tree and its weapons
	labRat			: { name : "Lab Rat", text : "Validate your first research.", picture : "flask", metal : "bronze",
						test : function () { return state == "playing" && researchesDone() >= 1; } },
	fireworks		: { name : "Fireworks", text : "Destroy 3 asteroids with a single bomb, its Chain Reaction included.", picture : "fireworks", metal : "silver",
						test : function () { return state == "playing" && bestBomb >= 3; } },
	giantSlayer		: { name : "Giant Slayer", text : "Finish a giant asteroid with your laser.", picture : "sword", metal : "silver",
						test : function () { return state == "playing" && giantSlain; } },
	scholar			: { name : "Scholar", text : "Complete every research in a game.", picture : "book", metal : "gold",
						test : function () { return state == "playing" && researchesDone() == Object.keys ( researches ).length; } }
};

// The pictures of the medals, drawn in a 64 x 64 square around its center (32, 32), with lines of the color "INK"
var medalPictures = {
	planet		: '<circle cx="32" cy="32" r="9"/><ellipse cx="32" cy="32" rx="18" ry="6" transform="rotate(-20 32 32)"/>',
	pause		: '<path d="M26 21v22M38 21v22" stroke-width="6"/>',
	burst		: '<polygon fill="INK" stroke="none" points="32,15 34.7,25.5 43.3,20.7 38.5,29.3 49,32 38.5,34.7 43.3,43.3 34.7,38.5 32,49 29.3,38.5 20.7,43.3 25.5,34.7 15,32 25.5,29.3 20.7,20.7 29.3,25.5"/>',
	arrow		: '<path d="M32 47V19M20 31l12-12 12 12"/>',
	cap			: '<path d="M13 28l19-9 19 9-19 9z"/><path d="M21 32v8c6 5 16 5 22 0v-8M51 28v11"/>',
	hourglass	: '<path d="M21 16h22M21 48h22M24 16c0 10 7 11 7 16s-7 6-7 16M40 16c0 10-7 11-7 16s7 6 7 16"/><path fill="INK" stroke="none" d="M27 46h10l-5-6z"/>',
	rock		: '<path d="M18 31l7-12 12-2 9 8-1 13-9 8-12-1-6-8z"/><path d="M34 18l-3 10 6 5-5 8" stroke-width="2"/>',
	crystal		: '<path d="M24 21h16l7 9-15 18-15-18z"/><path d="M17 30h30M28 21l-3 9 7 18 7-18-3-9" stroke-width="2"/>',
	target		: '<circle cx="32" cy="32" r="16"/><circle cx="32" cy="32" r="9"/><circle fill="INK" stroke="none" cx="32" cy="32" r="3.5"/>',
	shield		: '<path d="M32 15l14 5v11c0 9-6 14-14 18-8-4-14-9-14-18V20z"/><path d="M26 32l5 5 8-9"/>',
	billiards	: '<circle cx="23" cy="40" r="7"/><circle fill="INK" stroke="none" cx="42" cy="25" r="7"/><path d="M11 17q2 16 12 23" stroke-dasharray="3 4"/><path d="M50 16l3-3M52 27h4M45 14l1-4" stroke-width="2"/>',
	cannons		: '<circle cx="32" cy="32" r="7"/><path d="M32 25V13M39 32h12M32 39v12M25 32H13" stroke-width="4"/>',
	chip		: '<rect x="22" y="22" width="20" height="20" rx="3"/><path d="M27 22v-6M32 22v-6M37 22v-6M27 42v6M32 42v6M37 42v6M22 27h-6M22 32h-6M22 37h-6M42 27h6M42 32h6M42 37h6" stroke-width="2"/>',
	lightning	: '<path fill="INK" stroke="none" d="M36 13L20 36h11l-3 15 16-24H33z"/>',
	flask		: '<path d="M27 15h10M29 15v12L18 46c-1 2 0 4 2 4h24c2 0 3-2 2-4L35 27V15"/><path d="M22 40h20" stroke-width="2"/><circle fill="INK" stroke="none" cx="30" cy="45" r="2"/><circle fill="INK" stroke="none" cx="36" cy="44" r="1.5"/>',
	fireworks	: '<circle fill="INK" stroke="none" cx="32" cy="32" r="3"/><path d="M32 25v-7M37 27l5-5M39 32h7M37 37l5 5M32 39v7M27 37l-5 5M25 32h-7M27 27l-5-5" stroke-width="2.5"/><g fill="INK" stroke="none"><circle cx="32" cy="13" r="2"/><circle cx="45.4" cy="18.6" r="2"/><circle cx="51" cy="32" r="2"/><circle cx="45.4" cy="45.4" r="2"/><circle cx="32" cy="51" r="2"/><circle cx="18.6" cy="45.4" r="2"/><circle cx="13" cy="32" r="2"/><circle cx="18.6" cy="18.6" r="2"/></g>',
	sword		: '<path d="M46 16L25 37" stroke-width="4"/><path d="M46 16l2-4-4 2M19 33l12 12M24 40l-8 8" stroke-width="3"/><circle fill="INK" stroke="none" cx="15" cy="49" r="2.5"/>',
	book		: '<path d="M32 21c-5-4-12-5-18-4v26c6-1 13 0 18 4 5-4 12-5 18-4V17c-6-1-13 0-18 4zM32 21v26"/><path d="M19 25c3 0 6 1 8 2M19 31c3 0 6 1 8 2M37 27c2-1 5-2 8-2M37 33c2-1 5-2 8-2" stroke-width="1.5"/>'
};

// the colors of the medals : their metal's rim, their disk and their picture ; the ones not obtained yet are dark silhouettes
var medalColors = {
	bronze	: { rim : "#cd7f32", light : "#323c4c", dark : "#121821", ink : "#eef3fa" },
	silver	: { rim : "#c9d1d9", light : "#323c4c", dark : "#121821", ink : "#eef3fa" },
	gold	: { rim : "#f2c94c", light : "#323c4c", dark : "#121821", ink : "#eef3fa" },
	locked	: { rim : "#33383f", light : "#191c22", dark : "#0b0d10", ink : "#2f343c" }
};

// function to get the medal of an achievement, as an SVG picture
function medalSVG ( id ) {
	var achievement = achievements[id];
	var colors = medalColors[achieved[id] ? achievement.metal : "locked"];
	var gradient = "medal" + ( achieved[id] ? achievement.metal : "Locked" );
	return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
		+ '<defs><radialGradient id="' + gradient + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="' + colors.light + '"/><stop offset="1" stop-color="' + colors.dark + '"/></radialGradient></defs>'
		+ '<circle cx="32" cy="32" r="29" fill="url(#' + gradient + ')" stroke="' + colors.rim + '" stroke-width="4"/>'
		+ '<circle cx="32" cy="32" r="24.5" fill="none" stroke="' + colors.rim + '" stroke-opacity="0.35"/>'
		+ '<g fill="none" stroke="' + colors.ink + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'
		+ medalPictures[achievement.picture].replace ( /INK/g, colors.ink ) + '</g></svg>';
}

// the medals as images, for the canvas to draw them, as they are now : obtained or not
var medalImages = {};

// function to get the image of an achievement's medal
function medalImage ( id ) {
	var key = id + ( achieved[id] ? "" : "Locked" );
	if ( !medalImages[key] ) {
		medalImages[key] = new Image();
		medalImages[key].src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent ( medalSVG ( id ) );
	}
	return medalImages[key];
}

// the achievements obtained, with the day they were : saved by the browser
var achieved = {};

// the ones obtained in the current game, for the Game Over screen, and the ones waiting to be shown at the bottom of the game area
var newAchievements = [];
var achievementQueue = [];
var achievementClock = { shown : 0, last : 0 };	// how long the first one waiting has been shown, in milliseconds

// function to know if the game has lasted that long (in seconds, pauses excluded)
function survived ( seconds ) {
	return state == "playing" && gameTime >= seconds * framesPerSecond;
}

// function to count the weapons bought (a weapon has no cannon until it is bought)
function ownedWeapons () {
	var owned = 0;
	for ( var w in weaponList ) {
		if ( weaponList[w].cannonNbr > 0 ) {
			owned++;
		}
	}
	return owned;
}

// function to count the researches validated in the current game (researches.js)
function researchesDone () {
	var done = 0;
	for ( var id in research.done ) {
		done++;
	}
	return done;
}

// function to read the achievements saved by the browser
function loadAchievements () {
	try {
		achieved = JSON.parse ( localStorage["achievements"] || "{}" );
	} catch ( e ) {
		achieved = {};
	}
}

// function to test the achievements not obtained yet, at each turn of the engine
function checkAchievements () {
	for ( var id in achievements ) {
		if ( !achieved[id] && achievements[id].test() ) {
			achieved[id] = new Date().toISOString().substring ( 0, 10 );
			localStorage["achievements"] = JSON.stringify ( achieved );
			newAchievements.push ( id );
			achievementQueue.push ( id );
		}
	}
}

// function to tell on the start menu's button how many achievements are obtained
function showAchievementCount () {
	var count = 0, total = 0;
	for ( var id in achievements ) {
		total++;
		if ( achieved[id] ) {
			count++;
		}
	}
	document.getElementById ( "achievementCount" ).textContent = count + "/" + total;
}

// function to erase the achievements obtained
function resetAchievements () {
	if ( !confirm ( "Erase all your achievements?" ) ) {
		return;
	}
	localStorage.removeItem ( "achievements" );
	achieved = {};
	state = "achievements";
}

// function to show an achievement just obtained, at the bottom of the game area, for 3.5 seconds each
// (its time stands still in the pause menu, which would hide it)
function drawAchievement ( ctx ) {
	var now = performance.now();
	var spent = Math.min ( now - achievementClock.last, 100 );
	achievementClock.last = now;
	if ( achievementQueue.length == 0 ) {
		return;
	}
	if ( !( state == "playing" && pause == 1 ) ) {
		achievementClock.shown += spent;
	}
	if ( achievementClock.shown >= 3500 ) {
		achievementQueue.shift();
		achievementClock.shown = 0;
		return;
	}
	var achievement = achievements[achievementQueue[0]];
	ctx.save();
	// fading in, then out
	ctx.globalAlpha = Math.min ( 1, achievementClock.shown / 300, ( 3500 - achievementClock.shown ) / 500 );
	ctx.fillStyle = 'rgba(60,60,60,0.75)';
	ctx.fillRect ( 0, gameSize - 76, gameSize, 76 );
	// its medal on the left
	var medal = medalImage ( achievementQueue[0] );
	if ( medal.complete && medal.naturalWidth > 0 ) {
		ctx.drawImage ( medal, 16, gameSize - 68, 60, 60 );
	}
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = '#5df45d';
	ctx.font = 'bold 12px Arial';
	ctx.fillText ( 'ACHIEVEMENT UNLOCKED', gameSize / 2, gameSize - 58 );
	ctx.fillStyle = '#fff';
	ctx.font = '30px MirageRegular';
	ctx.fillText ( achievement.name, gameSize / 2, gameSize - 28 );
	ctx.fillStyle = '#ddd';
	ctx.font = '12px Arial';
	ctx.fillText ( achievement.text, gameSize / 2, gameSize - 10 );
	ctx.restore();
}

// function to fill the achievements' page of the start menu : a grid of medals, six by row, with their name under them
// (the ones not obtained yet stay secret ; the others tell what they asked, and when they were obtained, under the mouse)
function showAchievements ( holder ) {
	var count = 0, total = 0;
	var medals = "";
	for ( var id in achievements ) {
		total++;
		if ( achieved[id] ) {
			count++;
		}
		medals += "<div class='medal" + ( achieved[id] ? "" : " locked" ) + "' data-achievement='" + id + "'>" + medalSVG ( id )
			+ "<div class='name'>" + ( achieved[id] ? achievements[id].name : "???" ) + "</div></div>";
	}
	holder.innerHTML = "<div class='subtitle'>Achievements <span class='green'>" + count + " / " + total + "</span></div>"
		+ "<div class='medals'>" + medals + "</div>"
		+ "<div class='buttons'><a href='#' class='button' onClick='state=\"menu\";'>Main Menu</a></div>"
		+ ( count > 0 ? "<div class='reset'><a href='#' onClick='resetAchievements();'>reset achievements</a></div>" : "" );
	// the names too long for their place get smaller
	var names = holder.querySelectorAll ( ".name" );
	for ( var n = 0; n < names.length; n++ ) {
		var size = 11;
		while ( names[n].scrollWidth > names[n].clientWidth && size > 7 ) {
			size -= 0.5;
			names[n].style.fontSize = size + "px";
		}
	}
	if ( !holder.hasTooltips ) {
		addMedalTooltips ( holder );
		holder.hasTooltips = true;
	}
}

// function to show what a medal was obtained for, and when, in the menus' tooltip (menu.js)
function addMedalTooltips ( holder ) {
	holder.addEventListener ( "mouseover", function ( e ) {
		var medal = e.target.closest ( ".medal" );
		if ( !medal || medal.classList.contains ( "locked" ) ) {
			return;
		}
		var id = medal.getAttribute ( "data-achievement" );
		shopTooltip.innerHTML = "";
		newElement ( "h3", "", shopTooltip ).textContent = achievements[id].name;
		newElement ( "div", "", shopTooltip ).textContent = achievements[id].text;
		newElement ( "div", "date", shopTooltip ).textContent = "Obtained on " + achieved[id];
		shopTooltip.style.display = "block";
		placeTooltip ( e );
	} );
	holder.addEventListener ( "mousemove", placeTooltip );
	holder.addEventListener ( "mouseout", function ( e ) {
		var medal = e.target.closest ( ".medal" );
		if ( medal && !medal.contains ( e.relatedTarget ) ) {
			hideTooltip();
		}
	} );
	holder.addEventListener ( "click", hideTooltip );
}
