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
//	  0 being the right and 90 the bottom ; from everywhere when not told), their speed (1 being the Arcade's), its splitting asteroids
//	  and comets mixed with them, its giants, coming last, and a swarm or a group of armored asteroids announced first (threats.js)
//	- a hunt or a survival (type) has no waves, but a time, a flow of asteroids (advanceFlow) and, for a hunt, the asteroids to destroy ;
//	  the boss (type) has its own fight (boss.js)
var adventureLevels = [
	{ name : "First Light", values : { planetMat : 20 },
		brings : [ "gravPower", "gravSort", "mCMSpeed", "mainPow", "mainSpeed" ],
		waves : [ { count : 2, gap : 4 }, { count : 3, gap : 4 }, { count : 4, gap : 3 } ],
		challenge : { text : "Gather 100 mat", test : function () { return MyPlanet.totalMat >= 100; } } },
	{ name : "Crossfire", values : { planetMat : 40 },
		brings : [ "gravShield", "gravScanner", "mCFireRate", "SMART", "kamikazeNbr", "kamikazeBuilding" ],
		waves : [ { count : 3, gap : 3 }, { count : 4, gap : 3 }, { count : 5, gap : 2.5, from : [0, 180] }, { count : 6, gap : 2, from : [90, 270] } ],
		challenge : { text : "Win in less than 1 minute 45", test : function () { return gameTime <= 105 * framesPerSecond; } } },
	{ name : "Heavy Metal", values : { planetMat : 80 },
		brings : [ "SaOW", "SaOCNumber", "SaOCFireRate", "SaOPow", "SaOSpeed", "MaxWAtATime", "healing", "healFact", "autoHeal", "maxMat" ],
		waves : [ { count : 3, gap : 3.5 }, { count : 4, gap : 3 }, { count : 5, gap : 3, from : [45, 225] }, { count : 5, gap : 2.5 }, { count : 3, gap : 3, giants : 1 } ],
		challenge : { text : "Destroy the giant before it travels a third of the way to your planet",
			test : function () { return giantClosest > gameSize / 2 - ( gameSize / 2 - MyPlanet.radius ) / 3; } } },
	{ name : "Comet Shower", type : "hunt", time : 150, goal : 15, values : { planetMat : 60 },
		brings : [ "critChance", "critDamage", "mCNumber" ],
		flow : { every : [6, 3], comets : 7 },
		challenge : { text : "Destroy 25 asteroids", test : function () { return nbrDestroyed >= 25; } } },
	{ name : "Shatterpoint", values : { planetMat : 100 },
		brings : [ "magneticW", "magneticCNumber", "magneticCFireRate", "magneticPow", "magneticSpeed", "gravPulse", "repulsion" ],
		waves : [ { count : 2, splitters : 3, gap : 3 }, { count : 3, splitters : 4, gap : 2.5 }, { count : 2, splitters : 5, gap : 2.5, from : [0, 180] },
			{ count : 4, splitters : 4, comets : 2, gap : 2 }, { count : 2, splitters : 7, gap : 2, from : [90, 270] } ],
		challenge : { text : "Let no splinter touch your planet", test : function () { return splinterHits == 0; } } },
	{ name : "Hold the Line", type : "survival", time : 180, values : { planetMat : 100 },
		brings : [ "crews", "maxHealth", "recovery", "gravProspector" ],
		flow : { every : [5, 2.5], comets : 12, split : 0.2 },
		challenge : { text : "Lose fewer than 5 million inhabitants", test : function () { return nbrDamage < 5; } } },
	{ name : "Swarm Season", values : { planetMat : 80 },
		brings : [ "lab", "missiles", "missileFireRate", "missilePow", "missileBlast" ],
		waves : [ { count : 6, gap : 2 }, { count : 6, swarm : true, gap : 2 }, { count : 7, splitters : 3, gap : 1.8, speed : 1.2 },
			{ count : 6, comets : 3, swarm : true, gap : 1.8 }, { count : 8, giants : 2, gap : 1.6, speed : 1.2 } ],
		challenge : { text : "Win in less than 3 minutes 20", test : function () { return gameTime <= 200 * framesPerSecond; } } },
	{ name : "Iron Rain", values : { planetMat : 60 },
		brings : [ "lasers", "laserPow", "laserDuration", "laserCooldown", "earlyWarning" ],
		waves : [ { count : 7, gap : 2, speed : 1.2 }, { count : 5, armored : true, gap : 1.8 }, { count : 8, splitters : 3, gap : 1.6, speed : 1.2 },
			{ count : 6, comets : 3, armored : true, gap : 1.6 }, { count : 8, giants : 2, armored : true, gap : 1.5, speed : 1.3 } ],
		challenge : { text : "Destroy every armored asteroid before it gets halfway to your planet",
			test : function () { return armorClosest > ( gameSize / 2 + MyPlanet.radius ) / 2; } } },
	{ name : "The Gauntlet", type : "survival", time : 240, values : { planetMat : 100 },
		brings : [ "explosives", "nitroReload", "nitroPow", "nitroBlast" ],
		flow : { every : [6, 2.5], comets : 12, split : 0.15, giants : [110, 180, 225], swarms : [80, 200], armored : [140] },
		challenge : { text : "Lose fewer than 10 million inhabitants", test : function () { return nbrDamage < 10; } } },
	{ name : "The Colossus", type : "boss", values : { planetMat : 100 }, brings : [],
		challenge : { text : "Destroy the Colossus before it travels a third of the way to your planet",
			test : function () { return colossusClosest > colossusPost - ( colossusPost - MyPlanet.radius ) / 3; } } }
];
// the Adventure is shown on the start menu once it is ready ; until then, opening the game as index.html?adventure shows it, to test it
var adventureReady	= /adventure/.test ( location.search );
var sideSpread	= 25;		// how far from its side an asteroid of a wave may come, in degrees on each side
var waveBreak	= 2;		// seconds between a wave destroyed (or going away) and the next one,
var waveWait	= 20;		// and at most since its last asteroid came, when some of them are still there
var levelEnd	= 3;		// seconds of play once the last asteroid is gone, for its debris to be gathered
var cometDelay	= 4;		// seconds before the first comet of a hunt's or a survival's flow

