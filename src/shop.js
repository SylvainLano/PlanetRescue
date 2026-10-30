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


// The upgrades of the pause menu : adding one only takes a new line here, and its place in shopLayout
//	- name and tip are shown in the menu (the tip's text follows its title, after " - ")
//	- max is the maximum level, price the name of its formula in calculate()
//	- level() reads the current level, raise() buys the next one
//	- appears(), if any, tells when it is worth buying : its tile stays hidden until then
//	- its tile (tiles.js) shows its picture (tilePictures), its value as the player reads it (value(), or else its level) and its unit ;
//	  its tooltip tells what one more of it does : change(), or else what it is, from its value to the next one
//	  (next(), or else its value with one step more : step, or else one, less when it is decreasing)
var upgrades = {
	// GRAVITRON
	gravSort			: { name : "Sorting", tip : "Sorting the asteroids - This means your Gravitron will attract asteroids less and debris more.",
							max : 5, price : "5powtimes4",
							level : function () { return MyGravitron.sort; }, raise : function () { MyGravitron.sort++; },
							picture : "sort", unit : "on rocks", value : function () { return rockPull ( MyGravitron.sort, MyGravitron.power ) + "%"; },
							change : function () { return "the asteroids feel " + rockPull ( MyGravitron.sort, MyGravitron.power ) + "% → " + rockPull ( MyGravitron.sort + 1, MyGravitron.power ) + "% of the pull on the debris"; } },
	gravPower			: { name : "Gravity Generator", tip : "Gravity Generator - This represent the suction power of the opened part of the Gravitron.",
							max : 5, price : "5powtimes4",
							level : function () { return MyGravitron.power; }, raise : function () { MyGravitron.power++; },
							picture : "pull", unit : "pull", value : function () { return "×" + MyGravitron.power; },
							change : function () { return "×" + MyGravitron.power + " → ×" + ( MyGravitron.power + 1 ) + " pull on the debris, the asteroids feeling "
								+ rockPull ( MyGravitron.sort, MyGravitron.power + 1 ) + "% of it"; } },
	repulsion			: { name : "Repulsion", tip : "Repulsion - This represent the repulsion power of the closed part of the Gravitron. It uses the Gravity Generator power and the Gravitron's sorting effect to perform.",
							max : 1, price : "plus250", appears : function () { return MyGravitron.power > 1; },
							level : function () { return MyGravitron.repulsion; }, raise : function () { MyGravitron.repulsion++; },
							picture : "push", unit : "", value : function () { return MyGravitron.repulsion ? "on" : "off"; },
							change : function () { return "the closed part of the Gravitron pushes the asteroids away"; } },
	gravShield			: { name : "Gravitron Shield", tip : "Gravitron Shield - With a shielding effect, your Gravitron will protect your planet (a few). It loads over time and then unloads on asteroids, thus damaging them.",
							max : 5, price : "times10plus50",
							level : function () { return MyGravitron.shield; }, raise : function () { MyGravitron.shield++; },
							picture : "shield", unit : function () { return MyGravitron.shield ? "charge" : ""; }, value : function () { return MyGravitron.shield ? MyGravitron.shield * 10 : "off"; },
							change : function () { var s = MyGravitron.shield; return ( s ? s * 10 + " → " : "" ) + ( s + 1 ) * 10 + " charge, a point every "
								+ shieldSeconds ( s + 1 ) + " s" + ( s ? " instead of " + shieldSeconds ( s ) : "" ); } },
	gravPulse			: { name : "Gravitron Pulse", tip : "Gravitron Pulse - When the shield is hit by an asteroid, it will emit a pulse that causes damages to the nearby asteroids. At level 2 it will also pulse when shield is fully loaded.",
							max : 2, price : "plus1times500", appears : function () { return MyGravitron.shield > 0; },
							level : function () { return MyGravitron.pulse; }, raise : function () { MyGravitron.pulse++; },
							picture : "pulse", unit : "of 2",
							change : function () { return MyGravitron.pulse ? "level 2, a pulse when the shield is full, too" : "level 1, a pulse when an asteroid hits the shield"; } },
	gravScanner			: { name : "Field Scanner", tip : "Field Scanner - Level 1 shows the limits of the Gravitron's field. Level 2 colors the asteroids it pulls in red, and the ones it pushes away in green.",
							max : 2, price : "plus1times50",
							level : function () { return MyGravitron.scanner; }, raise : function () { MyGravitron.scanner++; },
							picture : "eye", unit : "of 2",
							change : function () { return MyGravitron.scanner ? "level 2, coloring the asteroids pulled in red, the ones pushed away in green" : "level 1, showing the limits of the Gravitron's field"; } },
	gravProspector		: { name : "Prospector", tip : "Prospector - Your Gravitron draws in more asteroids with a metal in their rock: copper, silver or gold. Half of their debris are made of it, and worth 2, 3 or 5 mat. Each level makes them 50% more frequent.",
							max : 2, price : "plus1times50",
							level : function () { return MyGravitron.prospector; }, raise : function () { MyGravitron.prospector++; },
							picture : "crystal", unit : "metals", value : function () { return "×" + ( 1 + prospectorBonus * MyGravitron.prospector ); },
							change : function () { return "×" + ( 1 + prospectorBonus * MyGravitron.prospector ) + " → ×" + ( 1 + prospectorBonus * ( MyGravitron.prospector + 1 ) ) + " asteroids with a metal"; } },
	// brought by its research (researches.js)
	compactor			: { name : "Compactor", tip : "Compactor - Each level makes 10% more mat from the debris your Gravitron gathers.",
							max : 5, price : "plus1times100", appears : function () { return research.done.compactor ? true : false; },
							level : function () { return MyGravitron.compactor; }, raise : function () { MyGravitron.compactor++; },
							picture : "press", unit : "mat", value : function () { return "+" + Math.round ( MyGravitron.compactor * compactorBonus * 100 ) + "%"; },
							change : function () { return "+" + Math.round ( MyGravitron.compactor * compactorBonus * 100 ) + "% → +" + Math.round ( ( MyGravitron.compactor + 1 ) * compactorBonus * 100 )
								+ "% mat from the debris gathered"; } },

	// MAIN STRUCTURE
	mCMSpeed			: { name : "Main Structure Move Speed", tip : "Main Structure Move Speed - Making the Main Structure to move faster.",
							max : 5, price : "5powtimes4",
							level : function () { return mainCanMovSpeed; }, raise : function () { mainCanMovSpeed++; },
							picture : "turn", unit : "° / s", value : function () { return turnSpeed ( mainCanMovSpeed ); }, next : function () { return turnSpeed ( mainCanMovSpeed + 1 ); },
							what : "degrees per second" },
	SMART				: { name : "Main Structure SMART AI", tip : "Main Structure SMART AI - Next level of SMART AI will grant you anticipation, to make basic weapon more effective.",
							max : 5, price : "times250",
							level : function () { return mainCannon.smart; }, raise : function () { mainCannon.smart++; },
							picture : "chip", unit : "AI level", what : "level of SMART AI" },
	MaxWAtATime			: { name : "Multiple weapon", tip : "Multiple weapon structure - Each level gives you one more weapon to activate at the same time.",
							max : 2, price : "times250", appears : function () { return ownedWeapons() > 1; },
							level : function () { return maxWAtATime; }, raise : function () { maxWAtATime++; },
							picture : "weapons", unit : "at a time", what : "weapon active at a time" },
	// the critical shots of the Basic, Spiral and Magnetic weapons (bonuses.js)
	critChance			: { name : "Critical Chance", tip : "Critical Chance - The chance of a shot of your Basic, Spiral or Magnetic weapon to be critical: red, it does several times its power. Expressed in percents, 5 more at each level.",
							max : 25, price : "times10",
							level : function () { return Math.round ( critChance * 100 ); }, raise : function () { critChance = ( Math.round ( critChance * 100 ) + 5 ) / 100; },
							picture : "dice", unit : "of shots", value : function () { return Math.round ( critChance * 100 ) + "%"; },
							change : function () { return Math.round ( critChance * 100 ) + "% → " + ( Math.round ( critChance * 100 ) + 5 ) + "% of the shots critical"; } },
	critDamage			: { name : "Critical Damage", tip : "Critical Damage - How many times its power a critical shot does.",
							max : 5, price : "minus2times100",
							level : function () { return critDamage; }, raise : function () { critDamage += 0.5; },
							picture : "burst", unit : "power", value : function () { return "×" + critDamage; },
							change : function () { return "×" + critDamage + " → ×" + ( critDamage + 0.5 ) + " power for a critical shot"; } },

	// BASIC CANNON
	mCNumber			: { name : "Cannons", tip : "Basic Cannons Number - Increased fire spread, and so fire rate as well.",
							max : 5, price : "times250",
							level : function () { return mainCannon.cannonNbr; }, raise : function () { mainCannon.cannonNbr++; },
							picture : "cannons", unit : "cannons", what : "cannon" },
	mCFireRate			: { name : "Fire Rate", tip : "Basic Weapon Fire Rate - Making the weapon to fire faster. Expressed in Shots Per Second.",
							max : 5, price : "expFrom26times1000squared",
							level : function () { return Math.floor(2500/mainCannon.fireRate)/100; }, raise : function () { mainCannon.fireRate-=2; },
							picture : "bolt", unit : "shots / s", next : function () { return fireRateAfter ( mainCannon, 2 ); }, what : "shots per second" },
	mainPow				: { name : "Fire Power", tip : "Basic Shots Power - To cause more damages.",
							max : 10, price : "times3pow2",
							level : function () { return mainCannon.power; }, raise : function () { mainCannon.power++; },
							picture : "flame", unit : "damage", what : "damage per shot" },
	mainSpeed			: { name : "Fire Speed", tip : "Basic Shots Speed - To reach targets faster.",
							max : 5, price : "times10plus50",
							level : function () { return mainCannon.speed; }, raise : function () { mainCannon.speed++; },
							picture : "speed", unit : "speed", what : "speed for the shots" },

	// SPIRAL AND ORBITAL CANNON
	SaOCNumber			: { name : "Cannons", tip : "Spiral Cannons Number - Increased fire spread and unlock new modes.",
							max : 5, price : "times250",
							level : function () { return spiralCannon.cannonNbr; }, raise : function () { spiralCannon.cannonNbr++; },
							picture : "cannons", unit : "cannons", what : "cannon" },
	SaOCFireRate		: { name : "Fire Rate", tip : "Spiral Weapon Fire Rate - Making the weapon to fire faster. Expressed in Shots Per Second.",
							max : 5, price : "expFrom26times1000squared",
							level : function () { return Math.floor(2500/spiralCannon.fireRate)/100; }, raise : function () { spiralCannon.fireRate-=2; },
							picture : "bolt", unit : "shots / s", next : function () { return fireRateAfter ( spiralCannon, 2 ); }, what : "shots per second" },
	SaOPow				: { name : "Fire Power", tip : "Spiral Shots Power - To cause more damages.",
							max : 10, price : "plus1times50",
							level : function () { return spiralCannon.power; }, raise : function () { spiralCannon.power++; },
							picture : "flame", unit : "damage", what : "damage per shot" },
	// this one goes down : slower spiral shots stay longer in game
	SaOSpeed			: { name : "Fire Speed", tip : "Spiral Shots Speed - To slow down shoots, thus making more of them staying in game.",
							max : 1, decreasing : true, price : "from6times100",
							level : function () { return spiralCannon.speed; }, raise : function () { spiralCannon.speed--; },
							picture : "slow", unit : "speed", what : "speed for the shots, to stay longer" },

	// MAGNETIC CANNON
	magneticCNumber		: { name : "Cannons", tip : "Magnetic Cannons Number - Increased fire spread.",
							max : 5, price : "times250",
							level : function () { return magneticCannon.cannonNbr; }, raise : function () { magneticCannon.cannonNbr++; },
							picture : "cannons", unit : "cannons", what : "cannon" },
	magneticCFireRate	: { name : "Fire Rate", tip : "Magnetic Weapon Fire Rate - Making the weapon to fire faster. Expressed in Shots Per Second.",
							max : 5, price : "expFrom26times1000squared",
							level : function () { return Math.floor(2500/magneticCannon.fireRate)/100; }, raise : function () { magneticCannon.fireRate-=2; },
							picture : "bolt", unit : "shots / s", next : function () { return fireRateAfter ( magneticCannon, 2 ); }, what : "shots per second" },
	magneticPow			: { name : "Fire Power", tip : "Magnetic Shots Power - To cause more damages.",
							max : 10, price : "plus1times3pow2",
							level : function () { return magneticCannon.power; }, raise : function () { magneticCannon.power++; },
							picture : "flame", unit : "damage", what : "damage per shot" },
	magneticSpeed		: { name : "Fire Friction", tip : "Magnetic Shots Friction - To slow down shoots, thus making more of them staying in game.",
							max : 5, price : "times10plus50",
							level : function () { return magneticCannon.speed; }, raise : function () { magneticCannon.speed++; },
							picture : "slow", unit : "friction", what : "friction, to keep the shots longer" },

	// HAMMER AND BROOM CANNON
	HaBCNumber			: { name : "Cannons", tip : "Hammer Cannons Number - Increased fire spread.",
							max : 5, price : "times250",
							level : function () { return hammerCannon.cannonNbr; }, raise : function () { hammerCannon.cannonNbr++; },
							picture : "cannons", unit : "cannons", what : "cannon" },
	HaBCFireRate		: { name : "Fire Rate", tip : "Hammer Weapon Fire Rate - Making the weapon to fire faster. Expressed in Shots Per Second.",
							max : 5, price : "expFrom26times1000squared2",
							level : function () { return Math.floor(2500/hammerCannon.fireRate)/100; }, raise : function () { hammerCannon.fireRate-=2; },
							picture : "bolt", unit : "shots / s", next : function () { return fireRateAfter ( hammerCannon, 2 ); }, what : "shots per second" },
	HaBPow				: { name : "Fire Power", tip : "Hammer Shots Power - To cause more damages.",
							max : 10, price : "plus1times3pow2",
							level : function () { return hammerCannon.power; }, raise : function () { hammerCannon.power++; },
							picture : "flame", unit : "power", what : "power per shot" },
	HaBSpeed			: { name : "Fire Spread", tip : "Hammer Shots Spread - To slow down shoots, thus making more of them staying in game.",
							max : 5, price : "times10plus50",
							level : function () { return hammerCannon.speed; }, raise : function () { hammerCannon.speed++; },
							picture : "spread", unit : "spread", what : "spread, to keep the shots longer" },

	// MISSILE LAUNCHER : a secondary weapon, given by its research (researches.js)
	missileFireRate		: { name : "Fire Rate", tip : "Missile Fire Rate - Making the launcher to fire faster. Expressed in Missiles Per Second.",
							max : 0.5, price : "times600",
							level : function () { return Math.floor(2500/missileLauncher.fireRate)/100; }, raise : function () { missileLauncher.fireRate-=10; },
							picture : "bolt", unit : "missiles / s", next : function () { return fireRateAfter ( missileLauncher, 10 ); }, what : "missiles per second" },
	missilePow			: { name : "Blast Power", tip : "Missile Blast Power - The damages done to the asteroid touched, and half of them to the others caught in the blast.",
							max : 8, price : "times3pow2",
							level : function () { return missileLauncher.power; }, raise : function () { missileLauncher.power++; },
							picture : "flame", unit : "damage", what : "damage" },
	missileBlast		: { name : "Blast Radius", tip : "Missile Blast Radius - To catch more asteroids in each blast.",
							max : 50, price : "times10plus50",
							level : function () { return missileLauncher.blast; }, raise : function () { missileLauncher.blast+=5; },
							picture : "blast", unit : "radius", step : 5, what : "blast radius" },

	// NITROGLYCERINE LAUNCHER : another secondary weapon, given by its research
	// (this one goes down : the seconds it waits for a new capsule, once the bomb before is gone)
	nitroReload			: { name : "Reload Time", tip : "Nitroglycerine Reload Time - The time the launcher waits before firing a new capsule, once the bomb before is gone. Expressed in seconds.",
							max : 3, decreasing : true, price : "from9times100",
							level : function () { return nitroLauncher.fireRate / framesPerSecond; }, raise : function () { nitroLauncher.fireRate-=framesPerSecond; },
							picture : "hourglass", unit : "s reload", what : "seconds of reload" },
	nitroPow			: { name : "Blast Power", tip : "Nitroglycerine Blast Power - The damages done to every asteroid caught in the blast of a bomb.",
							max : 30, price : "squared",
							level : function () { return nitroLauncher.power; }, raise : function () { nitroLauncher.power+=2; },
							picture : "flame", unit : "damage", step : 2, what : "damage" },
	nitroBlast			: { name : "Blast Radius", tip : "Nitroglycerine Blast Radius - To catch more asteroids in each blast.",
							max : 80, price : "times10plus50",
							level : function () { return nitroLauncher.blast; }, raise : function () { nitroLauncher.blast+=5; },
							picture : "blast", unit : "radius", step : 5, what : "blast radius" },

	// LASER : one more secondary weapon, given by its research
	// (its cooldown goes down, in seconds as its beam's duration)
	laserPow			: { name : "Beam Power", tip : "Laser Beam Power - The damages done by the beam each second.",
							max : 24, price : "squaredtimes3",
							level : function () { return laserCannon.power; }, raise : function () { laserCannon.power+=2; },
							picture : "flame", unit : "damage / s", step : 2, what : "damage per second" },
	laserDuration		: { name : "Beam Duration", tip : "Laser Beam Duration - How long the beam burns, before it cools down. Expressed in seconds.",
							max : 5, price : "times100",
							level : function () { return laserCannon.duration / framesPerSecond; }, raise : function () { laserCannon.duration+=framesPerSecond/2; },
							picture : "beam", unit : "s beam", step : 0.5, what : "seconds of beam" },
	laserCooldown		: { name : "Cooldown", tip : "Laser Cooldown - The time the laser needs to cool down, before it fires again. Expressed in seconds.",
							max : 4, decreasing : true, price : "from16times100",
							level : function () { return laserCannon.fireRate / framesPerSecond; }, raise : function () { laserCannon.fireRate-=2*framesPerSecond; },
							picture : "cold", unit : "s cooldown", step : -2, what : "seconds of cooldown" },

	// REBOUND CANNON : the last secondary weapon, given by its research
	// (its reload time goes down, in seconds)
	reboundReload		: { name : "Reload Time", tip : "Rebound Reload Time - The time the cannon waits before firing a new shot. Expressed in seconds.",
							max : 2, decreasing : true, price : "from6times100",
							level : function () { return reboundCannon.fireRate / framesPerSecond; }, raise : function () { reboundCannon.fireRate-=framesPerSecond/2; },
							picture : "hourglass", unit : "s reload", step : -0.5, what : "seconds of reload" },
	reboundPow			: { name : "Hit Power", tip : "Rebound Hit Power - The damages done to every asteroid a shot hits.",
							max : 8, price : "times3pow2",
							level : function () { return reboundCannon.power; }, raise : function () { reboundCannon.power++; },
							picture : "flame", unit : "damage", what : "damage per hit" },
	// (two at a time : a shot going to and fro between an asteroid and the planet only hits it again every two rebounds)
	reboundBounces		: { name : "Rebounds", tip : "Rebounds - How many times a shot can ricochet, on the asteroids, the edges of space or your planet, before it is spent. Two more at each level.",
							max : 8, price : "times150",
							level : function () { return reboundCannon.rebounds; }, raise : function () { reboundCannon.rebounds+=2; },
							picture : "pinball", unit : "rebounds", step : 2, what : "rebounds" },

	// PLANET
	// healing is bought by the inhabitants : its price counts the ones left to heal, and it can heal a part of them only
	// (its tile shows the inhabitants left to heal, and tells what a click heals : healingInfo, tiles.js)
	healing				: { name : "Healing", tip : "Healing - Here you can spend your Mat to help the reconstruction of your planet.",
							max : function () { return MyPlanet.maxLife; }, price : "times-healFact",
							level : function () { return MyPlanet.life + planetHealPend; },
							toPay : function () { return MyPlanet.maxLife - MyPlanet.life - planetHealPend; },
							raise : function ( healed ) { planetHealPend += healed; },
							picture : "heal", unit : "M to heal", value : function () { return this.toPay(); } },
	healFact			: { name : "Healing Factor", tip : "Healing Factor - This will make your healing more effective: each level heals an inhabitant for 1 mat less (from 5 down to 1) and a second faster (from 5 seconds down to 1).",
							max : 5, price : "times100",
							level : function () { return planetHealFact; }, raise : function () { planetHealFact++; },
							picture : "healFactor", unit : "mat / inhab.", value : function () { return healCost(); },
							change : function () { return healCost() + " → " + ( healCost() - 1 ) + " mat per inhabitant healed, one every "
								+ Math.round ( ( healTurns() - healFaster ) / framesPerSecond ) + " s instead of " + Math.round ( healTurns() / framesPerSecond ); } },
	crews				: { name : "Rebuilding Crews", tip : "Rebuilding Crews - More crews rebuild your planet: each level heals one more inhabitant at a time, at the pace of the Healing Factor.",
							max : 3, price : "times50",
							level : function () { return planetCrews; }, raise : function () { planetCrews++; },
							picture : "crews", unit : "at a time", what : "inhabitant healed at a time" },
	maxHealth			: { name : "Maximum Health", tip : "Maximum Health - It's the maximum amount of inhabitants your planet can have on.",
							max : 50, price : "times5",
							level : function () { return MyPlanet.maxLife; }, raise : function () { MyPlanet.maxLife+=10; },
							picture : "people", unit : "M inhab.", next : function () { return MyPlanet.maxLife + 10; }, what : "million inhabitants at most" },
	maxMat				: { name : "Maximum Mat", tip : "Maximum Mat - It's the maximum amount of material your planet can store.",
							max : 1000, price : "times0.75",
							level : function () { return MyPlanet.maxMat; }, raise : function () { MyPlanet.maxMat+=100; },
							picture : "crate", unit : "mat stored", next : function () { return MyPlanet.maxMat + 100; }, what : "mat stored at most" },
	autoHeal			: { name : "Auto-Healing", tip : "Auto-Healing - Your planet heals an inhabitant for every few mat your Gravitron gathers, without spending them: every 10 mat, then 8, 6, 4 and 2 with the next levels.",
							max : 5, price : "plus1times50",
							level : function () { return planetAutoHeal; }, raise : function () { planetAutoHeal++; },
							picture : "autoHeal", unit : function () { return planetAutoHeal ? "mat / inhab." : ""; },
							value : function () { return planetAutoHeal ? autoHealMat() : "off"; },
							change : function () { return planetAutoHeal ? autoHealMat() + " → " + ( autoHealMat() - autoHealStep ) + " mat gathered per inhabitant healed"
								: "an inhabitant healed for every " + ( autoHealStep * maxUpgrade("autoHeal") ) + " mat gathered"; } },
	// (a crash gives back a fifth of its asteroid's life as mat by level : engine.js)
	recovery			: { name : "Recovery", tip : "Recovery - With this upgrade, your citizens will be able to get mat from the asteroids crashing on their planet.",
							max : 5, price : "plus1times50",
							level : function () { return planetRecovery; }, raise : function () { planetRecovery++; },
							picture : "recovery", unit : "of a crash", value : function () { return planetRecovery * 20 + "%"; },
							change : function () { return planetRecovery * 20 + "% → " + ( planetRecovery + 1 ) * 20 + "% of the inhabitants a crash takes, given back as mat"; } },
	// brought by its research (researches.js)
	earlyWarning		: { name : "Early Warning", tip : "Early Warning - Each level evacuates 5% of the inhabitants an asteroid's crash would take away.",
							max : 5, price : "plus1times100", appears : function () { return research.done.earlyWarning ? true : false; },
							level : function () { return MyPlanet.warning; }, raise : function () { MyPlanet.warning++; },
							picture : "warning", unit : "evacuated", value : function () { return Math.round ( MyPlanet.warning * warningShare * 100 ) + "%"; },
							change : function () { return Math.round ( MyPlanet.warning * warningShare * 100 ) + "% → " + Math.round ( ( MyPlanet.warning + 1 ) * warningShare * 100 )
								+ "% of the inhabitants a crash would take, evacuated"; } },
	// the planet's lab, needed for any research (researches.js) : it comes once an achievement has opened a branch of the research tree,
	// and its level 2, the Automation, does the researches one after the other by itself
	lab					: { name : "Research Lab", tip : "",
							max : 2, price : "times200plus100", appears : function () { return anyBranchOpen(); },
							level : function () { return research.lab; }, raise : function () { research.lab++; },
							picture : "lab", unit : "", value : function () { return [ "off", "lab", "auto" ][research.lab]; },
							change : function () { return research.lab ? "the Automation, doing the researches by itself" : "the lab, needed for any research"; } }
};

