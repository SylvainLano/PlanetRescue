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


// THE TUTORIAL (since 0.58.0 ; the Arcade's hints of 0.53.0 before it, and the tutorial of 2010 before them) : a game of its own,
// played from its page of the start menu, the page shown until it is finished once ; its lessons come one after the other, each one
// with what it needs, and each one stops the game to tell about something : the game area darkens but around it, the NAZA's bubble
// beside it, and the game goes on once the player does what it asks, or clicks OK ; the planet can't fall, and nothing comes but what
// the lessons send (nowhere else does the game stop the player to teach : neither the Arcade nor the Adventure)
var lessonVeil	= 0.62;		// the darkness around what a lesson tells about,
var lessonAfter	= 1;		// the seconds of play between a lesson and the next one,
var lessonPause	= 5;		// and the pause a lesson stops the game with : nothing moves, as in the pause, its menu staying closed

// the tutorial being played : the lesson told (its number in lessons), whether it has begun, stopped the game, and told what it had
// to tell, the turns of play since it began (or since the game went on), the turns to wait before the next one, the asteroid it sent,
// what it tells about, and the keys held when it stopped the game (a key already held doesn't do what a lesson asks : it is pressed)
var tutorial = { on : false };

// the tutorial finished once, remembered by the browser : the start menu opens on its page until then
var tutorialDone = ( localStorage["tutorialDone"] == "yes" );

// the lessons, in their order : the text of each one (the letters as kbd with their place on the keyboard, written as the player's
// keyboard has them : showKeyLabels, functions.js), what it does when it begins (start), when it stops the game (ready), what it tells
// about (subject : one or more circles in game units, its bubble beside the first one), what the player does to make the game go on
// (gesture, or OK only), when the next one may come (over), and when it is skipped, what it was about being gone before it was told (gone)
var lessons = [
	{ id : "turn", text : "This ring around the Earth is your <b>Gravitron</b>, open on one side. Turn it with <kbd>&larr;</kbd><kbd>&rarr;</kbd> or <kbd data-code='KeyA'>A</kbd><kbd data-code='KeyD'>D</kbd>.",
		ready : function () { return tutorial.turns >= framesPerSecond; },
		subject : earthSubject,
		gesture : function () { return pressed ( 0 ) || pressed ( 1 ); },
		over : function () { return tutorial.turns >= 3 * framesPerSecond; } },
	{ id : "cannon", text : "An asteroid! Your <b>cannon</b> aims and fires on its own: you don't shoot, you protect the Earth.",
		start : function ( ctx ) { tutorial.rock = lessonRock ( ctx, - Math.PI / 2, 2, 5 ); },
		ready : function () { return rockNear ( 250 ); },
		subject : function () { return [ rockSubject(), earthSubject() ]; },
		over : rockGone,
		gone : rockGone },
	{ id : "gather", text : "Debris! Turn the Gravitron's opening toward them, and widen it with <kbd>&darr;</kbd> or <kbd data-code='KeyS'>S</kbd>: they become <b>mat</b>, to buy upgrades.",
		ready : function () { return debrisList.length > 0; },
		subject : function () { return [ debrisSubject(), earthSubject() ]; },
		gesture : function () { return pressed ( 3 ); },
		over : function () { return debrisList.length == 0 || tutorial.turns >= 10 * framesPerSecond; },
		gone : function () { return debrisList.length == 0; } },
	{ id : "pull", text : "Careful: the opening <b>pulls the asteroids in</b> too, toward your planet. Narrow it with <kbd>&uarr;</kbd> or <kbd data-code='KeyW'>W</kbd>, or turn it away.",
		start : function ( ctx ) { tutorial.rock = lessonRock ( ctx, MyGravitron.angle + MyGravitron.wideness / 2, 1.6, 8 ); },
		ready : function () { return ( rockNear ( 250 ) && intoArcField ( angleAroundPlanet ( tutorial.rock.x, tutorial.rock.y ), MyGravitron ) ) || rockNear ( 170 ); },
		subject : function () { return [ rockSubject(), earthSubject() ]; },
		gesture : function () { return pressed ( 2 ) || pressed ( 0 ) || pressed ( 1 ); },
		over : rockGone,
		gone : rockGone },
	// (its mat topped up by the inhabitants if it lacks some, and its gauge lit at the top ; it goes on in the pause menu : tutorialMenu)
	{ id : "shop", text : "You have the <b>mat</b> for an upgrade: its gauge is lit, at the top. <kbd>Space</kbd> opens the pause menu, where you spend it.",
		start : function () { MyPlanet.mat = Math.max ( MyPlanet.mat, priceToPay ( "mainPow" ) ); },
		ready : function () { return true; },
		subject : earthSubject,
		lit : "lessonMat",
		gesture : function () { return pressed ( 4 ); },
		menu : true,
		over : function () { return tutorial.menu == "done"; } },
	{ id : "kamikaze", text : "This one is tough and fast: your cannon may not stop it in time. Click it to send a <b>kamikaze</b>, a ship that rams it and stops it, or press <kbd data-code='KeyF'>F</kbd> for the asteroid your cannon aims at.",
		start : function ( ctx ) { tutorial.rock = lessonRock ( ctx, mainCannon.angle + Math.PI, 2.4, 30 ); },
		ready : function () { return rockNear ( 245 ); },
		subject : function () { return [ rockSubject(), { x : 18, y : gameSize - 18, r : 16 } ]; },
		gesture : function () { return kamikazeList.length > 0; },
		over : function () { return rockGone() || tutorial.turns >= 8 * framesPerSecond; },
		gone : rockGone },
	{ id : "giant", text : "A <b>giant</b>! Your cannon aims at the closest asteroid: <kbd data-code='KeyT'>T</kbd> makes it aim at the next one, here the giant. <kbd data-code='KeyR'>R</kbd> lets it choose again.",
		start : function ( ctx ) {
			tutorial.rock = lessonRock ( ctx, - Math.PI / 4, 0.8, 16, true, 270 );
			lessonRock ( ctx, Math.PI * 3 / 4, 0.6, 6, false, 180 ); },
		ready : function () { return rockNear ( 255 ); },
		subject : function () { return [ rockSubject(), earthSubject() ]; },
		gesture : function () { return pressed ( 5 ); },
		over : function () { return rockGone() || tutorial.turns >= 15 * framesPerSecond; },
		gone : rockGone },
	{ id : "end", text : "Well done! You know enough to save the Earth: the rest, you will find out as you play.",
		ready : function () { return true; },
		subject : earthSubject }
];