// the level being played (its number in adventureLevels, null in the Arcade), its waves, and the banner telling them
//	- wave : the waves come so far ; queue : the asteroids of the wave still to come (true for a giant) ; timer : the turns until the next one
//	- calm : the turns since the last one came ; rest : the turns since the asteroids are all gone or going away ; ending : the turns until the level's end
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
	menuPage = "adventure";		// (the start menu comes back to its page after the game,
	mapChoice = false;			// and the map to the next level to play)
	state = "init";
}

// function to play the Arcade, at the difficulty level chosen
function playArcade () {
	adventure.level = null;
	menuPage = "arcade";
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
	adventure.failed = false;		// why a level was lost before the planet was destroyed (a hunt whose time is up)
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
// the asteroids of a wave come one after the other, and the next wave once they are all gone or going away (or after a while),
// until the level is won when the last one is gone (a hunt or a survival has its flow instead : advanceFlow)
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
	if ( level.type == "boss" ) {
		advanceBoss ( ctx, level );		// (boss.js)
		return;
	}
	if ( level.type ) {
		advanceFlow ( ctx, level );
		return;
	}
	if ( adventure.queue.length > 0 ) {
		adventure.timer--;
		if ( adventure.timer <= 0 ) {
			var wave = level.waves[adventure.wave - 1];
			launchWaveItem ( ctx, adventure.queue.shift(), wave );
			adventure.timer = Math.round ( ( wave.gap || 2 ) * framesPerSecond );
		}
		return;
	}
	adventure.calm++;
	adventure.rest = noThreatLeft() ? adventure.rest + 1 : 0;
	if ( adventure.wave == level.waves.length ) {
		if ( adventure.rest > 0 ) {
			adventure.ending = levelEnd * framesPerSecond;
			adventure.banner = { text : "Level complete", from : gameTime, time : levelEnd };
		}
	} else if ( adventure.rest >= waveBreak * framesPerSecond || adventure.calm >= waveWait * framesPerSecond ) {
		startWave ( level );
	}
}

// function to know if the asteroids left are no more a threat : all destroyed, or going away from the planet with no crash ahead
// (as if the Gravitron stays where it is : crashTime, functions.js) ; the ones going away vanish far from the planet (engine.js)
function noThreatLeft () {
	for ( var a in asteroidList ) {
		var asteroid = asteroidList[a];
		var away = ( asteroid.x - MyPlanet.x ) * asteroid.vx + ( asteroid.y - MyPlanet.y ) * asteroid.vy > 0;
		if ( !away || crashTime ( asteroid ) !== false ) {
			return false;
		}
	}
	return true;
}

