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


// Main function to get things done
window.addEventListener('load', function () {
	// Getting the main area to draw into
	var main = document.getElementById('mainArea');
	if (!main || !main.getContext) {
		return;
	}

	// Adding the 2D context
	var context = main.getContext('2d');
	if (!context) {
		return;
	}

	// Now browser should work with HTML 5 and Canvas

	// Zooming the game area to fit the window, now and each time it is resized
	fitGameArea();
	window.addEventListener('resize', fitGameArea, false);

	// Highlighting the difficulty level chosen last time
	showLevel();

	// Building the pause menu with its upgrades
	buildShop();

	// Creation of the Planet
	// (its weapons are created with each new game, by initDefault)
	MyPlanet = new Planet(context,startValues.planetLife,startValues.planetMat,planetSkin,planetRadius,planetMass,planetX,planetY);
	skinImage(MyPlanet.skin);	// loading its map now, so that it is ready for the first game
	MyGravitron = new Gravitron(context,gravSuction,0,gravMinSize,startValues.gravShield,startValues.gravPower,startValues.gravSort,startValues.gravRepulsion,startValues.gravPulse,gravRadius);
	document.fonts.load('85px MirageRegular');	// the countdown's font, for the canvas to have it

	// Making engine() roll the dices 25 times a second (25 fps), and drawing the game at each refresh of the screen
	// (until 2026, setInterval called the engine, which drew the game 25 times a second only)
	var turn = 1000 / framesPerSecond;
	var late = 0;		// time since the engine's last turn
	var last = performance.now();
	function frame ( now ) {
		requestAnimationFrame(frame);
		late += Math.max(0, now - last);
		last = now;
		// after a long wait (the browser's tab hidden, a slow computer), the game goes on where it was, instead of rushing to catch up
		if ( late > turn * 5 ) {
			late = turn;
		}
		while ( late >= turn ) {
			rememberPlaces();
			engine();
			late -= turn;
		}
		drawGame(late / turn);
	}
	requestAnimationFrame(frame);

	// Setting the call to the changeKey function which will take care of the keyboards events
	document.onkeydown=function(e){changeKey((e||window.event).keyCode, 1);}
	document.onkeyup=function(e){changeKey((e||window.event).keyCode, 0);}

}, false);