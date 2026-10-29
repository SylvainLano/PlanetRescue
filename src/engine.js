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
	var gameOver = document.getElementById("gameOver");
	var loader = document.getElementById("loader");
	var pauseScreen = document.getElementById("pause");
	var countdown = document.getElementById("countdown");
	
	if(state == "menu") {
		
		// Displaying start menu
		startMenu.style.display = "block";
		mainMenu.style.display = "block";
		infoText.style.display = "none";
		achievementsText.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		loader.style.display = "none";
		instructions.style.display = "none";
		countdown.style.display = "none";
		showAchievementCount();

	} else if(state == "infos") {

		// Displaying start menu
		startMenu.style.display = "block";
		mainMenu.style.display = "none";
		infoText.style.display = "block";
		achievementsText.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		loader.style.display = "none";
		instructions.style.display = "none";
		countdown.style.display = "none";

	} else if(state == "achievements") {

		// Displaying the achievements, from the start menu (achievements.js)
		startMenu.style.display = "block";
		mainMenu.style.display = "none";
		infoText.style.display = "none";
		achievementsText.style.display = "block";
		showAchievements(achievementsText);
		state = "stand";

	} else if (state == "tutorial"){
	
		startMenu.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		countdown.style.display = "block";
		instructions.style.display = "block";
		status.style.display = "block";
		countdown.style.background = 'rgba(60,60,60,0)';
		status.style.background = 'rgba(60,60,60,0)';
		instructions.style.background = 'rgba(60,60,60,0)';
		countdown.style.top = '35px';
		instructions.style.top = '155px';
		initDefault(ctx,"normal");
		initTutorial(ctx);
		state = "tutorialSteps";
		
	} else if (state == "tutorialSteps"){

		// (what the tutorial shows is drawn by drawTutorial)
		if ( countdownValue > 10 ) {
			MyPlanet.Turn();
		}
		if ( countdownValue > 214 ) {
			debrisList = resolveDebris(debrisList,ctx,MyPlanet,pause,gravSuction,MyGravitron.power,MyGravitron.sort,debrisColor);
		}
		if ( countdownValue > 234 ) {
		var keys = [0,0,0,0,0,0];
			if ( countdownValue > 262 ) {
				keys=key;
			}
			resolveGravitron (ctx,pause,MyGravitron,gravFriction,keys,gravMinSize,gravMaxSize,gravColor,gravWidth,MyPlanet,gravRadius);
		}

		var step = countdownValue;
		if ( countdownValue < 10 ) {
			countdown.innerHTML = "Tutorial";
			countdown.style.background = 'rgba(60,60,60,'+(countdownValue/20)+')';
			status.style.background = 'rgba(60,60,60,'+(countdownValue/20)+')';
			instructions.style.background = 'rgba(60,60,60,'+(countdownValue/20)+')';
			countdown.style.color = 'rgba(255,0,0,'+(countdownValue/10)+')';
			instructions.style.color = 'rgba(BB,BB,BB,'+(countdownValue/10)+')';
			countdownValue++;
		} else if ( countdownValue == 10 ) {
			instructions.innerHTML = 'Press "Space" to start the tutorial';
		} else if ( countdownValue < 22 ) {
			var string = "Your planet";
			countdown.innerHTML = string.substr(0,(countdownValue-10));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 22 ) {
			instructions.innerHTML = 'Press "Space"';
		} else if ( countdownValue < 36 ) {
			var string = "Don't lose it";
			countdown.innerHTML = string.substr(0,(countdownValue-22));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 36 ) {
			instructions.innerHTML = 'Keep pressing "Space"';
		} else if ( countdownValue < 57 ) {
			var string = "Its life is up there";
			countdown.innerHTML = string.substr(0,(countdownValue-36));
			countdownValue++;
			status.innerHTML = 'Life : 20';
			instructions.innerHTML = '';
		} else if ( countdownValue == 57 ) {
			instructions.innerHTML = '"Space", "Space", "SPACE"';
			var radius = gameSize / 2;
			var angle = Math.PI / 4;
			var AsterX = MyPlanet.x + (radius * Math.cos(angle));
			var AsterY = MyPlanet.y + (radius * Math.sin(angle));
			if ( asteroidList.length == 0 ) {
				item = new Asteroid(ctx,10,asteroidBR,asteroidBM,AsterX,AsterY,-0.25,-0.25);
				asteroidList.push(item);
			}
		} else if ( countdownValue < 77 ) {
			var string = "Look, an asteroid !";
			countdown.innerHTML = string.substr(0,(countdownValue-57));
			countdownValue++;
			instructions.innerHTML = '';
			asteroidList[0].x += asteroidList[0].vx;
			asteroidList[0].y += asteroidList[0].vy;
		} else if ( countdownValue < 120 ) {
			instructions.innerHTML = 'Wait . . .';
			asteroidList[0].x += asteroidList[0].vx;
			asteroidList[0].y += asteroidList[0].vy;
			countdownValue++;
		} else if ( countdownValue < 136 ) {
			var string = "This is harmful";
			countdown.innerHTML = string.substr(0,(countdownValue-120));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 136 )  {
			instructions.innerHTML = 'Lost in space? Press "Space"!';
		} else if ( countdownValue < 157 ) {
			var string = "We should destroy it";
			countdown.innerHTML = string.substr(0,(countdownValue-136));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 157 )  {
			instructions.innerHTML = 'Give it a try with "Space"';
			mainCannon.angle = Math.PI / 4;
		} else if ( countdownValue < 174 ) {
			var string = "We have a cannon";
			countdown.innerHTML = string.substr(0,(countdownValue-157));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 174 )  {
			instructions.innerHTML = "it's much more like a missile launcher, but anyway, press what you know";
		} else if ( countdownValue < 193 )  {
			var string = "It moves by itself";
			countdown.innerHTML = string.substr(0,(countdownValue-174));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 193 )  {
			instructions.innerHTML = "you can't control it, so keep pressing";
			var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(mainCannon.angle);
			var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(mainCannon.angle);
			var vx = mainCannon.speed * Math.cos(mainCannon.angle);
			var vy = mainCannon.speed * Math.sin(mainCannon.angle);
			if ( shotList.length == 0 ) {
				item = new Shot1(ctx,mainCannon.power,mainCannon.color,x,y,vx,vy);
				shotList.push(item);
			}
		} else if ( countdownValue < 213 )  {
			var string = "It shoots by itself";
			countdown.innerHTML = string.substr(0,(countdownValue-193));
			countdownValue++;
			instructions.innerHTML = '';
			asteroidList[0].x += asteroidList[0].vx;
			asteroidList[0].y += asteroidList[0].vy;
			shotList[0].x += shotList[0].vx;
			shotList[0].y += shotList[0].vy;
		} else if ( countdownValue == 213 )  {
			instructions.innerHTML = 'how can that be a game when you have nothing to do? Find out by waiting . . .';
			asteroidList[0].x += asteroidList[0].vx;
			asteroidList[0].y += asteroidList[0].vy;
			shotList[0].x += shotList[0].vx;
			shotList[0].y += shotList[0].vy;
			if ( ( asteroidList[0].x - shotList[0].x ) < asteroidList[0].radius ) {
				countdownValue++;
			}
		} else if ( countdownValue == 214 )  {
			addDebris(ctx,100,asteroidList[0].x,asteroidList[0].y,asteroidList[0].vx,asteroidList[0].vy,debrisList);
			shotList[0] = '';
			asteroidList[0] = '';
			countdownValue++;
		} else if ( countdownValue < 234 ) {
			var string = "Asteroid is no more";
			countdown.innerHTML = string.substr(0,(countdownValue-214));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 234 )  {
			instructions.innerHTML = "a great thing done, but here's where the game starts";
		} else if ( countdownValue < 255 ) {
			var string = "The GRAVITRON";
			countdown.innerHTML = string.substr(0,(countdownValue-234));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 255 )  {
			instructions.innerHTML = "it should have something to do with gravity, right?";
		} else if ( countdownValue < 261 ) {
			var string = "Right";
			countdown.innerHTML = string.substr(0,(countdownValue-255));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 261 )  {
		} else if ( countdownValue == 262 )  {
			instructions.innerHTML = "well ok, what's next";
		} else if ( countdownValue < 277 ) {
			var string = "Use arrow keys";
			countdown.innerHTML = string.substr(0,(countdownValue-262));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 277 )  {
			instructions.innerHTML = 'especially the Down one';
		} else if ( countdownValue < 296 ) {
			var string = "Collect the debris";
			countdown.innerHTML = string.substr(0,(countdownValue-277));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 296 )  {
			instructions.innerHTML = 'debris are the crumbles of the former asteroid';
		} else if ( countdownValue < 317 ) {
			var string = "Get Mat from them";
			countdown.innerHTML = string.substr(0,(countdownValue-296));
			countdownValue++;
			instructions.innerHTML = '';
			status.innerHTML = 'Life : 20 - Mat : 20';
		} else if ( countdownValue == 317 )  {
			instructions.innerHTML = 'it means "material", and you want MOAR of it';
		} else if ( countdownValue < 337 ) {
			var string = "Upgrade costs Mat";
			countdown.innerHTML = string.substr(0,(countdownValue-317));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 337 )  {
			instructions.innerHTML = 'In game, you will press... yes, "Space", to open upgrade menu';
		} else if ( countdownValue < 345 ) {
			var string = "The end";
			countdown.innerHTML = string.substr(0,(countdownValue-337));
			countdownValue++;
			instructions.innerHTML = '';
		} else if ( countdownValue == 345 )  {
			instructions.innerHTML = 'Tutorial is over. Applause. Thanks. Press "Space" to get back to menu.';
		} else if ( countdownValue > 345 )  {
			state="menu";
		}

		// "Space" only moves on from a step waiting for it, once that step has been played
		// (until 2026, a press at the very frame a step began could skip what it creates and crash the tutorial)
		if ( key[4] == 1 ) {
			pauseStep++;
			if(pauseStep==1 && countdownValue == step){
				countdownValue++;
			}
		}
		if ( key[4] == 0 ) {
			pauseStep=0;
		}

	} else if (state == "init"){
	
		startMenu.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		initDefault(ctx,difficulty);
		// the countdown's banner is drawn on the game, at the top, and hidden until the countdown begins
		// (the "countdown" element of the page only writes the tutorial's texts)
		countdown.style.display = "none";
		banner.y = 0;
		banner.alpha = 0;
		banner.background = 0;
		if ( countdownValue > 0 ) {
			state = "countdown";
		} else {
			status.style.display = "block";
			state = "playing";
		}

		var playedGames = localStorage[scoreKey('playedGames')];
		if( playedGames === null || playedGames === undefined ){
			localStorage[scoreKey('playedGames')] = 1;
		} else {
			localStorage[scoreKey('playedGames')]++;
		}
		
	} else if (state == "countdown"){
	
		MyPlanet.Turn();
		if ( countdownValue <= 0 ){
			status.style.display = "block";
			status.style.background = "";		// as css/main.css draws it, whatever the tutorial left
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
	if ( planetAutoHeal > 0 && pause == 0 && ( MyPlanet.life + planetHealPend ) < MyPlanet.maxLife ) {
		var autoFact = ( maxUpgrade("autoHeal") - planetAutoHeal + 1 );
		if ( MyPlanet.mat > autoFact ) {
			MyPlanet.mat -= autoFact;
			planetHealPend++;
		}
	}
	if ( planetHealPend > 0 && pause == 0 ) {
		planetHealTimer++;
	}
	if ( planetHealTimer >= ( 135 - ( 11 * planetHealFact ) ) ) {
		planetHealPend--;
		planetHealTimer = 0;
		MyPlanet.life++;
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

		// Creating an asteroid when the timer runs out, the timer getting shorter as time passes
		gameTime++;
		spawnTimer--;
		if ( spawnTimer <= 0 ) {
			spawnTimer = spawnInterval();

			// Creation of an asteroid
				var radius = gameSize / 2;
				
				// Determination of an angle
				var angle = Math.random() * Math.PI * 2 ;
				
				// Determination of the corresponding coordinates
				var AsterX = MyPlanet.x + (radius * Math.cos(angle));
				var AsterY = MyPlanet.y + (radius * Math.sin(angle));
				
				// Determination of the moving vector
				if ( asteroidList.length > 2 ) {
					angle = angle - Math.PI / 4 + Math.random() * Math.PI / 2;
				}
				// a giant now and then, after a while : much stronger, bigger, heavier and slower, a threat to destroy first
				var giant = gameTime >= gameValues.giantFrom * framesPerSecond && Math.random() < gameValues.giantChance;
				var velocity = (Math.random() * 2 + 1) * asteroidSpeedFactor() * asteroidBS * ( giant ? giantSpeed : 1 );
				var vx = - velocity * Math.cos(angle);
				var vy = - velocity * Math.sin(angle);

			// its life grows as time passes
			var life = ( giant ? gameValues.giantLife : gameValues.asteroidLife ) + asteroidExtraLife();
			item = new Asteroid(ctx,life,asteroidBR * ( giant ? giantSize : 1 ),asteroidBM * ( giant ? giantMass : 1 ),AsterX,AsterY,vx,vy,giant);
			asteroidList.push(item);
		}
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
				showGameOver(gameOver);	// its score, its numbers, its records and its achievements (gameover.js)
				pauseStep = 0;
			}
		} else {
			if ( pauseStep > 6 ) {
			
				for(i=0;i<asteroidList[0].life;i++){
					addDebris(ctx,1,asteroidList[0].x,asteroidList[0].y,Math.random(),Math.random(),debrisList);
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
			keepit = 0;
			nbrDestroyed++;
			if ( asteroidList[i].giant ) {
				nbrGiants++;
			}
		} else if (pause == 0) {
		
		// Calculating distance to the player's planet
		var distance = distanceToPlanet(asteroidList[i].x, asteroidList[i].y);
		// resolving gravitron's gravity !
			// Calculating angle around the planet to the asteroid
			var angle = angleAroundPlanet(asteroidList[i].x,asteroidList[i].y);		
			
			// Pulling the asteroid if it is into the gravitron's field, or pushing it away with the repulsion
			var pull = gravitronAcceleration(angle, asteroidList[i].mass);
			var heading = Math.atan2(asteroidList[i].vy, asteroidList[i].vx);
			asteroidList[i].vx += pull * Math.cos(angle);
			asteroidList[i].vy += pull * Math.sin(angle);
			// how much the GRAVITRON turns its way (a pull straight toward the planet turns nothing)
			if ( pull != 0 ) {
				var turn = Math.atan2(asteroidList[i].vy, asteroidList[i].vx) - heading;
				asteroidList[i].turned += Math.abs ( ( ( turn + 3 * Math.PI ) % ( 2 * Math.PI ) ) - Math.PI );
			}

			// Testing if asteroid is out of the gravitron's field
			if (intoArcField(angle,MyGravitron) == false) {

				// Checking if there's a pulse hitting the asteroid
				for (p in pulseList) {
					if ( Math.abs ( distance - pulseList[p].radius ) < ( asteroidList[i].radius / 2 ) && intoArcField(angle,pulseList[p]) == false ) {
						if ( pulseList[p].charge < asteroidList[i].life ) {
							asteroidList[i].life -= pulseList[p].charge;
							addDebris(ctx,pulseList[p].charge,asteroidList[i].x,asteroidList[i].y,asteroidList[i].vx,asteroidList[i].vy,debrisList);
							pulseList[p].charge = 0;
						} else {
							pulseList[p].charge -= asteroidList[i].life;
							addDebris(ctx,asteroidList[i].life,asteroidList[i].x,asteroidList[i].y,asteroidList[i].vx,asteroidList[i].vy,debrisList);
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
						shieldHit[0] = 1;
						shieldHit[1] = gravRadius;
						shieldHit[2] = MyGravitron.angle;
						shieldHit[3] = MyGravitron.wideness;
					}
				}
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
		
		// Testing if asteroid still in game
		if ( distance > gameSize ){
		
		// Asteroid outta game, relaunching it toward player's planet
			
			// angle has already been calculated before
			
			// lauching asteroid right through
 			var velocity = (Math.random() * 4 + 1) * asteroidSpeedFactor() * asteroidBS * ( asteroidList[i].giant ? giantSpeed : 1 );
			asteroidList[i].vx = - velocity * Math.cos(angle);
			asteroidList[i].vy = - velocity * Math.sin(angle);
			asteroidList[i].turned = 0;		// a new way, which the GRAVITRON has not turned yet


		// Testing if asteroid is in collision with the planet
		} else if ( distance < (MyPlanet.radius + asteroidList[i].radius) ){
			// Yes it is ! Decreasing life and destroying asteroid
			// (a bomb explodes there, taking its blast's power away too)
			var crashDamage = asteroidList[i].life;
			if ( asteroidList[i].bomb ) {
				crashDamage += asteroidList[i].bomb.power;
				explodeBomb(ctx,asteroidList[i]);
			}
			MyPlanet.life -= crashDamage;
			nbrDamage += crashDamage;
			if( MyPlanet.life < 0 ){
				nbrDamage += MyPlanet.life;
			}
			if ( planetRecovery > 0 && MyPlanet.mat < MyPlanet.maxMat ) {
				var temp = Math.floor ( asteroidList[i].life / 5 * planetRecovery );
				if ( ( MyPlanet.mat + temp ) > MyPlanet.maxMat ) {
					temp = MyPlanet.maxMat - MyPlanet.mat;
				}
				MyPlanet.mat += temp;
				MyPlanet.totalMat += temp;
			}
			nbrCrashes++;
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
						   
						// debris creation from asteroids' life
							var iLife = asteroidList[i].life;
							var jLife = asteroidList[j].life;
							var iColl = Math.floor(asteroidList[j].life * CollisionSpeed / MaxCollSpd );
							addDebris(ctx,iColl,asteroidList[i].x,asteroidList[i].y,asteroidList[j].vx,asteroidList[j].vy,debrisList);
							asteroidList[i].life -= iColl;

							var jColl = Math.floor(asteroidList[i].life * CollisionSpeed / MaxCollSpd );
							addDebris(ctx,jColl,asteroidList[j].x,asteroidList[j].y,asteroidList[i].vx,asteroidList[i].vy,debrisList);
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
			closestA.pass = 1;
			targetedA = false;
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
					// the shot is at this distance from the planet's center after its first move
					var r0 = MyPlanet.radius + 5 + weaponList[i].speed;
					var angle = interception ( closestA, weaponList[i].speed, r0 );
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
						var testAngle = MyGravitron.angle - weaponList[i].angle;
						if( (testAngle > moveSpeed && testAngle < Math.PI) || (testAngle < (0 - moveSpeed) && testAngle < (0 - Math.PI)) ) {
							weaponList[i].angle += moveSpeed;
						} else if( (testAngle < (0 - moveSpeed) && testAngle > (0 - Math.PI)) || (testAngle > moveSpeed && testAngle > Math.PI) ) {
							weaponList[i].angle -= moveSpeed;
						}
						weaponList[i].angle += 3 * Math.PI;
						weaponList[i].angle = weaponList[i].angle % ( Math.PI * 2 );
						weaponList[i].angle -= Math.PI;
					}
				}
				weaponList[i].currentDelay++;
				if(weaponList[i].currentDelay >= weaponList[i].fireRate){
					switch(weaponList[i].type){
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
		// the nitroglycerine launcher at an asteroid far from the planet
		fireMissiles(ctx,closestA);
		fireCapsules();
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
			} else if ( shotList[i].weapon == 4 ) {
				// Calculating positions
				shotList[i].d += shotList[i].vd / shotList[i].spread;
				shotList[i].t = shotList[i].tbase + ( shotList[i].spread - 1 ) * Math.PI / 64 * Math.sin( shotList[i].d / 8 );
				shotList[i].x = MyPlanet.x + Math.cos(shotList[i].t) * shotList[i].d;
				shotList[i].y = MyPlanet.y + Math.sin(shotList[i].t) * shotList[i].d;
			}

			// Testing if shot still in game
			var distance = distanceToPlanet(shotList[i].x,shotList[i].y);
			if ( distance > gameSize ){
			
			// Shot outta game, destroying it
				keepit = 0;
				nbrLostShots++;
				
			} else {
			// Shot still in game, let's destroy everything !
				
				//Checking collisions
				for (j in asteroidList) {
					var distance = Math.floor( Math.sqrt( Math.pow((shotList[i].x - asteroidList[j].x),2) + Math.pow((shotList[i].y - asteroidList[j].y),2) ) );
					if ( distance < asteroidList[j].radius ) {
						if ( shotList[i].weapon == 4 ) {
							var tempD = shotList[i].d + shotList[i].vd / shotList[i].spread;
							var tempT = shotList[i].tbase + shotList[i].spread * Math.PI / 64 * Math.sin( tempD / 8 );
							var tempX = MyPlanet.x + Math.cos(tempT) * tempD;
							var tempY = MyPlanet.y + Math.sin(tempT) * tempD;
							var tempVX = tempX - shotList[i].x;
							var tempVY = tempY - shotList[i].y;
							asteroidList[j].vx += tempVX * shotList[i].power / 15;
							asteroidList[j].vy += tempVY * shotList[i].power / 15;
						} else {
							// debris creation from asteroids' life
							addDebris(ctx,shotList[i].power,asteroidList[j].x,asteroidList[j].y,asteroidList[j].vx,asteroidList[j].vy,debrisList);
							asteroidList[j].life -= shotList[i].power;
							if ( asteroidList[j].life <= 0 ) {
								allPassed = 1;
							}
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

	// Resolving the missiles, the capsules and the blasts (secondary.js)
	if ( pause == 0 ) {
		resolveMissiles(ctx);
		resolveCapsules();
		resolveBlasts();
	}


	// Turning the planet
	MyPlanet.Turn();

	
	// Charging GRAVITRON's shield
	var gravWidth = 2;
	var red = 66;
	var green = 66;
	var blue = 66;
	if ( MyGravitron.shield > 0 && pause == 0 ) {
		var chargingValue = ( (30 / MyGravitron.shield) + (21 - MyGravitron.shield));
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

	// Checking the achievements not obtained yet (achievements.js)
	checkAchievements();
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

	// the background's stars twinkling, under everything
	drawStars ( ctx );

	blendPlaces ( blend );
	try {
		if ( state == "tutorialSteps" ) {
			drawTutorial ( ctx );
		} else if ( state == "countdown" ) {
			MyPlanet.Draw();
			drawBanner ( ctx );
		} else if ( state == "playing" ) {
			drawPlaying ( ctx );
			drawBanner ( ctx );
			// what the player should know about the researches, while playing (researches.js)
			if ( pause == 0 ) {
				drawResearchCorner ( ctx );
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
	// the Red Effect, when the planet is hit
	if ( redEffect != 0 ) {
		ctx.fillStyle = "rgba(" + redEffect + ", 0, 0, 1)";
		ctx.fillRect(0,0,gameSize,gameSize);
	}
	// the limits of the GRAVITRON's field, with the Field Scanner
	if ( MyGravitron.scanner > 0 && pause == 0 ) {
		drawFieldLimits(ctx);
	}
	drawDebris(ctx);
	// the bombs' glow, under their rock (secondary.js)
	drawBombs(ctx);
	// the asteroids, tinted with the GRAVITRON's effect at Field Scanner level 2
	for ( var i in asteroidList ) {
		asteroidList[i].Draw();
		if ( MyGravitron.scanner > 1 && pause == 0 ) {
			drawFieldTint(ctx,asteroidList[i]);
		}
		if ( showDetails == true ) {
			asteroidList[i].ShowLife();
		}
	}
	// the weapons, and the asteroid the main cannon aims at, in red when chosen by the player
	if ( pause == 0 ) {
		if ( aimedA != false ) {
			ctx.strokeStyle = ( aimedA == targetedA ) ? "rgba(255, 0, 0, 1)" : "rgba(255, 255, 255, 1)";
			ctx.beginPath();
			ctx.arc(aimedA.x,aimedA.y,(aimedA.radius + 2),0,2*Math.PI,true);
			ctx.closePath();
			ctx.stroke();
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
	// the missiles, the capsules and the blasts (secondary.js)
	drawMissiles(ctx);
	drawCapsules(ctx);
	MyPlanet.Draw();
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
	if ( pause == 0 ) {
		drawPulses(ctx);
		drawGravitron(ctx,2);
	}
}

// Function to draw the tutorial, step by step
function drawTutorial ( ctx ) {
	if ( countdownValue > 10 ) {
		MyPlanet.Draw();
	}
	if ( countdownValue > 57 && countdownValue < 214 ) {
		asteroidList[0].Draw();
		if ( countdownValue <= 157 ) {
			ctx.strokeStyle = 'rgba(255,0,0,1)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(asteroidList[0].x,asteroidList[0].y,15,0,(Math.PI*2),false);
			ctx.arc(asteroidList[0].x,asteroidList[0].y,15,(Math.PI*2),0,true);
			ctx.closePath();
			ctx.stroke();
		}
	}
	if ( countdownValue > 157) {
		var sx = MyPlanet.x + MyPlanet.radius * Math.cos(mainCannon.angle);
		var sy = MyPlanet.y + MyPlanet.radius * Math.sin(mainCannon.angle);
		var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(mainCannon.angle);
		var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(mainCannon.angle);
		ctx.strokeStyle = mainCannon.color;
		ctx.beginPath();
		ctx.moveTo(sx,sy);
		ctx.lineTo(ex,ey);
		ctx.closePath();
		ctx.stroke();
		if ( countdownValue <= 213 ) {
			ctx.strokeStyle = 'rgba(255,0,0,1)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(ex,ey,10,0,(Math.PI*2),false);
			ctx.arc(ex,ey,10,(Math.PI*2),0,true);
			ctx.closePath();
			ctx.stroke();
		}
	}
	if ( countdownValue > 193 && countdownValue < 214 ) {
		ctx.fillStyle = shotList[0].color;
		ctx.beginPath();
		ctx.arc(shotList[0].x,shotList[0].y,1,0,2*Math.PI,true);
		ctx.closePath();
		ctx.fill();
	}
	if ( countdownValue > 214 ) {
		drawDebris(ctx);
	}
	if ( countdownValue > 234 ) {
		drawGravitron(ctx,1);	// thinner than in the game, as the tutorial has always shown it
	}
	// the mat, underlined in the status bar
	if ( countdownValue > 296 && countdownValue <= 317 ) {
		ctx.strokeStyle = 'rgba(255,0,0,1)';
		ctx.beginPath();
		ctx.moveTo(50,20);
		ctx.lineTo(100,20);
		ctx.closePath();
		ctx.stroke();
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









