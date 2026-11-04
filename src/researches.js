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


// The research tree, planned in 2010 for the pause menu : the Arcade's, all its branches open from the first game (until 0.53.0, an
// achievement opened each one) ; in a game, each research takes time, one at a time, before it is validated in the pause menu to
// bring its bonus (the Adventure has none : its stars' tree keeps what is won from a level to the next, starshop.js)
// each branch : its name
var researchBranches = {
	missiles	: { name : "Missiles" },
	explosives	: { name : "Explosives" },
	lasers		: { name : "Lasers" },
	ricochets	: { name : "Ricochets" },
	gravitron	: { name : "Gravitron" },
	planet		: { name : "Planet" }
};

// each research : its name, its tooltip, its branch, its time (in seconds of play), the researches it needs first, its place in the
// tree (in columns and rows from the lab, the north up : refreshResearches), its picture (tilePictures, tiles.js), and what it brings
// (since 0.54.0, the Compactor waits for the Wide Net, the Slingshot for the Gravity Brake, and the Shelters for the Thick Atmosphere :
// every research of the tree opens from the lab or from the one before it)
var researches = {
	missiles	: { name : "Missile Launcher", branch : "missiles", time : 60, needs : [], at : [0, -1], picture : "missile",
					tip : "Missile Launcher - A secondary weapon, which takes no place among your active weapons. Its missiles fly to your main cannon's target, and explode on the first asteroid they touch, damaging every asteroid around.",
					apply : function () { missileLauncher.cannonNbr = 1; } },
	homing		: { name : "Homing Missiles", branch : "missiles", time : 90, needs : ["missiles"], at : [0, -2], picture : "homing",
					tip : "Homing Missiles - Your missiles steer toward their target, even when it changes its way, and look for another one if it is destroyed before they reach it.",
					apply : function () { missileLauncher.smart = 1; } },
	nitro		: { name : "Nitroglycerine", branch : "explosives", time : 75, needs : [], at : [-1, -1], picture : "bomb",
					tip : "Nitroglycerine - A secondary weapon, whose slow capsules turn an asteroid far from your planet into a bomb, damaging every asteroid around when it explodes : when it touches another asteroid, when it is destroyed, or as soon as your planet comes into its blast, which spares your planet. Steer it into the others with your Gravitron.",
					apply : function () { nitroLauncher.cannonNbr = 1; } },
	chain		: { name : "Chain Reaction", branch : "explosives", time : 90, needs : ["nitro"], at : [-2, -2], picture : "fireworks",
					tip : "Chain Reaction - The asteroids a bomb's blast doesn't destroy become bombs too, with half its power : their blasts do the same, until the reaction fades out.",
					apply : function () { nitroLauncher.smart = 1; } },
	laser		: { name : "Laser", branch : "lasers", time : 90, needs : [], at : [1, -1], picture : "beam",
					tip : "Laser - A secondary weapon, whose beam burns an asteroid for a while, then cools down. It aims first at the giants, then at the asteroids going to crash on your planet, the soonest first.",
					apply : function () { laserCannon.cannonNbr = 1; } },
	piercing	: { name : "Piercing Beam", branch : "lasers", time : 90, needs : ["laser"], at : [2, -2], picture : "pierce",
					tip : "Piercing Beam - Your laser's beam goes through its target, and spreads behind it in a cone of light to the edge of space : every other asteroid it reaches, on its way or in the cone, burns at half power.",
					apply : function () { laserCannon.smart = 1; } },
	rebound		: { name : "Rebound Shot", branch : "ricochets", time : 90, needs : [], at : [-1, 0], picture : "boomerang",
					tip : "Rebound Shot - A secondary weapon, whose fast shots fly to your main cannon's target, then ricochet on the asteroids they hit, on the edges of space and on your planet's atmosphere, which they don't harm, until they have made all their rebounds.",
					apply : function () { reboundCannon.cannonNbr = 1; } },
	trick		: { name : "Trick Shot", branch : "ricochets", time : 90, needs : ["rebound"], at : [-2, 0], picture : "pinball",
					tip : "Trick Shot - Your rebound cannon reckons its ricochets before it fires : among many angles, it takes the one whose way hits the most asteroids, rebounds included, and its shots no longer go astray on the rock.",
					apply : function () { reboundCannon.smart = 1; } },
	wideNet		: { name : "Wide Net", branch : "gravitron", time : 45, needs : [], at : [1, 0], picture : "net",
					tip : "Wide Net - Out of its opening, your Gravitron pulls the debris too, more weakly, but never the asteroids.",
					apply : function () { MyGravitron.wideNet = 1; } },
	compactor	: { name : "Compactor", branch : "gravitron", time : 45, needs : ["wideNet"], at : [2, 0], picture : "press",
					tip : "Compactor - Brings the Compactor upgrade of your Gravitron : each of its levels makes more mat from the debris gathered.",
					apply : function () {} },
	gravityBrake: { name : "Gravity Brake", branch : "gravitron", time : 60, needs : [], at : [1, 1], picture : "slow",
					tip : "Gravity Brake - The asteroids in your Gravitron's opening slow down, the heavy ones less : your cannons have more time to destroy them.",
					apply : function () { MyGravitron.brake = 1; } },
	slingshot	: { name : "Slingshot", branch : "gravitron", time : 60, needs : ["gravityBrake"], at : [2, 2], picture : "sling",
					tip : "Slingshot - An asteroid your Gravitron has turned from its way hits twice as hard the asteroids it runs into.",
					apply : function () { MyGravitron.slingshot = 1; } },
	atmosphere	: { name : "Thick Atmosphere", branch : "planet", time : 60, needs : [], at : [0, 1], picture : "atmosphere",
					tip : "Thick Atmosphere - Your planet's atmosphere thickens : every asteroid coming into it burns, losing 2 points of life, and the weakest ones burn up before they crash.",
					apply : function () { MyPlanet.atmosphere = 1; } },
	earlyWarning: { name : "Early Warning", branch : "planet", time : 45, needs : [], at : [-1, 1], picture : "warning",
					tip : "Early Warning - Brings the Early Warning upgrade of your planet : each of its levels evacuates more inhabitants before the asteroids crash.",
					apply : function () {} },
	shelters	: { name : "Shelters", branch : "planet", time : 60, needs : ["atmosphere"], at : [0, 2], picture : "bunker",
					tip : "Shelters - Once in a game, when an asteroid's crash should end it, the shelters save 10% of your planet's inhabitants.",
					apply : function () { MyPlanet.shelters = 1; } }
};

