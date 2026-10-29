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


// The sounds of the game, made by the browser itself (Web Audio), with no file to load : off until the player turns them on,
// with the M key or the start menu, and the browser remembers it
var soundOn = ( localStorage["sound"] == "on" );
var audio = false;			// the browser's sound maker, made once the sounds are on (browsers wait for a click or a key to play them)
var soundClock = {};		// when each sound was played last, for the frequent ones not to pile up
var laserHumming = false;	// the laser's hum, going on while it fires

// each sound : the time it waits before it can be played again (in milliseconds), and how it is made
var sounds = {
	shot		: { gap : 70, play : function ( t ) { tone ( "triangle", 900, 450, 0.05, 0.04, t ); } },
	destroy		: { gap : 50, play : function ( t ) { hiss ( 1400, 0.2, 0.35, t ); } },
	giant		: { gap : 0, play : function ( t ) { hiss ( 500, 0.5, 0.6, t ); tone ( "sine", 90, 40, 0.5, 0.35, t ); } },
	crash		: { gap : 0, play : function ( t ) { tone ( "sine", 110, 35, 0.5, 0.7, t ); hiss ( 300, 0.4, 0.4, t ); } },
	shield		: { gap : 80, play : function ( t ) { tone ( "sawtooth", 1200, 300, 0.15, 0.05, t ); } },
	missile		: { gap : 80, play : function ( t ) { tone ( "sawtooth", 220, 660, 0.15, 0.03, t ); } },
	blast		: { gap : 60, play : function ( t ) { hiss ( 900, 0.3, 0.45, t ); } },
	capsule		: { gap : 0, play : function ( t ) { tone ( "sine", 300, 600, 0.12, 0.12, t ); } },
	bomb		: { gap : 40, play : function ( t ) { hiss ( 450, 0.7, 0.8, t ); tone ( "sine", 70, 30, 0.6, 0.5, t ); } },
	rebound		: { gap : 80, play : function ( t ) { tone ( "triangle", 500, 1100, 0.08, 0.06, t ); } },
	ricochet	: { gap : 40, play : function ( t ) { tone ( "triangle", 2200, 1500, 0.07, 0.05, t ); } },
	achievement	: { gap : 0, play : function ( t ) { notes ( [1047, 1319, 1568], 0.12, t ); } },
	research	: { gap : 0, play : function ( t ) { notes ( [784, 1175], 0.14, t ); } },
	shelters	: { gap : 0, play : function ( t ) { notes ( [523, 659, 392], 0.2, t ); } }
};

// function to turn the sounds on or off, from the start menu or with the M key
function toggleSound () {
	soundOn = !soundOn;
	localStorage["sound"] = soundOn ? "on" : "off";
	if ( soundOn ) {
		playSound ( "research" );	// a chime, to hear that they are on
	} else {
		laserHum ( false );
	}
	showSoundState();
}

// function to write on the menus if the sounds are on or off
function showSoundState () {
	var states = document.querySelectorAll ( ".soundState" );
	for ( var s = 0; s < states.length; s++ ) {
		states[s].textContent = soundOn ? "on" : "off";
		states[s].classList.toggle ( "on", soundOn );
	}
}

// function to get the browser's sound maker ready, once the sounds are on ; false when the browser has none
function startAudio () {
	if ( !audio ) {
		var Maker = window.AudioContext || window.webkitAudioContext;
		if ( !Maker ) {
			return false;
		}
		audio = new Maker();
		audio.master = audio.createGain();
		audio.master.gain.value = 0.3;
		audio.master.connect ( audio.destination );
		// a second of noise, for the crumbles and the blasts
		audio.noise = audio.createBuffer ( 1, audio.sampleRate, audio.sampleRate );
		var data = audio.noise.getChannelData ( 0 );
		for ( var n = 0; n < data.length; n++ ) {
			data[n] = Math.random() * 2 - 1;
		}
	}
	if ( audio.state == "suspended" && !document.hidden ) {
		audio.resume();
	}
	return true;
}

// function to play a sound, if the sounds are on and it was not played too recently
function playSound ( name ) {
	if ( !soundOn || !startAudio() ) {
		return;
	}
	var now = audio.currentTime;
	var sound = sounds[name];
	if ( soundClock[name] !== undefined && ( now - soundClock[name] ) * 1000 < sound.gap ) {
		return;
	}
	soundClock[name] = now;
	sound.play ( now );
}

// function to make a tone, sliding from a frequency to another while it fades out
function tone ( type, from, to, length, volume, t ) {
	var oscillator = audio.createOscillator();
	var gain = audio.createGain();
	oscillator.type = type;
	oscillator.frequency.setValueAtTime ( from, t );
	oscillator.frequency.exponentialRampToValueAtTime ( to, t + length );
	gain.gain.setValueAtTime ( volume, t );
	gain.gain.exponentialRampToValueAtTime ( 0.001, t + length );
	oscillator.connect ( gain );
	gain.connect ( audio.master );
	oscillator.start ( t );
	oscillator.stop ( t + length );
}

// function to make a noise through a low-pass filter, fading out : a crumble, or a blast when it is low and long
function hiss ( cutoff, length, volume, t ) {
	var source = audio.createBufferSource();
	var filter = audio.createBiquadFilter();
	var gain = audio.createGain();
	source.buffer = audio.noise;
	filter.type = "lowpass";
	filter.frequency.value = cutoff;
	gain.gain.setValueAtTime ( volume, t );
	gain.gain.exponentialRampToValueAtTime ( 0.001, t + length );
	source.connect ( filter );
	filter.connect ( gain );
	gain.connect ( audio.master );
	source.start ( t, Math.random() * 0.4 );
	source.stop ( t + length );
}

// function to play a few notes, one after the other : a chime
function notes ( list, length, t ) {
	for ( var n = 0; n < list.length; n++ ) {
		tone ( "sine", list[n], list[n], length * 2, 0.15, t + n * length );
	}
}

// function to make the laser hum while it fires, and to stop it, at each turn of the engine
function laserHum ( on ) {
	if ( on && !laserHumming && soundOn && startAudio() ) {
		var oscillator = audio.createOscillator();
		var wobble = audio.createOscillator();
		var depth = audio.createGain();
		var filter = audio.createBiquadFilter();
		var gain = audio.createGain();
		oscillator.type = "sawtooth";
		oscillator.frequency.value = 180;
		wobble.frequency.value = 30;
		depth.gain.value = 12;
		wobble.connect ( depth );
		depth.connect ( oscillator.frequency );
		filter.type = "lowpass";
		filter.frequency.value = 900;
		gain.gain.value = 0.05;
		oscillator.connect ( filter );
		filter.connect ( gain );
		gain.connect ( audio.master );
		oscillator.start();
		wobble.start();
		laserHumming = { oscillator : oscillator, wobble : wobble, gain : gain };
	} else if ( !on && laserHumming ) {
		var end = audio.currentTime;
		laserHumming.gain.gain.setTargetAtTime ( 0, end, 0.03 );
		laserHumming.oscillator.stop ( end + 0.2 );
		laserHumming.wobble.stop ( end + 0.2 );
		laserHumming = false;
	}
}

// the browsers let the sounds play once the player has clicked or pressed a key
function wakeSound () {
	if ( soundOn ) {
		startAudio();
	}
}
document.addEventListener ( "click", wakeSound );
document.addEventListener ( "keydown", wakeSound );

// the sounds wait while the game's tab is hidden, as the game does
document.addEventListener ( "visibilitychange", function () {
	if ( audio ) {
		if ( document.hidden ) {
			audio.suspend();
		} else if ( soundOn ) {
			audio.resume();
		}
	}
} );