// The layout of the pause menu, built by menu.js : its sections, the weapons' one being split into tabs
// (a weapon's upgrades are shown once it is bought, and a tab with appears() stays hidden until then :
// each weapon comes once the one before is bought, a secondary weapon once its research is validated)
var shopLayout = [
	{ title : "Upgrade Your Gravitron", upgrades : ["gravSort","gravPower","repulsion","gravShield","gravPulse","gravScanner","gravProspector","compactor"] },
	{ title : "Build or upgrade your Weapons", panels : [
		{ tab : "Structure", title : "Main Structure", upgrades : ["mCMSpeed","SMART","MaxWAtATime","critChance","critDamage"] },
		{ tab : "Basic", title : "Basic Weapon", weapon : "basicW",
			statusTip : "By making this weapon active, you could disactivate the current one.",
			upgrades : ["mCNumber","mCFireRate","mainPow","mainSpeed"] },
		{ tab : "Spiral", title : "Spiral and Orbital Weapon", weapon : "SaOW", modes : true,
			statusTip : "By making this weapon active, you could disactivate one of the current one.",
			upgrades : ["SaOCNumber","SaOCFireRate","SaOPow","SaOSpeed"] },
		{ tab : "Magnet", title : "Magnetic Weapon", weapon : "magneticW", modes : true,
			appears : function () { return spiralCannon.cannonNbr > 0; },
			statusTip : "By making this weapon active, you could disactivate one of the current one.",
			upgrades : ["magneticCNumber","magneticCFireRate","magneticPow","magneticSpeed"] },
		{ tab : "Hammer", title : "Hammer and Broom Weapon", weapon : "HaBW", modes : true,
			appears : function () { return magneticCannon.cannonNbr > 0; },
			statusTip : "By making this weapon active, you could disactivate one of the current one.",
			upgrades : ["HaBCNumber","HaBCFireRate","HaBPow","HaBSpeed"] },
		// a secondary weapon : its tab is shown once its research is validated
		{ tab : "Missile", title : "Missile Launcher", secondary : "missileW",
			appears : function () { return missileLauncher.cannonNbr > 0; },
			statusTip : "A secondary weapon, always active : it takes no place among your active weapons.",
			upgrades : ["missileFireRate","missilePow","missileBlast"] },
		{ tab : "Nitro", title : "Nitroglycerine Launcher", secondary : "nitroW",
			appears : function () { return nitroLauncher.cannonNbr > 0; },
			statusTip : "A secondary weapon, always active : it takes no place among your active weapons.",
			upgrades : ["nitroReload","nitroPow","nitroBlast"] },
		{ tab : "Laser", title : "Laser Cannon", secondary : "laserW",
			appears : function () { return laserCannon.cannonNbr > 0; },
			statusTip : "A secondary weapon, always active : it takes no place among your active weapons.",
			upgrades : ["laserPow","laserDuration","laserCooldown"] },
		{ tab : "Rebound", title : "Rebound Cannon", secondary : "reboundW",
			appears : function () { return reboundCannon.cannonNbr > 0; },
			statusTip : "A secondary weapon, always active : it takes no place among your active weapons.",
			upgrades : ["reboundReload","reboundPow","reboundBounces"] }
	] },
	{ title : "Heal or upgrade your Planet", upgrades : ["healing","healFact","crews","maxHealth","maxMat","autoHeal","recovery","earlyWarning","lab"] },
	{ title : "Researches", researches : true }		// filled by refreshResearches() (researches.js)
];

