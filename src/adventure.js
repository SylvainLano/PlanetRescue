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


// The Adventure : levels to win one after the other, each with its waves of asteroids and its own shop in the pause menu,
// and three stars to win in each one : the level won, more than half of the inhabitants saved, and its own challenge
// (a star stays won once won, and winning a level opens the next one : the browser remembers it)

// the levels : their line of the NAZA's log, the rain they are in the story (shown on the map : story.js),
// what they change from the starting values (as the difficulty levels do : parameters.js ; a store big enough for the weapon
// a level offers), their shop (the upgrades, weapons and research branches the pause menu sells in it alone, a few at a time
// for the player to learn them : a weapon of it comes without the ones before it, shop.js), their waves and their challenge
// (with the NAZA's tip to win it, its picture and the numbers of the level's end it lights up : gameover.js)
//	- a wave : its asteroids, the seconds between two of them, the sides they come from (in degrees around the planet,
//	  0 being the right and 90 the bottom ; from everywhere when not told), their speed (1 being the Arcade's), its splitting asteroids
//	  and comets mixed with them, its giants, coming last, and a swarm or a group of armored asteroids announced first (threats.js)
//	- a hunt or a survival (type) has no waves, but a time, a flow of asteroids (advanceFlow) and, for a hunt, the asteroids to destroy ;
//	  the boss (type) has its own fight (boss.js)
//	- a bonus level is off the path, open once the level it follows (after) is won, on its own spot of the map : a simulation, in the
//	  NAZA's simulator (its own look : drawSimulation), testing the prototype of a weapon, there from the start ; won, the prototype goes
//	  into production, and its upgrades come to every level's shop (unlocks)
// (the first world opens little : the basic weapon, the Gravitron, the planet and the kamikazes, the Spiral in its bonus level ;
// the other weapons and the researches wait for the next worlds ; the wide shop of its last levels, as a final exam, sells all of it)
var wideShop = [ "mainPow", "mCNumber", "mCFireRate", "mainSpeed", "mCMSpeed", "SMART", "critChance", "critDamage",
	"gravPower", "gravSort", "gravOpening", "gravShield", "gravPulse", "repulsion",
	"healing", "healFact", "crews", "maxHealth", "autoHeal", "maxMat", "recovery", "earlyWarning", "kamikazeNbr", "kamikazeBuilding" ];
