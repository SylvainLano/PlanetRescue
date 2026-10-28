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
	head.textContent = section.title;
	head.addEventListener ( "click", function () { openSection ( block ); } );
	var content = newElement ( "div", "content", block );
	if ( section.upgrades ) {
		addUpgrades ( content, section.upgrades );
	} else if ( section.panels ) {
		addPanels ( content, section.panels );
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
	tab.textContent = panel.tab;
	tab.addEventListener ( "click", function () { showPanel ( index, tabs, holder ); } );
	var box = newElement ( "div", "panel", holder );
	newElement ( "h2", "", box ).textContent = panel.title;
	var list = box;
	if ( panel.weapon ) {
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
		tabs.children[n].className = ( n == index ) ? "tab current" : "tab";
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
