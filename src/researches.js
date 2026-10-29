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


// The research tree, planned in 2010 for the pause menu : its branches open for good with an achievement,
// and in a game, each research takes time, one at a time, before it is validated in the pause menu to bring its bonus
// each branch : its name, and the achievement opening it
var researchBranches = {
	missiles	: { name : "Missiles", opener : "survivor" },
	explosives	: { name : "Explosives", opener : "demolisher" },
	lasers		: { name : "Lasers", opener : "sharpshooter" },
	ricochets	: { name : "Ricochets", opener : "bankShot" }
};

// each research : its name, its tooltip, its branch, its time (in seconds of play), the researches it needs first, and what it brings
var researches = {
	missiles	: { name : "Missile Launcher", branch : "missiles", time : 60, needs : [],
					tip : "Missile Launcher - A secondary weapon, which takes no place among your active weapons. Its missiles fly to your main cannon's target, and explode on the first asteroid they touch, damaging every asteroid around.",
					apply : function () { missileLauncher.cannonNbr = 1; } },
	homing		: { name : "Homing Missiles", branch : "missiles", time : 90, needs : ["missiles"],
					tip : "Homing Missiles - Your missiles steer toward their target, even when it changes its way, and look for another one if it is destroyed before they reach it.",
					apply : function () { missileLauncher.smart = 1; } },
	nitro		: { name : "Nitroglycerine", branch : "explosives", time : 75, needs : [],
					tip : "Nitroglycerine - A secondary weapon, whose slow capsules turn an asteroid far from your planet into a bomb, damaging every asteroid around when it explodes : when it touches another asteroid, when it is destroyed, or as soon as your planet comes into its blast, which spares your planet. Steer it into the others with your Gravitron.",
					apply : function () { nitroLauncher.cannonNbr = 1; } },
	chain		: { name : "Chain Reaction", branch : "explosives", time : 90, needs : ["nitro"],
					tip : "Chain Reaction - The asteroids a bomb's blast doesn't destroy become bombs too, with half its power : their blasts do the same, until the reaction fades out.",
					apply : function () { nitroLauncher.smart = 1; } },
	laser		: { name : "Laser", branch : "lasers", time : 90, needs : [],
					tip : "Laser - A secondary weapon, whose beam burns an asteroid for a while, then cools down. It aims first at the giants, then at the asteroids going to crash on your planet, the soonest first.",
					apply : function () { laserCannon.cannonNbr = 1; } },
	piercing	: { name : "Piercing Beam", branch : "lasers", time : 90, needs : ["laser"],
					tip : "Piercing Beam - Your laser's beam goes through its target, and spreads behind it in a cone of light to the edge of space : every other asteroid it reaches, on its way or in the cone, burns at half power.",
					apply : function () { laserCannon.smart = 1; } },
	rebound		: { name : "Rebound Shot", branch : "ricochets", time : 90, needs : [],
					tip : "Rebound Shot - A secondary weapon, whose fast shots fly to your main cannon's target, then ricochet on the asteroids they hit, on the edges of space and on your planet's atmosphere, which they don't harm, until they have made all their rebounds.",
					apply : function () { reboundCannon.cannonNbr = 1; } }
};

// the researches of the current game : the planet's lab (an upgrade to buy, its level 2 being the Automation), the one going on,
// if it is complete, the time spent on each one (in turns), the ones validated, and the last one the Automation validated
var research = { lab : 0, current : false, complete : false, spent : {}, done : {}, validated : false };

// function to start a game with no lab and no research done
function newResearches () {
	research = { lab : 0, current : false, complete : false, spent : {}, done : {}, validated : false };
}

// function to know if a branch is open, by its achievement
function branchOpen ( branch ) {
	return achieved[researchBranches[branch].opener] ? true : false;
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

// function to know if a research can be done : the lab built, its branch open, not done yet, and the researches it needs done
function researchOpen ( id ) {
	var item = researches[id];
	if ( !research.lab || research.done[id] || !branchOpen ( item.branch ) ) {
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

// function to start a research, or to stop it (its time spent is kept), or to validate it once complete, from the pause menu
function researchAction ( id ) {
	if ( research.current == id ) {
		if ( research.complete ) {
			validateResearch();
		}
		research.current = false;
	} else if ( !research.current && researchOpen ( id ) ) {
		startResearch ( id );
	}
	refresh();
}

// function to fill the Researches section of the pause menu, at each refresh() : the lab to build first, the open branches
// with their researches, and the closed ones, whose achievement stays secret
function refreshResearches () {
	var holder = document.getElementById ( "researchList" );
	holder.innerHTML = "";
	if ( !research.lab && anyBranchOpen() ) {
		// a click opens the planet's upgrades, where the lab is bought
		var lab = addLine ( holder, upgrades.lab.name, "", upgrades.lab.tip, function () { openSection ( document.getElementById ( "lab" ).closest ( ".section" ) ); } );
		lab.querySelector ( "a" ).innerHTML = "<span class='upred'>build it first, with your planet's upgrades</span>";
	}
	for ( var branch in researchBranches ) {
		if ( !branchOpen ( branch ) ) {
			var closed = addLine ( holder, "???", "", "Closed branch - An achievement will open this branch of the research tree, for good.", function () {} );
			closed.querySelector ( "a" ).innerHTML = "<span class='upred'>opened by an achievement</span>";
			continue;
		}
		newElement ( "h2", "", holder ).textContent = researchBranches[branch].name;
		for ( var id in researches ) {
			if ( researches[id].branch == branch ) {
				addResearchLine ( holder, id );
			}
		}
	}
}

// function to add the line of a research, telling what a click on it does
function addResearchLine ( holder, id ) {
	var item = researches[id];
	var line = addLine ( holder, item.name, "research_" + id, item.tip, function () { researchAction ( id ); } );
	var link = line.querySelector ( "a" );
	if ( research.done[id] ) {
		link.innerHTML = "<span class='green'>researched</span>";
	} else if ( research.current == id && research.complete ) {
		link.innerHTML = "<span class='upgreen'>COMPLETE : VALIDATE</span>";
	} else if ( research.current == id ) {
		var done = Math.floor ( 100 * research.spent[id] / ( item.time * framesPerSecond ) );
		link.innerHTML = "<span><span class='blue'>" + done + "% done, " + researchLeft ( id ) + " s left</span> <span class='upred'>STOP</span></span>";
	} else if ( !researchOpen ( id ) ) {
		var needs = research.lab ? [] : [ upgrades.lab.name ];
		for ( var n in item.needs ) {
			needs.push ( researches[item.needs[n]].name );
		}
		link.innerHTML = "<span class='upred'>needs " + needs.join ( ", " ) + "</span>";
	} else if ( research.current ) {
		link.innerHTML = "<span class='upred'>" + researchLeft ( id ) + " s, once the current research is over</span>";
	} else {
		link.innerHTML = "<span class='upgreen'>START : " + researchLeft ( id ) + " s</span>";
	}
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