var mainLevels = 10;		// the levels of the path, the boss last : the bonus levels come after them
var adventureLevels = [
	{ name : "First Light", log : "Rain 41. A small one, they say. A good one to learn on.",
		values : { planetMat : 20 },
		shop : [ "mainPow", "gravPower", "gravSort", "gravOpening" ],
		waves : [ { count : 2, gap : 4 }, { count : 3, gap : 4 }, { count : 4, gap : 3 } ],
		challenge : { text : "Gather 100 mat", test : function () { return MyPlanet.totalMat >= 100; },
			hint : "Turn your Gravitron's opening toward the debris (&larr; &rarr;) and widen it (&darr;): the more it pulls in, the more mat you gather.",
			picture : "pull", tiles : [ "Mat gathered" ] } },
	{ name : "Crossfire", log : "Rain 42. From two sides at once, this time. As if they were aimed.",
		values : { planetMat : 40 },
		shop : [ "mainPow", "mCFireRate", "mCMSpeed", "SMART", "kamikazeNbr", "kamikazeBuilding" ],
		waves : [ { count : 3, gap : 3 }, { count : 4, gap : 3 }, { count : 5, gap : 2.5, from : [0, 180] }, { count : 6, gap : 2, from : [90, 270] } ],
		challenge : { text : "Win in less than 1 minute 45", test : function () { return gameTime <= 105 * framesPerSecond; },
			hint : "The next wave comes as soon as the last asteroid is gone: more Fire Power and a shorter Cooldown shorten every wave.",
			picture : "bolt", tiles : [ "Time" ] } },
	{ name : "Heavy Metal", log : "Rain 43. One of them is huge and slow. If it lands, there will be little left to save.",
		values : { planetMat : 80 },
		shop : [ "mainPow", "mCFireRate", "healing", "autoHeal", "kamikazeNbr" ],
		waves : [ { count : 3, gap : 3.5 }, { count : 4, gap : 3 }, { count : 5, gap : 3, from : [45, 225] }, { count : 5, gap : 2.5 }, { count : 3, gap : 3, giants : 1 } ],
		challenge : { text : "Destroy the giant before it travels a third of the way to your planet",
			test : function () { return giantClosest > gameSize / 2 - ( gameSize / 2 - MyPlanet.radius ) / 3; },
			hint : "Raise your Fire Power before the last wave, and aim at the giant with T as soon as it shows up.",
			picture : "flame", tiles : [ "Destroyed" ] } },
	{ name : "Comet Shower", log : "Rain 44. Ice, this time. The inhabitants call it the cold rain, and its debris are worth a lot.",
		type : "hunt", time : 150, goal : 15, values : { planetMat : 100 },
		shop : [ "mainPow", "mCNumber", "SMART", "critChance" ],
		flow : { every : [7, 4], comets : 10 },
		challenge : { text : "Destroy 32 asteroids", test : function () { return nbrDestroyed >= 32; },
			hint : "The comets are fast, but break in one shot: SMART AI 2 aims ahead of them, and more Cannons destroy more of everything in the same time.",
			picture : "cannons", tiles : [ "Hunt" ] } },
	{ name : "Shatterpoint", log : "Rain 45. Cracked rocks, glowing red. They burst when they break: keep them far.",
		values : { planetMat : 100 },
		shop : [ "mainPow", "mainSpeed", "gravPower", "gravShield", "repulsion" ],
		waves : [ { count : 3, splitters : 5, gap : 2.3, speed : 1.1 }, { count : 5, splitters : 7, gap : 1.9, speed : 1.1 },
			{ count : 3, splitters : 9, gap : 1.9, from : [0, 180], speed : 1.1 }, { count : 7, splitters : 7, comets : 3, gap : 1.5, speed : 1.1 },
			{ count : 3, splitters : 12, gap : 1.5, from : [90, 270], speed : 1.1 } ],
		challenge : { text : "Let no splinter touch your planet", test : function () { return splinterHits == 0; },
			hint : "Break the splitting asteroids far from your planet: aim at them with T as soon as they come, before their splinters are close.",
			picture : "burst", tiles : [ "Inhabitants" ] } },
	{ name : "Hold the Line", log : "Rain 46. The longest one yet. No waves, no rest: just hold on.",
		type : "survival", time : 180, values : { planetMat : 100 },
		shop : [ "gravShield", "gravPulse", "healing", "healFact", "crews", "maxHealth" ],
		flow : { every : [3, 1.5], speed : 1.1, comets : 7.3, split : 0.2 },
		challenge : { text : "Lose fewer than 5 million inhabitants", test : function () { return nbrDamage < 5; },
			hint : "Every hit counts, even healed: the Gravitron Shield and its Pulse stop the asteroids before they land.",
			picture : "shield", tiles : [ "Inhabitants" ] } },
	{ name : "Swarm Season", log : "Rain 47. Pebbles flying together, in swarms, like birds. Small ones, but so many.",
		values : { planetMat : 80 },
		shop : [ "mainPow", "mCNumber", "mCFireRate", "SMART", "gravShield" ],
		waves : [ { count : 10, gap : 1.5, speed : 1.1 }, { count : 10, swarm : true, gap : 1.5, speed : 1.1 },
			{ count : 12, splitters : 5, gap : 1.4, speed : 1.3 }, { count : 10, comets : 5, swarm : true, gap : 1.4, speed : 1.1 },
			{ count : 14, giants : 2, gap : 1.2, speed : 1.3 } ],
		challenge : { text : "Win in less than 3 minutes 20", test : function () { return gameTime <= 200 * framesPerSecond; },
			hint : "The next wave comes as soon as the last asteroid is gone: more Cannons and a shorter Cooldown clear the swarms fast.",
			picture : "blast", tiles : [ "Time" ] } },
	{ name : "Iron Rain", log : "Rain 48. Steel plates, rivets, seams. Rocks don't grow rivets.",
		values : { planetMat : 60 },
		shop : [ "mainPow", "SMART", "mCFireRate", "critChance", "critDamage", "kamikazeNbr" ],
		waves : [ { count : 9, gap : 1.9, speed : 1.1 }, { count : 5, armored : true, gap : 1.9, speed : 1.1 },
			{ count : 10, splitters : 3, gap : 1.7, speed : 1.2 }, { count : 7, comets : 3, armored : true, gap : 1.7, speed : 1.1 },
			{ count : 10, giants : 1, armored : true, gap : 1.5, speed : 1.2 } ],
		challenge : { text : "Destroy every armored asteroid before it travels three quarters of the way to your planet",
			test : function () { return armorClosest > gameSize / 2 - ( gameSize / 2 - MyPlanet.radius ) * 3 / 4; },
			hint : "Aim at each armored asteroid with T as soon as it comes: their plates absorb 3 of each shot's power, so raise your Fire Power early; the critical shots go through whole.",
			picture : "flame", tiles : [ "Destroyed" ] } },
	{ name : "The Gauntlet", log : "Rain 49. Everything at once. The NAZA has never seen a rain like this one.",
		type : "survival", time : 240, values : { planetMat : 100 },
		shop : wideShop,
		flow : { every : [3.1, 1.3], speed : 1.15, comets : 6.2, split : 0.15, giants : [110, 180, 225], swarms : [80, 200], armored : [140] },
		challenge : { text : "Lose fewer than 10 million inhabitants", test : function () { return nbrDamage < 10; },
			hint : "The giants come at 1:50, 3:00 and 3:45: raise your Fire Power before, and aim at each one with T as soon as it shows up.",
			picture : "blast", tiles : [ "Inhabitants" ] } },
	{ name : "The Colossus", log : "Rain 50. Something as big as a moon is coming.",
		type : "boss", values : { planetMat : 100 },
		shop : wideShop,
		challenge : { text : "Destroy the Colossus before it travels a third of the way to your planet",
			test : function () { return colossusClosest > colossusPost - ( colossusPost - MyPlanet.radius ) / 3; },
			hint : "Send a kamikaze into the Colossus: the blow spins it half a turn, its bare rock toward you. Its plates stop most of the hits under 8 of power.",
			picture : "rock", tiles : [ "Colossus" ] } },
	// the bonus levels
	{ name : "The Prototype", log : "The engineers have built a new cannon. Before it goes into production, it must pass the NAZA's simulator.",
		bonus : true, after : 2, spot : [232, 205], icon : "spiral", simulation : true, prototype : "SaOW",
		unlocks : [ "SaOW", "SaOCNumber", "SaOCFireRate", "SaOPow", "SaOSpeed" ],
		values : { planetMat : 100 },
		shop : [ "SaOCNumber", "SaOCFireRate", "SaOPow", "SaOSpeed" ],
		waves : [ { count : 8, gap : 1.8 }, { count : 6, swarm : true, gap : 2 }, { count : 6, splitters : 4, gap : 1.8 },
			{ count : 6, comets : 3, swarm : true, gap : 1.8 } ],
		challenge : { text : "Let no swarm pebble touch your planet", test : function () { return pebbleHits == 0; },
			hint : "The Spiral's shots turn around your planet: with three Cannons, its Orbital mode makes a wall that the pebbles can't cross.",
			picture : "spread", tiles : [ "Inhabitants" ] } }
];
// the Adventure is shown on the start menu since 1.0.0 (until then, only to the game opened as index.html?adventure, to test it)
var adventureReady	= true;
var sideSpread	= 25;		// how far from its side an asteroid of a wave may come, in degrees on each side
var waveBreak	= 2;		// seconds between a wave destroyed (or going away) and the next one,
var waveWait	= 20;		// and at most since its last asteroid came, when some of them are still there
var levelEnd	= 3;		// seconds of play once the last asteroid is gone, for its debris to be gathered
var cometDelay	= 4;		// seconds before the first comet of a hunt's or a survival's flow
var waveAnnounce	= 15;		// seconds between the announce of a wave's swarm or armored group and its coming, the wave coming meanwhile
							// (the Arcade's announces give 30 : threats.js)

// the level being played (its number in adventureLevels, null in the Arcade), its waves, and the banner telling them
//	- wave : the waves come so far ; queue : the asteroids of the wave still to come (true for a giant) ; timer : the turns until the next one
//	- calm : the turns since the last one came ; rest : the turns since the asteroids are all gone or going away ; ending : the turns until the level's end
var adventure = { level : null, wave : 0, queue : [], timer : 0, calm : 0, rest : 0, ending : 0, banner : false };