// function to start the next wave of the level : its asteroids, splitting ones and comets mixed, then its giants ;
// a swarm or a group of armored asteroids is announced first, and comes once its countdown is over (threats.js)
function startWave ( level ) {
	var wave = level.waves[adventure.wave];
	adventure.wave++;
	var mixed = [];
	for ( var n = 0; n < ( wave.count || 0 ); n++ ) {
		mixed.push ( "rock" );
	}
	for ( var n = 0; n < ( wave.splitters || 0 ); n++ ) {
		mixed.push ( "splitter" );
	}
	for ( var n = 0; n < ( wave.comets || 0 ); n++ ) {
		mixed.push ( "comet" );
	}
	mixed.sort ( function () { return Math.random() - 0.5; } );
	adventure.queue = [];
	adventure.timer = 0;
	if ( wave.swarm || wave.armored ) {
		// the countdown of the announce, waited for before the rest of the wave
		adventure.queue.push ( "wait" );
		adventure.timer = announceTime * framesPerSecond;
		if ( wave.swarm ) {
			announceSwarm ( announceTime );
		} else {
			announceArmored ( announceTime );
		}
	}
	adventure.queue = adventure.queue.concat ( mixed );
	for ( var g = 0; g < ( wave.giants || 0 ); g++ ) {
		adventure.queue.push ( "giant" );
	}
	adventure.calm = 0;
	adventure.rest = 0;
	adventure.banner = { text : "Wave " + adventure.wave + "/" + level.waves.length, from : gameTime, time : 2.5 };
}

// function to launch what comes next in a wave : an asteroid, a giant, a splitting one or a comet (the wait of an announce : nothing)
function launchWaveItem ( ctx, item, wave ) {
	if ( item == "comet" ) {
		launchComet ( ctx );
	} else if ( item != "wait" ) {
		var asteroid = launchAsteroid ( ctx, waveAngle ( wave ), item == "giant", wave.speed );
		if ( item == "splitter" ) {
			makeSplitter ( asteroid );
		}
	}
}

// THE HUNTS AND THE SURVIVALS : a level of one of these types has a flow of asteroids coming on a timer, faster and faster,
// instead of waves ; a survival is won once its time is over, a hunt if enough asteroids were destroyed by then
//	- the flow : the seconds between two asteroids, at the start and at the end, the part of them splitting ones,
//	  the seconds between two comets, and the times of the giants, of the swarms and of the groups of armored asteroids
//	  (these two announced before)
function advanceFlow ( ctx, level ) {
	var flow = level.flow;
	adventure.timer--;
	if ( adventure.timer <= 0 ) {
		var share = Math.min ( 1, gameTime / ( level.time * framesPerSecond ) );
		adventure.timer = Math.round ( ( flow.every[0] + ( flow.every[1] - flow.every[0] ) * share ) * framesPerSecond );
		var asteroid = launchAsteroid ( ctx, Math.random() * 2 * Math.PI, false );
		if ( Math.random() < ( flow.split || 0 ) ) {
			makeSplitter ( asteroid );
		}
	}
	for ( var g in flow.giants ) {
		if ( gameTime == flow.giants[g] * framesPerSecond ) {
			launchAsteroid ( ctx, Math.random() * 2 * Math.PI, true );
		}
	}
	if ( gameTime == 1 ) {
		adventure.banner = { text : ( level.type == "hunt" ) ? "Destroy " + level.goal + "!" : "Survive " + minutes ( level.time ) + "!", from : gameTime, time : 2.5 };
	}
	if ( flow.comets && gameTime >= cometDelay * framesPerSecond ) {
		adventure.calm--;
		if ( adventure.calm <= 0 ) {
			launchComet ( ctx );
			adventure.calm = Math.round ( flow.comets * ( 0.6 + Math.random() * 0.8 ) * framesPerSecond );
		}
	}
	for ( var s in flow.swarms ) {
		if ( gameTime == ( flow.swarms[s] - announceTime ) * framesPerSecond ) {
			announceSwarm ( announceTime );
		}
	}
	for ( var a in flow.armored ) {
		if ( gameTime == ( flow.armored[a] - announceTime ) * framesPerSecond ) {
			announceArmored ( announceTime );
		}
	}
	if ( gameTime >= level.time * framesPerSecond ) {
		if ( level.type == "hunt" && nbrDestroyed < level.goal ) {
			failLevel ( "time is up: " + nbrDestroyed + " of " + level.goal + " asteroids destroyed" );
		} else {
			adventure.ending = levelEnd * framesPerSecond;
			adventure.banner = { text : "Level complete", from : gameTime, time : levelEnd };
		}
	}
}

