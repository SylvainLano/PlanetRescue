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
	// game parameters
	if( localStorage["displayS"] === null || localStorage["displayS"] === undefined ){
		localStorage["displayS"] = "bars";
		var displayS = "bars";
	}else{
		var displayS = localStorage["displayS"];
	}
	var state 			= "menu";
	var potential		= 200;
	var difficulty		= 100;
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
	var planetLife		= 20;
	var planetMaxLife	= planetLife;
	var planetAutoHeal	= 0;
	var planetHealFact	= 1;
	var planetHealTimer	= 0;
	var planetHealPend	= 0;
	var planetMat		= 20;
	var planetMaxMat	= 100;
	var planetTotalMat	= 0;
	var planetRecovery	= 0;
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
	var mainCanMovSpeed	= 2;
	var maxWAtATime		= 1;
	var orbitalNbr		= 0;
	
	// player's GRAVITRON parameters
	var key				= [0,0,0,0,0,0,0];		// counterclockwise, clockwise, close, open, pause, change target, erase target choice
	var gravSuction		= 0.05;
	var gravRepulsion	= 0;
	var gravColor		= '#666666';
	var gravRadius		= planetRadius * 1.1;
	var gravFriction	= 30;					// expressed in percents
	var gravMinSize		= Math.PI / 64;
	var gravMaxSize		= 2 * Math.PI - gravMinSize;
	var gravSort		= 1;
	var gravPower		= 1;
	var gravShield		= 0;
	var gravPulse		= 0;
	var pulseList		= new Array();
	
	// asteroids parameters
	var asteroidList	= new Array();
	var asteroid1Skin	= 'img/asteroid1.png';
	var asteroidBS		= 0.20;		// Base speed for the asteroids
	var asteroidBR		= 8;		// Base radius for the asteroids
	var asteroidBM		= 8;		// Base mass for the asteroids
	var MaxCollSpd		= 10;		// Max Collision Speed for the asteroid to bounce without being destroyed
	var targetedA		= false;
	
	// debris parameters
	var debrisList		= new Array();
	var debrisColor		= '#734A12';

	
	
function initDefault(context) {
	// game parameters
	potential		= 200;
	difficulty		= 100;
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
	MyPlanet.life		= planetLife;
	MyPlanet.maxLife	= planetLife;
	MyPlanet.mat		= planetMat;
	MyPlanet.maxMat		= planetMaxMat;
	MyPlanet.totalMat	= planetTotalMat;
	MyPlanet.radius		= planetRadius;
	MyPlanet.mass		= planetMass;
	MyPlanet.x			= planetX;
	MyPlanet.y			= planetY;
	planetAutoHeal		= 0;
	planetHealFact		= 1;
	planetHealTimer		= 0;
	planetHealPend		= 0;
	planetRecovery		= 5;
	
	// player's weapons parameters
	// Weapon ( context, type, color, angle, delay, power, speed, smart, cNbr )
	shotList		= [];
	weaponList		= [];
	maxWAtATime		= 1;							// Maximum amount of active weapons
	mainCannon		= new Weapon(context,"basicW","#FFFFFF",0,25,2,1,1,1);
	spiralCannon	= new Weapon(context,"SaOW","#00FFFF",0,25,1,5,0,0);
	magneticCannon	= new Weapon(context,"magneticW","#964514",0,25,3,1,0,0);
	hammerCannon	= new Weapon(context,"HaBW","#0099CC",0,50,1,1,0,0);
	weaponList.push(mainCannon);
	weaponList.push(spiralCannon);
	weaponList.push(magneticCannon);
	weaponList.push(hammerCannon);
	activate("basicW");
	mainCanMovSpeed	= 2;
	orbitalNbr		= 0;
	
	// player's GRAVITRON parameters
	MyGravitron.suction		= gravSuction;
	MyGravitron.repulsion	= gravRepulsion;
	MyGravitron.shield		= gravShield;
	MyGravitron.charge		= 0;
	MyGravitron.counter		= 0;
	MyGravitron.power		= gravPower;
	MyGravitron.sort		= gravSort;
	MyGravitron.pulse		= gravPulse;
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
	asteroidBS		= 0.5;		// Base speed for the asteroids
	asteroidBR		= 8;		// Base radius for the asteroids
	asteroidBM		= 8;		// Base mass for the asteroids
	MaxCollSpd		= 10;		// Max Collision Speed for the asteroid to bounce without being destroyed
	targetedA		= false;
	
	// debris parameters
	debrisList		= [];
	debrisColor		= '#734A12';
}

function initTutorial(context) {
	countdownValue = 0;
}