// what the next level of SMART AI brings, for the upgrade menu
var smartNextLevel = [
	"",
	"Next level of SMART AI will grant you anticipation, to make the basic weapon more effective.",
	"Next level of SMART AI will stop wasting shots : only the shots needed to destroy a target, and none at the asteroids out of reach.",
	"Next level of SMART AI will choose the target it can hit the soonest, turning and shooting.",
	"Next level of SMART AI will shoot first at the asteroids going to crash on your planet.",
	"Your SMART AI is at its best : no more level available."
];

// what the next level of the Research Lab brings, for the upgrade menu
var labNextLevel = [
	"Research Lab - Your planet needs it to do any research. Then the researches of the branches your achievements opened can be started from the Researches section.",
	"Research Lab - Its next level, the Automation, validates each research once complete, and starts the next one by itself : the one to be done the soonest. You can still stop it, and choose another one.",
	"Research Lab - Your lab does the researches by itself : no more level available."
];

// function to activate a weapon
function activate ( weapon ) {
	// buying the weapon first if needed, so that a lack of mat leaves the active weapons untouched
	var purchased = false;
	for ( i in weaponList ) {
		if ( weaponList[i].type == weapon && weaponList[i].cannonNbr == 0 ) {
			var price = weaponCost[weapon];
			if ( MyPlanet.mat < price ) {
				document.getElementById(weapon).innerHTML = "<span class='red'>not enough mat, please activate another weapon</span>";
				return;
			}
			MyPlanet.mat -= price;
			nbrUpgrades++;
			nbrCost += price;
			weaponList[i].cannonNbr++;
			purchased = true;
		}
	}
	for ( i in weaponList ) {
		var item = document.getElementById(weaponList[i].type);
		if ( weaponList[i].type == weapon ) {
			weaponList[i].active = 1;
			item.innerHTML = "<span class='green'>active</span>";
		} else if ( weaponList[i].cannonNbr == 0 ) {
			weaponList[i].active = 0;
			item.innerHTML = purchaseStatus ( weaponList[i] );
		} else if ( weaponList[i].active >= maxWAtATime || weaponList[i].active == 0 ) {
			weaponList[i].active = 0;
			item.innerHTML = "<span class='red'>inactive</span>";
		} else {
			weaponList[i].active++;
		}
	}
	if ( purchased ) {
		refresh();
	}
}

