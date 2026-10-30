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


// The Adventure : levels to win one after the other, each with its waves of asteroids and what it brings to the pause menu,
// and three stars to win in each one : the level won, more than half of the inhabitants saved, and its own challenge
// (a star stays won once won, and winning a level opens the next one : the browser remembers it)

// the levels : what they change from the starting values (as the difficulty levels do : parameters.js),
// what they bring to the pause menu (upgrades and weapons, kept by the next levels), their waves and their challenge
//	- a wave : its asteroids, the seconds between two of them, the sides they come from (in degrees around the planet,
//	  0 being the right and 90 the bottom ; from everywhere when not told), their speed (1 being the Arcade's) and its giants, coming last
var adventureLevels = [
	{ name : "First Light", values : { planetMat : 20 },
		brings : [ "gravPower", "gravSort", "mCMSpeed", "mainPow", "mainSpeed" ],
		waves : [ { count : 2, gap : 4 }, { count : 3, gap : 4 }, { count : 4, gap : 3 } ],
		challenge : { text : "Gather 65 mat", test : function () { return MyPlanet.totalMat >= 65; } } },
	{ name : "Crossfire", values : { planetMat : 40 },
		brings : [ "gravShield", "gravScanner", "mCFireRate", "SMART" ],
		waves : [ { count : 3, gap : 3 }, { count : 4, gap : 3 }, { count : 5, gap : 2.5, from : [0, 180] }, { count : 6, gap : 2, from : [90, 270] } ],
		challenge : { text : "Win in less than 3 minutes", test : function () { return gameTime <= 180 * framesPerSecond; } } },
	{ name : "Heavy Metal", values : { planetMat : 80 },
		brings : [ "SaOW", "SaOCNumber", "SaOCFireRate", "SaOPow", "SaOSpeed", "MaxWAtATime", "healing", "healFact", "autoHeal", "maxMat" ],
		waves : [ { count : 3, gap : 3.5 }, { count : 4, gap : 3 }, { count : 5, gap : 3, from : [45, 225] }, { count : 5, gap : 2.5 }, { count : 3, gap : 3, giants : 1 } ],
		challenge : { text : "Destroy the giant before it gets halfway to your planet", test : function () { return giantClosest > ( gameSize / 2 + MyPlanet.radius ) / 2; } } }
];
var adventureReady	= false;	// the Adventure is shown on the start menu once it is ready : set it to true to play it
var sideSpread	= 25;		// how far from its side an asteroid of a wave may come, in degrees on each side
var waveBreak	= 2;		// seconds between a wave destroyed and the next one,
var waveWait	= 20;		// and at most since its last asteroid came, when some of them are still there
var levelEnd	= 3;		// seconds of play once the last asteroid is gone, for its debris to be gathered

// the level being played (its number in adventureLevels, null in the Arcade), its waves, and the banner telling them
//	- wave : the waves come so far ; queue : the asteroids of the wave still to come (true for a giant) ; timer : the turns until the next one
//	- calm : the turns since the last one came ; rest : the turns since the asteroids are all gone ; ending : the turns until the level's end
var adventure = { level : null, wave : 0, queue : [], timer : 0, calm : 0, rest : 0, ending : 0, banner : false };

// the stars won in each level, saved by the browser : three for each level, the ones won being true
var levelStars = loadLevelStars();

// function to read the stars won, saved by the browser
function loadLevelStars () {
	try {
		var saved = JSON.parse ( localStorage["adventure"] || "[]" );
		return Array.isArray ( saved ) ? saved : [];
	} catch ( e ) {
		return [];
	}
}

// function to know if a level of the Adventure is being played
function inAdventure () {
	return adventure.level !== null;
}

// function to know if a level can be played : the first one, and the ones after a level won
function levelOpen ( number ) {
	return number == 0 || ( levelStars[number - 1] && levelStars[number - 1][0] ) ? true : false;
}

// function to play a level of the Adventure, from the start menu or the level's end
function playLevel ( number ) {
	if ( !levelOpen ( number ) ) {
		return;
	}
	adventure.level = number;
	state = "init";
}

// function to play the Arcade, at the difficulty level chosen
function playArcade () {
	adventure.level = null;
	state = "init";
}

// function to start the waves of a new game, by initDefault (parameters.js)
function newWaves () {
	adventure.wave = 0;
	adventure.queue = [];
	adventure.timer = 0;
	adventure.calm = 0;
	adventure.rest = 0;
	adventure.ending = 0;
	adventure.banner = false;
}

