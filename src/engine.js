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

// Explicit function, called 25 times a second
function engine() {
	// Clearing the context
	var main = document.getElementById('mainArea');
	var ctx = main.getContext('2d');
	ctx.clearRect(0,0,main.width,main.height);
	var status = document.getElementById("status");
	var startMenu = document.getElementById("startMenu");
	var mainMenu = document.getElementById("mainMenu");
	var infoText = document.getElementById("infoText");
	var gameOver = document.getElementById("gameOver");
	var loader = document.getElementById("loader");
	var pauseScreen = document.getElementById("pause");
	var countdown = document.getElementById("countdown");
	var resetHS = document.getElementById("resetHS");
	var testText = "";
	
	if(state == "menu") {
		
		// Displaying start menu
		startMenu.style.display = "block";
		mainMenu.style.display = "block";
		infoText.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		loader.style.display = "none";
		instructions.style.display = "none";
		countdown.style.display = "none";
		enableResetHS(resetHS);
		
	} else if(state == "infos") {
		
		// Displaying start menu
		startMenu.style.display = "block";
		mainMenu.style.display = "none";
		infoText.style.display = "block";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		loader.style.display = "none";
		instructions.style.display = "none";
		countdown.style.display = "none";
		enableResetHS(resetHS);
		
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
		initDefault(ctx);
		initTutorial(ctx);
		state = "tutorialSteps";
		
	} else if (state == "tutorialSteps"){
		
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
			debrisList = resolveDebris(debrisList,ctx,MyPlanet,pause,main,gravSuction,gravPower,gravSort,debrisColor);
		}
		if ( countdownValue > 234 ) {
		var keys = [0,0,0,0,0,0];
			if ( countdownValue > 262 ) {
				keys=key;
			}
			resolveGravitron (ctx,pause,MyGravitron,gravFriction,keys,gravMinSize,gravMaxSize,gravColor,gravWidth,MyPlanet,gravRadius);
		}
		if ( key[4] == 1 ) {
			pauseStep++;
			if(pauseStep==1){
				countdownValue++;
			}
		}
		if ( key[4] == 0 ) {
			pauseStep=0;
		}
		
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
			var radius = main.width / 2;
			var angle = Math.PI / 4;
			var AsterX = MyPlanet.x + (radius * Math.cos(angle));
			var AsterY = MyPlanet.y + (radius * Math.sin(angle));
			item = new Asteroid(ctx,10,asteroid1Skin,asteroidBR,asteroidBM,AsterX,AsterY,-0.25,-0.25);
			asteroidList.push(item);
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
			item = new Shot1(ctx,mainCannon.power,mainCannon.color,x,y,vx,vy);
			shotList.push(item);
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
			ctx.strokeStyle = 'rgba(255,0,0,1)';
			ctx.beginPath();
			ctx.moveTo(50,20);
			ctx.lineTo(100,20);
			ctx.closePath();
			ctx.stroke();
			countdown.innerHTML = string.substr(0,(countdownValue-296));
			countdownValue++;
			instructions.innerHTML = '';
			status.innerHTML = 'Life : 20 - Mat : 20';
		} else if ( countdownValue == 317 )  {
			ctx.strokeStyle = 'rgba(255,0,0,1)';
			ctx.beginPath();
			ctx.moveTo(50,20);
			ctx.lineTo(100,20);
			ctx.closePath();
			ctx.stroke();
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
		
	} else if (state == "init"){
	
		startMenu.style.display = "none";
		gameOver.style.display = "none";
		pauseScreen.style.display = "none";
		initDefault(ctx);
		if ( countdownValue > 0 ) {
			countdown.style.display = "block";
			state = "countdown";
		} else {
			status.style.display = "block";
			state = "playing";
		}

		var playedGames = localStorage['playedGames'];
		if( playedGames === null || playedGames === undefined ){
			localStorage['playedGames'] = 1;
		} else {
			localStorage['playedGames']++;
		}
		
	} else if (state == "countdown"){
	
		MyPlanet.Draw();
		if ( countdownValue <= 0 ){
			status.style.display = "block";
			status.style.background = 'rgba(60,60,60,0.5)';
			state = "playing";
			countdownValue=10;
		} else {
			var Z = Math.floor((countdownValue-1)/25);
			var step = countdownValue - ( Z * 25 );
			var posTop = (300 - (countdownValue*300/countdownStart));
			if( Z == 0 ) {	Z = "GO !";	}
			if( posTop > 240) {	posTop = 240;	}
			countdown.innerHTML = Z;
			countdown.style.top = posTop+'px';
			countdown.style.color = 'rgba(255,0,0,'+(4*step/100)+')';
			countdownValue--;
		}
		
		
	} else if (state == "hiscores"){
	
		startMenu.style.display = "none";
		pauseScreen.style.display = "none";
		status.style.display = "none";
		gameOver.style.display = "block";
		var gameOverInnerHTML = "<div class=title>Hi-Scores</div><div class=text>Maximum amount of mat gathered : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['totalMat'] + "</span><br />Maximum accuracy reached : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['accuracy'] + "%</span><br />Maximum crashed asteroids : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['nbrCrashes'] + "</span><br />Maximum inhabitants lost : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['nbrDamage'] + "</span><br />Maximum upgrade purchased : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['nbrUpgrades'] + "</span><br />Maximum mat spent : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['nbrCost'] + "</span><br /><br />Number of games played : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['playedGames'] + "</span><br /><br />Hi-Score : ";
			gameOverInnerHTML += "<span class=statUpper>";
			gameOverInnerHTML += localStorage['score'] + "</span></div><div class=title><br /><a href=# onClick='state=&quot;menu&quot;;'>Back to Main Menu</a></div>";
			gameOver.innerHTML = gameOverInnerHTML;	
		state = "stand";
		
	} else if (state == "playing"){
	
	// Making the Red Effect when planet is hit!
	if ( redEffect != 0 ) {
		ctx.fillStyle = "rgba(" + redEffect + ", 0, 0, 1)";
		ctx.fillRect(0,0,main.width,main.height);
		redEffect -= 64;
		if( redEffect < 0 ) { redEffect = 0; }
	}
	
	// Making the countdown disappear
	if ( countdownValue <= 0 ) {
		countdown.style.display = "none";
		countdown.style.background = 'rgba(60,60,60,0.5)';
	} else {
		countdown.style.background = 'rgba(60,60,60,'+(countdownValue/20)+')';
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
	} else if ( key[4] == 1 && pause == 0 ) {
		pause++; pauseStep++;
		refresh();
		pauseScreen.style.display = "block";
	} else if ( pauseStep == 1 && key[4] == 0 ) {
		pauseStep++;
	} else if ( pauseStep == 2 && key[4] == 1 ) {
		pauseStep++;
	} else if ( pauseStep == 3 && key[4] == 0 ) {
		pause=0; pauseStep=0;
		pauseScreen.style.display = "none";
	}
	
	
	// Resolving the debris
	debrisList = resolveDebris(debrisList,ctx,MyPlanet,pause,main,gravSuction,MyGravitron.power,MyGravitron.sort,debrisColor);

	
	if ( pause == 0 ) {
		// Creating an asteroid or not
		potential+=difficulty;
		if(potential>(asteroidList.length*20000)) {
			// Decreasing potential of asteroids' creation
			potential-=(asteroidList.length*1000);
			
			// Creation of an asteroid
				var radius = main.width / 2;
				
				// Determination of an angle
				var angle = Math.random() * Math.PI * 2 ;
				
				// Determination of the corresponding coordinates
				var AsterX = MyPlanet.x + (radius * Math.cos(angle));
				var AsterY = MyPlanet.y + (radius * Math.sin(angle));
				
				// Determination of the moving vector
				if ( asteroidList.length > 2 ) {
					angle = angle - Math.PI / 4 + Math.random() * Math.PI / 2;
				}
				var velocity = (Math.random() * 2 + 1) * difficulty / 200 * asteroidBS;
				var vx = - velocity * Math.cos(angle);
				var vy = - velocity * Math.sin(angle);
			
			item = new Asteroid(ctx,10,asteroid1Skin,asteroidBR,asteroidBM,AsterX,AsterY,vx,vy);
			asteroidList.push(item);
			
			// Increasing the difficulty
			difficulty += 1;
		}
	}	// this is the pause bracket

	
	// Resolving the asteroids
	if ( pause == 2 ) {
		// If game is over, let's destroy every asteroid one by one
		if ( asteroidList.length == 0 ) {
			// If there is no more asteroid, display the Game Over screen
			if( pauseStep != 0){
				status.style.display = "none";
				gameOver.style.display = "block";
				var gameOverInnerHTML = "<div class=title>Game Over</div><div class=text>Your planet has been destroyed !<br /><br />You gathered a total of ";
				var accuracy = Math.floor((1-(nbrLostShots/nbrShots))*100);
					// Saving the hi-scores
					var hiTotalMat = localStorage['totalMat'];
					if( hiTotalMat === null || hiTotalMat === undefined || hiTotalMat < MyPlanet.totalMat ){
						localStorage['totalMat'] = MyPlanet.totalMat;
						gameOverInnerHTML += "<span class=statUpper>";
					} else {
						gameOverInnerHTML += "<span class=statLower>";
					}
					gameOverInnerHTML += MyPlanet.totalMat + " mat</span>.<br />You shot a total of " + nbrShots + " shots but " + nbrLostShots + " of them were lost in space.<br />You therefor reached an accuracy of ";
					var hiAccuracy = localStorage['accuracy'];
					if( hiAccuracy === undefined || hiAccuracy === null ||  hiAccuracy < accuracy ){
						localStorage['accuracy'] = accuracy;
						gameOverInnerHTML += "<span class=statUpper>";
					} else {
						gameOverInnerHTML += "<span class=statLower>";
					}
					gameOverInnerHTML += accuracy + "%</span>.<br />";
					var hiNbrCrashes = localStorage['nbrCrashes'];
					if( hiNbrCrashes === undefined || hiNbrCrashes === null ||  hiNbrCrashes < nbrCrashes ){
						localStorage['nbrCrashes'] = nbrCrashes;
						gameOverInnerHTML += "<span class=statUpper>";
					} else {
						gameOverInnerHTML += "<span class=statLower>";
					}
					gameOverInnerHTML += nbrCrashes + " asteroids</span> hit your planet, causing a loss of ";
					var hiNbrDamage = localStorage['nbrDamage']
					if( hiNbrDamage === undefined || hiNbrDamage === null ||  hiNbrDamage < nbrDamage ){
						localStorage['nbrDamage'] = nbrDamage;
						gameOverInnerHTML += "<span class=statUpper>";
					} else {
						gameOverInnerHTML += "<span class=statLower>";
					}
					gameOverInnerHTML += nbrDamage + "M inhabitants</span> before you lose.<br />You purchased ";
					var hiNbrUpgrades = localStorage['nbrUpgrades'];
					if( hiNbrUpgrades === undefined || hiNbrUpgrades === null ||  hiNbrUpgrades < nbrUpgrades ){
						localStorage['nbrUpgrades'] = nbrUpgrades;
						gameOverInnerHTML += "<span class=statUpper>";
					} else {
						gameOverInnerHTML += "<span class=statLower>";
					}
					gameOverInnerHTML += nbrUpgrades + " upgrades</span> and spent ";
					var hiNbrCost = localStorage['nbrCost'];
					if( hiNbrCost === undefined || hiNbrCost === null ||  hiNbrCost < nbrCost ){
						localStorage['nbrCost'] = nbrCost;
						gameOverInnerHTML += "<span class=statUpper>";
					} else {
						gameOverInnerHTML += "<span class=statLower>";
					}
					gameOverInnerHTML += nbrCost + " mat</span> for them.</div><div class=title>";
					var score = Math.floor ( accuracy / 100 * ( ( nbrUpgrades * nbrCost ) + ( nbrCrashes * nbrDamage ) - MyPlanet.totalMat ) );
					var hiScore = localStorage['score'];
					if( hiScore === undefined || hiScore === null ||  hiScore < score ){
						localStorage['score'] = score;
						gameOverInnerHTML += "<span class=green>High Score : ";
					} else {
						gameOverInnerHTML += "<span class=red>Score : ";
					}
					gameOverInnerHTML += score + "</span><br /><a href=# onClick='state=&quot;init&quot;;'>Retry</a> - <a href=# onClick='state=&quot;menu&quot;;'>Main Menu</a></div>";
					gameOver.innerHTML = gameOverInnerHTML;
				pauseStep = 0;
			}
		} else {
			if ( pauseStep > 6 ) {
			
				for(i=0;i<asteroidList[0].life;i++){
					deBrisList = addDebris(ctx,1,asteroidList[0].x,asteroidList[0].y,Math.random(),Math.random(),debrisList);
				}
				asteroidList.shift();
				pauseStep = 0;
				
			}
			pauseStep++;
		}
	}
	
	var tempList = new Array();
	var closestA = false;
	var closestD = main.width;
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
			// This one is done
			keepit = 0;
		} else if (pause == 0) {
		
		// Calculating distance to the player's planet
		var distance = distanceToPlanet(asteroidList[i].x, asteroidList[i].y);
		// resolving gravitron's gravity !
			// Calculating angle around the planet to the asteroid
			var angle = angleAroundPlanet(asteroidList[i].x,asteroidList[i].y);		
			
			// Testing if asteroid is into the gravitron's field
			if (intoArcField(angle,MyGravitron) == true) {
				// Yes it is !
				asteroidList[i].vx -= gravSuction * MyGravitron.power / Math.pow(MyGravitron.sort, MyGravitron.power) * Math.cos(angle) / asteroidList[i].mass;
				asteroidList[i].vy -= gravSuction * MyGravitron.power / Math.pow(MyGravitron.sort, MyGravitron.power) * Math.sin(angle) / asteroidList[i].mass;
			} else {
				if ( MyGravitron.repulsion > 0 ) {
					asteroidList[i].vx += gravSuction * Math.pow(MyGravitron.sort, MyGravitron.power) * Math.cos(angle) / asteroidList[i].mass;
					asteroidList[i].vy += gravSuction * Math.pow(MyGravitron.sort, MyGravitron.power) * Math.sin(angle) / asteroidList[i].mass;
				}
				
				// Checking if there's a pulse hitting the asteroid
				for (p in pulseList) {
					if ( Math.abs ( distance - pulseList[p].radius ) < ( asteroidList[i].radius / 2 ) && intoArcField(angle,pulseList[p]) == false ) {
						if ( pulseList[p].charge < asteroidList[i].life ) {
							asteroidList[i].life -= pulseList[p].charge;
							deBrisList = addDebris(ctx,pulseList[p].charge,asteroidList[i].x,asteroidList[i].y,asteroidList[i].vx,asteroidList[i].vy,debrisList);
							pulseList[p].charge = 0;
						} else {
							pulseList[p].charge -= asteroidList[i].life;
							deBrisList = addDebris(ctx,asteroidList[i].life,asteroidList[i].x,asteroidList[i].y,asteroidList[i].vx,asteroidList[i].vy,debrisList);
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
		
		// Testing if asteroid is the closest to the player's planet
		if( distance < closestD && asteroidList[i].pass == 0){
			closestA = asteroidList[i];
			closestD = distance;
		}
		
		// Testing if asteroid still in game
		if ( distance > main.width ){
		
		// Asteroid outta game, relaunching it toward player's planet
			
			// angle has already been calculated before
			
			// lauching asteroid right through
 			var velocity = (Math.random() * 4 + 1) * difficulty / 200 * asteroidBS;
			asteroidList[i].vx = - velocity * Math.cos(angle);
			asteroidList[i].vy = - velocity * Math.sin(angle);
			

		// Testing if asteroid is in collision with the planet
		} else if ( distance < (MyPlanet.radius + asteroidList[i].radius) ){
			// Yes it is ! Decreasing life and destroying asteroid
			MyPlanet.life -= asteroidList[i].life;
			nbrDamage += asteroidList[i].life;
			if( MyPlanet.life < 0 ){
				nbrDamage += MyPlanet.life;
			}
			if ( planetRecovery > 0 && MyPlanet.mat < MyPlanet.totalMat ) {
				var temp = Math.floor ( asteroidList[i].life / 5 * planetRecovery );
				if ( ( MyPlanet.mat + temp ) > MyPlanet.maxMat ) {
					temp = MyPlanet.maxMat - MyPlanet.mat;
				}
				MyPlanet.mat += temp;
				MyPlanet.totalMat += temp;
			}
			nbrCrashes++;
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
						
						/*
							
							This below is an old routine only working
							for perfectly elastic collisions with equal masses
							do not uncomment until you comment the new routine
							
							// Calculating the base
							var nx = (asteroidList[j].x - asteroidList[i].x)/collision;
							var ny = (asteroidList[j].y - asteroidList[i].y)/collision;
							var gx = -ny;
							var gy = nx;

							// Calculating speeds inside the base
							var v1n = nx*asteroidList[i].vx + ny*asteroidList[i].vy;
							var v1g = gx*asteroidList[i].vx + gy*asteroidList[i].vy;
							var v2n = nx*asteroidList[j].vx + ny*asteroidList[j].vy;
							var v2g = gx*asteroidList[j].vx + gy*asteroidList[j].vy;

							// Resolving new speeds
							asteroidList[i].vx = nx*v2n +  gx*v1g;
							asteroidList[i].vy = ny*v2n +  gy*v1g;
							asteroidList[j].vx = nx*v1n +  gx*v2g;
							asteroidList[j].vy = ny*v1n +  gy*v2g;
							
						*/
						
							// This routine works really better
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
						   if ( (vx2minus1*x2minus1 + vy2minus1*y2minus1) >= 0) break;
						// will they bounce or do they completely crash
						   var CollisionSpeed = Math.abs(vx2minus1)+Math.abs(vy2minus1);
						   
						// debris creation from asteroids' life
							var iColl = Math.floor(asteroidList[j].life * CollisionSpeed / MaxCollSpd );
							deBrisList = addDebris(ctx,iColl,asteroidList[i].x,asteroidList[i].y,asteroidList[j].vx,asteroidList[j].vy,debrisList);
							asteroidList[i].life -= iColl;
							
							var jColl = Math.floor(asteroidList[i].life * CollisionSpeed / MaxCollSpd );
							deBrisList = addDebris(ctx,jColl,asteroidList[j].x,asteroidList[j].y,asteroidList[i].vx,asteroidList[i].vy,debrisList);
							asteroidList[j].life -= jColl;
							
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
			// Displaying asteroid
			asteroidList[i].Draw();
			if(showDetails == true) {
				asteroidList[i].ShowLife();
			}
		}
	}
	asteroidList = tempList;
	if ( allPassed == 1 ) {
		allPassed = 0;
	}
	if ( passedNbr == asteroidList.length ) {
		allPassed = 1;
	}
	if ( targetedA.life <= 0 || key[6] == 1 ) {
		targetedA = false;
		allPassed = 1;
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
		for(i in weaponList){
			if ( closestA != false && weaponList[i].type == "basicW" ) {
				if ( closestA == targetedA ) {
					ctx.strokeStyle = "rgba(255, 0, 0, 1)";
				} else {
					ctx.strokeStyle = "rgba(255, 255, 255, 1)";
				}
				
				ctx.beginPath();
				ctx.arc(closestA.x,closestA.y,(closestA.radius + 2),0,2*Math.PI,true);
				ctx.closePath();
				ctx.stroke();
				
				var moveSpeed = mainCanMovSpeed * Math.PI / 256;
				if( weaponList[i].smart == 1 ){
					var angle = angleAroundPlanet(closestA.x,closestA.y);
				} else {
					
					var Vx = closestA.vx;
					var Vy = closestA.vy;
					var Vp = weaponList[i].speed;
					var teta = angleAroundPlanet ( closestA.x, closestA.y );
					var r = MyPlanet.radius;
					var d = distanceToPlanet ( closestA.x, closestA.y );
					
					var angle = interception ( Vx, Vy, Vp, teta, r, d );
					
					if( teta < 0 ) {
						angle = (teta * 1.5) - (angle - Math.PI)/2;
					}	
					
					angle += 3 * Math.PI;
					angle = angle%(Math.PI*2);
					angle -= Math.PI;
				}
				
				var testAngle = angle - weaponList[i].angle;
				if( (testAngle > moveSpeed && testAngle < Math.PI) || (testAngle < (0 - moveSpeed) && testAngle < (0 - Math.PI)) ) {
					weaponList[i].angle += moveSpeed;
				} else if( (testAngle < (0 - moveSpeed) && testAngle > (0 - Math.PI)) || (testAngle > moveSpeed && testAngle > Math.PI) ) {
					weaponList[i].angle -= moveSpeed;
				} else {
					weaponList[i].angle = angle;
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
							nbrShots+=weaponList[i].cannonNbr;
							if(closestA == false) {
								break;
							}
						case "SaOW":
							if ( weaponList[i].type == "SaOW" && ( weaponList[i].smart == 0 && weaponList[i].currentDelay < ( weaponList[i].fireRate * weaponList[i].cannonNbr ) ) ) {
								break;
							}
							weaponList[i].currentDelay = 0;
							if ( weaponList[i].angle == 0 ) {
								nbrShots+=weaponList[i].cannonNbr;
							}
							shoot(ctx,weaponList[i]);
							break;
					}
				}
				displayWeapon(ctx,weaponList[i]);
			}
		}
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
			if ( distance > main.width ){
			
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
							deBrisList = addDebris(ctx,shotList[i].power,asteroidList[j].x,asteroidList[j].y,asteroidList[j].vx,asteroidList[j].vy,debrisList);
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
			
			// Displaying shot
			if ( shotList[i].weapon == 3 ) {
				shotList[i].colorAlpha = ( shotList[i].colorAlpha + 5 ) % 50;
				ctx.fillStyle = "rgba(255,0,0,"+(100-shotList[i].colorAlpha)/100+")";
			} else {
				ctx.fillStyle = shotList[i].color;
			}
			ctx.beginPath();
			ctx.arc(shotList[i].x,shotList[i].y,1,0,2*Math.PI,true);
			ctx.closePath();
			ctx.fill();
		}
	}
	orbitalNbr = orbitalCount;
	shotList = tempList;
	
	
	// Displaying the planet
	MyPlanet.Draw();

	
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
		
		// Displaying shield's energy
		if ( shieldHit[0] == 0 ) {
			shieldHit[4] = gravWidth+2;
			shieldHit[5] = red;
			shieldHit[6] = green;
			shieldHit[7] = blue;
			shieldHit[8] = 1;
		} else {
			ctx.strokeStyle = 'rgba('+shieldHit[5]+','+shieldHit[6]+','+shieldHit[7]+','+shieldHit[8]+')';
			ctx.lineWidth = shieldHit[4];
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.arc(MyPlanet.x,MyPlanet.y,(shieldHit[1]+Math.floor(shieldHit[4]/2)),(shieldHit[2] + shieldHit[3]),shieldHit[2],false);
			ctx.arc(MyPlanet.x,MyPlanet.y,(shieldHit[1]+Math.floor(shieldHit[4]/2)),shieldHit[2],(shieldHit[2] + shieldHit[3]),true);
			ctx.closePath();
			ctx.stroke();
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
	
	
	// Displaying counters
	var lifePC = Math.round( ( MyPlanet.life + ( planetHealTimer / ( 135 - ( 11 * planetHealFact ) ) ) ) * 100 /  MyPlanet.maxLife);
	if ( lifePC <= 25 ) {
		var lifeColor = "#FF0000";
	} else if ( lifePC <= 50 ) {
		var lifeColor = "#FFFF00";
	} else {
		var lifeColor = "#009900";
	}
	var matPC = Math.round(MyPlanet.mat * 100 /  MyPlanet.maxMat);
	if ( matPC == 100 ) {
		var matColor = "#FF0000";
	} else if ( matPC > 80 ) {
		var matColor = "#FFFF00";
	} else {
		var matColor = "#999999";
	}
	if ( displayS == "digits" ) {
		var statusText = "Life : <span style='color:" + lifeColor + "'>" + MyPlanet.life + "</span>";
		if ( planetHealPend > 0 ) {
			statusText += " (+" + planetHealPend + ")";
		}
		statusText += " / " + MyPlanet.maxLife + " - Mat : <span style='color:" + matColor + "'>" + MyPlanet.mat + "</span> / " + MyPlanet.maxMat;
		if(MyGravitron.shield > 0){
			statusText += " - Shield : <span style='color:" + gravColor + "'>" + MyGravitron.charge + "</span> / " + (MyGravitron.shield * 10);
		}
	} else {
		var statusText = "Life : <div style='display:inline-block;width:100px; padding:1px; border:1px solid #999999; background-color:black; height:5px;'><div style='float:left;width:" + lifePC + "px; background-color:" + lifeColor + ";height:5px;'></div>";
		if ( planetHealPend > 0 ) {
			statusText += "<div style='float:left;width:" + ( Math.round ( ( MyPlanet.life + planetHealPend ) * 100 / MyPlanet.maxLife ) - lifePC ) + "px; background-color:#999999;height:5px;'></div>";
		}
		statusText += "</div> - Mat : <div style='display:inline-block;width:100px; padding:1px; border:1px solid #999999; background-color:black; height:5px;'><div style='float:left;width:" + matPC + "px; background-color:" + matColor + ";height:5px;'></div></div>";
		if(MyGravitron.shield > 0){
			statusText += " - Shield : <div style='display:inline-block;width:" + ( MyGravitron.shield * 10 ) + "px; padding:1px; border:1px solid #999999; background-color:black; height:5px;'><div style='float:left;width:" + MyGravitron.charge + "px; background-color:" + gravColor + ";height:5px;'></div></div>";
		}
	}
	status.innerHTML = statusText + " <br /> " + testText;
	
	
	}	// Bracket for the state == "playing"
}