// function to display the purchase status of a weapon not bought yet
function purchaseStatus ( weapon ) {
	var price = weaponCost[weapon.type];
	if ( MyPlanet.mat >= price ) {
		return "<span class='blue'>purchase for " + price + " mat</span>";
	} else {
		return "<span class='blue'>" + price + " mat needed to purchase</span>";
	}
}

// function to change a weapon's mode
function modeChange ( weapon ) {
	for ( i in weaponList ) {
		if ( weaponList[i].type == weapon ) {
			if ( weapon == "SaOW" ) {
				weaponList[i].smart = ( weaponList[i].smart + 1 ) % Math.ceil( weaponList[i].cannonNbr / 2 );
				modeUpdate ( weaponList[i] );
			} else if ( weapon == "magneticW" ) {
				weaponList[i].smart = ( weaponList[i].smart + 1 ) % 2;
				modeUpdate ( weaponList[i] );
			} else if ( weapon == "HaBW" ) {
				weaponList[i].smart = ( weaponList[i].smart + 1 ) % 3;
				modeUpdate ( weaponList[i] );
			}
		}
	}
}

// function to update the weapon's mode used
function modeUpdate ( weapon ) {
	var item = document.getElementById(weapon.type + "Mode");
	if ( weapon.type == "SaOW" ) {
		if ( weapon.smart == 0 ) {
			item.innerHTML = "<span class='green'>synchronised</span>";
		} else if ( weapon.smart == 1 ) {
			item.innerHTML = "<span class='green'>not synchronised</span>";
		} else {
			item.innerHTML = "<span class='green'>ORBITAL !</span>";
		}
	} else if ( weapon.type == "magneticW" ) {
		if ( weapon.smart == 0 ) {
			item.innerHTML = "<span class='green'>following</span>";
		} else {
			item.innerHTML = "<span class='green'>revolution</span>";
		}
	} else if ( weapon.type == "HaBW" ) {
		if ( weapon.smart == 0 ) {
			item.innerHTML = "<span class='green'>following Main Structure</span>";
		} else if ( weapon.smart == 1 ) {
			item.innerHTML = "<span class='green'>revolution</span>";
		} else {
			item.innerHTML = "<span class='green'>following Gravitron</span>";
		}
	}
}