// function to know if the tutorial is being played
function inTutorial () {
	return tutorial.on;
}

// function to play the tutorial, from its page of the start menu
function playTutorial () {
	adventure.level = null;		// (neither a level of the Adventure,
	tutorial = { on : true, lesson : 0, begun : false, frozen : false, told : false, turns : 0, wait : 0, rock : false, subject : false, held : [],
		menu : false, bought : 0 };
	menuPage = "tutorial";		// nor the Arcade : the start menu comes back to its page if it is left)
	state = "init";
}

// function to finish the tutorial, once its last lesson is read : remembered, and the start menu turned to the next page
function finishTutorial () {
	tutorial.on = false;
	tutorialDone = true;
	try {
		localStorage["tutorialDone"] = "yes";
	} catch ( e ) {}
	menuPage = adventureReady ? "adventure" : "arcade";
	state = "menu";
}

// function to make the tutorial go on, at each turn of its game (not during the pause, nor while a lesson is told) : instead of the
// Arcade's asteroids, each lesson in its turn, once the one before is over
function advanceTutorial ( ctx ) {
	if ( tutorial.wait > 0 ) {
		tutorial.wait--;
		return;
	}
	var lesson = lessons[tutorial.lesson];
	if ( !tutorial.begun ) {
		tutorial.begun = true;
		tutorial.turns = 0;
		if ( lesson.start ) {
			lesson.start ( ctx );
		}
	}
	tutorial.turns++;
	if ( !tutorial.told ) {
		if ( lesson.gone && lesson.gone() ) {
			nextLesson();
		} else if ( lesson.ready() ) {
			stopForLesson ( lesson );
		}
	} else if ( lesson.over && lesson.over() ) {
		nextLesson();
	}
}