// function to write a level's goal : its waves, the asteroids to destroy in a hunt, the time to survive
function levelGoal ( level ) {
	if ( level.type == "hunt" ) {
		return "Hunt: destroy " + level.goal + " asteroids in " + minutes ( level.time );
	}
	if ( level.type == "survival" ) {
		return "Survival: hold on for " + minutes ( level.time );
	}
	if ( level.type == "boss" ) {
		return "Boss: destroy the Colossus";
	}
	return level.waves.length + " waves";
}

// function to write the status bar's gauges of the Adventure (showStatus, functions.js) : the waves come so far,
// or the asteroids destroyed in a hunt and its time left, or the time survived
function adventureGauges () {
	var level = adventureLevels[adventure.level];
	var seconds = Math.min ( level.time || 0, Math.floor ( gameTime / framesPerSecond ) );
	if ( level.type == "hunt" ) {
		return statusGauge ( "Hunt", nbrDestroyed / level.goal, "#8fb8ff", nbrDestroyed, level.goal, 0 )
			+ statusGauge ( "Time", 1 - seconds / level.time, "#f2c94c", minutes ( level.time - seconds ), minutes ( level.time ), 0 );
	}
	if ( level.type == "survival" ) {
		return statusGauge ( "Time", seconds / level.time, "#8fb8ff", minutes ( seconds ), minutes ( level.time ), 0 );
	}
	if ( level.type == "boss" ) {
		var life = colossus ? Math.max ( 0, colossus.life ) : colossusLife;		// (boss.js)
		return statusGauge ( "Colossus", life / colossusLife, colossusColors[Math.min ( 3, Math.max ( 1, bossPhase ) ) - 1], life, colossusLife, 0 );
	}
	return statusGauge ( "Wave", adventure.wave / level.waves.length, "#8fb8ff", adventure.wave, level.waves.length, 0 );
}

// function to end a level lost before the planet was destroyed (a hunt whose time is up) : the game stops behind the level's end
function failLevel ( reason ) {
	adventure.failed = reason;
	pause = 3;
	laserCannon.firing = 0;
	checkAchievements();
	document.getElementById("status").style.display = "none";
	var holder = document.getElementById("gameOver");
	holder.style.display = "block";
	showLevelEnd ( holder, false );
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
		+ "<div class='subtitle'>Level " + levelLabel ( adventure.level ) + " &middot; <strong>" + level.name + "</strong>"
		+ ( won ? "" : " &middot; " + ( adventure.failed || "your planet has been destroyed" ) ) + "</div>"
		+ "<div class='stars'>";
	for ( var s = 0; s < 3; s++ ) {
		html += "<div class='star" + ( stars[s] ? " won" : "" ) + "'><span>&#9733;</span><div class='reason'>" + reasons[s] + "</div></div>";
	}
	html += "</div><div class='tiles'>"
		+ gameOverTile ( "Time", minutes ( seconds ), seconds + " seconds", false )
		+ levelTile ( level, won )
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
	html += "<a href='#' class='button' onClick='state=\"map\";'>Map</a></div></div>";
	holder.innerHTML = html;
	achievementQueue = [];		// their banners would go on behind this screen, which shows their medals
}

// function to write the level end's tile of the level's goal : the waves destroyed, the asteroids of a hunt, or the time survived
function levelTile ( level, won ) {
	if ( level.type == "hunt" ) {
		return gameOverTile ( "Hunt", nbrDestroyed + "/" + level.goal, "asteroids destroyed", false );
	}
	if ( level.type == "survival" ) {
		return gameOverTile ( "Survived", minutes ( Math.min ( level.time, Math.floor ( gameTime / framesPerSecond ) ) ), "of " + minutes ( level.time ), false );
	}
	if ( level.type == "boss" ) {
		var left = ( won || !colossus ) ? ( won ? 0 : 100 ) : Math.ceil ( Math.max ( 0, colossus.life ) / colossusLife * 100 );
		return gameOverTile ( "Colossus", won ? "Destroyed" : left + "%", won ? "the boss is down" : "of its life left", false );
	}
	return gameOverTile ( "Waves", Math.max ( 0, adventure.wave - ( won ? 0 : 1 ) ) + "/" + level.waves.length, "destroyed", false );
}