// function to refresh the upgrade menu
function refresh() {
	document.getElementById("matNbr").innerHTML = MyPlanet.mat;
	upgrades.SMART.tip = "Main Structure SMART AI - " + smartNextLevel[translate("SMART")];
	upgrades.lab.tip = labNextLevel[translate("lab")];
	for ( var iw=1; iw<=weaponList.length; iw++ ){
		var item = document.getElementById(weaponList[iw-1].type + "Upgrades");
		if ( weaponList[iw-1].cannonNbr < 1 ) {
			item.style.display = "none";
			document.getElementById(weaponList[iw-1].type).innerHTML = purchaseStatus ( weaponList[iw-1] );
		} else {
			item.style.display = "";		// its lines join the panel's columns (css/main.css)
		}
		modeUpdate ( weaponList[iw-1] );
	}
	refreshResearches();
	refreshTiles();
	refreshAppearing();
	refreshBadges();
}

// function to find a weapon by its type, the secondary ones too
function weaponOfType ( type ) {
	var secondary = [ missileLauncher, nitroLauncher, laserCannon, reboundCannon ];
	for ( var s in secondary ) {
		if ( type == secondary[s].type ) {
			return secondary[s];
		}
	}
	for ( var w in weaponList ) {
		if ( weaponList[w].type == type ) {
			return weaponList[w];
		}
	}
}