// function to go to the next lesson, after a moment of play
function nextLesson () {
	tutorial.lesson++;
	tutorial.begun = false;
	tutorial.told = false;
	tutorial.wait = lessonAfter * framesPerSecond;
}

// function to stop the game for a lesson : what it tells about lit, the rest darkened, and its bubble beside it
function stopForLesson ( lesson ) {
	tutorial.frozen = true;
	tutorial.told = true;
	tutorial.held = key.slice();
	tutorial.subject = [].concat ( lesson.subject() );
	pause = lessonPause;
	if ( lesson.lit ) {
		document.getElementById ( "status" ).classList.add ( lesson.lit );
	}
	showLesson ( lesson );
}

// function to make the game go on after a lesson, once its player did what it asked, or clicked OK (the last one ends the tutorial ;
// the one of the pause menu waits for it to open)
function goOn () {
	if ( !tutorial.frozen ) {
		return;
	}
	var lesson = lessons[tutorial.lesson];
	tutorial.frozen = false;
	tutorial.turns = 0;
	pause = 0;
	document.getElementById ( "lesson" ).classList.remove ( "shown" );
	if ( lesson.lit ) {
		document.getElementById ( "status" ).classList.remove ( lesson.lit );
	}
	if ( lesson.menu ) {
		tutorial.menu = "wait";
		if ( !pressed ( 4 ) ) {
			openPauseMenu();	// (OK opens it too)
		}
	}
	if ( tutorial.lesson == lessons.length - 1 ) {
		finishTutorial();
	}
}

// function to open the pause menu as Space does, Space let go already (engine.js)
function openPauseMenu () {
	pause = 1;
	pauseStep = 2;
	refresh();
	document.getElementById ( "pause" ).style.display = "block";
}

// function to know if the lesson being told asks for something (the kamikaze one lets a kamikaze go while it stops the game : kamikaze.js)
function lessonAsks ( id ) {
	return inTutorial() && tutorial.frozen && lessons[tutorial.lesson].id == id;
}

// function to make the lesson of the pause menu go on in it, at each turn of the engine : once it opens, its Fire Power shown and lit,
// the bubble under it ; once it is bought, the bubble on the pause bar, telling how to go back to the game ; done once the game goes on
function tutorialMenu () {
	if ( tutorial.menu == "wait" && pause == 1 ) {
		var tile = document.querySelector ( "#shop .tile[data-upgrade='mainPow']" );
		openSection ( tile.closest ( ".section" ) );
		var panel = tile.closest ( ".panels > *" ), holder = panel.parentNode;
		showPanel ( Array.prototype.indexOf.call ( holder.children, panel ), holder.parentNode.querySelector ( ".tabs" ), holder );
		tile.querySelector ( ".square" ).classList.add ( "lessonTile" );
		tutorial.bought = nbrUpgrades;
		tutorial.menu = "buy";
		showBubble ( "Click the <b>Fire Power</b> tile to buy it: one more damage for each shot of your cannon. Its price is on its corner.", tile );
	} else if ( tutorial.menu == "buy" && nbrUpgrades > tutorial.bought ) {
		lessonTileOff();
		tutorial.menu = "resume";
		showBubble ( "Bought! <kbd>Space</kbd> takes you back to the game.", document.querySelector ( "#pause .pauseBar" ) );
	} else if ( ( tutorial.menu == "buy" || tutorial.menu == "resume" ) && pause == 0 ) {
		lessonTileOff();
		tutorial.menu = "done";
		document.getElementById ( "lesson" ).classList.remove ( "shown" );
	}
}

// function to put out the tile lit by the lesson of the pause menu
function lessonTileOff () {
	var lit = document.querySelector ( "#shop .lessonTile" );
	if ( lit ) {
		lit.classList.remove ( "lessonTile" );
	}
}

