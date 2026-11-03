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


// The Game Over screen : the score of the game, its numbers, the records it beat, the NAZA's tip and the achievements it brought,
// and the hi-scores page, with the records of each difficulty level
// (until 2026, both were pages of sentences ; the records are saved as they were, by difficulty level)

// THE TIPS OF THE GAME'S END : after a game lost, the NAZA's advice, chosen from what happened in it (and in the Adventure, after
// a level won without all its stars, how to win the first one missed : adventure.js) ; a tip shows in a card under the numbers,
// with the picture of what it advises, and the number behind it lights up
var hotTile		= false;	// the labels of the numbers that the tip shown lights up (gameOverTile)
var tipInk		= "#8fc4ff";	// the blue of the NAZA's announces (threats.js)
var tipMat		= 60;		// the mat left in store at the end that a tip finds too much,
var tipAccuracy	= 70;		// the accuracy under which the SMART AI is advised (over 3 minutes, SMART 1 : 55 to 70 %, SMART 2 : 80 to 87 %),
var tipTurning	= 35;		// the part of the time turning over which the Move Speed is (37 to 47 % at first, 28 to 39 % with one more level),
var tipBounces	= 15;		// the hits bounced off armored asteroids that make a tip,
var tipFull		= 20;		// the seconds with the store full that do,
var tipPace		= 45;		// the mat a minute under which the Gravitron is advised (30 to 50 without steering it),
var tipReach	= 3;		// and the asteroids coming too fast for the cannon's shots that make the Fire Speed advised
						// (over 3 minutes : 0 to 3 with the first shots' speed, none at 3)