// function to know if something of the menu is shown : its weapon tab and its line, which may wait for something else (appears),
// and in the Adventure, the level must bring it (adventure.js)
function thingAppears ( thing ) {
	var upgrade = upgrades[thing.upgrade];
	return ( !thing.appears || thing.appears() ) && ( !upgrade || !upgrade.appears || upgrade.appears() )
		&& adventureAllows ( thing.upgrade || thing.weapon );
}

// function to get the price of something of the menu, or false when it can't be bought now :
// something still hidden, a weapon already bought, an upgrade at its maximum, or the upgrade of a weapon not there yet
// (healing can be bought for a single inhabitant)
function thingPrice ( thing ) {
	if ( !thingAppears ( thing ) ) {
		return false;
	}
	if ( thing.weapon ) {
		return ( weaponOfType ( thing.weapon ).cannonNbr == 0 ) ? weaponCost[thing.weapon] : false;
	}
	if ( thing.owner && weaponOfType ( thing.owner ).cannonNbr < 1 ) {
		return false;
	}
	if ( maxReached ( thing.upgrade ) ) {
		return false;
	}
	if ( thing.upgrade == "healing" ) {
		return maxUpgrade("healFact") - planetHealFact + 1;
	}
	return priceToPay ( thing.upgrade );
}

