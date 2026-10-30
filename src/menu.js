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


// The pause menu, built from shopLayout and upgrades (shop.js) : its sections open one at a time,
// the weapons are shown by tabs, the upgrades by tiles (tiles.js), and every line and tile has a tooltip. (It used jQuery and its plugins until 2026.)
var shopTooltip = false;
var researchSection = false;	// the Researches section, opened with the pause when a research waits for the player
var menuBadges = [];			// the counters of the titles and weapon tabs : what can be bought there (refreshBadges)
var menuAppearing = [];			// the sections, weapon tabs and upgrade tiles hidden until they are worth buying (refreshAppearing)

// function to build the pause menu
function buildShop() {
	var shop = document.getElementById("shop");
	for ( var s in shopLayout ) {
		addSection ( shop, shopLayout[s] );
	}
	openSection ( shop.firstChild );
	addTooltips ( shop );
}

// function to create an element into its parent
function newElement ( tag, className, parent ) {
	var element = document.createElement ( tag );
	if ( className ) {
		element.className = className;
	}
	parent.appendChild ( element );
	return element;
}

// function to add a section of the menu, opened by a click on its title
function addSection ( shop, section ) {
	var block = newElement ( "div", "section", shop );
	menuAppearing.push ( { element : block, appears : function () { return sectionAppears ( section ); } } );
	var head = newElement ( "div", "head", block );
	addBadge ( head, section.title, section.researches ? "research" : sectionThings ( section ) );
	head.addEventListener ( "click", function () { openSection ( block ); } );
	var content = newElement ( "div", "content", block );
	if ( section.upgrades ) {
		addTiles ( content, section.upgrades );		// shown as tiles (tiles.js)
	} else if ( section.panels ) {
		addPanels ( content, section.panels );
	} else if ( section.researches ) {
		// filled at each refresh (researches.js)
		newElement ( "div", "lines", content ).id = "researchList";
		researchSection = block;
	} else {
		content.textContent = section.text;
	}
}

// function to open a section of the menu, closing the others
function openSection ( block ) {
	var sections = block.parentNode.children;
	for ( var n = 0; n < sections.length; n++ ) {
		sections[n].className = ( sections[n] == block ) ? "section open" : "section";
	}
}

// function to add the weapon panels, one shown at a time by its tab
function addPanels ( content, panels ) {
	var tabs = newElement ( "div", "tabs", content );
	var holder = newElement ( "div", "panels", content );
	for ( var p in panels ) {
		addPanel ( tabs, holder, panels[p] );
	}
	showPanel ( 0, tabs, holder );
}

// function to add a weapon panel and its tab
function addPanel ( tabs, holder, panel ) {
	var index = holder.children.length;
	var tab = newElement ( "a", panel.secondary ? "tab secondary" : "tab", tabs );	// (the secondary weapons' tabs on a row of their own)
	addBadge ( tab, panel.tab, panelThings ( panel ) );
	tab.addEventListener ( "click", function () { showPanel ( index, tabs, holder ); } );
	menuAppearing.push ( { element : tab, appears : function () { return panelAppears ( panel ); } } );
	var box = newElement ( "div", "panel lines", holder );
	newElement ( "h2", "", box ).textContent = panel.title;
	var list = box;
	if ( panel.secondary ) {
		// a secondary weapon, always active once researched
		var status = addLine ( box, "Status", panel.secondary, panel.statusTip, function () {} );
		status.querySelector ( "a" ).innerHTML = "<span class='green'>active</span>";
	} else if ( panel.weapon ) {
		addLine ( box, "Status", panel.weapon, panel.statusTip, function () { activate ( panel.weapon ); } );
		// the weapon's mode and upgrades, shown by refresh() once it is bought
		list = newElement ( "div", "more", box );
		list.id = panel.weapon + "Upgrades";
		if ( panel.modes ) {
			addLine ( list, "Mode", panel.weapon + "Mode", "Change the mode to trigger alternative fire.", function () { modeChange ( panel.weapon ); } );
		}
	}
	addTiles ( list, panel.upgrades );		// under the lines of its status and mode (tiles.js)
}

// function to show a weapon panel, hiding the others
function showPanel ( index, tabs, holder ) {
	for ( var n = 0; n < holder.children.length; n++ ) {
		holder.children[n].style.display = ( n == index ) ? "" : "none";	// (shown as its columns ask, css/main.css)
		tabs.children[n].classList.toggle ( "current", n == index );
	}
}

// function to know if a weapon tab is shown : once its weapon or one of its upgrades can be bought, as the level of the Adventure decides
// (adventure.js), and once the tab is worth it (appears)
function panelAppears ( panel ) {
	if ( panel.appears && !panel.appears() ) {
		return false;
	}
	if ( adventureAllows ( panel.weapon ) ) {
		return true;
	}
	for ( var u in panel.upgrades ) {
		if ( adventureAllows ( panel.upgrades[u] ) ) {
			return true;
		}
	}
	return false;
}

// function to know if a section of the menu is shown : once something of it can be bought, as the level of the Adventure decides
// (the Researches, once a branch is open)
function sectionAppears ( section ) {
	if ( section.researches ) {
		return !inAdventure() || anyBranchOpen();
	}
	for ( var u in section.upgrades ) {
		if ( adventureAllows ( section.upgrades[u] ) ) {
			return true;
		}
	}
	for ( var p in section.panels ) {
		if ( panelAppears ( section.panels[p] ) ) {
			return true;
		}
	}
	return false;
}

// function to show the weapon tabs and upgrade tiles once they are worth buying, at each refresh()
// (they are hidden again at a new game : back to the first tab if the one shown goes)
function refreshAppearing () {
	for ( var n in menuAppearing ) {
		var item = menuAppearing[n];
		var shown = item.appears();
		item.element.style.display = shown ? "" : "none";
		if ( !shown && item.element.classList.contains ( "current" ) ) {
			item.element.parentNode.firstChild.click();
		}
	}
}