// the tips of a game lost, in their order : the first one true is shown (or the next one, when it was the game before's) ;
// each one has its name, the numbers it lights up (of the Arcade's screen or of the Adventure's), its picture (tiles.js or
// achievements.js), and its text, or false when it doesn't fit the game
var lossTips = [
	{ id : "shop", tiles : [ "Upgrades" ], picture : "pause", text : function () {
		if ( nbrUpgrades > 0 || nbrCost > 0 ) {
			return false;
		}
		return "You spent no mat in this game. Press Space: the pause menu sells upgrades for your cannon, your Gravitron and your planet."; } },
	{ id : "autoHeal", tiles : [ "Hits taken", "Inhabitants" ], picture : "autoHeal", text : function () {
		if ( MyPlanet.life > 0 || MyPlanet.mat < tipMat || planetAutoHeal > 0 || !tipCan ( "autoHeal" ) ) {
			return false;
		}
		return "Your planet fell with " + MyPlanet.mat + " mat in store. Auto-Healing heals it with the mat your Gravitron gathers, without spending any."; } },
	{ id : "healing", tiles : [ "Hits taken", "Inhabitants" ], picture : "heal", text : function () {
		if ( MyPlanet.life > 0 || MyPlanet.mat < tipMat || !adventureAllows ( "healing" ) || ( planetAutoHeal == 0 && tipCan ( "autoHeal" ) ) ) {
			return false;		// (the Auto-Healing's tip comes first)
		}
		return "Your planet fell with " + MyPlanet.mat + " mat in store. In the pause menu, Healing turns your mat into inhabitants."; } },
	{ id : "giant", tiles : [ "Hits taken", "Inhabitants" ], picture : "rock", text : function () {
		if ( MyPlanet.life > 0 || lastCrash != "giant" ) {
			return false;
		}
		return "A giant ended the game: all the life it had left crashed on your planet. Aim at the giants first, with T, as soon as they come."; } },
	{ id : "armored", tiles : [ "Accuracy" ], picture : "flame", text : function () {
		if ( nbrBounces < tipBounces || mainCannon.power > armorPlates || !tipCan ( "mainPow" ) ) {
			return false;
		}
		return nbrBounces + " of your shots bounced off armored asteroids. Their plates absorb " + armorPlates + " of each shot's power: raise your Fire Power, or count on critical shots"
			+ ( adventureAllows ( "lasers" ) ? " and the laser." : "." ); } },
	{ id : "smart", tiles : [ "Accuracy" ], picture : "chip", text : function () {
		if ( gameAccuracy() >= tipAccuracy || mainCannon.smart >= 2 || !tipCan ( "SMART" ) ) {
			return false;
		}
		return "Your cannon missed " + ( 100 - gameAccuracy() ) + "% of its shots. SMART AI level 2 aims ahead of the asteroids, where they will be."; } },
	{ id : "reach", tiles : [ "Accuracy" ], picture : "speed", text : function () {
		if ( nbrOutOfReach < tipReach || !tipCan ( "mainSpeed" ) ) {
			return false;
		}
		return "Your cannon let " + nbrOutOfReach + " asteroids go by, too fast for its shots. Fire Speed makes them faster, and a kamikaze slows one down."; } },
	{ id : "move", tiles : [ "Destroyed" ], picture : "turn", text : function () {
		var turning = Math.round ( turningTurns / Math.max ( 1, gameTime ) * 100 );
		if ( turning < tipTurning || mainCanMovSpeed > gameValues.mainCanMovSpeed || !tipCan ( "mCMSpeed" ) ) {
			return false;
		}
		return "Your cannon spent " + turning + "% of the game turning from one asteroid to the next. Main Structure Move Speed turns it faster, for more shots."; } },
	{ id : "full", tiles : [ "Mat gathered" ], picture : "crate", text : function () {
		var seconds = Math.floor ( fullTurns / framesPerSecond );
		if ( seconds < tipFull || !tipCan ( "maxMat" ) ) {
			return false;
		}
		return "Your store was full for " + seconds + " seconds, and your Gravitron gathered nothing more. Spend your mat as it comes, or buy Maximum Mat."; } },
	{ id : "pace", tiles : [ "Mat gathered" ], picture : "pull", text : function () {
		var pace = Math.round ( MyPlanet.totalMat / Math.max ( 1, gameTime / framesPerSecond ) * 60 );
		if ( gameTime < 60 * framesPerSecond || pace >= tipPace ) {
			return false;
		}
		return "Your Gravitron gathered " + pace + " mat a minute. Turn its opening toward the debris (&larr; &rarr;) and widen it (&darr;) to pull more in."; } },
	{ id : "power", tiles : [ "Destroyed" ], picture : "flame", text : function () {
		var shots = Math.ceil ( ( gameValues.asteroidLife + asteroidExtraLife() ) / mainCannon.power );
		if ( shots < 3 || !tipCan ( "mainPow" ) ) {
			return false;
		}
		return "At the end, it took " + shots + " of your shots to destroy an asteroid. Fire Power makes each one count."; } }
];

// function to save a record of the difficulty level if this game beat it, and to tell if it did
function saveRecord ( name, value ) {
	var record = localStorage[scoreKey(name)];
	if ( record === undefined || record === null || Number ( record ) < value ) {
		localStorage[scoreKey(name)] = value;
		return true;
	}
	return false;
}