// function to know if something of the menu is an upgrade at its maximum (not one of a weapon still to buy, nor a hidden one)
function thingMaxed ( thing ) {
	if ( !thing.upgrade || !thingAppears ( thing ) || ( thing.owner && weaponOfType ( thing.owner ).cannonNbr < 1 ) ) {
		return false;
	}
	return maxReached ( thing.upgrade );
}

// function to determine the maximum update you can reach
function maxUpgrade(thing) {
	var max = upgrades[thing].max;
	if ( typeof max == "function" ) {
		return max();
	}
	return max;
}

// function to know if an upgrade has reached its maximum
function maxReached(thing) {
	if ( upgrades[thing].decreasing ) {
		return translate(thing) <= maxUpgrade(thing);
	}
	return translate(thing) >= maxUpgrade(thing);
}

// function to upgrade things...
function upgrade(thing) {
	if ( maxReached(thing) ) {
		return;
	}
	var price=enoughFor(thing);
	var HPRecovery = 0;
	if ( thing == "healing") {
		// without enough mat to heal everything, healing as many inhabitants as possible
		var healFact = (maxUpgrade("healFact") - planetHealFact + 1 );
		HPRecovery = priceToPay("healing") / healFact;
		if ( MyPlanet.mat >= healFact && price == false) {
			HPRecovery = Math.floor ( MyPlanet.mat / healFact );
			price = HPRecovery * healFact;
		}
	}
	if (price != false) {
		upgrades[thing].raise(HPRecovery);
		MyPlanet.mat -= price;
		if ( thing != "healing" ) {
			// healing is not counted as an upgrade
			nbrUpgrades++;
		}
		nbrCost += price;
	}

	refresh();
}

