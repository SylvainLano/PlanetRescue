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


// The Adventure's story, told as a comic page : its panels appear one after the other, each one a picture panning slowly under
// its caption, written letter after letter ; a click (or Space) writes the caption at once, or shows the next panel, and the last
// one brings the button going on. The first world's story comes the first time the Adventure starts, and again from the map's
// Story link ; its end comes after the Colossus.
//	- a story : the page's layout, its panels one under the other, cut by slanted gutters : the lines between them, at the left
//	  and at the right (in parts of the page's height), and the sides of each panel, at its top and at its bottom (in parts of the
//	  page's width) ; then its panels, each one with its picture (in img/story/ ; the game's sky while it is not there) and the
//	  height its pan looks at (and fromRight, for a pan starting at its right end, or midway, for one starting halfway ; one panel
//	  out of two pans the other way), or a panel without picture, its title and its text in the middle
var stories = {
	intro : { lines : [ [0, 0], [0.27, 0.21], [0.46, 0.55], [0.72, 0.86], [1, 1] ],
		sides : [ [ [0, 0], [1, 1] ], [ [0.035, 0], [1, 0.985] ], [ [0, 0.02], [0.97, 1] ], [ [0, 0], [1, 1] ] ],
		panels : [
			{ picture : "intro1.jpg", look : "30%", fromRight : true, text : "2131. Twenty years ago, the first rain of asteroids fell on the Earth. Nobody knew why. It never stopped." },
			{ picture : "intro2.jpg", look : "50%", text : "The rains come back every six months, like clockwork, each one heavier than the last. Twenty million of us are left, living under the ground." },
			{ picture : "intro3.jpg", look : "20%", fromRight : true, text : "The NAZA watches the sky, and gives you the last shield of the planet: the Gravitron, an arc of gravity around the Earth, and a cannon that never sleeps." },
			{ picture : "intro4.jpg", look : "8%", midway : true, text : "Rain 41 is coming. Hold on until it ends, and save as many lives as you can." }
		] },
	world1End : { lines : [ [0, 0], [0.40, 0.33], [0.66, 0.74], [1, 1] ],
		sides : [ [ [0, 0], [1, 1] ], [ [0, 0.03], [0.975, 1] ], [ [0, 0], [1, 1] ] ],
		panels : [
			{ picture : "end1.jpg", look : "55%", text : "The Colossus is down. In its broken core, the NAZA finds steel beams, cables, and a light still blinking." },
			{ picture : "end2.jpg", look : "35%", fromRight : true, midway : true, text : "Asteroids don't fall by chance. Someone is sending them." },
			{ title : "World 1 complete", text : "To be continued." }
		] }
};
var storySky		= "img/background1.jpg";	// the picture of a panel while its own one is not there,
var storyLetters	= 40;		// the letters written each second,
var storyPage		= { width : 584, height : 536 };	// the size of the page's panels together, in the game's pixels,
var storyGutter		= 10;		// the gutters between them,
var storyInk		= 5;		// the width of their black ink,
var storyWobble		= 1;		// and how much a hand draws it astray

// the story being told : the ones still to tell after it (the first one being told), its rows on the page, the ones shown,
// and the timer writing the last one's text (false : written)
var story = { queue : [], rows : [], shown : 0, timer : false };
var storyPictures = [];		// the stories' pictures, loaded before they are told (preloadStories)

// function to load the stories' pictures once, when the start menu shows the Adventure's page (adventure.js), for each panel
// to come with its picture at once, even online
function preloadStories () {
	if ( storyPictures.length > 0 ) {
		return;
	}
	for ( var id in stories ) {
		for ( var p = 0; p < stories[id].panels.length; p++ ) {
			if ( stories[id].panels[p].picture ) {
				var picture = new Image();
				picture.src = "img/story/" + stories[id].panels[p].picture;
				storyPictures.push ( picture );
			}
		}
	}
}

// function to start the Adventure, from the start menu : its story first, the first time, then the map
function openAdventure () {
	if ( storySeen ( "intro" ) ) {
		state = "map";
	} else {
		tellStories ( [ "intro" ] );
	}
}