// function to write the stars of a level : the ones won full, the others empty
function starsText ( stars ) {
	var text = "";
	for ( var s = 0; s < 3; s++ ) {
		text += ( stars && stars[s] ) ? "★" : "☆";
	}
	return text;
}

// the start menu's page shown : the Adventure's first, then the one of the mode last played ; the Arcade's alone until the Adventure is ready
var menuPage = adventureReady ? "adventure" : "arcade";

// function to show the start menu's pages, at each turn of the menu (engine.js) : the Adventure's and the Arcade's side by side,
// sliding to the one shown (css/main.css), with a big arrow on the side turning to the other one ;
// the Adventure's button starts it, or continues it once a level is won (in green), on the map, and tells the next level and the stars won
function showMenuPages () {
	var menu = document.getElementById("mainMenu");
	menu.classList.toggle ( "adventure", adventureReady );
	menu.classList.toggle ( "arcade", menuPage == "arcade" );
	var started = adventureStarted();
	var button = document.getElementById("adventureStart");
	writeOnce ( button, started ? "Continue" : "Start" );
	button.classList.toggle ( "continue", started );
	var next = nextLevel();
	var allWon = levelStars[next] && levelStars[next][0];		// (every level made so far is won)
	writeOnce ( document.getElementById("adventureNext"), !started ? "Save the Earth, level after level"
		: allWon ? "Every level won so far: more are coming" : "Next level: " + levelLabel ( next ) + " · " + adventureLevels[next].name );
	writeOnce ( document.getElementById("adventureStars"), started ? "★ " + starsCount() + " / " + mapSpots.length * 3 : "" );
	showBonusIcons();		// and the bonuses bought with the stars (starshop.js)
}

// function to name a level by its world and its place in it : 1-5 for the fifth level of the first world
function levelLabel ( n ) {
	return "1-" + ( n + 1 );
}

// function to write a text into an element, only when it changes (the start menu writes its texts at each turn)
function writeOnce ( element, text ) {
	if ( element.textContent != text ) {
		element.textContent = text;
	}
}

// function to know if the Adventure is started : a level won at least
function adventureStarted () {
	for ( var n in levelStars ) {
		if ( levelStars[n] && levelStars[n][0] ) {
			return true;
		}
	}
	return false;
}

// function to count the stars won in the Adventure
function starsCount () {
	var count = 0;
	for ( var n in levelStars ) {
		for ( var s = 0; s < 3; s++ ) {
			count += ( levelStars[n] && levelStars[n][s] ) ? 1 : 0;
		}
	}
	return count;
}

// function to turn the start menu to a page, or else to the other one
function turnMenuPage ( page ) {
	if ( adventureReady ) {
		menuPage = page || ( ( menuPage == "arcade" ) ? "adventure" : "arcade" );
	}
}

// the keyboard's arrows turn the start menu's pages too
document.addEventListener ( "keydown", function ( e ) {
	if ( state == "menu" && e.key == "ArrowRight" ) {
		turnMenuPage ( "arcade" );
	} else if ( state == "menu" && e.key == "ArrowLeft" ) {
		turnMenuPage ( "adventure" );
	}
} );

// THE MAP : the first world's levels on a winding path, the boss last and bigger ; the levels not made yet are on it, coming soon
// (the spots' centers, in the pixels of the map's road, under its bar)
var mapSpots = [ [70, 270], [180, 290], [290, 262], [400, 282], [500, 222], [420, 150], [300, 166], [185, 142], [95, 84], [290, 50] ];
var mapChoice = false;		// the level chosen on the map, told under it (false : the next one to play)