// function to determine if enough mat
function enoughFor(what) {
	var price = priceToPay(what);
	if (MyPlanet.mat >= price) {
		return price;
	} else {
		return false;
	}
}

// function to return the price to pay for what
function priceToPay(what) {
	var item = upgrades[what];
	if ( item.toPay ) {
		return calculate(item.price,item.toPay());
	}
	return calculate(item.price,translate(what));
}

// function to read the current level of an upgrade
function translate(that) {
	return upgrades[that].level();
}

// function to determine a price
function calculate(type,ref) {
	switch (type) {
		case "5powtimes4" :
			ref = 4 * Math.pow(5,ref);
			break;
		case "times10plus50" :
			ref = ( 10 * ref ) + 50;
			break;
		case "times3pow2" :
			ref = Math.pow((ref*3),2);
			break;
		case "plus1times3pow2" :
			ref = Math.pow(((ref+1)*3),2);
			break;
		case "expFrom26times1000squared" :
			ref = Math.floor(Math.sqrt(Math.exp(26-(25/ref))*1000));
			break;
		case "expFrom26times1000squared2" :
			ref = Math.floor(Math.sqrt(Math.exp(26-(12.5/ref))*1000));
			break;
		case "times250" :
			ref *= 250;
			break;
		case "times100" :
			ref *= 100;
			break;
		case "times10" :
			ref *= 10;
			break;
		case "times50" :
			ref *= 50;
			break;
		case "minus2times100" :
			ref = ( ref - 2 ) * 100;
			break;
		case "times150" :
			ref *= 150;
			break;
		case "plus1times100" :
			ref = ( ref + 1 ) * 100;
			break;
		case "times600" :
			ref = Math.round ( ref * 600 );
			break;
		case "times0.75" :
			ref *= 0.75;
			break;
		case "plus1times50" :
			ref = ( ref + 1 ) * 50;
			break;
		case "times5" :
			ref *= 5;
			break;
		case "times-healFact" :
			ref *= ( maxUpgrade("healFact") - planetHealFact + 1 );
			break;
		case "times200plus100" :
			ref = ref * 200 + 100;
			break;
		case "plus250" :
			ref += 250;
			break;
		case "plus1times500" :
			ref = ( ref + 1 ) * 500;
			break;
		case "from6times100" :
			ref = ( 6 - ref ) * 100;
			break;
		case "from9times100" :
			ref = ( 9 - ref ) * 100;
			break;
		case "squared" :
			ref *= ref;
			break;
		case "squaredtimes3" :
			ref = ref * ref * 3;
			break;
		case "from16times100" :
			ref = ( 16 - ref ) * 100;
			break;
	}
	return ref;
}