// function to tell stories, one after the other, then go to the map (engine.js shows them : showStory)
function tellStories ( list ) {
	story.queue = list.slice();
	state = "story";
}

// function to know the stories the map's Story link tells : the first world's, and its end once the Colossus is destroyed
function storyList () {
	var list = [ "intro" ];
	var last = adventureLevels.length - 1;
	if ( levelStars[last] && levelStars[last][0] ) {
		list.push ( "world1End" );
	}
	return list;
}

// function to know if a story was told already, the browser remembering it
function storySeen ( id ) {
	try {
		return JSON.parse ( localStorage["storySeen"] || "{}" )[id] ? true : false;
	} catch ( e ) {
		return false;
	}
}

// function to show the first story to tell : its panels, hidden but the first one, cut to their shapes, the black ink of their
// frames drawn over them, and the bar under them ; a panel's caption sits in its top left corner, under its slanted top
function showStory ( holder ) {
	var id = story.queue[0];
	try {
		var seen = JSON.parse ( localStorage["storySeen"] || "{}" );
		seen[id] = true;
		localStorage["storySeen"] = JSON.stringify ( seen );
	} catch ( e ) {}
	var layout = stories[id];
	var html = "<div class='page'>";
	var frames = "";
	for ( var p = 0; p < layout.panels.length; p++ ) {
		var panel = layout.panels[p];
		var corners = panelCorners ( layout, p );
		var left = Math.min ( corners[0][0], corners[3][0] ), right = Math.max ( corners[1][0], corners[2][0] );
		var top = Math.min ( corners[0][1], corners[1][1] ), bottom = Math.max ( corners[2][1], corners[3][1] );
		var shape = corners.map ( function ( c ) { return ( c[0] - left ).toFixed(1) + "px " + ( c[1] - top ).toFixed(1) + "px"; } ).join ( "," );
		// (the caption : inside the panel's slanted sides, on half of its width at most)
		var width = ( corners[1][0] - corners[0][0] ) * 0.5;
		var x = Math.max ( corners[0][0], corners[3][0] ) + 10;
		var y = Math.max ( corners[0][1], edgeHeight ( corners[0], corners[1], x + width ) ) + 9;
		html += "<div class='panel" + ( panel.picture ? "" : " plain" ) + "' style='left:" + left.toFixed(1) + "px;top:" + top.toFixed(1) + "px;"
			+ "width:" + ( right - left ).toFixed(1) + "px;height:" + ( bottom - top ).toFixed(1) + "px;clip-path:polygon(" + shape + ")'>";
		if ( panel.picture ) {
			html += "<div class='picture" + ( panel.fromRight ? " fromRight" : "" ) + ( panel.midway ? " midway" : "" ) + "' style=\"background-image:url('img/story/" + panel.picture + "'),url('" + storySky + "');"
				+ "background-position-y:" + panel.look + "\"></div>"
				+ "<div class='caption' style='left:" + ( x - left ).toFixed(1) + "px;top:" + ( y - top ).toFixed(1) + "px;max-width:" + width.toFixed(1) + "px'></div>";
		} else {
			html += "<div class='title'>" + panel.title + "</div><div class='caption'></div>";
		}
		html += "</div>";
		frames += "<path d='" + inkedPath ( corners, p * 17 + 11 ) + "'/>";
	}
	html += "<svg class='frames' viewBox='0 0 " + storyPage.width + " " + storyPage.height + "' stroke-width='" + storyInk + "'>" + frames + "</svg></div>"
		+ "<div class='bar'><a href='#' class='level' onClick='skipStory(); return false;'>Skip</a>"
		+ "<span class='middle'><span class='hint'>click or press Space</span>"
		+ "<a href='#' class='button' onClick='endStory(); return false;'>Continue</a></span><span></span></div>";
	holder.innerHTML = html;
	holder.onclick = function ( e ) {
		if ( !e.target.closest ( "a" ) ) {
			advanceStory();
		}
	};
	story.rows = holder.querySelectorAll ( ".panel" );
	story.frames = holder.querySelectorAll ( ".frames path" );
	story.shown = 0;
	showRow ( 0 );
}

