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


$(document).ready(function(){	
	$('.pretty').tooltip({
		track: true,
		delay: 0,
		showURL: false,
		showBody: " - ",
		extraClass: "pretty",
		fixPNG: true,
		left: -120
	});
	$('#coda-slider-1').codaSlider({
		dynamicArrows: false,
		dynamicTabs: false
	});
	$( "#accordion" ).accordion({
		header: '.head',
		fillSpace: true
	});
});	