// the researches of the current game : the planet's lab (an upgrade to buy, its level 2 being the Automation), the one going on,
// if it is complete, the time spent on each one (in turns), the ones validated, and the last one the Automation validated
var research = { lab : 0, current : false, complete : false, spent : {}, done : {}, validated : false };

// function to start a game with no lab and no research done
function newResearches () {
	research = { lab : 0, current : false, complete : false, spent : {}, done : {}, validated : false };
}

// function to know if a branch is open : all of them in the Arcade, none in the Adventure
function branchOpen ( branch ) {
	return !inAdventure();
}

// function to know if a branch at least is open, for the lab to be worth building
function anyBranchOpen () {
	for ( var branch in researchBranches ) {
		if ( branchOpen ( branch ) ) {
			return true;
		}
	}
	return false;
}

// function to know if a research is opened : its branch
function researchOpened ( id ) {
	return branchOpen ( researches[id].branch );
}

// function to know if a research can be done : the lab built, opened, not done yet, and the researches it needs done
function researchOpen ( id ) {
	var item = researches[id];
	if ( !research.lab || research.done[id] || !researchOpened ( id ) ) {
		return false;
	}
	for ( var n in item.needs ) {
		if ( !research.done[item.needs[n]] ) {
			return false;
		}
	}
	return true;
}

// function to know what the player should be told : a research complete, or one to start while none goes on, or the one going on
function researchNews () {
	if ( research.complete ) {
		return "complete";
	}
	if ( research.current ) {
		return "running";
	}
	for ( var id in researches ) {
		if ( researchOpen ( id ) ) {
			return "available";
		}
	}
	return false;
}

// function to get the seconds of play left to a research
function researchLeft ( id ) {
	return Math.max ( 0, Math.ceil ( researches[id].time - ( research.spent[id] || 0 ) / framesPerSecond ) );
}

