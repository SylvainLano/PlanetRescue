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


// The Game Over screen : the score of the game, its numbers, the records it beat and the achievements it brought,
// and the hi-scores page, with the records of each difficulty level
// (until 2026, both were pages of sentences ; the records are saved as they were, by difficulty level)

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
	var accuracy = ( nbrShots > 0 ) ? Math.floor ( ( 1 - nbrLostShots / nbrShots ) * 100 ) : 0;
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
		+ "</div>";
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

// function to write one of the numbers of the game, with its record if it beat it
function gameOverTile ( label, value, detail, record ) {
	return "<div class='tile" + ( record ? " record" : "" ) + "'><div class='label'>" + label + ( record ? " <span class='badge'>record</span>" : "" ) + "</div>"
		+ "<div class='value'>" + value + "</div><div class='detail'>" + detail + "</div></div>";
}