// the Adventure's difficulty level, remembered by the browser : each one is an adventure of its own, with its own levels won, stars
// and bonuses of the stars' tree, saved under its own names (adventureKey) ; the stories seen are the same for all (story.js)
var adventureDifficulty = /^(easy|normal|hard)$/.test ( localStorage["adventureDifficulty"] ) ? localStorage["adventureDifficulty"] : "normal";

// function to get the name a save of the Adventure has at its difficulty level, the normal one keeping the original names
// (as the hi-scores of the Arcade : scoreKey, functions.js)
function adventureKey ( name ) {
	return ( adventureDifficulty == "normal" ) ? name : name + "_" + adventureDifficulty;
}

// what the difficulty level changes, the same in every level : its density, the asteroids of the waves and of the flows that many
// times as many (closer, a bit faster), the Colossus's throws, charge and debris as much (boss.js) ; a hunt's asteroids only go
// faster or slower, as many coming, for its goal to stay the same
var adventureDensity = { easy : 0.7, normal : 1, hard : 1.3 };

// function to get the density of the level being played, at the Adventure's difficulty level (1 in the Arcade)
function levelDensity () {
	return inAdventure() ? adventureDensity[adventureDifficulty] : 1;
}

// function to get how much faster the asteroids go at a density
function densitySpeed ( dense ) {
	return 1 + ( dense - 1 ) * 0.15;
}

// function to get a wave as the difficulty level plays it : that many times as many asteroids, splitting ones and comets (one at
// least of each kind it has), closer by the square root of it and a bit faster ; its giants, swarm or armored group the same
function denseWave ( wave ) {
	var dense = levelDensity(), copy = {};
	for ( var field in wave ) {
		copy[field] = wave[field];
	}
	var kinds = [ "count", "splitters", "comets" ];
	for ( var k in kinds ) {
		if ( wave[kinds[k]] ) {
			copy[kinds[k]] = Math.max ( 1, Math.round ( wave[kinds[k]] * dense ) );
		}
	}
	copy.gap = ( wave.gap || 2 ) / Math.sqrt ( dense );
	copy.speed = ( wave.speed || 1 ) * densitySpeed ( dense );
	return copy;
}

// function to choose the Adventure's difficulty level, on the start menu : its own adventure, its stars and bonuses read
function chooseAdventureLevel ( level ) {
	adventureDifficulty = level;
	try {
		localStorage["adventureDifficulty"] = level;
	} catch ( e ) {}
	levelStars = loadLevelStars();
	starBonuses = loadStarBonuses();		// (starshop.js)
	mapChoice = false;
}

// function to restart the Adventure at its difficulty level from its first level, once the player confirms it : its stars and
// bonuses forgotten (the other difficulty levels' adventures, the achievements obtained and the stories seen kept)
function restartAdventure () {
	if ( !confirm ( "Restart the " + levelName ( adventureDifficulty ) + " adventure? Its stars and bonuses will be lost." ) ) {
		return;
	}
	try {
		localStorage.removeItem ( adventureKey ( "adventure" ) );
		localStorage.removeItem ( adventureKey ( "adventureTree" ) );
	} catch ( e ) {}
	levelStars = [];
	starBonuses = {};
	mapChoice = false;
}

// the stars won in each level, saved by the browser : three for each level, the ones won being true
var levelStars = loadLevelStars();

// function to read the stars won, saved by the browser
function loadLevelStars () {
	try {
		var saved = JSON.parse ( localStorage[adventureKey ( "adventure" )] || "[]" );
		return Array.isArray ( saved ) ? saved : [];
	} catch ( e ) {
		return [];
	}
}

// function to know if a level of the Adventure is being played
function inAdventure () {
	return adventure.level !== null;
}

// function to know if a level is won
function levelWon ( number ) {
	return levelStars[number] && levelStars[number][0] ? true : false;
}

// function to know if a level can be played : the first one, the ones after a level won, and a bonus level once the one it follows is won
function levelOpen ( number ) {
	var level = adventureLevels[number];
	return level.bonus ? levelWon ( level.after ) : number == 0 || levelWon ( number - 1 );
}

// function to know how many levels of the path are open, one after the other : the map shows them alone, the next rains staying unknown
function levelsOpen () {
	var count = 1;
	while ( count < mainLevels && levelOpen ( count ) ) {
		count++;
	}
	return count;
}

// function to list the bonus levels open
function bonusesOpen () {
	var found = [];
	for ( var n = mainLevels; n < adventureLevels.length; n++ ) {
		if ( levelOpen ( n ) ) {
			found.push ( n );
		}
	}
	return found;
}

// function to count the stars of the levels open, the bonus ones too
function starsOpen () {
	return ( levelsOpen() + bonusesOpen().length ) * 3;
}

// function to know if the Adventure has shown something to the player : an upgrade or a weapon sold in a level of the path already
// open, or brought by a bonus level won (the tree of the stars hides its cells until then : starshop.js)
function metInAdventure ( name ) {
	for ( var n = 0; n < levelsOpen(); n++ ) {
		if ( adventureLevels[n].shop.indexOf ( name ) >= 0 ) {
			return true;
		}
	}
	for ( var n = mainLevels; n < adventureLevels.length; n++ ) {
		if ( levelWon ( n ) && adventureLevels[n].unlocks.indexOf ( name ) >= 0 ) {
			return true;
		}
	}
	return false;
}

// function to play a level of the Adventure, from the start menu or the level's end
function playLevel ( number ) {
	if ( !levelOpen ( number ) ) {
		return;
	}
	adventure.level = number;
	tutorial.on = false;		// (tutorial.js)
	menuPage = "adventure";		// (the start menu comes back to its page after the game,
	mapChoice = false;			// and the map to the next level to play)
	state = "init";
}