// function to make the research going on advance, at each turn of the game (not during the pause) ;
// with the lab's Automation, a research complete is validated at once, and the next one starts by itself
function advanceResearch () {
	if ( research.current && !research.complete ) {
		research.spent[research.current]++;
		if ( research.spent[research.current] >= researches[research.current].time * framesPerSecond ) {
			research.complete = true;
		}
	}
	if ( research.lab >= 2 ) {
		if ( research.complete ) {
			// told for a few seconds at the bottom right (drawResearchCorner)
			research.validated = { id : research.current, until : gameTime + 4 * framesPerSecond };
			validateResearch();
		}
		if ( !research.current ) {
			startResearch ( nextResearch() );
		}
	}
}

// function to choose the research the Automation starts : the one to be done the soonest, among the ones that can be done
function nextResearch () {
	var next = false;
	for ( var id in researches ) {
		if ( researchOpen ( id ) && ( !next || researchLeft ( id ) < researchLeft ( next ) ) ) {
			next = id;
		}
	}
	return next;
}

// function to start a research, keeping the time already spent on it
function startResearch ( id ) {
	if ( id ) {
		research.current = id;
		research.spent[id] = research.spent[id] || 0;
	}
}

// function to validate the research complete, which brings its bonus
function validateResearch () {
	research.done[research.current] = true;
	researches[research.current].apply();
	research.complete = false;
	research.current = false;
	playSound ( "research" );
}

// function to act on a research, from its cell of the tree : to validate it once complete, to stop it (its time spent is kept),
// or to start it, the one going on stopping (validated first, if complete)
function researchAction ( id ) {
	if ( research.done[id] ) {
		return;
	}
	if ( research.current == id ) {
		if ( research.complete ) {
			validateResearch();
		}
		research.current = false;
	} else if ( researchOpen ( id ) ) {
		if ( research.complete ) {
			validateResearch();
		}
		startResearch ( id );
	}
	refresh();
	researchTip ( false, id );
}

// THE RESEARCH TREE, in the Researches section of the pause menu, drawn as the Adventure's tree of the stars (starshop.js) : the lab
// in the middle, bought there with mat, and the researches around it, each one in its branch's direction (the weapons to the north
// and the west, the Gravitron to the east, the planet to the south), linked to the lab or to the one before it ; only the lab
// until it is built, then the researches done, in the Earth's blue, the one going on, gold, its time filling it as a clock from
// noon, and the ones that can be started, their time in their pill ; the others stay hidden
var researchArea	= 268;		// the tree's width and height, for five cells (as the stars' tree's : treePitch, treeCell)

// function to fill the Researches section of the pause menu with the tree, at each refresh()
function refreshResearches () {
	var holder = document.getElementById ( "researchList" );
	var area = { width : researchArea, height : researchArea };
	var shown = [];
	for ( var id in researches ) {
		if ( research.lab && ( research.done[id] || research.current == id || researchOpen ( id ) ) ) {
			shown.push ( id );
		}
	}
	var html = "<div class='tree research'><svg class='links' viewBox='0 0 " + area.width + " " + area.height + "'>";
	// the links, from the lab or the research before, to the researches shown (under the cells)
	for ( var s in shown ) {
		var item = researches[shown[s]];
		var from = cellPlace ( item.needs.length ? researches[item.needs[0]].at : [0, 0], area );
		var to = cellPlace ( item.at, area );
		html += "<line class='" + ( research.done[shown[s]] ? "bought" : "open" ) + "' x1='" + ( from.left + treeCell / 2 ) + "' y1='" + ( from.top + treeCell / 2 )
			+ "' x2='" + ( to.left + treeCell / 2 ) + "' y2='" + ( to.top + treeCell / 2 ) + "'/>";
	}
	html += "</svg>";
	// the lab, and what its next level costs
	var lab = cellPlace ( [0, 0], area );
	var labCost = maxReached ( "lab" ) ? false : priceToPay ( "lab" );
	html += "<div class='cell lab" + ( research.lab ? " bought" : "" ) + ( labCost === false ? " max" : "" ) + "' style='left:" + lab.left + "px;top:" + lab.top + "px'"
		+ " onmouseenter='labTip(event);' onmousemove='placeTooltip(event);' onmouseleave='hideTooltip();' onClick='buyLab();'>"
		+ tileSVG ( "lab" ) + "<div class='value'>" + [ "to build", "lab", "auto" ][research.lab] + "</div>"
		+ ( labCost === false ? "" : "<div class='price" + ( MyPlanet.mat >= labCost ? "" : " short" ) + "'>" + labCost + " mat</div>" ) + "</div>";
	// the researches shown
	for ( var s in shown ) {
		var id = shown[s];
		var place = cellPlace ( researches[id].at, area );
		var state = research.done[id] ? " bought max" : ( research.current == id ) ? ( research.complete ? " complete" : " running" ) : "";
		var pill = research.done[id] ? "" : ( research.current == id && research.complete ) ? "validate" : researchLeft ( id ) + " s";
		var clock = ( state == " running" ) ? ";--done:" + researchShare ( id ) + "%" : "";
		html += "<div class='cell" + state + "' style='left:" + place.left + "px;top:" + place.top + "px" + clock + "'"
			+ " onmouseenter='researchTip(event,\"" + id + "\");' onmousemove='placeTooltip(event);' onmouseleave='hideTooltip();' onClick='researchAction(\"" + id + "\");'>"
			+ tileSVG ( researches[id].picture ) + ( pill ? "<div class='price" + ( state == " complete" ? " gold" : "" ) + "'>" + pill + "</div>" : "" ) + "</div>";
	}
	html += "</div><div class='foot'>" + researchFoot() + "</div>";
	holder.innerHTML = html;
}

