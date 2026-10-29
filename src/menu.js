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
// the weapons are shown by tabs, and every line has a tooltip. (It used jQuery and its plugins until 2026.)
var shopTooltip = false;
var researchSection = false;	// the Researches section, opened with the pause when a research waits for the player
var menuBadges = [];			// the counters of the titles and weapon tabs : what can be bought there (refreshBadges)

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
	var head = newElement ( "div", "head", block );
	addBadge ( head, section.title, section.researches ? "research" : sectionThings ( section ) );
	head.addEventListener ( "click", function () { openSection ( block ); } );
	var content = newElement ( "div", "content", block );
	if ( section.upgrades ) {
		addUpgrades ( content, section.upgrades );
	} else if ( section.panels ) {
		addPanels ( content, section.panels );
	} else if ( section.researches ) {
		// filled at each refresh (researches.js)
		newElement ( "div", "", content ).id = "researchList";
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
	var tab = newElement ( "a", "tab", tabs );
	addBadge ( tab, panel.tab, panelThings ( panel ) );
	tab.addEventListener ( "click", function () { showPanel ( index, tabs, holder ); } );
	var box = newElement ( "div", "panel", holder );
	newElement ( "h2", "", box ).textContent = panel.title;
	var list = box;
	if ( panel.secondary ) {
		// a secondary weapon, always active once researched : its tab stays hidden until then
		tab.id = panel.secondary + "Tab";
		var status = addLine ( box, "Status", panel.secondary, panel.statusTip, function () {} );
		status.querySelector ( "a" ).innerHTML = "<span class='green'>active</span>";
	} else if ( panel.weapon ) {
		addLine ( box, "Status", panel.weapon, panel.statusTip, function () { activate ( panel.weapon ); } );
		// the weapon's upgrades, shown by refresh() once it is bought
		list = newElement ( "div", "", box );
		list.id = panel.weapon + "Upgrades";
		if ( panel.modes ) {
			addLine ( list, "Mode", panel.weapon + "Mode", "Change the mode to trigger alternative fire.", function () { modeChange ( panel.weapon ); } );
		}
	}
	addUpgrades ( list, panel.upgrades );
}

// function to show a weapon panel, hiding the others
function showPanel ( index, tabs, holder ) {
	for ( var n = 0; n < holder.children.length; n++ ) {
		holder.children[n].style.display = ( n == index ) ? "block" : "none";
		tabs.children[n].classList.toggle ( "current", n == index );
	}
}

// function to show the tab of a secondary weapon once researched, or to hide it (back to the first tab if it was the one shown)
function showSecondaryTab ( weapon, shown ) {
	var tab = document.getElementById ( weapon + "Tab" );
	tab.style.display = shown ? "" : "none";
	if ( !shown && tab.classList.contains ( "current" ) ) {
		tab.parentNode.firstChild.click();
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
function panelThings ( panel ) {
	var things = [];
	if ( panel.weapon ) {
		things.push ( { weapon : panel.weapon } );
	}
	for ( var u in panel.upgrades ) {
		things.push ( { upgrade : panel.upgrades[u], owner : panel.weapon || panel.secondary } );
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

// function to add the lines of a list of upgrades, each one bought by a click
function addUpgrades ( parent, list ) {
	for ( var u in list ) {
		addUpgrade ( parent, list[u] );
	}
}

// function to add the line of an upgrade : its tooltip is read from upgrades when shown, as some of them change (SMART)
function addUpgrade ( parent, thing ) {
	var line = addLine ( parent, upgrades[thing].name, thing, false, function () { upgrade ( thing ); } );
	line.setAttribute ( "data-upgrade", thing );
}

// function to add a line of the menu : its label, the link that refresh() fills, and its tooltip
function addLine ( parent, label, id, tip, onClick ) {
	var line = newElement ( "span", "tip", newElement ( "p", "", parent ) );
	line.appendChild ( document.createTextNode ( label + " : " ) );
	var link = newElement ( "a", "", line );
	link.id = id;
	link.addEventListener ( "click", onClick );
	if ( tip ) {
		line.setAttribute ( "data-tip", tip );
	}
	return line;
}

// function to show the tooltips of the menu, following the mouse ; their text is split by " - " into a title and a text
// (the tooltip is put into the game area, to be zoomed with it)
function addTooltips ( shop ) {
	shopTooltip = newElement ( "div", "", document.getElementById("gameArea") );
	shopTooltip.id = "tooltip";
	shop.addEventListener ( "mouseover", function ( e ) {
		var line = e.target.closest ( ".tip" );
		if ( !line ) {
			return;
		}
		var tip = line.getAttribute ( "data-tip" ) || upgrades[line.getAttribute ( "data-upgrade" )].tip;
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
	shop.addEventListener ( "click", hideTooltip );
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
