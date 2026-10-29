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

// Parameters setup (default values);
	// starting values of a game, gathered here to tune the difficulty
	var startValues = {
		// asteroids : one comes at each interval, and the interval shrinks over time down to a minimum
		spawnStart		: 7,		// seconds between two asteroids at the beginning
		spawnMin		: 1.5,		// seconds between two asteroids in the long run
		spawnSlowness	: 180,		// seconds for the interval to go about two thirds of the way down
		speedGrowth		: 400,		// seconds for the asteroids' speed to grow by its starting value
		asteroidLife	: 10,
		lifeGrowth		: 60,		// seconds for the asteroids to get one more point of life
		asteroidSpeed	: 0.25,		// base speed for the asteroids, each one being 1 to 3 times faster
		giantFrom		: 120,		// seconds before the first giant asteroid may come
		giantChance		: 0.1,		// part of the asteroids coming as giants after that
		giantLife		: 40,		// a giant's life, growing with time as the others'

		// player's planet
		planetLife		: 20,
		planetMat		: 20,
		planetMaxMat	: 100,
		planetAutoHeal	: 0,
		planetHealFact	: 1,
		planetRecovery	: 0,		// mat recovered from the asteroids crashing on the planet, an upgrade to buy

		// player's weapons
		maxWAtATime		: 1,		// maximum amount of active weapons
		mainCanMovSpeed	: 2,
		basicW			: { delay : 25, power : 2, speed : 1, smart : 1, cannons : 1 },
		SaOW			: { delay : 25, power : 1, speed : 5, smart : 0, cannons : 0 },
		magneticW		: { delay : 25, power : 3, speed : 1, smart : 0, cannons : 0 },
		HaBW			: { delay : 50, power : 1, speed : 1, smart : 0, cannons : 0 },
		missileW		: { delay : 100, power : 3, speed : 1.5, smart : 0, cannons : 0, blast : 25 },	// a secondary weapon, given by its research
		nitroW			: { delay : 200, power : 12, speed : 1.5, smart : 0, cannons : 0, blast : 40 },	// another one, its delay counted once its bomb is gone
		laserW			: { delay : 350, power : 6, speed : 0, smart : 0, cannons : 0, duration : 50 },	// and the laser : its power per second, its beam's duration and its cooldown in turns

		// player's GRAVITRON
		gravPower		: 1,
		gravSort		: 1,
		gravShield		: 0,
		gravPulse		: 0,
		gravRepulsion	: 0,
		gravScanner		: 0
	};

	// difficulty levels : what each one changes from the values above, which are the normal ones
	var difficultyLevels = {
		easy	: { planetLife : 30, planetMat : 50, spawnStart : 9, spawnMin : 2.5, spawnSlowness : 240, speedGrowth : 600, basicW : { smart : 2 } },
		normal	: {},
		hard	: { spawnStart : 5, spawnMin : 1, spawnSlowness : 150, speedGrowth : 300 }
	};
	// what each difficulty level changes, as the start menu tells it
	var levelTexts = {
		easy	: "More life and mat for your planet, slower asteroids, and a cannon aiming ahead from the start.",
		normal	: "The game as it is balanced.",
		hard	: "The asteroids come sooner, and faster and faster."
	};
	// difficulty level chosen by the player, remembered by the browser
	var difficulty = localStorage["difficulty"];
	if ( !difficultyLevels.hasOwnProperty(difficulty) ) {
		difficulty = "normal";
	}
	var gameValues = startValues;	// starting values of the current game, at its difficulty level

	// game parameters
	if( localStorage["displayS"] === null || localStorage["displayS"] === undefined ){
		localStorage["displayS"] = "bars";
		var displayS = "bars";
	}else{
		var displayS = localStorage["displayS"];
	}
	var gameSize		= 600;		// size of the game area in game units, the canvas is zoomed to fit the screen
	var screenFill		= 0.80;		// part of the window's smallest side filled by the game area
	var state 			= "menu";
	var framesPerSecond	= 25;		// the engine runs this many times a second
	var gameTime		= 0;		// turns played in the current game, pauses excluded
	var spawnTimer		= 0;		// turns left before the next asteroid
	var showDetails		= false;	// Set this one to true to see some helpful vars on screen
	var redEffect		= 0;		// to make the screen become red
	var pause			= 0;
	var pauseStep		= 0;
	var upgradeMenu		= true;		// Set to false to prevent the player from upgrading (usefull for missions)
	var shieldHit		= [0];		// to make the shield's energy vanish when hit
	var countdownStart	= 100;		// time before game starts
	var countdownValue	= 100;		// time before game starts
	var banner			= { text : "", y : 0, alpha : 0, background : 0 };	// the countdown's banner (3, 2, 1, GO !), drawn on the game
	var passedA			= 0;		// to avoid double switch when changing target
	var allPassed		= 0;		// to check if all asteroids where passed and get back to beginning
	
	// game statistics
	var nbrShots		= 0;
	var nbrLostShots	= 0;
	var nbrCrashes		= 0;
	var nbrDestroyed	= 0;
	var nbrGiants		= 0;		// the giant asteroids among the destroyed ones
	var nbrDamage		= 0;
	var nbrUpgrades		= 0;
	var nbrCost			= 0;
	var calmSince		= 0;		// the turn of the last asteroid crashed on the planet (Untouchable achievement)
	var bankShot		= false;	// an asteroid destroyed by another one the GRAVITRON deflected (Bank Shot achievement)
	var bestBomb		= 0;		// the most asteroids destroyed by a bomb and the ones of its Chain Reaction (Fireworks achievement)
	var giantSlain		= false;	// a giant asteroid finished by the laser (Giant Slayer achievement)

	// player's planet parameters
	var planetSkin		= earthMap;		// the map wrapped around the planet (img/earth.js)
	var planetTurn		= 2 * Math.PI / ( 60 * framesPerSecond );	// the planet turns on itself once a minute
	var planetTilt		= 23.4 * Math.PI / 180;	// its axis leans like the Earth's
	var planetView		= 15 * Math.PI / 180;	// and we see it from a bit above its equator
	var planetAutoHeal	= startValues.planetAutoHeal;
	var planetHealFact	= startValues.planetHealFact;
	var planetHealTimer	= 0;
	var planetHealPend	= 0;
	var planetRecovery	= startValues.planetRecovery;
	var planetRadius	= 50;
	var planetMass		= 150;
	var planetX			= 300;
	var planetY			= 300;
	
	// player's weapons parameters
	var shotList		= new Array();
	var weaponList		= new Array();
	var weaponCost		= new Array();	// costs of each weapon
	weaponCost["basicW"]= 50;
	weaponCost["SaOW"]	= 150;
	weaponCost["magneticW"]	= 300;
	weaponCost["HaBW"]	= 450;
	var mainCanMovSpeed	= startValues.mainCanMovSpeed;
	var maxWAtATime		= startValues.maxWAtATime;
	var orbitalNbr		= 0;
	var missileLauncher	= false;			// the secondary weapon of the research tree (secondary.js)
	var missileList		= new Array();
	var blastList		= new Array();		// the missiles' explosions
	var homingTurn		= 0.08;				// how much a homing missile can turn at each turn, in radians
	var nitroLauncher	= false;			// the other one, whose capsules turn an asteroid into a bomb (secondary.js)
	var capsuleList		= new Array();
	var laserCannon		= false;			// and the laser, burning its target for a while before it cools down (secondary.js)

	// player's GRAVITRON parameters
	var key				= [0,0,0,0,0,0,0];		// counterclockwise, clockwise, close, open, pause, change target, erase target choice
	var gravSuction		= 0.05;
	var gravColor		= '#666666';
	var gravRadius		= planetRadius * 1.1;
	var gravFriction	= 30;					// expressed in percents
	var gravMinSize		= Math.PI / 64;
	var gravMaxSize		= 2 * Math.PI - gravMinSize;
	var pulseList		= new Array();
	
	// asteroids parameters
	var asteroidList	= new Array();
	var asteroidBS		= startValues.asteroidSpeed;	// Base speed for the asteroids
	var asteroidBR		= 8;		// Base radius for the asteroids
	var asteroidBM		= 8;		// Base mass for the asteroids
	var MaxCollSpd		= 10;		// Max Collision Speed for the asteroid to bounce without being destroyed
	var giantSize		= 1.5;		// a giant asteroid is this much bigger,
	var giantMass		= 3;		// heavier, for the GRAVITRON to move it less,
	var giantSpeed		= 0.6;		// and slower, to give time to destroy it before it crashes with all its life
	var bankShotTurn	= 20 * Math.PI / 180;	// how much the GRAVITRON must turn an asteroid's way for a Bank Shot
	var targetedA		= false;
	var aimedA			= false;	// the asteroid the main cannon aims at, circled on screen

	// debris parameters
	var debrisList		= new Array();
	var debrisColor		= '#734A12';

	
	