// function to know how much of a research is done, in percents
function researchShare ( id ) {
	return Math.min ( 100, Math.floor ( 100 * ( research.spent[id] || 0 ) / ( researches[id].time * framesPerSecond ) ) );
}

// function to write under the tree what goes on, and what a click does
function researchFoot () {
	if ( !research.lab ) {
		return "Build the lab, in the middle, to research: each research then takes time, not mat.";
	}
	if ( research.current ) {
		var name = researches[research.current].name;
		return research.complete ? name + " is complete: click it to validate it."
			: "Researching " + name + ": " + researchShare ( research.current ) + "% done, " + researchLeft ( research.current ) + " s left. Click it to stop it.";
	}
	return ( researchNews() == "available" ) ? "Click a research to start it: one at a time, it goes on while you play." : "Every research is done.";
}

// function to fill the tooltip with a research of the tree : its name, what it brings, and what a click on it does
// (placed under the mouse when it comes on the cell, left where it is after a click)
function researchTip ( e, id ) {
	var item = researches[id];
	var cut = item.tip.indexOf ( " - " );
	shopTooltip.innerHTML = "";
	newElement ( "h3", "", shopTooltip ).textContent = item.name;
	newElement ( "div", "", shopTooltip ).textContent = ( cut >= 0 ) ? item.tip.substring ( cut + 3 ) : item.tip;
	var does = newElement ( "div", "buys", shopTooltip );
	if ( research.done[id] ) {
		does.innerHTML = "<span class='gold'>Researched: yours for this game.</span>";
	} else if ( research.current == id && research.complete ) {
		does.innerHTML = "<span class='green'>Complete: a click validates it.</span>";
	} else if ( research.current == id ) {
		does.innerHTML = "<span class='gold'>" + researchShare ( id ) + "% done, " + researchLeft ( id ) + " s left</span><br>A click stops it, its time kept.";
	} else if ( research.current ) {
		does.innerHTML = "<span class='green'>" + researchLeft ( id ) + " s of play</span><br>A click starts it, " + researches[research.current].name + " stopping, its time kept.";
	} else {
		does.innerHTML = "<span class='green'>" + researchLeft ( id ) + " s of play: a click starts it.</span>";
	}
	shopTooltip.style.display = "block";
	if ( e ) {
		placeTooltip ( e );
	}
}