// function to show the bubble in a menu, under an element of it (or over it, without room under it), without its OK
function showBubble ( text, element ) {
	var box = document.getElementById ( "lesson" ), area = document.getElementById ( "gameArea" );
	box.innerHTML = "<span class='label'>NAZA</span>" + text;
	showKeyLabels ( box );
	box.classList.add ( "shown" );
	// the element's place in the game area's own pixels, before its zoom (as the tooltip's : placeTooltip, menu.js)
	var frame = area.getBoundingClientRect(), place = element.getBoundingClientRect();
	var zoom = frame.width / area.offsetWidth, gap = 10, edge = 8;
	var left = ( place.left + place.width / 2 - frame.left ) / zoom - area.clientLeft - box.offsetWidth / 2;
	var top = ( place.bottom - frame.top ) / zoom - area.clientTop + gap;
	if ( top + box.offsetHeight > gameSize - edge ) {
		top = ( place.top - frame.top ) / zoom - area.clientTop - gap - box.offsetHeight;
	}
	box.style.left = Math.max ( edge, Math.min ( gameSize - edge - box.offsetWidth, left ) ) + "px";
	box.style.top = Math.max ( edge, Math.min ( gameSize - edge - box.offsetHeight, top ) ) + "px";
}

// function to know if a key is pressed, not held since the lesson stopped the game
function pressed ( k ) {
	return key[k] == 1 && !tutorial.held[k];
}

// function to read what the player does while a lesson is told, at each turn of the engine : the keys let go, and the gesture
// it asks for ; the bubble hidden once the tutorial is left
function tutorialTurn () {
	if ( !inTutorial() || state != "playing" ) {
		document.getElementById ( "lesson" ).classList.remove ( "shown" );
		return;
	}
	tutorialMenu();
	if ( !tutorial.frozen ) {
		return;
	}
	for ( var k = 0; k < key.length; k++ ) {
		if ( !key[k] ) {
			tutorial.held[k] = 0;
		}
	}
	var lesson = lessons[tutorial.lesson];
	if ( lesson.gesture && lesson.gesture() ) {
		goOn();
	}
}

// Enter is OK too
document.addEventListener ( "keydown", function ( e ) {
	if ( e.key == "Enter" && tutorial.frozen ) {
		goOn();
	}
} );

// function to send a lesson's asteroid from a side (its angle around the planet), straight at the planet, at that many times the
// asteroids' base speed, with that much life (or the usual one) ; a giant, and from closer than the edge, if asked
function lessonRock ( ctx, angle, speed, life, giant, distance ) {
	var rock = launchAsteroid ( ctx, angle, giant || false, 1, distance );
	var velocity = Math.sqrt ( rock.vx * rock.vx + rock.vy * rock.vy );
	rock.vx *= speed * asteroidBS / velocity;
	rock.vy *= speed * asteroidBS / velocity;
	if ( life ) {
		rock.life = life;
	}
	return rock;
}

// functions to know if the lesson's asteroid is gone (destroyed, crashed or away), or closer to the planet than a distance,
// and to circle it
function rockGone () {
	return !tutorial.rock || tutorial.rock.life <= 0 || asteroidList.indexOf ( tutorial.rock ) < 0;
}

function rockNear ( distance ) {
	return !rockGone() && distanceToPlanet ( tutorial.rock.x, tutorial.rock.y ) < distance;
}

function rockSubject () {
	return { x : tutorial.rock.x, y : tutorial.rock.y, r : tutorial.rock.radius + 26 };
}

// function to circle the Earth, with its Gravitron and its cannon
function earthSubject () {
	return { x : MyPlanet.x, y : MyPlanet.y, r : gravRadius + 25 };
}