// function to know if the level being played brings something to the pause menu : an upgrade, a weapon or a branch of the research tree
// (anything in the Arcade)
function adventureAllows ( name ) {
	if ( !inAdventure() ) {
		return true;
	}
	for ( var n = 0; n <= adventure.level; n++ ) {
		if ( adventureLevels[n].brings.indexOf ( name ) >= 0 ) {
			return true;
		}
	}
	return false;
}

// function to send the waves of the level, at each turn of the game (not during the pause) :
// the asteroids of a wave come one after the other, and the next wave once they are all gone (or after a while),
// until the level is won when the last one is gone
function advanceWaves ( ctx ) {
	var level = adventureLevels[adventure.level];
	if ( adventure.ending > 0 ) {
		// the level is won : a few seconds for the debris to come, then its end
		adventure.ending--;
		if ( adventure.ending == 0 ) {
			winLevel();
		}
		return;
	}
	if ( adventure.queue.length > 0 ) {
		adventure.timer--;
		if ( adventure.timer <= 0 ) {
			var wave = level.waves[adventure.wave - 1];
			launchAsteroid ( ctx, waveAngle ( wave ), adventure.queue.shift(), wave.speed );
			adventure.timer = Math.round ( ( wave.gap || 2 ) * framesPerSecond );
		}
		return;
	}
	adventure.calm++;
	adventure.rest = ( asteroidList.length == 0 ) ? adventure.rest + 1 : 0;
	if ( adventure.wave == level.waves.length ) {
		if ( adventure.rest > 0 ) {
			adventure.ending = levelEnd * framesPerSecond;
			adventure.banner = { text : "Level complete", from : gameTime, time : levelEnd };
		}
	} else if ( adventure.rest >= waveBreak * framesPerSecond || adventure.calm >= waveWait * framesPerSecond ) {
		startWave ( level );
	}
}

// function to start the next wave of the level : its asteroids, then its giants
function startWave ( level ) {
	var wave = level.waves[adventure.wave];
	adventure.wave++;
	adventure.queue = [];
	for ( var n = 0; n < wave.count; n++ ) {
		adventure.queue.push ( false );
	}
	for ( var g = 0; g < ( wave.giants || 0 ); g++ ) {
		adventure.queue.push ( true );
	}
	adventure.timer = 0;
	adventure.calm = 0;
	adventure.rest = 0;
	adventure.banner = { text : "Wave " + adventure.wave + "/" + level.waves.length, from : gameTime, time : 2.5 };
}

// function to choose where an asteroid of a wave comes from : around one of its sides, or from anywhere (in radians)
function waveAngle ( wave ) {
	if ( !wave.from ) {
		return Math.random() * Math.PI * 2;
	}
	var side = wave.from[Math.floor ( Math.random() * wave.from.length )];
	return ( side + ( Math.random() * 2 - 1 ) * sideSpread ) * Math.PI / 180;
}

// function to know which stars the game has won : the level won, more than half of the inhabitants saved, and its challenge
// (the inhabitants being healed count)
function starsWon ( won ) {
	return [ won, won && ( MyPlanet.life + planetHealPend ) * 2 > MyPlanet.maxLife, won && adventureLevels[adventure.level].challenge.test() ? true : false ];
}

// function to end a level won : the game stops behind the level's end, and its stars are saved
function winLevel () {
	pause = 3;
	laserCannon.firing = 0;
	checkAchievements();	// the ones of the game's end, before they are listed
	document.getElementById("status").style.display = "none";
	var holder = document.getElementById("gameOver");
	holder.style.display = "block";
	showLevelEnd ( holder, true );
}