// function to fill the tooltip with the lab, in the middle of the tree : what its next level brings, and its price
function labTip ( e ) {
	var cost = maxReached ( "lab" ) ? false : priceToPay ( "lab" );
	var cut = upgrades.lab.tip.indexOf ( " - " );
	shopTooltip.innerHTML = "";
	newElement ( "h3", "", shopTooltip ).textContent = research.lab >= 2 ? "Research Lab: the Automation" : upgrades.lab.name;
	newElement ( "div", "", shopTooltip ).textContent = upgrades.lab.tip.substring ( cut + 3 );
	var buys = newElement ( "div", "buys", shopTooltip );
	if ( cost === false ) {
		buys.innerHTML = "<span class='gold'>Maximum reached.</span>";
	} else {
		buys.innerHTML = "<span class='" + ( MyPlanet.mat >= cost ? "green" : "red" ) + "'>" + cost + " mat" + ( research.lab ? " for the Automation" : " to build it" ) + "</span>"
			+ ( MyPlanet.mat >= cost ? "" : "<br>You have " + MyPlanet.mat + " mat." );
	}
	shopTooltip.style.display = "block";
	if ( e ) {
		placeTooltip ( e );
	}
}

// function to buy the lab, or its Automation, from the middle of the tree, when the mat pays for it (upgrade, shop.js)
function buyLab () {
	upgrade ( "lab" );
	labTip ( false );
}

// function to tell the player about the researches, at the bottom right of the game area (above an achievement's banner) :
// a research complete or one to start are shown until the player acts, the one going on more quietly,
// and the one the Automation has just validated for a few seconds
function drawResearchCorner ( ctx ) {
	var news = researchNews();
	var validated = research.validated && gameTime < research.validated.until;
	if ( news == false && !validated ) {
		return;
	}
	var width = 200, height = 44;
	var x = gameSize - width - 8;
	var y = gameSize - height - 8 - ( achievementQueue.length > 0 ? 76 : 0 );
	ctx.save();
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	if ( validated ) {
		ctx.fillStyle = 'rgba(30,30,30,0.85)';
		ctx.fillRect ( x, y, width, height );
		ctx.strokeStyle = 'rgb(242,201,76)';
		ctx.lineWidth = 2;
		ctx.strokeRect ( x + 1, y + 1, width - 2, height - 2 );
		ctx.fillStyle = 'rgb(242,201,76)';
		ctx.font = 'bold 12px Arial';
		ctx.fillText ( 'RESEARCH VALIDATED', x + 10, y + 18 );
		ctx.fillStyle = '#ddd';
		ctx.font = '11px Arial';
		ctx.fillText ( researches[research.validated.id].name, x + 10, y + 34 );
	} else if ( news == "running" ) {
		var item = researches[research.current];
		ctx.fillStyle = 'rgba(30,30,30,0.6)';
		ctx.fillRect ( x, y, width, height );
		ctx.fillStyle = '#aaa';
		ctx.font = '11px Arial';
		ctx.fillText ( 'Researching : ' + item.name, x + 10, y + 17 );
		ctx.fillText ( researchLeft ( research.current ) + ' s', x + width - 40, y + 33 );
		ctx.fillStyle = '#333';
		ctx.fillRect ( x + 10, y + 26, width - 60, 6 );
		ctx.fillStyle = '#5454e3';
		ctx.fillRect ( x + 10, y + 26, ( width - 60 ) * research.spent[research.current] / ( item.time * framesPerSecond ), 6 );
	} else {
		// gold for a research to validate, green for one to start, blinking softly
		var color = ( news == "complete" ) ? '242,201,76' : '93,244,93';
		ctx.fillStyle = 'rgba(30,30,30,0.85)';
		ctx.fillRect ( x, y, width, height );
		ctx.strokeStyle = 'rgba(' + color + ',' + ( 0.55 + 0.45 * Math.sin ( performance.now() / 200 ) ) + ')';
		ctx.lineWidth = 2;
		ctx.strokeRect ( x + 1, y + 1, width - 2, height - 2 );
		ctx.fillStyle = 'rgb(' + color + ')';
		ctx.font = 'bold 12px Arial';
		ctx.fillText ( ( news == "complete" ) ? 'RESEARCH COMPLETE' : 'RESEARCH AVAILABLE', x + 10, y + 18 );
		ctx.fillStyle = '#ddd';
		ctx.font = '11px Arial';
		ctx.fillText ( ( news == "complete" ) ? researches[research.current].name + ' : press Space' : 'Press Space to choose one', x + 10, y + 34 );
	}
	ctx.restore();
}