// function to know the corners of a panel of a story's page, in pixels : top left, top right, bottom right, bottom left
// (half a gutter away from the lines between the panels)
function panelCorners ( layout, n ) {
	var top = layout.lines[n], bottom = layout.lines[n + 1], sides = layout.sides[n];
	var above = ( n > 0 ) ? storyGutter / 2 : 0, below = ( n < layout.panels.length - 1 ) ? storyGutter / 2 : 0;
	var w = storyPage.width, h = storyPage.height;
	return [ [ sides[0][0] * w, top[0] * h + above ], [ sides[1][0] * w, top[1] * h + above ],
		[ sides[1][1] * w, bottom[1] * h - below ], [ sides[0][1] * w, bottom[0] * h - below ] ];
}

// function to know the height of a panel's edge at a place across it, between two of its corners
function edgeHeight ( from, to, x ) {
	return from[1] + ( to[1] - from[1] ) * ( x - from[0] ) / ( to[0] - from[0] );
}

// function to draw a panel's frame as a hand inks it : its sides in a few curves, each one a little astray (always the same way
// for the same seed)
function inkedPath ( corners, seed ) {
	var astray = function () {
		seed = ( seed * 9301 + 49297 ) % 233280;
		return ( seed / 233280 - 0.5 ) * 2 * storyWobble;
	};
	var path = "M" + corners[0][0].toFixed(1) + " " + corners[0][1].toFixed(1);
	for ( var s = 0; s < 4; s++ ) {
		var from = corners[s], to = corners[( s + 1 ) % 4];
		for ( var k = 1; k <= 4; k++ ) {
			var mid = ( k - 0.5 ) / 4, end = k / 4;
			path += " Q" + ( from[0] + ( to[0] - from[0] ) * mid + astray() ).toFixed(1) + " " + ( from[1] + ( to[1] - from[1] ) * mid + astray() ).toFixed(1)
				+ " " + ( from[0] + ( to[0] - from[0] ) * end ).toFixed(1) + " " + ( from[1] + ( to[1] - from[1] ) * end ).toFixed(1);
		}
	}
	return path + " Z";
}

// function to show a panel of the story, with its frame, and write its caption letter after letter ; the last one brings
// the button going on
function showRow ( n ) {
	var row = story.rows[n];
	var text = stories[story.queue[0]].panels[n].text;
	var words = row.querySelector ( ".caption" );
	var written = 0;
	row.classList.add ( "shown" );
	story.frames[n].classList.add ( "shown" );
	clearInterval ( story.timer );
	story.timer = setInterval ( function () {
		written++;
		words.textContent = text.substring ( 0, written );
		if ( written >= text.length ) {
			finishRow();
		}
	}, 1000 / storyLetters );
	story.finish = function () {
		words.textContent = text;
	};
}

// function to end the writing of the last row shown, and bring the button going on after the last row
function finishRow () {
	clearInterval ( story.timer );
	story.timer = false;
	story.finish();
	if ( story.shown == story.rows.length - 1 ) {
		document.querySelector ( "#story .bar" ).classList.add ( "ready" );
	}
}

// function to go on with the story, at a click or Space : the text written at once, or the next row
function advanceStory () {
	if ( story.timer ) {
		finishRow();
	} else if ( story.shown < story.rows.length - 1 ) {
		story.shown++;
		showRow ( story.shown );
	} else {
		endStory();
	}
}

// function to end the story told : the next one, or the map
function endStory () {
	clearInterval ( story.timer );
	story.timer = false;
	story.queue.shift();
	if ( story.queue.length > 0 ) {
		state = "story";
	} else {
		document.getElementById("story").style.display = "none";
		state = "map";
	}
}

// function to skip every story still to tell
function skipStory () {
	story.queue = [ story.queue[0] ];
	endStory();
}

// Space and Enter go on with the story, Escape skips it
document.addEventListener ( "keydown", function ( e ) {
	var holder = document.getElementById("story");
	if ( !holder || holder.style.display != "block" ) {
		return;
	}
	if ( e.key == " " || e.key == "Enter" ) {
		advanceStory();
		e.preventDefault();
	} else if ( e.key == "Escape" ) {
		skipStory();
		e.preventDefault();
	}
} );