// function to play the Arcade, at the difficulty level chosen
function playArcade () {
	adventure.level = null;
	tutorial.on = false;
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

// function to give a level what it starts with, after the bonuses of the stars (engine.js) : the prototype a simulation tests,
// built and active next to the basic cannon
function startLevel () {
	var level = adventureLevels[adventure.level];
	if ( level.prototype ) {
		var weapon = weaponOfType ( level.prototype );
		weapon.cannonNbr = Math.max ( weapon.cannonNbr, 1 );
		activate ( level.prototype );
	}
}

// function to know if the shop of the level being played sells something in the pause menu : an upgrade, a weapon or a branch of
// the research tree, its own shop only, and what the bonus levels won bring to every level (anything in the Arcade)
function adventureAllows ( name ) {
	if ( !inAdventure() ) {
		return true;
	}
	if ( adventureLevels[adventure.level].shop.indexOf ( name ) >= 0 ) {
		return true;
	}
	for ( var n = mainLevels; n < adventureLevels.length; n++ ) {
		if ( levelWon ( n ) && adventureLevels[n].unlocks.indexOf ( name ) >= 0 ) {
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
			var wave = denseWave ( level.waves[adventure.wave - 1] );
			launchWaveItem ( ctx, adventure.queue.shift(), wave );
			adventure.timer = Math.round ( ( wave.gap || 2 ) * framesPerSecond );
		}
		return;
	}
	// (a swarm or a group of armored asteroids announced is still to come : the wave isn't over)
	if ( threatComing() ) {
		adventure.calm = 0;
		adventure.rest = 0;
		return;
	}
	adventure.calm++;
	adventure.rest = noThreatLeft() ? adventure.rest + 1 : 0;
	if ( adventure.wave == level.waves.length ) {
		if ( adventure.rest > 0 ) {
			adventure.ending = levelEnd * framesPerSecond;
			adventure.banner = { text : level.simulation ? "Test passed" : "Level complete", from : gameTime, time : levelEnd };
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
// a swarm or a group of armored asteroids is announced at once, and comes once its countdown is over (threats.js), the rest of
// the wave coming meanwhile (the wave isn't over before it has come : advanceWaves) ; as dense as the difficulty level makes it
function startWave ( level ) {
	var wave = denseWave ( level.waves[adventure.wave] );
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
	adventure.queue = mixed;
	adventure.timer = 0;
	if ( wave.swarm ) {
		announceSwarm ( waveAnnounce );
	} else if ( wave.armored ) {
		announceArmored ( waveAnnounce );
	}
	for ( var g = 0; g < ( wave.giants || 0 ); g++ ) {
		adventure.queue.push ( "giant" );
	}
	adventure.calm = 0;
	adventure.rest = 0;
	adventure.banner = { text : "Wave " + adventure.wave + "/" + level.waves.length, from : gameTime, time : 2.5 };
}

// function to launch what comes next in a wave : an asteroid, a giant, a splitting one or a comet ;
// a giant comes straight at the planet, not to fly by : the level ends once it is destroyed, or pushed away
function launchWaveItem ( ctx, item, wave ) {
	if ( item == "comet" ) {
		launchComet ( ctx );
	} else {
		var asteroid = launchAsteroid ( ctx, waveAngle ( wave ), item == "giant", wave.speed );
		if ( item == "splitter" ) {
			makeSplitter ( asteroid );
		} else if ( item == "giant" ) {
			var speed = Math.sqrt ( asteroid.vx * asteroid.vx + asteroid.vy * asteroid.vy );
			var angle = Math.atan2 ( MyPlanet.y - asteroid.y, MyPlanet.x - asteroid.x );
			asteroid.vx = speed * Math.cos ( angle );
			asteroid.vy = speed * Math.sin ( angle );
		}
	}
}

// THE HUNTS AND THE SURVIVALS : a level of one of these types has a flow of asteroids coming on a timer, faster and faster,
// instead of waves ; a survival is won once its time is over, a hunt if enough asteroids were destroyed by then
//	- the flow : the seconds between two asteroids, at the start and at the end, their speed (1 being the Arcade's), the part of them splitting ones,
//	  the seconds between two comets, and the times of the giants, of the swarms and of the groups of armored asteroids
//	  (these two announced before) ; the asteroids and the comets as dense as the difficulty level makes them, but a hunt's
function advanceFlow ( ctx, level ) {
	var flow = level.flow;
	var dense = ( level.type == "hunt" ) ? 1 : levelDensity();
	adventure.timer--;
	if ( adventure.timer <= 0 ) {
		var share = Math.min ( 1, gameTime / ( level.time * framesPerSecond ) );
		adventure.timer = Math.round ( ( flow.every[0] + ( flow.every[1] - flow.every[0] ) * share ) / dense * framesPerSecond );
		var asteroid = launchAsteroid ( ctx, Math.random() * 2 * Math.PI, false, ( flow.speed || 1 ) * densitySpeed ( levelDensity() ) );
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
			adventure.calm = Math.round ( flow.comets / dense * ( 0.6 + Math.random() * 0.8 ) * framesPerSecond );
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

// function to write a level's goal : its waves, the asteroids to destroy in a hunt, the time to survive, the prototype to test
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
	if ( level.simulation ) {
		return "Simulator: test the " + weaponName ( level.prototype ) + " over " + level.waves.length + " waves";
	}
	return level.waves.length + " waves";
}

// function to name a weapon as its tab in the pause menu does (shop.js)
function weaponName ( type ) {
	var panels = shopLayout[1].panels;
	for ( var p in panels ) {
		if ( panels[p].weapon == type ) {
			return panels[p].tab;
		}
	}
	return type;
}

// THE SIMULATOR : the look of a simulation, the NAZA's simulator : a deep blue space crossed by a glowing grid, rings and a radar's
// beam instead of the sky, the simulated world as holograms (the planet and its wireframe globe, the asteroids, the debris : tinted
// cyan, see-through and outlined ; the player's weapons and Gravitron keep their colors), and the simulator's screen over it all
var simGrid		= 30;		// the grid's step, in game units (a brighter line every five, through the planet's center)
var simFilter	= "grayscale(1) sepia(1) hue-rotate(150deg) saturate(3) brightness(1.15)";		// the holograms' tint

// function to know if the game shows a simulation
function simulating () {
	return inAdventure() && adventureLevels[adventure.level].simulation && ( state == "playing" || state == "countdown" ) ? true : false;
}

var simInk		= "120,220,255";	// the simulator's cyan, its lines and its writing
var simSweep	= 6;		// the seconds of a turn of its radar's beam

// function to draw the simulator under the game, the game area's sky hidden then (css/main.css) : its deep blue, lighter around the
// planet, its grid fading away from it, rings of distance around it, and a radar's beam turning ; false when the game isn't a
// simulation (drawGame, engine.js)
function drawSimulation ( ctx ) {
	var sim = simulating();
	if ( ctx.canvas.classList.contains ( "simulation" ) != sim ) {
		ctx.canvas.classList.toggle ( "simulation", sim );
	}
	if ( !sim ) {
		return false;
	}
	var cx = MyPlanet.x, cy = MyPlanet.y;
	var time = performance.now() / 1000;
	ctx.save();
	var glow = ctx.createRadialGradient ( cx, cy, 30, cx, cy, gameSize * 0.75 );
	glow.addColorStop ( 0, "rgba(25,70,125,0.6)" );
	glow.addColorStop ( 1, "rgba(25,70,125,0)" );
	ctx.fillStyle = glow;
	ctx.fillRect ( 0, 0, gameSize, gameSize );
	// the grid : its lines, then a brighter one every five, both fading away from the planet
	for ( var strong = 0; strong < 2; strong++ ) {
		var ink = ctx.createRadialGradient ( cx, cy, 0, cx, cy, gameSize * 0.72 );
		ink.addColorStop ( 0, "rgba(" + simInk + "," + ( strong ? 0.3 : 0.13 ) + ")" );
		ink.addColorStop ( 1, "rgba(" + simInk + "," + ( strong ? 0.08 : 0.03 ) + ")" );
		ctx.strokeStyle = ink;
		ctx.lineWidth = strong ? 1 : 0.6;
		ctx.beginPath();
		for ( var x = 0; x <= gameSize; x += simGrid ) {
			if ( ( ( x / simGrid ) % 5 == 0 ) == ( strong == 1 ) ) {
				ctx.moveTo ( x, 0 );
				ctx.lineTo ( x, gameSize );
				ctx.moveTo ( 0, x );
				ctx.lineTo ( gameSize, x );
			}
		}
		ctx.stroke();
	}
	// the rings of distance around the planet, dashed, each one with its distance written
	ctx.setLineDash ( [2, 6] );
	ctx.strokeStyle = "rgba(" + simInk + ",0.22)";
	ctx.fillStyle = "rgba(" + simInk + ",0.4)";
	ctx.font = "8px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	for ( var r = 120; r <= 420; r += 75 ) {
		ctx.beginPath();
		ctx.arc ( cx, cy, r, 0, 2 * Math.PI );
		ctx.stroke();
		ctx.fillText ( r, cx + r * 0.82 + 3, cy - r * 0.57 - 2 );		// (at 35° over the east : clear of the screen's writing)
	}
	ctx.setLineDash ( [] );
	// the radar's beam, turning, with its fading trail
	var beam = ( time / simSweep % 1 ) * 2 * Math.PI;
	for ( var k = 0; k < 20; k++ ) {
		ctx.fillStyle = "rgba(" + simInk + "," + ( 0.07 * ( 1 - k / 20 ) ) + ")";
		ctx.beginPath();
		ctx.moveTo ( cx, cy );
		ctx.arc ( cx, cy, gameSize * 0.75, beam - ( k + 1 ) * 0.025, beam - k * 0.025 );
		ctx.closePath();
		ctx.fill();
	}
	ctx.strokeStyle = "rgba(" + simInk + ",0.35)";
	ctx.beginPath();
	ctx.moveTo ( cx, cy );
	ctx.lineTo ( cx + gameSize * 0.75 * Math.cos ( beam ), cy + gameSize * 0.75 * Math.sin ( beam ) );
	ctx.stroke();
	ctx.restore();
	return true;
}

// function to draw a part of a simulated world as a hologram : tinted cyan and see-through
function asHologram ( ctx, draw ) {
	ctx.save();
	ctx.filter = simFilter;
	ctx.globalAlpha = 0.8;
	draw();
	ctx.restore();
}

// function to draw an asteroid of a simulation as a hologram, outlined along its rock (drawPlaying, engine.js)
function drawHologram ( ctx, asteroid ) {
	asHologram ( ctx, function () { asteroid.Draw(); } );
	ctx.save();
	ctx.strokeStyle = "rgba(" + simInk + ",0.75)";
	ctx.lineWidth = 0.8;
	ctx.translate ( asteroid.x, asteroid.y );
	if ( asteroid.outline ) {
		ctx.rotate ( asteroid.spin );
		ctx.stroke ( asteroid.outline );
	} else {
		ctx.beginPath();
		ctx.arc ( 0, 0, asteroid.radius + 1, 0, 2 * Math.PI );
		ctx.stroke();
	}
	ctx.restore();
}

// function to draw the planet of a simulation as a hologram, with its wireframe globe : its outline, its parallels, and its
// meridians turning with it, its axis leaning as the Earth's (drawGame and drawPlaying, engine.js)
function drawHologramPlanet ( ctx ) {
	asHologram ( ctx, function () { MyPlanet.Draw(); } );
	var r = MyPlanet.radius;
	ctx.save();
	ctx.translate ( MyPlanet.x, MyPlanet.y );
	ctx.rotate ( planetTilt );
	ctx.lineWidth = 1;
	ctx.strokeStyle = "rgba(" + simInk + ",0.8)";
	ctx.beginPath();
	ctx.arc ( 0, 0, r, 0, 2 * Math.PI );
	ctx.stroke();
	ctx.strokeStyle = "rgba(" + simInk + ",0.5)";
	for ( var lat = -60; lat <= 60; lat += 30 ) {
		var w = r * Math.cos ( lat * Math.PI / 180 );
		ctx.beginPath();
		ctx.ellipse ( 0, - r * Math.sin ( lat * Math.PI / 180 ) * Math.cos ( planetView ), w, w * Math.sin ( planetView ), 0, 0, Math.PI );
		ctx.stroke();
	}
	for ( var m = 0; m < 12; m++ ) {
		var lon = MyPlanet.spin + m * Math.PI / 6;
		if ( Math.cos ( lon ) <= 0 ) {
			continue;		// (a meridian behind the globe)
		}
		var side = Math.sin ( lon );
		ctx.beginPath();
		ctx.ellipse ( 0, 0, r * Math.abs ( side ), r, 0, ( side > 0 ) ? - Math.PI / 2 : Math.PI / 2, ( side > 0 ) ? Math.PI / 2 : 3 * Math.PI / 2 );
		ctx.stroke();
	}
	ctx.restore();
}

// function to draw over a simulation the simulator's screen : its scan lines, a brighter band going down, its corners, and what
// it writes (its name and the prototype tested at the top left, SIMULATION blinking at the top right, the test's wave at the
// bottom right)
function drawSimulationOverlay ( ctx ) {
	if ( !simulating() ) {
		return;
	}
	var level = adventureLevels[adventure.level];
	var time = performance.now() / 1000;
	ctx.save();
	ctx.fillStyle = "rgba(0,0,0,0.13)";
	for ( var y = 0; y < gameSize; y += 3 ) {
		ctx.fillRect ( 0, y, gameSize, 1 );
	}
	var band = ( time * 45 ) % ( gameSize + 120 ) - 60;
	var shine = ctx.createLinearGradient ( 0, band - 30, 0, band + 30 );
	shine.addColorStop ( 0, "rgba(" + simInk + ",0)" );
	shine.addColorStop ( 0.5, "rgba(" + simInk + ",0.05)" );
	shine.addColorStop ( 1, "rgba(" + simInk + ",0)" );
	ctx.fillStyle = shine;
	ctx.fillRect ( 0, band - 30, gameSize, 60 );
	// the corners of the screen
	ctx.strokeStyle = "rgba(" + simInk + ",0.6)";
	ctx.lineWidth = 1.5;
	var top = 30, edge = 8, arm = 22;
	[ [edge, top, 1, 1], [gameSize - edge, top, -1, 1], [edge, gameSize - edge, 1, -1], [gameSize - edge, gameSize - edge, -1, -1] ].forEach ( function ( c ) {
		ctx.beginPath();
		ctx.moveTo ( c[0] + c[2] * arm, c[1] );
		ctx.lineTo ( c[0], c[1] );
		ctx.lineTo ( c[0], c[1] + c[3] * arm );
		ctx.stroke();
	} );
	ctx.textBaseline = "top";
	ctx.fillStyle = "rgba(" + simInk + ",0.8)";
	ctx.font = "11px Arial";
	ctx.textAlign = "left";
	ctx.fillText ( "NAZA SIMULATOR", 18, 38 );
	ctx.fillStyle = "rgba(" + simInk + ",0.55)";
	ctx.font = "9px Arial";
	ctx.fillText ( "PROTOTYPE: " + weaponName ( level.prototype ).toUpperCase(), 18, 52 );
	ctx.textAlign = "right";
	ctx.fillText ( "TEST " + Math.max ( 1, adventure.wave ) + " / " + level.waves.length, gameSize - 18, gameSize - 26 );
	ctx.font = "16px MirageRegular";
	ctx.fillStyle = "rgba(" + simInk + "," + ( 0.55 + 0.35 * Math.sin ( time * 2.5 ) ) + ")";
	ctx.fillText ( "SIMULATION", gameSize - 18, 36 );
	ctx.restore();
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

// function to end a level won : the game stops behind the level's end, and its stars are saved ; the boss destroyed, the end of
// the world's story is told first, every time (the map's Story link tells it again : story.js), then comes the level's end
function winLevel () {
	pause = 3;
	laserCannon.firing = 0;
	checkAchievements();	// the ones of the game's end, before they are listed
	document.getElementById("status").style.display = "none";
	var holder = document.getElementById("gameOver");
	showLevelEnd ( holder, true );
	if ( adventureLevels[adventure.level].type == "boss" ) {
		tellStories ( [ "world1End" ], function () {
			holder.style.display = "block";
			state = "playing";		// (the game stopped behind it, as before the story)
		} );
	} else {
		holder.style.display = "block";
	}
}

// function to show the end of a level, won or lost : its stars, its numbers and the achievements it brought (achievements.js)
function showLevelEnd ( holder, won ) {
	var level = adventureLevels[adventure.level];
	var stars = starsWon ( won );
	if ( won ) {
		var saved = levelStars[adventure.level] || [false, false, false];
		levelStars[adventure.level] = [ saved[0] || stars[0], saved[1] || stars[1], saved[2] || stars[2] ];
		localStorage[adventureKey ( "adventure" )] = JSON.stringify ( levelStars );
	}
	var seconds = Math.floor ( gameTime / framesPerSecond );
	var tip = won ? missedStarTip ( level ) : lossTip();		// (chosen first, for its numbers to light up : gameover.js)
	var reasons = [ "Win the level", "Save more than half of your inhabitants", level.challenge.text ];
	// (the boss destroyed : a victory, the world saved ; a simulation won : its prototype into production, lost : a test failed)
	var victory = won && level.type == "boss";
	var title = victory ? "Victory!" : level.simulation ? ( won ? "Prototype validated" : "Test failed" ) : won ? "Level complete" : "Level failed";
	var html = "<div class='over'><div class='title'>" + title + "</div>"
		+ "<div class='subtitle'>" + levelTitle ( adventure.level ) + " &middot; <strong>" + level.name + "</strong>"
		+ ( won ? "" : " &middot; " + ( adventure.failed || ( level.simulation ? "the simulated planet has been destroyed" : "your planet has been destroyed" ) ) ) + "</div>"
		+ ( victory ? "<div class='cheer'>The Colossus is down, and " + MyPlanet.life + " million people live on. The first world is saved: the NAZA salutes you!</div>" : "" )
		+ ( won && level.simulation ? "<div class='cheer'>The " + weaponName ( level.prototype ) + " goes into production: it is in the shop of every level now.</div>" : "" )
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
		+ "</div>" + tipCard ( tip );
	// the achievements of the game, with their medals (achievements.js)
	if ( newAchievements.length > 0 ) {
		html += "<div class='unlocked'><div class='label'>Achievements unlocked</div>";
		for ( var a in newAchievements ) {
			html += "<div class='medal'>" + medalSVG ( newAchievements[a] ) + "<div class='name'>" + achievements[newAchievements[a]].name + "</div></div>";
		}
		html += "</div>";
	}
	html += "<div class='buttons'><a href='#' class='button' onClick='state=\"init\";'>Retry</a>";
	if ( won && level.bonus ) {
		// (a bonus level won : back to the path, to the next level to play)
		html += "<a href='#' class='button' onClick='playLevel(nextLevel());'>Next Level</a>";
	} else if ( won && adventure.level + 1 < mainLevels ) {
		html += "<a href='#' class='button' onClick='playLevel(" + ( adventure.level + 1 ) + ");'>Next Level</a>";
	}
	// (the last level won : the end of the world's story was told before : winLevel)
	html += "<a href='#' class='button' onClick='state=\"map\";'>Map</a></div></div>";
	holder.innerHTML = html;
	achievementQueue = [];		// their banners would go on behind this screen, which shows their medals
}

// function to choose the tip of a level won without all its stars : how to win the first one missed, if it was never won
// (the second star's tip is the same in every level, healing being there or not ; the third one's is its challenge's)
function missedStarTip ( level ) {
	var owned = levelStars[adventure.level];
	var found = [];
	if ( !owned[1] ) {
		found.push ( adventureAllows ( "healing" )
			? { id : "star2", tiles : [ "Inhabitants" ], picture : "heal",
				text : "To save more than half of your inhabitants, heal as you play: Healing turns mat into inhabitants, Auto-Healing heals with the mat you gather." }
			: { id : "star2", tiles : [ "Inhabitants" ], picture : "kamikaze",
				text : "To save more than half of your inhabitants, stop the asteroids before they land: click one your cannon can't catch, or press F, to send a kamikaze." } );
	}
	if ( !owned[2] ) {
		found.push ( { id : "star3-" + adventure.level, tiles : level.challenge.tiles, picture : level.challenge.picture, text : level.challenge.hint } );
	}
	return chooseTip ( found );
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

// function to write the stars of a level : the ones won in gold, the others in grey (css/main.css)
function starsText ( stars ) {
	var text = "";
	for ( var s = 0; s < 3; s++ ) {
		text += "<i" + ( ( stars && stars[s] ) ? "" : " class='empty'" ) + ">★</i>";
	}
	return text;
}

// the start menu's pages, from left to right : the Tutorial's (tutorial.js), the Adventure's (once it is ready) and the Arcade's,
// with their names on the big arrows turning to them
var menuPageNames = { tutorial : "Tutorial", adventure : "Adventure", arcade : "Arcade" };

// function to list the start menu's pages
function menuPages () {
	return adventureReady ? [ "tutorial", "adventure", "arcade" ] : [ "tutorial", "arcade" ];
}

// the start menu's page shown : the Tutorial's until it is finished, then the Adventure's (the Arcade's until the Adventure is
// ready), then the one of the mode last played
var menuPage = !tutorialDone ? "tutorial" : adventureReady ? "adventure" : "arcade";

// function to show the start menu's pages, at each turn of the menu (engine.js) : side by side, sliding to the one shown
// (css/main.css), with a big arrow on each side turning to the next one, named ;
// the Tutorial's button plays it again once it is finished ;
// the Adventure's button starts it, or continues it once a level is won (in green), on the map, and tells the next level and the stars won,
// at the difficulty level chosen under it (chooseAdventureLevel)
function showMenuPages () {
	var menu = document.getElementById("mainMenu");
	menu.classList.toggle ( "adventure", adventureReady );
	var pages = menuPages();
	var at = Math.max ( 0, pages.indexOf ( menuPage ) );
	var track = document.getElementById("menuTrack"), shift = "translateX(" + ( - at * 100 ) + "%)";
	if ( !track.style.transform ) {
		// (the first time, the menu opens on its page, without sliding to it)
		track.style.transition = "none";
		track.style.transform = shift;
		track.offsetWidth;
		track.style.transition = "";
	} else if ( track.style.transform != shift ) {
		track.style.transform = shift;
	}
	showPageArrow ( document.getElementById("turnLeft"), pages[at - 1] );
	showPageArrow ( document.getElementById("turnRight"), pages[at + 1] );
	writeOnce ( document.getElementById("tutorialStart"), tutorialDone ? "Play again" : "Start" );
	writeOnce ( document.getElementById("tutorialText"), tutorialDone ? "Finished: play it again whenever you like."
		: "Learn to defend the Earth, in a few minutes." );
	for ( var level in difficultyLevels ) {
		document.getElementById("adventure_" + level).classList.toggle ( "current", level == adventureDifficulty );
	}
	var started = adventureStarted();
	var button = document.getElementById("adventureStart");
	writeOnce ( button, started ? "Continue" : "Start" );
	button.classList.toggle ( "continue", started );
	var next = nextLevel();
	var allWon = levelStars[next] && levelStars[next][0];		// (every level made so far is won)
	writeOnce ( document.getElementById("adventureNext"), !started ? "Save the Earth, level after level"
		: allWon ? "Every level won so far: more are coming" : "Next level: " + levelLabel ( next ) + " · " + adventureLevels[next].name );
	writeOnce ( document.getElementById("adventureStars"), started ? "★ " + starsCount() + " / " + starsOpen() : "" );
	document.getElementById("adventureRestart").classList.toggle ( "shown", started );
	showBonusIcons();		// and the bonuses bought with the stars (starshop.js)
	if ( adventureReady ) {
		preloadStories();	// and the story's pictures, before it is told (story.js)
	}
}

// function to name a level of the path by its world and its place in it : 1-5 for the fifth level of the first world
function levelLabel ( n ) {
	return "1-" + ( n + 1 );
}

// function to title a level : Level 1-5, or Bonus level (no letter for it : the menus' font draws a B as an 8)
function levelTitle ( n ) {
	return adventureLevels[n].bonus ? "Bonus level" : "Level " + levelLabel ( n );
}

// function to write a level's place in its world, on its spot of the map : its number, or "bonus"
function levelNumber ( n ) {
	return adventureLevels[n].bonus ? "bonus" : n + 1;
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

// function to show a big arrow of the start menu, named after the page it turns to (hidden without one)
function showPageArrow ( arrow, page ) {
	arrow.classList.toggle ( "shown", page !== undefined );
	if ( page !== undefined ) {
		writeOnce ( arrow.querySelector ( "span" ), menuPageNames[page] );
	}
}

// function to turn the start menu to the next page on a side (1 : the right one, -1 : the left one), if there is one
function turnMenuPage ( side ) {
	var pages = menuPages();
	var page = pages[Math.max ( 0, pages.indexOf ( menuPage ) ) + side];
	if ( page ) {
		menuPage = page;
	}
}

// the keyboard's arrows turn the start menu's pages too
document.addEventListener ( "keydown", function ( e ) {
	if ( state == "menu" && e.key == "ArrowRight" ) {
		turnMenuPage ( 1 );
	} else if ( state == "menu" && e.key == "ArrowLeft" ) {
		turnMenuPage ( -1 );
	}
} );

// THE MAP : the first world's levels on a winding path, the boss last and bigger ; only the levels open are on it, the next rains
// staying unknown (the spots' centers, in the pixels of the map's road, under its bar) ; a bonus level is beside the path, smaller,
// at the end of a dashed side path from the level it follows (its spot : adventureLevels)
var mapSpots = [ [70, 270], [180, 290], [290, 262], [400, 282], [500, 222], [420, 150], [300, 166], [185, 142], [95, 84], [290, 50] ];
var mapChoice = false;		// the level chosen on the map, told under it (false : the next one to play)

// the icons of the levels' types on their spots (img/icons, neon holograms), by the name of their file : the waves (a level
// without a type) are falling meteors, a hunt a target, a survival an hourglass, the boss a skull
var levelIcons = {
	waves		: "waves",
	hunt		: "target",
	survival	: "hourglass",
	boss		: "boss",
	// (the bonus levels' own icons : the weapon they bring, as its tile in the tree of the stars : tiles.js)
	spiral		: "spiral"
};

// function to show the map : its bar, the stars won out of the ones of the levels open, its road lit through them, a spot for each
// one with its stars, and the level chosen under it, with its challenge and the button to play it
function showMap ( holder ) {
	if ( mapChoice === false ) {
		mapChoice = nextLevel();
	}
	var open = levelsOpen();
	var bonuses = bonusesOpen();
	var html = "<div class='map'><div class='bar'><span class='side'><a href='#' class='level' onClick='state=\"menu\";'>&lsaquo; Menu</a>"
		+ "<a href='#' class='level' onClick='tellStories(storyList());'>Story</a></span>"
		+ "<span class='world'>World 1 &middot; " + levelName ( adventureDifficulty ) + "</span><span class='count'>&#9733; " + starsCount() + " / " + starsOpen()
		+ " <a href='#' class='level" + ( starsLeft() > 0 ? " spend" : "" ) + "' onClick='state=\"upgrades\";'>Upgrades" + ( starsLeft() > 0 ? " (" + starsLeft() + " &#9733;)" : "" ) + "</a></span></div>"
		+ "<div class='road'><svg viewBox='0 0 566 340'>" + mapRoad ( mapSpots.slice ( 0, open ) );
	for ( var b in bonuses ) {
		// (a bonus level's side path, thinner, from the level it follows : lit once it is won)
		var from = mapSpots[adventureLevels[bonuses[b]].after], to = adventureLevels[bonuses[b]].spot;
		html += "<path class='" + ( levelWon ( bonuses[b] ) ? "lit" : "next" ) + " side' d='M" + from[0] + " " + from[1] + "L" + to[0] + " " + to[1] + "'/>";
	}
	html += "</svg>";
	for ( var n = 0; n < open; n++ ) {
		html += spotLink ( n, mapSpots[n], n == mainLevels - 1 ? " boss" : "" );
	}
	for ( var b in bonuses ) {
		html += spotLink ( bonuses[b], adventureLevels[bonuses[b]].spot, " bonus" );
	}
	html += "</div><div class='spotInfo'>" + spotInfo ( mapChoice ) + "</div></div>";
	holder.innerHTML = html;
}

// function to write a level's spot on the map, at its place : the picture of its type, its number and its stars
function spotLink ( n, place, kind ) {
	return "<a href='#' class='spot " + spotState ( n ) + kind + ( n == mapChoice ? " chosen" : "" ) + "'"
		+ " style='left:" + place[0] + "px;top:" + place[1] + "px' onClick='chooseSpot(" + n + ");'>"
		+ levelPicture ( n ) + "<span class='number'>" + levelNumber ( n ) + "</span>"
		+ "<span class='stars'>" + starsText ( levelStars[n] ) + "</span></a>";
}

// function to show the icon of a level's type (or its own one), on its spot
function levelPicture ( n ) {
	var level = adventureLevels[n];
	return "<img class='type' src='img/icons/" + levelIcons[level.icon || level.type || "waves"] + ".webp' alt=''>";
}

// function to choose a level on the map, to read its challenge and play it
function chooseSpot ( n ) {
	mapChoice = n;
	showMap ( document.getElementById("adventureMap") );
}

// function to know the level to play next : the first one of the path open and not won, or else the last one open
// (a bonus level is never the next one : it waits beside the path)
function nextLevel () {
	for ( var n = 0; n < mainLevels; n++ ) {
		if ( levelOpen ( n ) && !levelWon ( n ) ) {
			return n;
		}
	}
	return levelsOpen() - 1;
}

// function to know how an open level's spot looks, as the cells of the stars' tree : "won" (framed in the Earth's blue),
// "won perfect" with its three stars (tinted blue inside), or "open"
function spotState ( n ) {
	if ( !levelWon ( n ) ) {
		return "open";
	}
	return ( levelStars[n][1] && levelStars[n][2] ) ? "won perfect" : "won";
}

// function to tell about the level chosen on the map : its name and stars, its line of the log, its challenge and the button
// to play it
function spotInfo ( n ) {
	var level = adventureLevels[n];
	return "<div class='name'>" + levelTitle ( n ) + " &middot; " + level.name + " <span class='stars'>" + starsText ( levelStars[n] ) + "</span></div>"
		+ "<div class='log'>" + level.log + "</div>"
		+ "<div class='text'>" + levelGoal ( level ) + " &middot; Challenge: " + level.challenge.text + "</div>"
		+ "<a href='#' class='button' onClick='playLevel(" + n + ");'>Play</a>";
}

// function to draw the road of the map, a smooth curve through the centers of its spots (a Catmull-Rom spline), in SVG paths,
// one from each spot to the next : lit in blue toward a level won, dashed toward the next one to win (as the stars' tree's links)
function mapRoad ( spots ) {
	var road = "";
	for ( var s = 0; s < spots.length - 1; s++ ) {
		var before = spots[Math.max ( s - 1, 0 )], from = spots[s], to = spots[s + 1], after = spots[Math.min ( s + 2, spots.length - 1 )];
		road += "<path class='" + ( levelWon ( s + 1 ) ? "lit" : "next" ) + "' d='M" + from[0] + " " + from[1]
			+ " C" + Math.round ( from[0] + ( to[0] - before[0] ) / 6 ) + " " + Math.round ( from[1] + ( to[1] - before[1] ) / 6 )
			+ " " + Math.round ( to[0] - ( after[0] - from[0] ) / 6 ) + " " + Math.round ( to[1] - ( after[1] - from[1] ) / 6 )
			+ " " + to[0] + " " + to[1] + "'/>";
	}
	return road;
}

// function to draw the banner of the waves, and the one of the level won, over the game for a few seconds
// (in the bottom half when the duel's camera puts the planet in the top one : boss.js)
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
	ctx.fillText ( adventure.banner.text, gameSize / 2, ( cameraView ( camera.share ).y < gameSize / 2 - 1 ) ? gameSize - 150 : 170 );
	ctx.restore();
}
