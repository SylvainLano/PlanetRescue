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
	
	// Creation of the Planet
	MyPlanet = new Planet(context,planetLife,planetMat,planetSkin,planetRadius,planetMass,planetX,planetY);
	MyGravitron = new Gravitron(context,gravSuction,0,gravMinSize,gravShield,gravPower,gravSort,gravRepulsion,gravPulse,gravRadius);
	mainCannon	= new Weapon(context,"basicW","#FFFFFF",0,25,3,1,0,1);
	weaponList.push(mainCannon);
	activate("basicW");
	
	// Setting the call to engine()  so it rolls the dices 25 times a second (25 fps)
	var interval = setInterval("engine();",40);
	
	// Setting the call to the changeKey function which will take care of the keyboards events
	document.onkeydown=function(e){changeKey((e||window.event).keyCode, 1);}
	document.onkeyup=function(e){changeKey((e||window.event).keyCode, 0);}

}, false);