// function to write the title of a section or of a weapon tab, followed by its counter
function addBadge ( element, label, things ) {
	newElement ( "span", "", element ).textContent = label;
	var badge = newElement ( "span", "badge", element );
	menuBadges.push ( { element : element, badge : badge, things : things } );
}

// function to list what a section of the menu sells : its upgrades, or the ones of its weapon panels
function sectionThings ( section ) {
	var things = [];
	for ( var u in section.upgrades ) {
		things.push ( { upgrade : section.upgrades[u] } );
	}
	for ( var p in section.panels ) {
		things = things.concat ( panelThings ( section.panels[p] ) );
	}
	return things;
}

// function to list what a weapon panel sells : the weapon itself while it is not bought, and its upgrades once it is there
// (nothing while its tab is hidden)
function panelThings ( panel ) {
	var things = [];
	if ( panel.weapon ) {
		things.push ( { weapon : panel.weapon, appears : panel.appears } );
	}
	for ( var u in panel.upgrades ) {
		things.push ( { upgrade : panel.upgrades[u], owner : panel.weapon || panel.secondary, appears : panel.appears } );
	}
	return things;
}

// function to show on each title and weapon tab how many things can be bought there with the mat in store, in green,
// or else the price of the cheapest one ; the Researches section tells in gold when a research waits for the player
function refreshBadges () {
	for ( var b in menuBadges ) {
		var item = menuBadges[b];
		if ( item.things == "research" ) {
			var waiting = ( researchNews() == "available" || researchNews() == "complete" );
			item.badge.textContent = waiting ? " (1)" : "";
			item.element.classList.toggle ( "waiting", waiting );
			continue;
		}
		var count = 0, cheapest = false, maxed = false;
		for ( var t in item.things ) {
			var price = thingPrice ( item.things[t] );
			if ( price === false ) {
				maxed = maxed || thingMaxed ( item.things[t] );
				continue;
			}
			if ( price <= MyPlanet.mat ) {
				count++;
			}
			if ( cheapest === false || price < cheapest ) {
				cheapest = price;
			}
		}
		// (a tab shows it under its name, to keep the tabs on one row)
		var dot = item.element.classList.contains ( "tab" ) ? "" : " · ";
		item.element.classList.toggle ( "buyable", count > 0 );
		if ( count > 0 ) {
			item.badge.textContent = " (" + count + ")";
		} else if ( cheapest !== false ) {
			item.badge.textContent = dot + cheapest + " mat";
		} else {
			item.badge.textContent = maxed ? dot + "MAX" : "";
		}
	}
}

// function to add a line of the menu (a weapon's status or mode, a research) : its label, the link that refresh() fills, and its tooltip
function addLine ( parent, label, id, tip, onClick ) {
	var line = newElement ( "span", "tip", newElement ( "p", "", parent ) );
	newElement ( "span", "label", line ).textContent = label;
	var link = newElement ( "a", "", line );
	link.id = id;
	link.addEventListener ( "click", onClick );
	if ( tip ) {
		line.setAttribute ( "data-tip", tip );
	}
	return line;
}

// function to show the tooltips of the menu's lines, following the mouse ; their text is split by " - " into a title and a text
// (the tooltip is put into the game area, to be zoomed with it ; the tiles fill it themselves : tiles.js)
function addTooltips ( shop ) {
	shopTooltip = newElement ( "div", "", document.getElementById("gameArea") );
	shopTooltip.id = "tooltip";
	shop.addEventListener ( "mouseover", function ( e ) {
		var line = e.target.closest ( ".tip" );
		if ( !line ) {
			return;
		}
		var tip = line.getAttribute ( "data-tip" );
		var cut = tip.indexOf ( " - " );
		shopTooltip.innerHTML = "";
		if ( cut >= 0 ) {
			newElement ( "h3", "", shopTooltip ).textContent = tip.substring ( 0, cut );
			tip = tip.substring ( cut + 3 );
		}
		newElement ( "div", "", shopTooltip ).textContent = tip;
		shopTooltip.style.display = "block";
		placeTooltip ( e );
	} );
	shop.addEventListener ( "mousemove", placeTooltip );
	shop.addEventListener ( "mouseout", function ( e ) {
		var line = e.target.closest ( ".tip" );
		if ( line && !line.contains ( e.relatedTarget ) ) {
			hideTooltip();
		}
	} );
	// (a tile keeps its tooltip, telling what the next click buys)
	shop.addEventListener ( "click", function ( e ) {
		if ( !e.target.closest ( ".tile" ) ) {
			hideTooltip();
		}
	} );
}

// function to move the tooltip under the mouse, above it near the bottom of the game area
function placeTooltip ( e ) {
	if ( shopTooltip.style.display != "block" ) {
		return;
	}
	// the mouse position, in the game area's own pixels before its zoom
	var area = shopTooltip.parentNode;
	var frame = area.getBoundingClientRect();
	var zoom = frame.width / area.offsetWidth;
	var x = ( e.clientX - frame.left ) / zoom;
	var y = ( e.clientY - frame.top ) / zoom;
	var top = y + 15;
	if ( top + shopTooltip.offsetHeight > area.offsetHeight ) {
		top = y - 15 - shopTooltip.offsetHeight;
	}
	shopTooltip.style.left = Math.min ( Math.max ( 0, x - 120 ), area.offsetWidth - shopTooltip.offsetWidth ) + "px";
	shopTooltip.style.top = top + "px";
}

// function to hide the tooltip, also when the game resumes
function hideTooltip() {
	if ( shopTooltip ) {
		shopTooltip.style.display = "none";
	}
}