// function to show the map : its bar, its road, a spot for each level with its stars, and the level chosen under it,
// with its challenge and the button to play it
function showMap ( holder ) {
	if ( mapChoice === false ) {
		mapChoice = nextLevel();
	}
	var open = 0;	// the last level open : the road is lit up to it
	while ( open + 1 < adventureLevels.length && levelOpen ( open + 1 ) ) {
		open++;
	}
	var html = "<div class='map'><div class='bar'><a href='#' class='level' onClick='state=\"menu\";'>&lsaquo; Menu</a>"
		+ "<span class='world'>World 1</span><span class='count'>&#9733; " + starsCount() + " / " + mapSpots.length * 3
		+ " <a href='#' class='level" + ( starsLeft() > 0 ? " spend" : "" ) + "' onClick='state=\"upgrades\";'>Upgrades" + ( starsLeft() > 0 ? " (" + starsLeft() + " &#9733;)" : "" ) + "</a></span></div>"
		+ "<div class='road'><svg viewBox='0 0 566 340'><path class='way' d='" + mapRoad ( mapSpots ) + "'/>"
		+ "<path class='lit' d='" + mapRoad ( mapSpots.slice ( 0, open + 1 ) ) + "'/></svg>";
	for ( var n = 0; n < mapSpots.length; n++ ) {
		html += "<a href='#' class='spot " + spotState ( n ) + ( n == mapSpots.length - 1 ? " boss" : "" ) + ( n == mapChoice ? " chosen" : "" ) + "'"
			+ " style='left:" + mapSpots[n][0] + "px;top:" + mapSpots[n][1] + "px' onClick='chooseSpot(" + n + ");'>"
			+ "<span class='number'>" + ( n + 1 ) + "</span>"
			+ "<span class='stars'>" + ( n < adventureLevels.length ? starsText ( levelStars[n] ) : ( n == mapSpots.length - 1 ? "Boss" : "" ) ) + "</span></a>";
	}
	html += "</div><div class='spotInfo'>" + spotInfo ( mapChoice ) + "</div></div>";
	holder.innerHTML = html;
}

// function to choose a level on the map, to read its challenge and play it
function chooseSpot ( n ) {
	mapChoice = n;
	showMap ( document.getElementById("adventureMap") );
}

// function to know the level to play next : the first one open and not won, or else the last one open
function nextLevel () {
	for ( var n = 0; n < adventureLevels.length; n++ ) {
		if ( levelOpen ( n ) && !( levelStars[n] && levelStars[n][0] ) ) {
			return n;
		}
	}
	var last = 0;
	while ( last + 1 < adventureLevels.length && levelOpen ( last + 1 ) ) {
		last++;
	}
	return last;
}

// function to know how a level's spot looks : "soon" (not made yet), "locked", "won", or "open"
function spotState ( n ) {
	if ( n >= adventureLevels.length ) {
		return "soon";
	}
	if ( !levelOpen ( n ) ) {
		return "locked";
	}
	return ( levelStars[n] && levelStars[n][0] ) ? "won" : "open";
}

// function to tell about the level chosen on the map : its name and stars, its challenge and the button to play it,
// or what opens it
function spotInfo ( n ) {
	var boss = ( n == mapSpots.length - 1 );
	if ( n >= adventureLevels.length ) {
		return "<div class='name'>Level " + levelLabel ( n ) + ( boss ? " &middot; Boss" : "" ) + "</div><div class='text'>Coming soon" + ( boss ? ": the first boss of the Adventure." : "." ) + "</div>";
	}
	var level = adventureLevels[n];
	var html = "<div class='name'>Level " + levelLabel ( n ) + " &middot; " + level.name + " <span class='stars'>" + starsText ( levelStars[n] ) + "</span></div>";
	if ( !levelOpen ( n ) ) {
		return html + "<div class='text'>Win level " + levelLabel ( n - 1 ) + " to open it.</div>";
	}
	return html + "<div class='text'>" + levelGoal ( level ) + " &middot; Challenge: " + level.challenge.text + "</div>"
		+ "<a href='#' class='button' onClick='playLevel(" + n + ");'>Play</a>";
}

// function to draw the road of the map, a smooth curve through the centers of its spots (a Catmull-Rom spline, as an SVG path)
function mapRoad ( spots ) {
	var road = "M" + spots[0][0] + " " + spots[0][1];
	for ( var s = 0; s < spots.length - 1; s++ ) {
		var before = spots[Math.max ( s - 1, 0 )], from = spots[s], to = spots[s + 1], after = spots[Math.min ( s + 2, spots.length - 1 )];
		road += " C" + Math.round ( from[0] + ( to[0] - before[0] ) / 6 ) + " " + Math.round ( from[1] + ( to[1] - before[1] ) / 6 )
			+ " " + Math.round ( to[0] - ( after[0] - from[0] ) / 6 ) + " " + Math.round ( to[1] - ( after[1] - from[1] ) / 6 )
			+ " " + to[0] + " " + to[1];
	}
	return road;
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
