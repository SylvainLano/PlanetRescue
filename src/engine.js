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

// Explicit function, called 25 times a second : it plays the game, which drawGame draws at each refresh of the screen
// (until 2026, it drew the game itself, 25 times a second)
function engine() {
	// The canvas' context, for the objects to know it
	var main = document.getElementById('mainArea');
	var ctx = main.getContext('2d');
	var status = document.getElementById("status");
	var startMenu = document.getElementById("startMenu");
	var mainMenu = document.getElementById("mainMenu");
	var infoText = document.getElementById("infoText");
	var achievementsText = document.getElementById("achievementsText");
	var adventureMap = document.getElementById("adventureMap");
	var starShop = document.getElementById("starShop");
	var gameOver = document.getElementById("gameOver");
	var loader = document.getElementById("loader");
	var pauseScreen = document.getElementById("pause");

	// the laser hums while it fires, and only then (sound.js)
	laserHum ( state == "playing" && pause == 0 && laserCannon && laserCannon.firing > 0 );

	if(state == "menu") {
		
		// Displaying start menu
		startMenu.style.display = "block";
		mainMenu.style.display = "block";
		infoText.style.display = "none";
		achievementsText.style.display = "none";
		adventureMap.style.display = "none";
		starShop.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		loader.style.display = "none";
		showAchievementCount();
		showMenuPages();		// the Adventure's page, with its levels, and the Arcade's (adventure.js)

	} else if(state == "infos") {

		// Displaying start menu
		startMenu.style.display = "block";
		mainMenu.style.display = "none";
		infoText.style.display = "block";
		infoText.classList.toggle("adventure", adventureReady && menuPage == "adventure");	// (the Adventure's mission, opened from its page)
		achievementsText.style.display = "none";
		adventureMap.style.display = "none";
		starShop.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		loader.style.display = "none";

	} else if(state == "achievements") {

		// Displaying the achievements, from the start menu (achievements.js)
		startMenu.style.display = "block";
		mainMenu.style.display = "none";
		infoText.style.display = "none";
		achievementsText.style.display = "block";
		adventureMap.style.display = "none";
		starShop.style.display = "none";
		showAchievements(achievementsText);
		state = "stand";

	} else if(state == "map") {

		// Displaying the map of the Adventure's levels, from the start menu or a level's end (adventure.js)
		startMenu.style.display = "block";
		mainMenu.style.display = "none";
		infoText.style.display = "none";
		achievementsText.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		adventureMap.style.display = "block";
		starShop.style.display = "none";
		showMap(adventureMap);
		state = "stand";

	} else if(state == "story") {

		// Telling the Adventure's story, from the start menu, the map or the Colossus's end, over everything (story.js)
		startMenu.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		var storyScreen = document.getElementById("story");
		storyScreen.style.display = "block";
		showStory(storyScreen);
		state = "stand";

	} else if(state == "upgrades") {

		// Displaying the tree of the Adventure's stars, from its map (starshop.js)
		startMenu.style.display = "block";
		mainMenu.style.display = "none";
		infoText.style.display = "none";
		achievementsText.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		adventureMap.style.display = "none";
		starShop.style.display = "block";
		showStarShop(starShop);
		state = "stand";

	} else if (state == "init"){
	
		startMenu.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		// a level of the Adventure starts with its own values, the Arcade with the difficulty level's (adventure.js), the tutorial with the Normal one's
		initDefault(ctx,inAdventure() ? adventureLevels[adventure.level].values : inTutorial() ? "normal" : difficulty);
		if ( inAdventure() ) {
			applyStarBonuses();		// and the bonuses bought with its stars (starshop.js),
			startLevel();			// then what the level gives at its start (adventure.js)
		}
		// the countdown's banner is drawn on the game, at the top, and hidden until the countdown begins
		banner.y = 0;
		banner.alpha = 0;
		banner.background = 0;
		if ( countdownValue > 0 ) {
			state = "countdown";
		} else {
			status.style.display = "block";
			state = "playing";
		}

		// (the hi-scores are the Arcade's)
		if ( !inAdventure() && !inTutorial() ) {
			var playedGames = localStorage[scoreKey('playedGames')];
			if( playedGames === null || playedGames === undefined ){
				localStorage[scoreKey('playedGames')] = 1;
			} else {
				localStorage[scoreKey('playedGames')]++;
			}
		}
		
	} else if (state == "countdown"){
	
		MyPlanet.Turn();
		if ( countdownValue <= 0 ){
			status.style.display = "block";
			state = "playing";
			countdownValue=10;
		} else {
			var Z = Math.floor((countdownValue-1)/25);
			var step = countdownValue - ( Z * 25 );
			var posTop = (300 - (countdownValue*300/countdownStart));
			if( Z == 0 ) {	Z = "GO !";	}
			if( posTop > 240) {	posTop = 240;	}
			// the banner going down, drawn on the game by drawGame
			banner.text = Z;
			banner.y = posTop;
			banner.alpha = 4*step/100;
			banner.background = 0.5;
			countdownValue--;
		}
		
		
	} else if (state == "hiscores"){
	
		startMenu.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		gameOver.style.display = "block";
		showHiScores(gameOver,difficulty);	// the records of the chosen level, the others by their tabs (gameover.js)
		state = "stand";
		
	} else if (state == "playing"){
	
	// Making the Red Effect fade, when planet is hit!
	if ( redEffect != 0 ) {
		redEffect -= 64;
		if( redEffect < 0 ) { redEffect = 0; }
	}

	// Making the countdown's banner disappear
	if ( countdownValue <= 0 ) {
		banner.alpha = 0;
		banner.background = 0;
	} else {
		banner.background = countdownValue/20;
		countdownValue--;
	}
	
	// Managing the game-over and pause
	// (the Auto-Healing adds inhabitants to heal as the planet gathers mat : autoHealing, functions.js)
	if ( planetHealPend > 0 && pause == 0 ) {
		planetHealTimer++;
	}
	if ( planetHealTimer >= healTurns() ) {
		var healed = Math.min ( planetCrews, planetHealPend );	// (the Rebuilding Crews heal several at a time)
		planetHealPend -= healed;
		planetHealTimer = 0;
		MyPlanet.life += healed;
	}
	// the planet can't fall in the tutorial (tutorial.js)
	if ( inTutorial() && MyPlanet.life < 1 ) {
		MyPlanet.life = 1;
	}
	// the Shelters save the planet, once in a game (researches.js)
	if ( MyPlanet.life <= 0 && MyPlanet.shelters == 1 ) {
		openShelters();
	}
	if ( MyPlanet.life <= 0 ){
		MyPlanet.life = 0;
		planetHealPend = 0;
		planetHealTimer = 0;
		pause = 2;
		nbrLostShots += shotList.length;
		shotList = [];
		missileList = [];
		capsuleList = [];
		laserCannon.firing = 0;
		reboundList = [];
		flashList = [];
		kamikazeList = [];
	} else if ( key[4] == 1 && pause == 0 ) {
		pause++; pauseStep++;
		refresh();
		pauseScreen.style.display = "block";
		// a research waiting for the player : its section opens with the pause (researches.js)
		if ( researchNews() == "complete" || researchNews() == "available" ) {
			openSection(researchSection);
		}
	} else if ( pauseStep == 1 && key[4] == 0 ) {
		pauseStep++;
	} else if ( pauseStep == 2 && key[4] == 1 ) {
		pauseStep++;
	} else if ( pauseStep == 3 && key[4] == 0 ) {
		pause=0; pauseStep=0;
		pauseScreen.style.display = "none";
		hideTooltip();
	}

	// Resolving the debris
	debrisList = resolveDebris(debrisList,ctx,MyPlanet,pause,gravSuction,MyGravitron.power,MyGravitron.sort,debrisColor);

	
	if ( pause == 0 ) {
		// The research going on advances with the time of play (researches.js)
		advanceResearch();

		gameTime++;
		// the time with the store full, the Gravitron gathering nothing more, for the tips of the game's end (gameover.js)
		if ( MyPlanet.mat >= MyPlanet.maxMat ) {
			fullTurns++;
		}
		if ( inTutorial() ) {
			// the tutorial's lessons send their own asteroids (tutorial.js)
			advanceTutorial(ctx);
		} else if ( inAdventure() ) {
			// the level of the Adventure sends its waves (adventure.js)
			advanceWaves(ctx);
		} else {
			// Creating an asteroid when the timer runs out, the timer getting shorter as time passes
			spawnTimer--;
			if ( spawnTimer <= 0 ) {
				spawnTimer = spawnInterval();
				// a giant now and then, after a while : much stronger, bigger, heavier and slower, a threat to destroy first
				var giant = gameTime >= gameValues.giantFrom * framesPerSecond && Math.random() < gameValues.giantChance;
				arcadeKind(launchAsteroid(ctx,Math.random() * Math.PI * 2,giant));	// (or another threat now and then : threats.js)
			}
			// and the other threats, one more every two minutes (threats.js)
			arcadeThreats(ctx);
		}
		// the NAZA's announces count down to what they announce (threats.js)
		advanceAnnounces(ctx);
		// the camera goes to the duel's view, once it began (boss.js)
		advanceCamera();
		// and the kamikazes are built, and fly to the asteroids they were sent to (kamikaze.js)
		advanceKamikazes(ctx);
	}	// this is the pause bracket

	
	// Resolving the asteroids
	if ( pause == 2 ) {
		// If game is over, let's destroy every asteroid one by one
		if ( asteroidList.length == 0 ) {
			// If there is no more asteroid, display the Game Over screen
			if( pauseStep != 0){
				checkAchievements();	// the ones of the game's end, before they are listed
				status.style.display = "none";
				gameOver.style.display = "block";
				if ( inAdventure() ) {
					showLevelEnd(gameOver,false);	// the level lost (adventure.js)
				} else {
					showGameOver(gameOver);	// its score, its numbers, its records and its achievements (gameover.js)
				}
				pauseStep = 0;
			}
		} else {
			if ( pauseStep > 6 ) {
			
				for(i=0;i<asteroidList[0].life;i++){
					addDebris(ctx,1,asteroidList[0].x,asteroidList[0].y,Math.random(),Math.random(),debrisList,asteroidList[0].metal);
				}
				asteroidList.shift();
				pauseStep = 0;
				
			}
			pauseStep++;
		}
	}
	
	var tempList = new Array();
	var closestA = false;
	var closestD = gameSize;
	var reachA = false;		// the closest asteroid within reach of the main cannon's shots (SMART 2's target : functions.js)
	var reachD = gameSize;
	var tempList = new Array();
	var passedNbr = 0;
	for (i in asteroidList) {
	
		// a var to know if we're gonna keep this asteroid into the array
		var keepit = 1;
		
		// managing the all target passed
		if ( allPassed == 1 ) {
			asteroidList[i].pass = 0;
		}
			
		if ( asteroidList[i].life <= 0 ) {
			// This one is done (the ones crashing on the planet are removed right away, they don't come here)
			// a bomb destroyed explodes (secondary.js)
			if ( asteroidList[i].bomb ) {
				explodeBomb(ctx,asteroidList[i]);
			}
			// a splitting one bursts into its parts, kept for the next turn (threats.js)
			if ( asteroidList[i].splitter && pause == 0 ) {
				splitRock(ctx,asteroidList[i],tempList);
			}
			keepit = 0;
			nbrDestroyed++;
			if ( asteroidList[i].giant ) {
				nbrGiants++;
			}
			playSound ( asteroidList[i].giant ? "giant" : "destroy" );
		} else if (pause == 0) {
		
		// Calculating distance to the player's planet
		var distance = distanceToPlanet(asteroidList[i].x, asteroidList[i].y);
		if ( asteroidList[i].giant && distance < giantClosest ) {
			giantClosest = distance;
		}
		if ( asteroidList[i].armored && distance < armorClosest ) {
			armorClosest = distance;		// (the same for the armored asteroids : threats.js)
		}
		// resolving gravitron's gravity !
			// Calculating angle around the planet to the asteroid
			var angle = angleAroundPlanet(asteroidList[i].x,asteroidList[i].y);		
			
			// Pulling the asteroid if it is into the gravitron's field, or braking it with the repulsion
			// (not a frozen one, held by the Cryo : cryo.js)
			var pull = asteroidList[i].frozen ? 0 : gravitronAcceleration(angle, asteroidList[i].mass, asteroidList[i].vx, asteroidList[i].vy);
			if ( asteroidList[i].frozen ) {
				holdFrozen(asteroidList[i]);
			}
			var heading = Math.atan2(asteroidList[i].vy, asteroidList[i].vx);
			asteroidList[i].vx += pull * Math.cos(angle);
			asteroidList[i].vy += pull * Math.sin(angle);
			// how much the GRAVITRON turns its way (a pull straight toward the planet turns nothing)
			if ( pull != 0 ) {
				var turn = Math.atan2(asteroidList[i].vy, asteroidList[i].vx) - heading;
				asteroidList[i].turned += Math.abs ( ( ( turn + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI );
			}
			// in the opening, the Gravity Brake slows it down, the heavy ones less (researches.js)
			if ( MyGravitron.brake > 0 && pull < 0 ) {
				var brake = 1 - brakeRate * asteroidBM / asteroidList[i].mass;
				asteroidList[i].vx *= brake;
				asteroidList[i].vy *= brake;
			}
			// coming into the planet's Thick Atmosphere, it burns, once on its way (researches.js)
			if ( MyPlanet.atmosphere > 0 && !asteroidList[i].burnt && distance < MyPlanet.radius + atmosphereDepth ) {
				burnInAtmosphere(ctx,asteroidList[i]);
			}
			if ( asteroidList[i].burning > 0 ) {
				asteroidList[i].burning--;
			}

			// Testing if asteroid is out of the gravitron's field
			if (intoArcField(angle,MyGravitron) == false) {

				// Checking if there's a pulse hitting the asteroid
				for (p in pulseList) {
					if ( Math.abs ( distance - pulseList[p].radius ) < ( asteroidList[i].radius / 2 ) && intoArcField(angle,pulseList[p]) == false ) {
						if ( pulseList[p].charge < asteroidList[i].life ) {
							asteroidList[i].life -= pulseList[p].charge;
							addDebris(ctx,pulseList[p].charge,asteroidList[i].x,asteroidList[i].y,asteroidList[i].vx,asteroidList[i].vy,debrisList,asteroidList[i].metal);
							pulseList[p].charge = 0;
						} else {
							pulseList[p].charge -= asteroidList[i].life;
							addDebris(ctx,asteroidList[i].life,asteroidList[i].x,asteroidList[i].y,asteroidList[i].vx,asteroidList[i].vy,debrisList,asteroidList[i].metal);
							asteroidList[i].life = 0;
						}
					}
				}
				
				// Testing if asteroid is hitting the shield
				if ( MyGravitron.shield > 0 ) {
					if ( distance < (gravRadius + asteroidList[i].radius) && MyGravitron.charge > 0 ){
						if(asteroidList[i].life < MyGravitron.charge) {
							MyGravitron.charge -= asteroidList[i].life;
							asteroidList[i].life = 0;
							if ( MyGravitron.pulse > 0 ) {
								pulseList = emitPulse(ctx,pulseList);
							}
						} else {
							asteroidList[i].life -= MyGravitron.charge;
							MyGravitron.charge = 0;
						}
						MyGravitron.counter = 0;
						playSound ( "shield" );
						shieldHit[0] = 1;
						shieldHit[1] = gravRadius;
						shieldHit[2] = MyGravitron.angle;
						shieldHit[3] = MyGravitron.wideness;
					}
				}
			}
			
		// (an asteroid curled by the Colossus turning on its arc : boss.js)
		if ( asteroidList[i].trail ) {
			curlTurn(asteroidList[i]);
		}

		// Calculating positions
		asteroidList[i].x += asteroidList[i].vx;
		asteroidList[i].y += asteroidList[i].vy;
		asteroidList[i].spin += asteroidList[i].spinSpeed;

		// Testing if asteroid is the closest to the player's planet
		if( distance < closestD && asteroidList[i].pass == 0){
			closestA = asteroidList[i];
			closestD = distance;
		}
		if ( distance < reachD && asteroidList[i].pass == 0 && !outOfReach ( asteroidList[i] ) ) {
			reachA = asteroidList[i];
			reachD = distance;
		}
		
		// Testing if asteroid still in game
		if ( ( distance > fieldReach && ( inAdventure() || asteroidList[i].flyBy ) ) || outOfDuel ( asteroidList[i] ) ){

		// in the Adventure, an asteroid gone so far is gone for good, for the waves to stay as written (adventure.js),
		// a comet or a swarm's pebble flies by for good (threats.js), and in the duel, one going away out of sight (boss.js)
			keepit = 0;
			asteroidList[i].life = 0;

		} else if ( distance > fieldReach ){

		// Asteroid outta game, relaunching it toward player's planet

			// angle has already been calculated before

			// lauching asteroid right through
 			var velocity = (Math.random() * 4 + 1) * asteroidSpeedFactor() * asteroidBS * ( asteroidList[i].giant ? giantSpeed : 1 );
			asteroidList[i].vx = - velocity * Math.cos(angle);
			asteroidList[i].vy = - velocity * Math.sin(angle);
			asteroidList[i].turned = 0;		// a new way, which the GRAVITRON has not turned yet
			asteroidList[i].burnt = false;	// and where the atmosphere has not burnt it yet


		// a bomb explodes as soon as the planet comes into its blast, which spares the planet (secondary.js)
		} else if ( asteroidList[i].bomb && distance < MyPlanet.radius + asteroidList[i].bomb.blast ) {
			detonateBomb(ctx,asteroidList[i]);

		// Testing if asteroid is in collision with the planet
		} else if ( distance < (MyPlanet.radius + asteroidList[i].radius) ){
			// Yes it is ! Decreasing life (less with the Early Warning) and destroying asteroid
			var damage = crashDamage(crashLife(asteroidList[i]));	// (a comet takes few : threats.js)
			if ( asteroidList[i].colossus ) {
				damage = Math.max ( damage, MyPlanet.life );		// (the Colossus crushes the planet : boss.js)
				asteroidList[i].crashed = true;
			}
			countCrash(asteroidList[i]);		// (the parts of a splitting asteroid are counted : threats.js)
			lastCrash = asteroidList[i].giant ? "giant" : ( asteroidList[i].armored ? "armored" : "rock" );	// (the tips : gameover.js)
			MyPlanet.life -= damage;
			nbrDamage += damage;
			if( MyPlanet.life < 0 ){
				nbrDamage += MyPlanet.life;
			}
			if ( planetRecovery > 0 && MyPlanet.mat < MyPlanet.maxMat ) {
				var temp = Math.floor ( asteroidList[i].life * recoveryShare * planetRecovery );
				if ( ( MyPlanet.mat + temp ) > MyPlanet.maxMat ) {
					temp = MyPlanet.maxMat - MyPlanet.mat;
				}
				MyPlanet.mat += temp;
				MyPlanet.totalMat += temp;
			}
			nbrCrashes++;
			playSound ( "crash" );
			calmSince = gameTime;
			keepit = 0;
			redEffect = 256;
			asteroidList[i].life = 0;
		} else {
		// Asteroid still in game, let's play pinball !
			
			//Checking collisions
			for (j in asteroidList) {
				if(i!=j){
					var collision = asteroidList[i].radius + asteroidList[j].radius;
					var tempD = Math.floor( Math.sqrt( Math.pow((asteroidList[i].x - asteroidList[j].x),2) + Math.pow((asteroidList[i].y - asteroidList[j].y),2) ) );
					if ( tempD < collision ) {
						// There's a collision between two asteroids
						// a bomb explodes against the other one instead of bouncing (secondary.js)
						if ( ( asteroidList[i].bomb || asteroidList[j].bomb ) && asteroidList[i].life > 0 && asteroidList[j].life > 0 ) {
							if ( asteroidList[i].bomb ) {
								touchBomb(ctx,asteroidList[i],asteroidList[j]);
							} else {
								touchBomb(ctx,asteroidList[j],asteroidList[i]);
							}
							continue;
						}

							// START OF NEW ROUTINE //
						   
						   var mass2on1=asteroidList[j].mass/asteroidList[i].mass;
						   var x2minus1=asteroidList[j].x-asteroidList[i].x;
						   var y2minus1=asteroidList[j].y-asteroidList[i].y;
						   var vx2minus1=asteroidList[j].vx-asteroidList[i].vx;
						   var vy2minus1=asteroidList[j].vy-asteroidList[i].vy;
						   var sign=1
						   var vx_cm = (asteroidList[i].mass*asteroidList[i].vx+asteroidList[j].mass*asteroidList[j].vx)/(asteroidList[i].mass+asteroidList[j].mass) ;
						   var vy_cm = (asteroidList[i].mass*asteroidList[i].vy+asteroidList[j].mass*asteroidList[j].vy)/(asteroidList[i].mass+asteroidList[j].mass) ;
							
						//     If not close enough, stop the process
						   if ( (vx2minus1*x2minus1 + vy2minus1*y2minus1) >= 0) continue;
						// will they bounce or do they completely crash
						   var CollisionSpeed = Math.abs(vx2minus1)+Math.abs(vy2minus1);
						   
						// debris creation from asteroids' life (an asteroid already destroyed in this turn hits with none left,
						// not with less than none : it would heal the other one)
							var iLife = asteroidList[i].life;
							var jLife = asteroidList[j].life;
							var iColl = Math.floor(Math.max(0, asteroidList[j].life) * CollisionSpeed / MaxCollSpd * slung(asteroidList[j]) );
							addDebris(ctx,iColl,asteroidList[i].x,asteroidList[i].y,asteroidList[j].vx,asteroidList[j].vy,debrisList,asteroidList[i].metal);
							asteroidList[i].life -= iColl;

							var jColl = Math.floor(Math.max(0, asteroidList[i].life) * CollisionSpeed / MaxCollSpd * slung(asteroidList[i]) );
							addDebris(ctx,jColl,asteroidList[j].x,asteroidList[j].y,asteroidList[i].vx,asteroidList[i].vy,debrisList,asteroidList[j].metal);
							asteroidList[j].life -= jColl;

							// an asteroid destroyed by another one which the GRAVITRON sent its way (Bank Shot achievement)
							if ( ( iLife > 0 && asteroidList[i].life <= 0 && asteroidList[j].turned >= bankShotTurn )
								|| ( jLife > 0 && asteroidList[j].life <= 0 && asteroidList[i].turned >= bankShotTurn ) ) {
								bankShot = true;
							}
							
						// calculating the restitution coefficient
						   var restitution = (MaxCollSpd - CollisionSpeed) / MaxCollSpd ;
						   //if this var is under zero, they won't survive both
						   if (restitution < 0) { restitution = 0; }
							   
						//     using a PSEUDOZERO to avoid a zero divide
						   var PSEUDOZERO=1.0E-12*Math.abs(y2minus1);
						   if ( Math.abs(x2minus1)<PSEUDOZERO ) {  
									   if (x2minus1<0) { sign=-1; } else { sign=1;}
									   x2minus1=PSEUDOZERO*sign; 
							} 
							
						//   velocities  update
						   var a=y2minus1/x2minus1;
						   var dvx= -2*(vx2minus1 +a*vy2minus1)/((1+a*a)*(1+mass2on1)) ;
						   asteroidList[j].vx=asteroidList[j].vx+dvx;
						   asteroidList[j].vy=asteroidList[j].vy+a*dvx;
						   asteroidList[i].vx=asteroidList[i].vx-mass2on1*dvx;
						   asteroidList[i].vy=asteroidList[i].vy-a*mass2on1*dvx;
						   
						//  velocity correction for inelastic collisions 
						   asteroidList[i].vx=(asteroidList[i].vx-vx_cm)*restitution + vx_cm;
						   asteroidList[i].vy=(asteroidList[i].vy-vy_cm)*restitution + vy_cm;
						   asteroidList[j].vx=(asteroidList[j].vx-vx_cm)*restitution + vx_cm;
						   asteroidList[j].vy=(asteroidList[j].vy-vy_cm)*restitution + vy_cm;
							
						// END OF NEW ROUTINE //
					}
				}
			}
		}
		}	// end of the life test
		
		if(keepit==1) {
			// managing the all target passed
			if ( asteroidList[i].pass == 1 ){
				passedNbr++;
			}
			// Keeping the asteroid
			tempList.push(asteroidList[i]);
		}
	}
	asteroidList = tempList;
	if ( allPassed == 1 ) {
		allPassed = 0;
	}
	if ( passedNbr == asteroidList.length ) {
		allPassed = 1;
	}
	// From SMART 3, the main cannon's AI chooses its target instead of taking the closest asteroid
	// (the other weapons only need an asteroid in game to shoot)
	var anyTarget = closestA;
	if ( mainCannon.smart >= 3 && pause == 0 ) {
		closestA = smartTarget(mainCannon);
	} else if ( mainCannon.smart == 2 && passedNbr == 0 ) {
		// SMART 2 leaves the asteroids out of reach of its shots, unless the player chooses one (T goes through them all)
		closestA = reachA;
	}
	if ( targetedA.life <= 0 || key[6] == 1 ) {
		// releasing the target : the passed asteroids are forgotten too, so that no new target gets locked at once
		targetedA = false;
		allPassed = 1;
		passedNbr = 0;
	}
	if ( targetedA != false ) {
		closestA = targetedA;
	} else if ( passedNbr != 0 ) {
		targetedA = closestA;
	}
	
	if( pause == 0) {
		
		// Resolving the target changing
		if ( key[5] == 1 && passedA == 0 ) {
			passedA = 1;
			if ( closestA != false ) {
				closestA.pass = 1;
				targetedA = false;
			} else if ( anyTarget != false ) {
				// (SMART 2 having left every asteroid out of reach, the closest one is chosen)
				targetedA = anyTarget;
				closestA = anyTarget;
			}
		}
		if ( key[5] == 0 && passedA == 1 ) {
			passedA = 0;
		}
	
		// Resolving the weapons, and making them shoot
		var moveSpeed = mainCanMovSpeed * Math.PI / 256;
		aimedA = false;
		for(i in weaponList){
			if ( closestA != false && weaponList[i].type == "basicW" ) {
				weaponList[i].target = closestA;
				aimedA = closestA;		// circled on screen, in red when chosen by the player

				if( weaponList[i].smart == 1 ){
					var angle = angleAroundPlanet(closestA.x,closestA.y);
				} else {
					// the shot is at this distance from the planet's center after its first move ; out of reach, the asteroid is marked
					// (to be left, unless the player chose it), and the shot goes where it comes the closest to it (functions.js)
					var r0 = MyPlanet.radius + 5 + weaponList[i].speed;
					var meeting = meetingPoint ( closestA, weaponList[i].speed, r0 );
					if ( meeting != false ) {
						closestA.unreachable = false;
						var angle = meeting.angle;
					} else {
						if ( distanceToPlanet ( closestA.x, closestA.y ) > r0 ) {
							markOutOfReach ( closestA );		// (not the one already crashing, within the shot's start)
						}
						var angle = nearestShot ( closestA, weaponList[i].speed, r0 );
					}
				}

				var testAngle = angle - weaponList[i].angle;
				if( (testAngle > moveSpeed && testAngle < Math.PI) || (testAngle < (0 - moveSpeed) && testAngle < (0 - Math.PI)) ) {
					weaponList[i].angle += moveSpeed;
					weaponList[i].aligned = false;
				} else if( (testAngle < (0 - moveSpeed) && testAngle > (0 - Math.PI)) || (testAngle > moveSpeed && testAngle > Math.PI) ) {
					weaponList[i].angle -= moveSpeed;
					weaponList[i].aligned = false;
				} else {
					weaponList[i].angle = angle;
					weaponList[i].aligned = true;
				}
				weaponList[i].angle += 3 * Math.PI;
				weaponList[i].angle = weaponList[i].angle % ( Math.PI * 2 );
				weaponList[i].angle -= Math.PI;
				if ( !weaponList[i].aligned ) {
					turningTurns++;		// (the time it turns instead of firing, for the tips of the game's end : gameover.js)
				}
			}
			if ( weaponList[i].active >= 1 ) {
				if ( weaponList[i].type == "magneticW" || weaponList[i].type == "HaBW" ) {
					if ( weaponList[i].smart == 0 ) {
						var testAngle = mainCannon.angle - weaponList[i].angle;
						if( (testAngle > moveSpeed && testAngle < Math.PI) || (testAngle < (0 - moveSpeed) && testAngle < (0 - Math.PI)) ) {
							weaponList[i].angle += moveSpeed;
						} else if( (testAngle < (0 - moveSpeed) && testAngle > (0 - Math.PI)) || (testAngle > moveSpeed && testAngle > Math.PI) ) {
							weaponList[i].angle -= moveSpeed;
						}
						weaponList[i].angle += 3 * Math.PI;
						weaponList[i].angle = weaponList[i].angle % ( Math.PI * 2 );
						weaponList[i].angle -= Math.PI;
					} else if ( weaponList[i].smart == 1 ) {
						weaponList[i].angle += moveSpeed;
					} else if ( weaponList[i].smart == 2 ) {
						// the middle of the GRAVITRON's opening, which the Hammer's waves keep (hammer.js)
						weaponList[i].angle = ( ( MyGravitron.angle + MyGravitron.wideness / 2 + 3 * Math.PI ) % ( Math.PI * 2 ) ) - Math.PI;
					}
				}
				weaponList[i].currentDelay++;
				if(weaponList[i].currentDelay >= weaponList[i].fireRate){
					switch(weaponList[i].type){
						// the Harvester's rays, at once, need an asteroid in front of the GRAVITRON's opening (functions.js),
						// and the Cryo's shards an asteroid not frozen yet (cryo.js)
						case "harvestW":
							if ( harvestTargets().length > 0 ) {
								weaponList[i].currentDelay = 0;
								shoot(ctx,weaponList[i]);
							}
							break;
						case "cryoW":
							if ( cryoTargets().length > 0 ) {
								weaponList[i].currentDelay = 0;
								shoot(ctx,weaponList[i]);
							}
							break;
						case "magneticW":
						case "HaBW":
						case "basicW":
							// the basic weapon waits to be turned toward its target before shooting
							if(anyTarget == false || ( weaponList[i].type == "basicW" && ( closestA == false || weaponList[i].aligned == false ) )) {
								break;
							}
						case "SaOW":
							if ( weaponList[i].type == "SaOW" && ( weaponList[i].smart == 0 && weaponList[i].currentDelay < ( weaponList[i].fireRate * weaponList[i].cannonNbr ) ) ) {
								break;
							}
							weaponList[i].currentDelay = 0;
							shoot(ctx,weaponList[i]);
							break;
					}
				}
			}
		}

		// The secondary weapons, once researched (secondary.js) : the missile launcher fires at the main cannon's target,
		// the nitroglycerine launcher at an asteroid far from the planet, the laser at the most dangerous one,
		// the rebound cannon at the main cannon's target too
		fireMissiles(ctx,closestA);
		fireCapsules();
		fireLaser(ctx);
		fireRebounds(closestA);
	}


	// Resolving the shots
	var tempList = new Array();
	var orbitalCount = 0;
	for (i in shotList) {
		// a var to know if we're gonna keep this shot into the array
		var keepit = 1;
		
		if (pause == 0){
			if ( shotList[i].weapon == 1 ) {
				// Calculating positions
				shotList[i].x += shotList[i].vx;
				shotList[i].y += shotList[i].vy;
			} else if ( shotList[i].weapon == 3 ) {
				// Calculating positions
				shotList[i].x += shotList[i].vx;
				shotList[i].y += shotList[i].vy;
				// Updating speeds
				shotList[i].vx -= magneticCannon.speed/50*shotList[i].vx;
				shotList[i].vy -= magneticCannon.speed/50*shotList[i].vy;
			} else if ( shotList[i].weapon == 2 ) {
				// Calculating positions
				shotList[i].d += shotList[i].vd;
				shotList[i].t += shotList[i].vt;
				shotList[i].x = MyPlanet.x + Math.cos(shotList[i].t) * shotList[i].d;
				shotList[i].y = MyPlanet.y + Math.sin(shotList[i].t) * shotList[i].d;
				if ( spiralCannon.smart == 2 ) {
					if ( shotList[i].d > ( MyPlanet.radius * 2 + orbitalNbr ) ) {
						if ( shotList[i].vd > 0 ) {
							shotList[i].vd -= 0.3;
						} else if ( shotList[i].vd > ( 0 - spiralCannon.speed / 2 ) ) {
							shotList[i].vd -= 0.1;
						}
					} else if ( shotList[i].d < ( MyPlanet.radius * 2 + orbitalNbr ) ) {
						if ( shotList[i].vd < 0 ) {
							shotList[i].vd += 0.3;
						} else if ( shotList[i].vd < ( spiralCannon.speed / 2 ) ) {
							shotList[i].vd += 0.1;
						}
					}
				} else if ( shotList[i].vd < ( spiralCannon.speed / 5 ) ) {
					shotList[i].vd += 0.1;
				}
				orbitalCount++;
			}

			// Testing if shot still in game
			var distance = distanceToPlanet(shotList[i].x,shotList[i].y);
			if ( distance > fieldReach ){
			
			// Shot outta game, destroying it
				keepit = 0;
				nbrLostShots++;
				
			} else {
			// Shot still in game, let's destroy everything !
				
				//Checking collisions
				for (j in asteroidList) {
					var distance = Math.floor( Math.sqrt( Math.pow((shotList[i].x - asteroidList[j].x),2) + Math.pow((shotList[i].y - asteroidList[j].y),2) ) );
					if ( distance < asteroidList[j].radius ) {
						// debris creation from asteroids' life (less from a shot on an armored one, a critical one aside : threats.js)
						// (the Hammer's waves, which push, are not shots : hammer.js)
						var damage = armorDamage(asteroidList[j],shotList[i].power,shotList[i].x,shotList[i].y,shotList[i].critical);
						addDebris(ctx,damage,asteroidList[j].x,asteroidList[j].y,asteroidList[j].vx,asteroidList[j].vy,debrisList,asteroidList[j].metal);
						asteroidList[j].life -= damage;
						if ( asteroidList[j].life <= 0 ) {
							allPassed = 1;
						}
						// a critical shot flashes red (bonuses.js)
						if ( shotList[i].critical ) {
							criticalHit(asteroidList[j]);
						}
						keepit = 0;
					} else if ( shotList[i].weapon == 3 && distance < ( asteroidList[j].radius * 10 ) ) {
						var tempAngle = Math.PI;
						if ( shotList[i].y != asteroidList[j].y || asteroidList[j].x > shotList[i].x) {
							tempAngle = (2 * Math.atan((asteroidList[j].y-shotList[i].y)/((asteroidList[j].x-shotList[i].x)+distance)));
						}
						shotList[i].vx += 10 * asteroidList[j].radius / distance * Math.cos(tempAngle);
						shotList[i].vy += 10 * asteroidList[j].radius / distance * Math.sin(tempAngle);
						if ( shotList[i].vx > 10 ) { shotList[i].vx = 10; }
						if ( shotList[i].vx < -10 ) { shotList[i].vx = -10; }
						if ( shotList[i].vy > 10 ) { shotList[i].vy = 10; }
						if ( shotList[i].vy < -10 ) { shotList[i].vy = -10; }
					}
				}
			}
		}
		
		if( keepit == 1){
			// Keeping shot
			tempList.push(shotList[i]);

			// Making the magnetic shots blink
			if ( shotList[i].weapon == 3 ) {
				shotList[i].colorAlpha = ( shotList[i].colorAlpha + 5 ) % 50;
			}
		}
	}
	orbitalNbr = orbitalCount;
	shotList = tempList;
	// the Harvester's rays fade, and go
	if ( pause == 0 ) {
		rayList = rayList.filter ( function ( ray ) { return ++ray.age < raySpan; } );
	}

	// Resolving the missiles, the capsules, the blasts, the rebound shots and their sparks (secondary.js)
	if ( pause == 0 ) {
		resolveMissiles(ctx);
		resolveShards(ctx);		// (the Cryo's : cryo.js)
		resolveWaves(ctx);		// (the Hammer's : hammer.js)
		resolveCapsules(ctx);
		resolveBlasts();
		resolveRebounds(ctx);
		resolveSparks();
		resolveFlashes();	// and the flashes of the critical shots (bonuses.js)
	}


	// Turning the planet
	MyPlanet.Turn();

	
	// Charging GRAVITRON's shield
	var gravWidth = 2;
	var red = 66;
	var green = 66;
	var blue = 66;
	if ( MyGravitron.shield > 0 && pause == 0 ) {
		var chargingValue = shieldTurns ( MyGravitron.shield );
		if ( MyGravitron.charge < (MyGravitron.shield * 10) ) {
			MyGravitron.counter++;
			if( MyGravitron.counter > chargingValue ) {
				MyGravitron.counter = 0;
				MyGravitron.charge++;
			}
		} else if ( MyGravitron.pulse == 2 ) {
			pulseList = emitPulse(ctx,pulseList);
		}
		
		var currentCharge = ( MyGravitron.charge * chargingValue ) + MyGravitron.counter;
		var oneStep = 10 * chargingValue;
		if ( currentCharge <= oneStep ) {
			var colorStep = Math.floor( currentCharge * 190 / oneStep ) + 66;
			red=green=blue=colorStep;
		} else if ( currentCharge <= (2*oneStep) ) {
			var colorStep = Math.floor( (currentCharge-oneStep) * 255 / oneStep );
			red=255;
			green=blue=255-colorStep;
		} else if ( currentCharge <= (3*oneStep) ) {
			var colorStep = Math.floor( (currentCharge-(2*oneStep)) * 255 / oneStep );
			red=255;
			blue=0;
			green=colorStep;
		} else if ( currentCharge <= (4*oneStep) ) {
			var colorStep = Math.floor( (currentCharge-(3*oneStep)) * 255 / oneStep );
			red=255-colorStep;
			blue=0;
			green=255;
		} else if ( currentCharge <= (5*oneStep) ) {
			var colorStep = Math.floor( (currentCharge-(4*oneStep)) * 255 / oneStep );
			red=0;
			blue=colorStep;
			green=255-colorStep;
		}
		
		// Making the shield's energy vanish when hit (drawn by drawGame)
		if ( shieldHit[0] == 0 ) {
			shieldHit[4] = gravWidth+2;
			shieldHit[5] = red;
			shieldHit[6] = green;
			shieldHit[7] = blue;
			shieldHit[8] = 1;
		} else {
			shieldHit[8] -= 0.04;
			if(shieldHit[8]<=0){
				shieldHit[0] = 0;
			}
		}
	}
	gravColor = 'rgb('+red+','+green+','+blue+')';


	// Resolving the Pulses
	if ( pause == 0 ) {
		pulseList = resolvePulses(pulseList,ctx);
	}


	// Resolving the GRAVITRON
	resolveGravitron (ctx,pause,MyGravitron,gravFriction,key,gravMinSize,gravMaxSize,gravColor,gravWidth,MyPlanet,gravRadius);
	
	
	// Displaying counters : the planet's life, its mat and the shield's charge (functions.js)
	showStatus(status);


	}	// Bracket for the state == "playing"

	// Checking the achievements not obtained yet (achievements.js), and reading what the player does while a lesson of the tutorial
	// stops the game (tutorial.js)
	checkAchievements();
	tutorialTurn();
}


// Function to draw the game, called at each refresh of the screen
// (the moving objects are drawn between their places at the engine's last two turns, "blend" going from 0 to 1 until the next turn)
function drawGame ( blend ) {
	var main = document.getElementById('mainArea');
	var ctx = main.getContext('2d');
	// drawing in game units, whatever the real size of the canvas
	var scale = main.width / gameSize;
	ctx.setTransform(scale,0,0,scale,0,0);
	ctx.clearRect(0,0,gameSize,gameSize);

	// the background's stars twinkling, under everything ; in a simulation of the Adventure, the simulator's grid instead (adventure.js)
	if ( !drawSimulation ( ctx ) ) {
		drawStars ( ctx );
	}
	// behind the start menu, the scenes of its two pages (menuscenes.js)
	if ( state == "menu" ) {
		drawMenuScenes ( ctx );
	}

	blendPlaces ( blend );
	try {
		if ( state == "countdown" ) {
			if ( simulating() ) {
				drawHologramPlanet ( ctx );		// (a simulation of the Adventure : adventure.js)
				drawSimulationOverlay ( ctx );
			} else {
				MyPlanet.Draw();
			}
			drawBanner ( ctx );
		} else if ( state == "playing" ) {
			// the Red Effect, when the planet is hit, over the whole game area
			if ( redEffect != 0 ) {
				ctx.fillStyle = "rgba(" + redEffect + ", 0, 0, 1)";
				ctx.fillRect(0,0,gameSize,gameSize);
			}
			// space as the camera sees it (the duel's : boss.js), with the sides of the threats announced (threats.js),
			// then what is written over it (the drawings keep the lines' width and colors left by the ones before, as in 2010)
			aimCamera ( ctx );
			drawPlaying ( ctx );
			drawKamikazes ( ctx );		// (the kamikazes flying, and the ones ready in a corner : kamikaze.js)
			drawThreatSides ( ctx );
			ctx.setTransform(scale,0,0,scale,0,0);
			drawKamikazeGauge ( ctx );
			drawBanner ( ctx );
			drawSimulationOverlay ( ctx );	// the simulator's screen over a simulation of the Adventure (adventure.js),
			drawWaveBanner ( ctx );		// and its waves
			drawAnnounce ( ctx );		// and the NAZA's announces of the threats coming (threats.js)
			drawLesson ( ctx );			// and a lesson of the tutorial, the game darkened around what it tells about (tutorial.js)
			// what the player should know about the researches, while playing (researches.js)
			if ( pause == 0 ) {
				drawResearchCorner ( ctx );
				drawShelterNote ( ctx );	// and the Shelters that have just saved the planet (functions.js)
			}
		}
		// an achievement just obtained, over everything
		drawAchievement ( ctx );
	} finally {
		// whatever happens, the objects go back where they really are
		unblendPlaces();
	}
}

// Function to draw a game being played, in the order of 2010 : some drawings keep the line's width left by the one before
function drawPlaying ( ctx ) {
	// the Hammer's waves, the sky rippling through them, under everything (hammer.js)
	drawWaves(ctx);
	// the limits of the GRAVITRON's field, with the Field Scanner, or golden with the Harvester, whose rays strike in it
	var harvesting = ( harvester.active >= 1 && harvester.cannonNbr > 0 );
	if ( ( MyGravitron.scanner > 0 || harvesting ) && pause == 0 ) {
		drawFieldLimits(ctx, harvesting ? 'rgba(255,200,61,0.4)' : 'rgba(255,255,255,0.3)');
	}
	// the planet's Thick Atmosphere, under everything (functions.js)
	drawAtmosphere(ctx);
	// (a simulation of the Adventure shows its world as holograms : adventure.js)
	var holograms = simulating();
	if ( holograms ) {
		asHologram(ctx,function () { drawDebris(ctx); });
	} else {
		drawDebris(ctx);
	}
	// the bombs' glow and the flames of the asteroids burning in the atmosphere, under their rock (secondary.js, functions.js)
	drawBombs(ctx);
	drawBurning(ctx);
	// the asteroids, tinted with the GRAVITRON's effect at Field Scanner level 2
	for ( var i in asteroidList ) {
		if ( holograms ) {
			drawHologram(ctx,asteroidList[i]);
		} else {
			asteroidList[i].Draw();
		}
		if ( asteroidList[i].frozen ) {
			drawFrozen(ctx,asteroidList[i]);		// (its ice, and the time it stays frozen : cryo.js)
		}
		if ( MyGravitron.scanner > 1 && pause == 0 ) {
			drawFieldTint(ctx,asteroidList[i]);
		}
		if ( showDetails == true ) {
			asteroidList[i].ShowLife();
		}
	}
	// the weapons, and the asteroid the main cannon aims at, in red when chosen by the player ; the asteroids out of reach of its
	// shots are ringed with grey dashes, and the one the player chose with red ones, told under it (functions.js)
	if ( pause == 0 ) {
		ctx.save();
		ctx.lineWidth = 1;
		ctx.setLineDash ( [3, 3] );
		ctx.strokeStyle = "rgba(170, 180, 195, 0.8)";
		for ( var i in asteroidList ) {
			if ( asteroidList[i] != aimedA && outOfReach ( asteroidList[i] ) ) {
				ctx.beginPath();
				ctx.arc(asteroidList[i].x,asteroidList[i].y,(asteroidList[i].radius + 4),0,2*Math.PI,true);
				ctx.stroke();
			}
		}
		ctx.restore();
		if ( aimedA != false ) {
			var away = outOfReach ( aimedA );
			ctx.strokeStyle = ( aimedA == targetedA ) ? "rgba(255, 0, 0, 1)" : "rgba(255, 255, 255, 1)";
			ctx.setLineDash ( away ? [3, 3] : [] );
			ctx.beginPath();
			ctx.arc(aimedA.x,aimedA.y,(aimedA.radius + 2),0,2*Math.PI,true);
			ctx.closePath();
			ctx.stroke();
			ctx.setLineDash ( [] );
			if ( away && aimedA == targetedA ) {
				ctx.save();
				ctx.fillStyle = "rgba(255, 90, 90, 0.95)";
				ctx.font = "9px Arial";
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.fillText ( "out of reach", aimedA.x, aimedA.y + aimedA.radius + 5 );
				ctx.restore();
			}
		}
		for ( var i in weaponList ) {
			if ( weaponList[i].active >= 1 ) {
				displayWeapon(ctx,weaponList[i]);
			}
		}
	}
	// the shots, the magnetic ones blinking
	for ( var i in shotList ) {
		if ( shotList[i].weapon == 3 ) {
			ctx.fillStyle = "rgba(255,0,0,"+(100-shotList[i].colorAlpha)/100+")";
		} else {
			ctx.fillStyle = shotList[i].color;
		}
		ctx.beginPath();
		ctx.arc(shotList[i].x,shotList[i].y,1,0,2*Math.PI,true);
		ctx.closePath();
		ctx.fill();
	}
	// the Cryo's shards (cryo.js), and the Harvester's rays, fading
	drawShards(ctx);
	ctx.save();
	ctx.lineWidth = 1.5;
	for ( var i in rayList ) {
		ctx.strokeStyle = "rgba(255,200,61," + ( 1 - rayList[i].age / raySpan ) + ")";
		ctx.beginPath();
		ctx.moveTo(rayList[i].x,rayList[i].y);
		ctx.lineTo(rayList[i].toX,rayList[i].toY);
		ctx.stroke();
	}
	ctx.restore();
	// the critical shots over them, and their flashes (bonuses.js)
	drawCriticals(ctx);
	// the missiles, the capsules, the blasts, the laser's beam and the rebound shots, from under the planet (secondary.js)
	drawMissiles(ctx);
	drawCapsules(ctx);
	drawLaser(ctx);
	drawRebounds(ctx);
	if ( holograms ) {
		drawHologramPlanet(ctx);
	} else {
		MyPlanet.Draw();
	}
	// the shield's energy, vanishing when hit
	if ( MyGravitron.shield > 0 && pause == 0 && shieldHit[0] != 0 ) {
		ctx.strokeStyle = 'rgba('+shieldHit[5]+','+shieldHit[6]+','+shieldHit[7]+','+shieldHit[8]+')';
		ctx.lineWidth = shieldHit[4];
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.arc(MyPlanet.x,MyPlanet.y,(shieldHit[1]+Math.floor(shieldHit[4]/2)),(shieldHit[2] + shieldHit[3]),shieldHit[2],false);
		ctx.arc(MyPlanet.x,MyPlanet.y,(shieldHit[1]+Math.floor(shieldHit[4]/2)),shieldHit[2],(shieldHit[2] + shieldHit[3]),true);
		ctx.closePath();
		ctx.stroke();
	}
	// (and while a lesson of the tutorial stops the game : tutorial.js)
	if ( pause == 0 || pause == lessonPause ) {
		drawPulses(ctx);
		drawGravitron(ctx,2);
	}
}

// Function to draw the countdown's banner (3, 2, 1, GO !), as the page drew it until 2026 : a grey band with the number in its middle
function drawBanner ( ctx ) {
	if ( banner.alpha <= 0 && banner.background <= 0 ) {
		return;
	}
	ctx.save();
	ctx.fillStyle = 'rgba(60,60,60,' + banner.background + ')';
	ctx.fillRect(0,banner.y,gameSize,116);			// 100 high, with 8 above and below
	ctx.fillStyle = 'rgba(255,0,0,' + banner.alpha + ')';
	ctx.font = '85px MirageRegular';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(banner.text,gameSize/2,banner.y + 74);	// where the page put the letters' baseline
	ctx.restore();
}