// function to show the end of a level, won or lost : its stars, its numbers and the achievements it brought (achievements.js)
function showLevelEnd ( holder, won ) {
	var level = adventureLevels[adventure.level];
	var stars = starsWon ( won );
	if ( won ) {
		var saved = levelStars[adventure.level] || [false, false, false];
		levelStars[adventure.level] = [ saved[0] || stars[0], saved[1] || stars[1], saved[2] || stars[2] ];
		localStorage["adventure"] = JSON.stringify ( levelStars );
	}
	var seconds = Math.floor ( gameTime / framesPerSecond );
	var reasons = [ "Win the level", "Save more than half of your inhabitants", level.challenge.text ];
	var html = "<div class='over'><div class='title'>" + ( won ? "Level complete" : "Level failed" ) + "</div>"
		+ "<div class='subtitle'>Level " + ( adventure.level + 1 ) + " &middot; <strong>" + level.name + "</strong>"
		+ ( won ? "" : " &middot; your planet has been destroyed" ) + "</div>"
		+ "<div class='stars'>";
	for ( var s = 0; s < 3; s++ ) {
		html += "<div class='star" + ( stars[s] ? " won" : "" ) + "'><span>&#9733;</span><div class='reason'>" + reasons[s] + "</div></div>";
	}
	html += "</div><div class='tiles'>"
		+ gameOverTile ( "Time", minutes ( seconds ), seconds + " seconds", false )
		+ gameOverTile ( "Waves", Math.max ( 0, adventure.wave - ( won ? 0 : 1 ) ) + "/" + level.waves.length, "destroyed", false )
		+ gameOverTile ( "Inhabitants", MyPlanet.life + "M", "of " + MyPlanet.maxLife + "M", false )
		+ gameOverTile ( "Destroyed", nbrDestroyed, nbrGiants > 0 ? "with " + nbrGiants + ( nbrGiants > 1 ? " giants" : " giant" ) : "asteroids", false )
		+ gameOverTile ( "Mat gathered", MyPlanet.totalMat, "mat", false )
		+ gameOverTile ( "Upgrades", nbrUpgrades, nbrCost + " mat spent", false )
		+ "</div>";
	// the achievements of the game, with their medals (achievements.js)
	if ( newAchievements.length > 0 ) {
		html += "<div class='unlocked'><div class='label'>Achievements unlocked</div>";
		for ( var a in newAchievements ) {
			html += "<div class='medal'>" + medalSVG ( newAchievements[a] ) + "<div class='name'>" + achievements[newAchievements[a]].name + "</div></div>";
		}
		html += "</div>";
	}
	html += "<div class='buttons'><a href='#' class='button' onClick='state=\"init\";'>Retry</a>";
	if ( won && adventure.level + 1 < adventureLevels.length ) {
		html += "<a href='#' class='button' onClick='playLevel(" + ( adventure.level + 1 ) + ");'>Next Level</a>";
	}
	html += "<a href='#' class='button' onClick='state=\"menu\";'>Main Menu</a></div></div>";
	holder.innerHTML = html;
	achievementQueue = [];		// their banners would go on behind this screen, which shows their medals
}

// function to write the stars of a level : the ones won full, the others empty
function starsText ( stars ) {
	var text = "";
	for ( var s = 0; s < 3; s++ ) {
		text += ( stars && stars[s] ) ? "★" : "☆";
	}
	return text;
}

// function to list the levels on the start menu, with their stars and their challenge
// (written again only when it changes : the start menu calls it at each turn)
var adventureListHTML = "";
function showAdventureList () {
	document.getElementById("mainMenu").classList.toggle ( "adventure", adventureReady );
	if ( !adventureReady ) {
		return;
	}
	var html = "<div class='label'>Adventure</div>";
	for ( var n = 0; n < adventureLevels.length; n++ ) {
		var open = levelOpen ( n );
		html += "<a href='#' class='stage" + ( open ? "" : " locked" ) + "' title='" + ( open ? "Challenge : " + adventureLevels[n].challenge.text : "Win the level before to open this one" ) + "'"
			+ " onClick='playLevel(" + n + ");'>" + ( n + 1 ) + " &middot; " + adventureLevels[n].name
			+ "<span class='stars'>" + starsText ( levelStars[n] ) + "</span></a>";
	}
	if ( html != adventureListHTML ) {
		adventureListHTML = html;
		document.getElementById("adventureList").innerHTML = html;
	}
}

// function to draw the banner of the waves, and the one of the level won, over the game for a few seconds
function drawWaveBanner ( ctx ) {
	if ( !adventure.banner ) {
		return;
	}
	var age = ( gameTime - adventure.banner.from ) / framesPerSecond;
	if ( age > adventure.banner.time ) {
		return;
	}
	ctx.save();
	ctx.font = '48px MirageRegular';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = 'rgba(255,71,71,' + Math.min ( 1, age * 4, ( adventure.banner.time - age ) * 2 ) + ')';
	ctx.fillText ( adventure.banner.text, gameSize / 2, 170 );
	ctx.restore();
}