function initDefault(context,level) {
	// game parameters
	gameValues		= levelValues(level);
	gameTime		= 0;
	spawnTimer		= 0;
	redEffect		= 0;		// to make the screen become red
	pause			= 0;
	pauseStep		= 0;
	upgradeMenu		= true;		// Set to false to prevent the player from upgrading (usefull for missions)
	countdownStart	= 100;		// time before game starts
	countdownValue	= 100;		// time before game starts
	
	// game statistics
	nbrShots		= 0;
	nbrLostShots	= 0;
	nbrCrashes		= 0;
	nbrDestroyed	= 0;
	nbrGiants		= 0;
	nbrDamage		= 0;
	nbrUpgrades		= 0;
	nbrCost			= 0;
	calmSince		= 0;
	bankShot		= false;
	bestBomb		= 0;
	giantSlain		= false;
	newAchievements	= [];		// the achievements obtained in this game (achievements.js)

	// player's planet parameters
	MyPlanet.skin		= planetSkin;
	MyPlanet.life		= gameValues.planetLife;
	MyPlanet.maxLife	= gameValues.planetLife;
	MyPlanet.mat		= gameValues.planetMat;
	MyPlanet.maxMat		= gameValues.planetMaxMat;
	MyPlanet.totalMat	= 0;
	MyPlanet.radius		= planetRadius;
	MyPlanet.mass		= planetMass;
	MyPlanet.x			= planetX;
	MyPlanet.y			= planetY;
	planetAutoHeal		= gameValues.planetAutoHeal;
	planetHealFact		= gameValues.planetHealFact;
	planetHealTimer		= 0;
	planetHealPend		= 0;
	planetRecovery		= gameValues.planetRecovery;
	
	// player's weapons parameters
	// Weapon ( context, type, color, angle, delay, power, speed, smart, cNbr )
	shotList		= [];
	weaponList		= [];
	maxWAtATime		= gameValues.maxWAtATime;
	mainCannon		= newWeapon(context,"basicW","#FFFFFF");
	spiralCannon	= newWeapon(context,"SaOW","#00FFFF");
	magneticCannon	= newWeapon(context,"magneticW","#964514");
	hammerCannon	= newWeapon(context,"HaBW","#0099CC");
	weaponList.push(mainCannon);
	weaponList.push(spiralCannon);
	weaponList.push(magneticCannon);
	weaponList.push(hammerCannon);
	activate("basicW");
	mainCanMovSpeed	= gameValues.mainCanMovSpeed;
	orbitalNbr		= 0;
	missileLauncher	= newWeapon(context,"missileW","#ff9933");	// with no cannon until its research is validated
	missileLauncher.blast = gameValues.missileW.blast;
	missileList		= [];
	blastList		= [];
	nitroLauncher	= newWeapon(context,"nitroW","#ffe066");	// with no cannon until its research is validated
	nitroLauncher.blast = gameValues.nitroW.blast;
	capsuleList		= [];
	laserCannon		= newWeapon(context,"laserW","#ff3355");		// with no cannon until its research is validated
	laserCannon.duration = gameValues.laserW.duration;
	laserCannon.firing = 0;		// the turns its beam still burns
	laserCannon.heat = 0;		// the part of a point of damage it has done
	newResearches();
	
	// player's GRAVITRON parameters
	MyGravitron.suction		= gravSuction;
	MyGravitron.repulsion	= gameValues.gravRepulsion;
	MyGravitron.shield		= gameValues.gravShield;
	MyGravitron.charge		= 0;
	MyGravitron.counter		= 0;
	MyGravitron.power		= gameValues.gravPower;
	MyGravitron.sort		= gameValues.gravSort;
	MyGravitron.pulse		= gameValues.gravPulse;
	MyGravitron.scanner		= gameValues.gravScanner;
	pulseList				= [];
	gravColor				= '#666666';
	gravRadius				= planetRadius * 1.1;
	gravFriction			= 30;					// expressed in percents
	gravMinSize				= Math.PI / 64;
	gravMaxSize				= 2 * Math.PI - gravMinSize;
	MyGravitron.wideness	= gravMinSize;
	
	// asteroids parameters
	asteroidList	= [];
	asteroidBS		= gameValues.asteroidSpeed;	// Base speed for the asteroids
	asteroidBR		= 8;		// Base radius for the asteroids
	asteroidBM		= 8;		// Base mass for the asteroids
	MaxCollSpd		= 10;		// Max Collision Speed for the asteroid to bounce without being destroyed
	targetedA		= false;
	aimedA			= false;

	// debris parameters
	debrisList		= [];
	debrisColor		= '#734A12';
}

// function to create a weapon from its starting values
function newWeapon(context,type,color) {
	// Weapon ( context, type, color, angle, delay, power, speed, smart, cNbr )
	var start = gameValues[type];
	return new Weapon(context,type,color,0,start.delay,start.power,start.speed,start.smart,start.cannons);
}

// function to get the starting values of a difficulty level : the normal ones, changed by the level's own
function levelValues(level) {
	var changes = difficultyLevels[level] || {};
	var values = {};
	for ( var name in startValues ) {
		var start = startValues[name];
		var change = changes[name];
		if ( typeof start == "object" ) {
			// a weapon : each of its values can be changed on its own
			values[name] = {};
			for ( var detail in start ) {
				values[name][detail] = ( change !== undefined && change[detail] !== undefined ) ? change[detail] : start[detail];
			}
		} else {
			values[name] = ( change !== undefined ) ? change : start;
		}
	}
	return values;
}

function initTutorial(context) {
	countdownValue = 0;
}