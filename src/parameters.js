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
		asteroidSpeed	: 0.25,		// base speed for the asteroids, each one being 1 to 3 times faster

		// player's planet
		planetLife		: 20,
		planetMat		: 20,
		planetMaxMat	: 100,
		planetAutoHeal	: 0,
		planetHealFact	: 1,
		planetRecovery	: 5,

		// player's weapons
		maxWAtATime		: 1,		// maximum amount of active weapons
		mainCanMovSpeed	: 2,
		basicW			: { delay : 25, power : 2, speed : 1, smart : 1, cannons : 1 },
		SaOW			: { delay : 25, power : 1, speed : 5, smart : 0, cannons : 0 },
		magneticW		: { delay : 25, power : 3, speed : 1, smart : 0, cannons : 0 },
		HaBW			: { delay : 50, power : 1, speed : 1, smart : 0, cannons : 0 },

		// player's GRAVITRON
		gravPower		: 1,
		gravSort		: 1,
		gravShield		: 0,
		gravPulse		: 0,
		gravRepulsion	: 0
	};

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
	var passedA			= 0;		// to avoid double switch when changing target
	var allPassed		= 0;		// to check if all asteroids where passed and get back to beginning
	
	// game statistics
	var nbrShots		= 0;
	var nbrLostShots	= 0;
	var nbrCrashes		= 0;
	var nbrDamage		= 0;
	var nbrUpgrades		= 0;
	var nbrCost			= 0;
	
	// player's planet parameters
	var planetSkin		= 'img/planet.png';
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
	var asteroid1Skin	= 'img/asteroid1.png';
	var asteroidBS		= startValues.asteroidSpeed;	// Base speed for the asteroids
	var asteroidBR		= 8;		// Base radius for the asteroids
	var asteroidBM		= 8;		// Base mass for the asteroids
	var MaxCollSpd		= 10;		// Max Collision Speed for the asteroid to bounce without being destroyed
	var targetedA		= false;
	
	// debris parameters
	var debrisList		= new Array();
	var debrisColor		= '#734A12';

	
	
function initDefault(context) {
	// game parameters
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
	nbrDamage		= 0;
	nbrUpgrades		= 0;
	nbrCost			= 0;
	
	// player's planet parameters
	MyPlanet.skin		= planetSkin;
	MyPlanet.life		= startValues.planetLife;
	MyPlanet.maxLife	= startValues.planetLife;
	MyPlanet.mat		= startValues.planetMat;
	MyPlanet.maxMat		= startValues.planetMaxMat;
	MyPlanet.totalMat	= 0;
	MyPlanet.radius		= planetRadius;
	MyPlanet.mass		= planetMass;
	MyPlanet.x			= planetX;
	MyPlanet.y			= planetY;
	planetAutoHeal		= startValues.planetAutoHeal;
	planetHealFact		= startValues.planetHealFact;
	planetHealTimer		= 0;
	planetHealPend		= 0;
	planetRecovery		= startValues.planetRecovery;
	
	// player's weapons parameters
	// Weapon ( context, type, color, angle, delay, power, speed, smart, cNbr )
	shotList		= [];
	weaponList		= [];
	maxWAtATime		= startValues.maxWAtATime;
	mainCannon		= newWeapon(context,"basicW","#FFFFFF");
	spiralCannon	= newWeapon(context,"SaOW","#00FFFF");
	magneticCannon	= newWeapon(context,"magneticW","#964514");
	hammerCannon	= newWeapon(context,"HaBW","#0099CC");
	weaponList.push(mainCannon);
	weaponList.push(spiralCannon);
	weaponList.push(magneticCannon);
	weaponList.push(hammerCannon);
	activate("basicW");
	mainCanMovSpeed	= startValues.mainCanMovSpeed;
	orbitalNbr		= 0;
	
	// player's GRAVITRON parameters
	MyGravitron.suction		= gravSuction;
	MyGravitron.repulsion	= startValues.gravRepulsion;
	MyGravitron.shield		= startValues.gravShield;
	MyGravitron.charge		= 0;
	MyGravitron.counter		= 0;
	MyGravitron.power		= startValues.gravPower;
	MyGravitron.sort		= startValues.gravSort;
	MyGravitron.pulse		= startValues.gravPulse;
	pulseList				= [];
	gravColor				= '#666666';
	gravRadius				= planetRadius * 1.1;
	gravFriction			= 30;					// expressed in percents
	gravMinSize				= Math.PI / 64;
	gravMaxSize				= 2 * Math.PI - gravMinSize;
	MyGravitron.wideness	= gravMinSize;
	
	// asteroids parameters
	asteroidList	= [];
	asteroid1Skin	= 'img/asteroid1.png';
	asteroidBS		= startValues.asteroidSpeed;	// Base speed for the asteroids
	asteroidBR		= 8;		// Base radius for the asteroids
	asteroidBM		= 8;		// Base mass for the asteroids
	MaxCollSpd		= 10;		// Max Collision Speed for the asteroid to bounce without being destroyed
	targetedA		= false;
	
	// debris parameters
	debrisList		= [];
	debrisColor		= '#734A12';
}

// function to create a weapon from its starting values
function newWeapon(context,type,color) {
	// Weapon ( context, type, color, angle, delay, power, speed, smart, cNbr )
	var start = startValues[type];
	return new Weapon(context,type,color,0,start.delay,start.power,start.speed,start.smart,start.cannons);
}

function initTutorial(context) {
	countdownValue = 0;
}