// function to circle the debris : around their middle, all of them in the circle, as far as it can
function debrisSubject () {
	var x = 0, y = 0;
	for ( var d in debrisList ) {
		x += debrisList[d].x / debrisList.length;
		y += debrisList[d].y / debrisList.length;
	}
	var r = 30;
	for ( var d in debrisList ) {
		r = Math.max ( r, Math.sqrt ( Math.pow ( debrisList[d].x - x, 2 ) + Math.pow ( debrisList[d].y - y, 2 ) ) + 16 );
	}
	return { x : x, y : y, r : Math.min ( r, 120 ) };
}

// function to show a lesson's bubble beside what it tells about first : on its right or its left (the side toward the middle first),
// or else under it or over it, kept in the game area ; the first place covering nothing lit, or else the one covering it the least
// (in the game area's own pixels, which are the game's units : it is zoomed with it, fitGameArea)
function showLesson ( lesson ) {
	var box = document.getElementById ( "lesson" );
	box.innerHTML = "<span class='label'>NAZA</span>" + lesson.text + "<a href='#' class='ok' onClick='goOn();'>OK</a>";
	showKeyLabels ( box );
	box.classList.add ( "shown" );
	var s = tutorial.subject[0], gap = 16, edge = 8;
	var width = box.offsetWidth, height = box.offsetHeight;
	var right = { left : s.x + s.r + gap, top : s.y - height / 2 }, left = { left : s.x - s.r - gap - width, top : s.y - height / 2 };
	var places = ( s.x < gameSize / 2 ) ? [ right, left ] : [ left, right ];
	places.push ( { left : s.x - width / 2, top : s.y + s.r + gap }, { left : s.x - width / 2, top : s.y - s.r - gap - height } );
	var place = false, least = Infinity;
	for ( var p in places ) {
		places[p].left = Math.max ( edge, Math.min ( gameSize - edge - width, places[p].left ) );
		places[p].top = Math.max ( edge, Math.min ( gameSize - edge - height, places[p].top ) );
		var covered = subjectCovered ( places[p].left, places[p].top, width, height );
		if ( covered < least ) {
			place = places[p];
			least = covered;
		}
	}
	var main = document.getElementById ( "mainArea" );
	box.style.left = ( main.offsetLeft + place.left ) + "px";
	box.style.top = ( main.offsetTop + place.top ) + "px";
}

// function to know how much a place of the bubble covers the circles of what the lesson tells about : how deep it goes into them
function subjectCovered ( left, top, width, height ) {
	var covered = 0;
	for ( var c in tutorial.subject ) {
		var s = tutorial.subject[c];
		var x = Math.max ( left, Math.min ( s.x, left + width ) ), y = Math.max ( top, Math.min ( s.y, top + height ) );
		covered += Math.max ( 0, s.r - Math.sqrt ( Math.pow ( x - s.x, 2 ) + Math.pow ( y - s.y, 2 ) ) );
	}
	return covered;
}

// function to draw what a lesson tells about, while it stops the game (drawGame, engine.js) : the game area darkened around its
// circles (each clip keeps what is outside one of them), and a dashed circle of the NAZA's blue turning around each one
function drawLesson ( ctx ) {
	if ( !inTutorial() || !tutorial.frozen ) {
		return;
	}
	ctx.save();
	for ( var c in tutorial.subject ) {
		var s = tutorial.subject[c];
		ctx.beginPath();
		ctx.rect ( 0, 0, gameSize, gameSize );
		ctx.arc ( s.x, s.y, s.r, 0, Math.PI * 2 );
		ctx.clip ( "evenodd" );
	}
	ctx.fillStyle = "rgba(0,0,0," + lessonVeil + ")";
	ctx.fillRect ( 0, 0, gameSize, gameSize );
	ctx.restore();
	ctx.save();
	ctx.strokeStyle = "rgba(143,196,255,0.9)";
	ctx.lineWidth = 2;
	ctx.setLineDash ( [ 6, 5 ] );
	ctx.lineDashOffset = - performance.now() / 60;
	for ( var c in tutorial.subject ) {
		var s = tutorial.subject[c];
		ctx.beginPath();
		ctx.arc ( s.x, s.y, s.r, 0, Math.PI * 2 );
		ctx.stroke();
	}
	ctx.restore();
}