// function to show the Game Over screen, once the planet is destroyed
function showGameOver ( holder ) {
	var seconds = Math.floor ( gameTime / framesPerSecond );
	var accuracy = gameAccuracy();
	var tip = lossTip();		// (chosen first, for its numbers to light up)
	// the score rewards what the player does : destroying asteroids (a giant is worth 50), gathering mat, and surviving
	// (the 2010 score was saved as 'score', this one has its own record)
	var asteroids = nbrDestroyed - nbrGiants;
	var score = asteroids * 10 + nbrGiants * 50 + MyPlanet.totalMat + seconds;
	var bestBefore = savedRecord ( "bestScore" );
	// the records beaten, cheered unless they are zero ; the crashes and the inhabitants lost are kept too, as in 2010, without being cheered
	var records = {
		survival : saveRecord ( "survival", seconds ) && seconds > 0,
		mat : saveRecord ( "totalMat", MyPlanet.totalMat ) && MyPlanet.totalMat > 0,
		accuracy : saveRecord ( "accuracy", accuracy ) && accuracy > 0,
		upgrades : saveRecord ( "nbrUpgrades", nbrUpgrades ) && nbrUpgrades > 0,
		spent : saveRecord ( "nbrCost", nbrCost ) && nbrCost > 0,
		score : saveRecord ( "bestScore", score ) && score > 0
	};
	saveRecord ( "nbrCrashes", nbrCrashes );
	saveRecord ( "nbrDamage", nbrDamage );

	var parts = [ asteroids + " asteroids &times; 10" ];
	if ( nbrGiants > 0 ) {
		parts.push ( nbrGiants + ( nbrGiants > 1 ? " giants" : " giant" ) + " &times; 50" );
	}
	parts.push ( MyPlanet.totalMat + " mat", seconds + " seconds" );

	var html = "<div class='over'><div class='title'>Game Over</div>"
		+ "<div class='subtitle'>Your planet has been destroyed. Difficulty level : <strong>" + levelName() + "</strong></div>"
		+ "<div class='score" + ( records.score ? " record" : "" ) + "'>"
		+ "<div class='label'>" + ( records.score ? "New high score !" : "Score" ) + "</div>"
		+ "<div class='value'>" + score + "</div>"
		+ "<div class='detail'>" + parts.join ( " + " ) + ( records.score || bestBefore === "-" ? "" : "<br />Best : " + bestBefore ) + "</div></div>"
		+ "<div class='tiles'>"
		+ gameOverTile ( "Survived", minutes ( seconds ), seconds + " seconds", records.survival )
		+ gameOverTile ( "Destroyed", nbrDestroyed, nbrGiants > 0 ? "with " + nbrGiants + ( nbrGiants > 1 ? " giants" : " giant" ) : "asteroids", false )
		+ gameOverTile ( "Mat gathered", MyPlanet.totalMat, "mat", records.mat )
		+ gameOverTile ( "Accuracy", accuracy + "%", ( nbrShots - nbrLostShots ) + " of " + nbrShots + " shots hit", records.accuracy )
		+ gameOverTile ( "Hits taken", nbrCrashes, nbrDamage + "M inhabitants lost", false )
		+ gameOverTile ( "Upgrades", nbrUpgrades, nbrCost + " mat spent", records.upgrades || records.spent )
		+ "</div>" + tipCard ( tip );
	// the achievements of the game, with their medals (achievements.js)
	if ( newAchievements.length > 0 ) {
		html += "<div class='unlocked'><div class='label'>Achievements unlocked</div>";
		for ( var a in newAchievements ) {
			html += "<div class='medal'>" + medalSVG ( newAchievements[a] ) + "<div class='name'>" + achievements[newAchievements[a]].name + "</div></div>";
		}
		html += "</div>";
	}
	html += "<div class='buttons'><a href='#' class='button' onClick='state=\"init\";'>Retry</a><a href='#' class='button' onClick='state=\"menu\";'>Main Menu</a></div></div>";
	holder.innerHTML = html;
	achievementQueue = [];		// their banners would go on behind this screen, which shows their medals
}

