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


// player's planet pseudo-class
function Planet(context,life,mat,skin,r,m,x,y) {
// elements from the function call
	this.life=life;
	this.maxLife=life;
	this.mat=mat;
	this.totalMat=0;
	this.context=context;
	this.skin=skin;
	this.radius=r;
	this.mass=m;
	this.x=x;
	this.y=y;

// object definition
	this.type="Planet";
}

function Gravitron(context,suction,angle,wideness,shield,power,sort,repulsion,pulse,radius) {
// elements from the function call
	this.context=context;
	this.suction=suction;
	this.repulsion=repulsion;
	this.pulse=pulse;
	this.power=power;
	this.sort=sort;
	this.angle=angle;
	this.wideness=wideness;
	this.shield=shield;
	this.radius=radius;
	
// elements to set up
	this.va = 0;		// velocity around the planet
	this.vg = 0;		// growth velocity
	this.charge = 0;	// shield charge
	this.counter = 0;	// count before charging

// object definition
	this.type="Gravitron";
}

function Pulse(context,angle,wideness,charge,gravRadius) {
// elements from the function call
	this.context=context;
	this.angle=angle;
	this.wideness=wideness;
	this.charge=charge;
	this.radius = gravRadius;

// object definition
	this.type="Pulse";
}

// asteroids  pseudo-class
function Asteroid(context,life,skin,r,m,x,y,vx,vy) {
// elements from the function call
	this.life=life;
	this.context=context;
	this.skin=skin;
	this.radius=r;
	this.mass=m;
	this.x=x;
	this.y=y;
	this.vx=vx;
	this.vy=vy;

// element to set up
	this.pass = 0;			// for the main structure to ignore this asteroid
	
// object definition
	this.type="Asteroid";
}

// debris  pseudo-class
function Debris(context,x,y,vx,vy) {
// elements from the function call
	this.context=context;
	this.x=x;
	this.y=y;
	this.vx=vx;
	this.vy=vy;

// object definition
	this.type="Debris";
}

// weapons pseudo-class
function Weapon(context,type,color,angle,delay,power,speed,smart,cNbr) {
// elements from the function call
	this.context=context;
	this.color=color;
	this.fireRate=delay;
	this.currentDelay=0;
	this.power=power;
	this.speed=speed;
	this.angle=angle;
	this.smart=smart;
		/*	Basic weapon uses :
					- angle as current angle
					- smart as the smartness of the shooting pattern
					- speed as the increasing speed of the shots
			Spiral weapon uses :
					- angle as a temp value for which cannon to fire
					- smart as the shooting mode : same time, one after the other, and Orbital
					- speed as the decreasing speed of the shots
			Magnetic weapon uses :
					- angle as the current angle
					- smart as the shooting mode : running around or following main cannon
					- speed as the shot friction generator (to decrease speed, thus making shots act like mines)
			Hammer weapon uses :
					- angle as the current angle
					- smart as the shooting mode
					- speed as fire spread, to make the shot follow a sinusoid
		*/
	this.active = 0;
	this.cannonNbr = cNbr;

// object definition
	this.type=type;
}

// Straight shot pseudo-class
function Shot1(context,power,color,x,y,vx,vy) {
// elements from the function call
	this.power=power;
	this.color=color;
	this.context=context;
	this.x=x;
	this.y=y;
	this.vx=vx;
	this.vy=vy;
	this.weapon=1;

// object definition
	this.type="Straight Shot";
}

// Spiral and orbital shots pseudo-class
function Shot2(context,power,color,t,vd,vt) {
// elements from the function call
	this.power=power;
	this.color=color;
	this.context=context;
	this.t=t + (4/Math.PI);
	this.vd=vd;
	this.vt=vt;

// elements to define
	this.d=MyPlanet.radius + 4;
	this.weapon=2;
	this.x=MyPlanet.x+Math.cos(this.t)*this.d;
	this.y=MyPlanet.y+Math.sin(this.t)*this.d;

// object definition
	this.type="Spiral/Orbital Shot";
}

// Magnetic shots pseudo-class
function Shot3(context,power,color,x,y,vx,vy) {
// elements from the function call
	this.power=power;
	this.color=color;
	this.colorAlpha=100;
	this.context=context;
	this.x=x;
	this.y=y;
	this.vx=vx;
	this.vy=vy;
	this.weapon=3;

// object definition
	this.type="Magnetic Shot";
}

// Hammer and broom shots pseudo-class
function Shot4(context,power,color,t,vd,spread) {
// elements from the function call
	this.power=power;
	this.color=color;
	this.context=context;
	this.tbase=t;
	this.t=t;
	this.vd=vd;
	this.spread=spread;

// elements to define
	this.d=MyPlanet.radius + 4;
	this.weapon=4;
	this.x=MyPlanet.x+Math.cos(this.t)*this.d;
	this.y=MyPlanet.y+Math.sin(this.t)*this.d;

// object definition
	this.type="Hammer/Broom Shot";
}