// function to show the hi-scores of a difficulty level, the chosen one first : the others are shown by their tabs
function showHiScores ( holder, level ) {
	var record = function ( name ) { return savedRecord ( name, level ); };
	hotTile = false;		// (no tip on this page)
	var levels = "";
	for ( var other in difficultyLevels ) {
		levels += "<a href='#' class='level" + ( other == level ? " current" : "" ) + "' onClick='showHiScores(document.getElementById(\"gameOver\"),\"" + other + "\");'>" + levelName ( other ) + "</a>";
	}
	var html = "<div class='over'><div class='title'>Hi-Scores</div><div class='levels'>" + levels + "</div>";
	if ( record ( "playedGames" ) == "-" ) {
		html += "<div class='empty'>No game played at this level yet.</div>";
	} else {
		html += "<div class='score'><div class='label'>Best score</div><div class='value'>" + record ( "bestScore" ) + "</div>"
			+ "<div class='detail'>" + record ( "playedGames" ) + " games played</div></div>"
			+ "<div class='tiles'>"
			+ gameOverTile ( "Longest survival", minutes ( record ( "survival" ) ), withUnit ( record ( "survival" ), " seconds" ), false )
			+ gameOverTile ( "Most mat", record ( "totalMat" ), "gathered in a game", false )
			+ gameOverTile ( "Best accuracy", withUnit ( record ( "accuracy" ), "%" ), "of the shots", false )
			+ gameOverTile ( "Most upgrades", record ( "nbrUpgrades" ), withUnit ( record ( "nbrCost" ), " mat spent at most" ), false )
			+ gameOverTile ( "Most hits taken", record ( "nbrCrashes" ), withUnit ( record ( "nbrDamage" ), "M inhabitants lost at most" ), false )
			+ gameOverTile ( "Games played", record ( "playedGames" ), "at this level", false )
			+ "</div>";
	}
	html += "<div class='buttons'><a href='#' class='button' onClick='state=\"menu\";'>Main Menu</a></div></div>";
	if ( record ( "playedGames" ) != "-" ) {
		html += "<div class='reset'><a href='#' onClick='resetHS(\"" + level + "\");'>reset hi-scores</a></div>";
	}
	holder.innerHTML = html;
}

// function to write a record with its unit, or a dash alone when it is not saved yet
function withUnit ( value, unit ) {
	return ( value == "-" ) ? value : value + unit;
}

// function to write a number of seconds as minutes and seconds (a record not saved yet stays a dash)
function minutes ( seconds ) {
	if ( seconds == "-" ) {
		return seconds;
	}
	return Math.floor ( seconds / 60 ) + ":" + ( "0" + seconds % 60 ).slice ( -2 );
}

// function to write one of the numbers of the game, with its record if it beat it, lit up when the tip shown is about it
function gameOverTile ( label, value, detail, record ) {
	var hot = hotTile && hotTile.indexOf ( label ) >= 0;
	return "<div class='tile" + ( record ? " record" : "" ) + ( hot ? " hot" : "" ) + "'><div class='label'>" + label + ( record ? " <span class='badge'>record</span>" : "" ) + "</div>"
		+ "<div class='value'>" + value + "</div><div class='detail'>" + detail + "</div></div>";
}

// function to get the accuracy of the game, in percents
function gameAccuracy () {
	return ( nbrShots > 0 ) ? Math.floor ( ( 1 - nbrLostShots / nbrShots ) * 100 ) : 0;
}

// function to know if a tip can advise an upgrade : brought by the level in the Adventure, and not at its maximum yet
function tipCan ( name ) {
	return adventureAllows ( name ) && !maxReached ( name );
}

// function to choose the tip of a game lost, among the ones that fit it
function lossTip () {
	var found = [];
	for ( var t in lossTips ) {
		var text = lossTips[t].text();
		if ( text ) {
			found.push ( { id : lossTips[t].id, tiles : lossTips[t].tiles, picture : lossTips[t].picture, text : text } );
		}
	}
	return chooseTip ( found );
}

// function to choose a tip among the ones that fit, in their order : the first one, or the second one when the first one
// was shown at the end of the game before ; it lights up its numbers (false : no tip)
function chooseTip ( found ) {
	var last = false;
	try {
		last = localStorage["lastTip"];
	} catch ( e ) {}
	var tip = ( found.length > 1 && found[0].id == last ) ? found[1] : ( found[0] || false );
	hotTile = tip ? tip.tiles : false;
	if ( tip ) {
		try {
			localStorage["lastTip"] = tip.id;
		} catch ( e ) {}
	}
	return tip;
}

// function to write the card of a tip, in the NAZA's blue : the picture of what it advises, and its text (nothing without a tip)
function tipCard ( tip ) {
	if ( !tip ) {
		return "";
	}
	var picture = ( tilePictures[tip.picture] || medalPictures[tip.picture] ).replace ( /INK/g, tipInk );
	return "<div class='tip'><svg viewBox='0 0 64 64'><g fill='none' stroke='" + tipInk + "' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>"
		+ picture + "</g></svg><div class='advice'><span class='label'>NAZA tip</span>" + tip.text + "</div></div>";
}
