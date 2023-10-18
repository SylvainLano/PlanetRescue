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


// Function to create a pulse
function emitPulse(ctx,pulseList) {
	var item = new Pulse(ctx,MyGravitron.angle,MyGravitron.wideness,MyGravitron.charge,MyGravitron.radius);
	MyGravitron.charge = 0;
	pulseList.push(item);
	return pulseList;
}

// Function to create the debris
function addDebris(ctx,nb,x,y,vx,vy,debrisList) {
	
	var velocity = Math.sqrt(Math.pow(vx,2)+Math.pow(vy,2));
	
	// Calculating angle
	if ( vy != 0 || vx > 0) {
		var angle = 2 * Math.atan(vy/(vx+velocity));
	} else {
		var angle = Math.PI;
	}
	
	for(d=1;d<=nb;d++){
		var tempAngle = angle - Math.PI / 4 + Math.random() * Math.PI / 2;
		var tempVelocity = Math.random() * velocity / 2;
		var vx = velocity * Math.cos(tempAngle);
		var vy = velocity * Math.sin(tempAngle);
		var item = new Debris(ctx,x,y,vx,vy);
		debrisList.push(item);
	}
	return debrisList;
}

// Function to resolve the pulses
function resolvePulses (pulseList,ctx) {
	var tempList = new Array();
	for (p in pulseList) {		
		if ( pulseList[p].charge > 0 ) {
			// Keeping pulse
			tempList.push(pulseList[p]);
			
			// Displaying pulse
			var oneStep = 10;
			var red = 66;
			var green = 66;
			var blue = 66;
			if ( pulseList[p].charge <= oneStep ) {
				var colorStep = Math.floor( pulseList[p].charge * 190 / oneStep ) + 66;
				red=green=blue=colorStep;
			} else if ( pulseList[p].charge <= (2*oneStep) ) {
				var colorStep = Math.floor( (pulseList[p].charge-oneStep) * 255 / oneStep );
				red=255;
				green=blue=255-colorStep;
			} else if ( pulseList[p].charge <= (3*oneStep) ) {
				var colorStep = Math.floor( (pulseList[p].charge-(2*oneStep)) * 255 / oneStep );
				red=255;
				blue=0;
				green=colorStep;
			} else if ( pulseList[p].charge <= (4*oneStep) ) {
				var colorStep = Math.floor( (pulseList[p].charge-(3*oneStep)) * 255 / oneStep );
				red=255-colorStep;
				blue=0;
				green=255;
			} else if ( pulseList[p].charge <= (5*oneStep) ) {
				var colorStep = Math.floor( (pulseList[p].charge-(4*oneStep)) * 255 / oneStep );
				red=0;
				blue=colorStep;
				green=255-colorStep;
			}
			ctx.strokeStyle = 'rgba('+red+','+green+','+blue+',0.5)';
			ctx.lineWidth = Math.floor ( ( pulseList[p].radius - MyGravitron.radius ) / 20 ) ;
			ctx.lineCap = 'square';
			ctx.beginPath();
			ctx.arc(MyPlanet.x,MyPlanet.y,pulseList[p].radius,(pulseList[p].angle + pulseList[p].wideness),pulseList[p].angle,false);
			ctx.arc(MyPlanet.x,MyPlanet.y,pulseList[p].radius,pulseList[p].angle,(pulseList[p].angle + pulseList[p].wideness),true);
			ctx.closePath();
			ctx.stroke();
			pulseList[p].radius++;
		}
	}
	return tempList;
}

// Function to resolve the debris
function resolveDebris (debrisList,ctx,MyPlanet,pause,main,gravSuction,gravPower,gravSort,debrisColor) {
	var tempList = new Array();
	for (i in debrisList) {
		// a var to know if we're gonna keep this debris into the array
		var keepit = 1;
		
		if ( pause == 0 || pause == 2) {
			// distance to the player's planet
			var distance = distanceToPlanet(debrisList[i].x,debrisList[i].y);
			
			// resolving gravitron's gravity !
				// Calculating angle around the planet to the debris
				var angle = angleAroundPlanet(debrisList[i].x,debrisList[i].y);
				
				// Testing if debris is into the gravitron's field
				if ( pause == 0 ) {
					if ( intoArcField(angle,MyGravitron) == true ) {
						// Yes it is !
						debrisList[i].vx -= gravSuction * gravPower * Math.cos(angle);
						debrisList[i].vy -= gravSuction * gravPower * Math.sin(angle);
						
					} else if ( MyGravitron.repulsion > 0 ) {
							debrisList[i].vx += gravSuction / Math.pow(gravSort, gravPower) * Math.cos(angle);
							debrisList[i].vx += gravSuction / Math.pow(gravSort, gravPower) * Math.sin(angle);
					}
				}
			
			
			// Calculating positions
			debrisList[i].x += debrisList[i].vx;
			debrisList[i].y += debrisList[i].vy;
			
			// Testing if debris still in game 
			if ( distance > main.width ){
				
				// Debris outta game, destroying it
				keepit = 0;
				
			// Testing if debris still in game 		
			} else if ( distance < MyPlanet.radius ) {
				
				// Debris collected, adding material and destroying it
				if ( pause == 0 ) {
					if ( MyPlanet.maxMat > MyPlanet.mat ){
						MyPlanet.mat++;
						MyPlanet.totalMat++;
					}
				}
				keepit = 0;
				
			}
		}
		
		if( keepit == 1){
			// Keeping debris
			tempList.push(debrisList[i]);
			
			// Displaying debris
			ctx.fillStyle = debrisColor;
			ctx.beginPath();
			ctx.arc(debrisList[i].x,debrisList[i].y,1,0,2*Math.PI,true);
			ctx.closePath();
			ctx.fill();
		}
	}
	return tempList;
}

// Function to resolve the GRAVITRON
function resolveGravitron (ctx,pause,MyGravitron,gravFriction,key,gravMinSize,gravMaxSize,gravColor,gravWidth,MyPlanet,gravRadius) {
	if(pause==0) {
		// Resizing GRAVITRON
		MyGravitron.vg *= (100 - gravFriction) / 100;
		if( key[2] && !key[3]) {
			MyGravitron.vg -= Math.PI / 128;
		} else if ( key[3] && !key[2] ) {
			MyGravitron.vg += Math.PI / 128;
		}
		if( Math.abs(MyGravitron.vg) < Math.PI / 256 ){
			MyGravitron.vg = 0;
		}
		MyGravitron.wideness += MyGravitron.vg;
		
		if ( MyGravitron.wideness < gravMinSize ) {
			MyGravitron.wideness = gravMinSize;
			MyGravitron.vg = 0;
		} else if ( MyGravitron.wideness > gravMaxSize ) {
			MyGravitron.wideness = gravMaxSize;
			MyGravitron.vg = 0;
		}
		
		// Moving GRAVITRON
		MyGravitron.va *= (100 - gravFriction) / 100;
		if( key[0] && !key[1]) {
			MyGravitron.va -= Math.PI / 128;
		} else if ( key[1] && !key[0] ) {
			MyGravitron.va += Math.PI / 128;
		}
		if( Math.abs(MyGravitron.va) < Math.PI / 256 ){
			MyGravitron.va = 0;
		}
		MyGravitron.angle += MyGravitron.va - MyGravitron.vg / 2;
		if( MyGravitron.angle < (0 - Math.PI) ) {
			MyGravitron.angle += 3*Math.PI;
		}else{
			MyGravitron.angle += Math.PI;
		}
		MyGravitron.angle = MyGravitron.angle % ( 2 * Math.PI );
		MyGravitron.angle -= Math.PI;
		
		// Displaying GRAVITRON
		ctx.strokeStyle = gravColor;
		ctx.lineWidth = gravWidth;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.arc(MyPlanet.x,MyPlanet.y,MyGravitron.radius,(MyGravitron.angle + MyGravitron.wideness),MyGravitron.angle,false);
		ctx.arc(MyPlanet.x,MyPlanet.y,MyGravitron.radius,MyGravitron.angle,(MyGravitron.angle + MyGravitron.wideness),true);
		ctx.closePath();
		ctx.stroke();
	}
}

// Function to take care of the keyboard events
function changeKey(which, to){
	switch (which){
		case 65: case 37: key[0]=to; break;		// left
		case 87: case 38: key[2]=to; break;		// up
		case 68: case 39: key[1]=to; break;		// right
		case 83: case 40: key[3]=to; break;		// down
		case 32: key[4]=to; break;				// space bar
		case 46: key[5]=to; break;				// delete
		case 35: key[6]=to; break;				// end
	}
}

// Function to test if an object is into the GRAVITRON field from is angle
function intoArcField(angle,arc) {
	var gravAngle2 = ((arc.angle + arc.wideness + Math.PI) % (2 * Math.PI)) - Math.PI;
	if (( arc.angle <= angle && angle <= gravAngle2 && arc.angle < gravAngle2) || (arc.angle > gravAngle2 && (arc.angle <= angle || angle <= gravAngle2))) {
		return true;
	} else {
		return false;
	}
}

// Calculating angle around the player's planet
function angleAroundPlanet(x,y) {
	if ( MyPlanet.y != y || x > MyPlanet.x) {
		return (2 * Math.atan((y-MyPlanet.y)/((x-MyPlanet.x)+distanceToPlanet(x,y))));
	} else {
		return Math.PI;
	}
}

// Calculating distance to the player's planet
function distanceToPlanet(x,y) {
	return Math.sqrt( Math.pow((x - MyPlanet.x),2) + Math.pow((y - MyPlanet.y),2) );
}

// function to create shoots depending on the weapon type and number of cannons
function shoot(ctx,weapon){
	switch ( weapon.type ) {
		case "basicW" :
			if ( weapon.cannonNbr % 2 == 1 ) {
				// lauching shot right through
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle);
				var vx = weapon.speed * Math.cos(weapon.angle);
				var vy = weapon.speed * Math.sin(weapon.angle);
				
				// let's create a shot
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
			} else {
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle - 0.04);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle - 0.04);
				var vx = weapon.speed * Math.cos(weapon.angle - 0.04);
				var vy = weapon.speed * Math.sin(weapon.angle - 0.04);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
				
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle + 0.04);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle + 0.04);
				var vx = weapon.speed * Math.cos(weapon.angle + 0.04);
				var vy = weapon.speed * Math.sin(weapon.angle + 0.04);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
			}
			if ( weapon.cannonNbr >= 3 ) {
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle - 0.08);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle - 0.08);
				var vx = weapon.speed * Math.cos(weapon.angle - 0.08);
				var vy = weapon.speed * Math.sin(weapon.angle - 0.08);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
				
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle + 0.08);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle + 0.08);
				var vx = weapon.speed * Math.cos(weapon.angle + 0.08);
				var vy = weapon.speed * Math.sin(weapon.angle + 0.08);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);	
			}
			if ( weapon.cannonNbr >= 5 ) {
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle - 0.16);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle - 0.16);
				var vx = weapon.speed * Math.cos(weapon.angle - 0.16);
				var vy = weapon.speed * Math.sin(weapon.angle - 0.16);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);
				
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle + 0.16);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle + 0.16);
				var vx = weapon.speed * Math.cos(weapon.angle + 0.16);
				var vy = weapon.speed * Math.sin(weapon.angle + 0.16);
				
				item = new Shot1(ctx,weapon.power,weapon.color,x,y,vx,vy);
				shotList.push(item);	
			}
			break;
		case "SaOW" :
			if ( weapon.smart == 0 ) {
				for ( it=0; it<weapon.cannonNbr; it++ ) {
				
					var t = 2*Math.PI/weapon.cannonNbr*it;
					
					item = new Shot2( ctx, weapon.power, weapon.color, t, weapon.speed/5, (weapon.speed/Math.PI/20) );
					shotList.push(item);
					
				}
			} else {
				
				var t = 2*Math.PI/weapon.cannonNbr*weapon.angle;
				
				item = new Shot2( ctx, weapon.power, weapon.color, t, weapon.speed/5, (weapon.speed/Math.PI/20) );
				shotList.push(item);
				
				weapon.angle++;
				if ( weapon.angle >= weapon.cannonNbr ) {
					weapon.angle = 0;
				}
				
			}
			break;
		case "magneticW" :
			for ( ik = 0; ik < weapon.cannonNbr; ik++ ) {
				var tempAngle = ( ( Math.random() * 2 ) - 1 ) / 10;
			
				// lauching shot right through
				var x = MyPlanet.x + (MyPlanet.radius+5) * Math.cos(weapon.angle+tempAngle);
				var y = MyPlanet.y + (MyPlanet.radius+5) * Math.sin(weapon.angle+tempAngle);
				var vx = 10 * Math.cos(weapon.angle+tempAngle);
				var vy = 10 * Math.sin(weapon.angle+tempAngle);
				
				// let's create a shot
				item = new Shot3(ctx,weapon.power * 2,weapon.color,x,y,vx,vy);
				shotList.push(item);
			}
			break;
		case "HaBW" :
			for ( ik = 0; ik < weapon.cannonNbr; ik++ ) {
				var t = 2 * Math.PI / weapon.cannonNbr * ik + weapon.angle;
				if ( t > Math.PI ) { t -= Math.PI * 2; }
				
				// let's create a shot
				item = new Shot4( ctx, weapon.power, weapon.color, t, 5, weapon.speed );
				shotList.push(item);
			}
			break;
	}
}

// function to display the current weapon
function displayWeapon(ctx,weapon) {
	switch ( weapon.type ) {
		case "basicW" :
			if ( weapon.cannonNbr % 2 == 1 ) {
				var sx = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle);
				var sy = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle);
				var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle);
				var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle);
				// Displaying weapon
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx,sy);
				ctx.lineTo(ex,ey);
				ctx.closePath();
				ctx.stroke();
			} else {
				var sx1 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle-0.04);
				var sy1 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle-0.04);
				var ex1 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle-0.04);
				var ey1 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle-0.04);
				var sx2 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle+0.04);
				var sy2 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle+0.04);
				var ex2 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle+0.04);
				var ey2 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle+0.04);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx1,sy1);
				ctx.lineTo(ex1,ey1);
				ctx.moveTo(sx2,sy2);
				ctx.lineTo(ex2,ey2);
				ctx.closePath();
				ctx.stroke();
			}
			if ( weapon.cannonNbr >= 3 ) {
				var sx1 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle-0.08);
				var sy1 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle-0.08);
				var ex1 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle-0.08);
				var ey1 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle-0.08);
				var sx2 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle+0.08);
				var sy2 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle+0.08);
				var ex2 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle+0.08);
				var ey2 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle+0.08);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx1,sy1);
				ctx.lineTo(ex1,ey1);
				ctx.moveTo(sx2,sy2);
				ctx.lineTo(ex2,ey2);
				ctx.closePath();
				ctx.stroke();
			}
			if ( weapon.cannonNbr >= 5 ) {
				var sx1 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle-0.16);
				var sy1 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle-0.16);
				var ex1 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle-0.16);
				var ey1 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle-0.16);
				var sx2 = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle+0.16);
				var sy2 = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle+0.16);
				var ex2 = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle+0.16);
				var ey2 = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle+0.16);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx1,sy1);
				ctx.lineTo(ex1,ey1);
				ctx.moveTo(sx2,sy2);
				ctx.lineTo(ex2,ey2);
				ctx.closePath();
				ctx.stroke();
			}
			break;
		case "SaOW" :
			for ( iw=0; iw<weapon.cannonNbr; iw++ ) {
			
				var t = 2*Math.PI/weapon.cannonNbr*iw;
				var sx = MyPlanet.x + MyPlanet.radius * Math.cos(t);
				var sy = MyPlanet.y + MyPlanet.radius * Math.sin(t);
				var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(t+(4/Math.PI));
				var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(t+(4/Math.PI));
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx,sy);
				ctx.lineTo(ex,ey);
				ctx.closePath();
				ctx.stroke();
				
			}
			break;
		case "magneticW" :
			var sx = MyPlanet.x + MyPlanet.radius * Math.cos(weapon.angle);
			var sy = MyPlanet.y + MyPlanet.radius * Math.sin(weapon.angle);
			var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(weapon.angle);
			var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(weapon.angle);
			// Displaying weapon
			ctx.strokeStyle = weapon.color;
			ctx.beginPath();
			ctx.moveTo(sx,sy);
			ctx.lineTo(ex,ey);
			ctx.closePath();
			ctx.stroke();
			break;
		case "HaBW" :
			for ( iw=0; iw<weapon.cannonNbr; iw++ ) {
			
				var t = 2*Math.PI/weapon.cannonNbr*iw + weapon.angle;
				var sx = MyPlanet.x + MyPlanet.radius * Math.cos(t);
				var sy = MyPlanet.y + MyPlanet.radius * Math.sin(t);
				var ex = MyPlanet.x + (MyPlanet.radius+4) * Math.cos(t);
				var ey = MyPlanet.y + (MyPlanet.radius+4) * Math.sin(t);
				ctx.strokeStyle = weapon.color;
				ctx.beginPath();
				ctx.moveTo(sx,sy);
				ctx.lineTo(ex,ey);
				ctx.closePath();
				ctx.stroke();
				
			}
			break;
	}
}

// function to activate a weapon
function activate ( weapon ) {
	for ( i in weaponList ) {
		var item = document.getElementById(weaponList[i].type);
		if ( weaponList[i].type == weapon ) {
			if ( weaponList[i].cannonNbr == 0 ) {
				var price = weaponCost[weaponList[i].type];
				if ( MyPlanet.mat >= price ) {
					weaponList[i].cannonNbr++;
					weaponList[i].active = 1;
					item.innerHTML = "<span class='green'>active</span>";
					modeUpdate ( weaponList[i] );
				} else {
					item.innerHTML = "<span class='red'>not enough mat, please activate another weapon</span>";
					break;
				}
			} else {
				weaponList[i].active = 1;
				item.innerHTML = "<span class='green'>active</span>";
			}
		} else if ( weaponList[i].cannonNbr == 0 ) {
			weaponList[i].active = 0;
			var price = weaponCost[weaponList[i].type];
			if ( MyPlanet.mat >= price ) {
				item.innerHTML = "<span class='blue'>purchase for " + price + " mat</span>";
			} else {
				item.innerHTML = "<span class='blue'>" + price + " mat needed to purchase</span>";
			}
		} else if ( weaponList[i].active >= maxWAtATime || weaponList[i].active == 0 ) {
			weaponList[i].active = 0;
			item.innerHTML = "<span class='red'>inactive</span>";
		} else {
			weaponList[i].active++;
		}
	}
}

// function to change a weapon's mode
function modeChange ( weapon ) {
	for ( i in weaponList ) {
		if ( weaponList[i].type == weapon ) {
			if ( weapon == "SaOW" ) {
				weaponList[i].smart = ( weaponList[i].smart + 1 ) % Math.ceil( weaponList[i].cannonNbr / 2 );
				modeUpdate ( weaponList[i] );
			} else if ( weapon == "magneticW" ) {
				weaponList[i].smart = ( weaponList[i].smart + 1 ) % 2;
				modeUpdate ( weaponList[i] );
			} else if ( weapon == "HaBW" ) {
				weaponList[i].smart = ( weaponList[i].smart + 1 ) % 3;
				modeUpdate ( weaponList[i] );
			}
		}
	}
}

// function to update the weapon's mode used
function modeUpdate ( weapon ) {
	var item = document.getElementById(weapon.type + "Mode");
	if ( weapon.type == "SaOW" ) {
		if ( weapon.smart == 0 ) {
			item.innerHTML = "<span class='green'>synchronised</span>";
		} else if ( weapon.smart == 1 ) {
			item.innerHTML = "<span class='green'>not synchronised</span>";
		} else {
			item.innerHTML = "<span class='green'>ORBITAL !</span>";
		}
	} else if ( weapon.type == "magneticW" ) {
		if ( weapon.smart == 0 ) {
			item.innerHTML = "<span class='green'>following</span>";
		} else {
			item.innerHTML = "<span class='green'>revolution</span>";
		}
	} else if ( weapon.type == "HaBW" ) {
		if ( weapon.smart == 0 ) {
			item.innerHTML = "<span class='green'>following Main Structure</span>";
		} else if ( weapon.smart == 1 ) {
			item.innerHTML = "<span class='green'>revolution</span>";
		} else {
			item.innerHTML = "<span class='green'>following Gravitron</span>";
		}
	}
}

// function to refresh the upgrade menu
function refresh() {
	var item = document.getElementById("matNbr");
	item.innerHTML = MyPlanet.mat;
	var refreshList = new Array("gravSort","gravPower","gravShield","repulsion","gravPulse",	// GRAVITRON
	"MaxWAtATime","mCMSpeed",																	// MAIN STRUCTURE
	"mainPow","mainSpeed","mCFireRate","SMART","mCNumber",										// BASIC CANNON
	"SaOCNumber","SaOCFireRate","SaOPow","SaOSpeed",											// SPIRAL AND ORBITAL CANNON
	"magneticCNumber","magneticCFireRate","magneticPow","magneticSpeed",						// MAGNETIC CANNON
	"HaBCNumber","HaBCFireRate","HaBPow","HaBSpeed",											// MAGNETIC CANNON
	"maxHealth","healing","healFact","maxMat","autoHeal","recovery");
	for(i in refreshList){
		var item = document.getElementById(refreshList[i]);
		item.innerHTML = "<b>" + translate(refreshList[i]) + "</b>";
		var max = maxUpgrade( refreshList[i] );
		if ( item.innerHTML != max ) {
			var price=priceToPay(refreshList[i]);
			if ( refreshList[i] == "healing" ) {
				var healFact = (maxUpgrade("healFact") - planetHealFact + 1 );
				var HPRecovery = price / healFact;
				if ( enoughFor(refreshList[i]) != false ) {
					item.innerHTML = " <span class='upgreen'>HEAL ALL HP FOR "+price+" MAT</span>";
				} else if ( MyPlanet.mat >= healFact ) {
					HPRecovery = Math.floor ( MyPlanet.mat / healFact );
					price = HPRecovery * healFact;
					item.innerHTML = " <span class='upgreen'>HEAL "+HPRecovery+" HP FOR "+price+" MAT</span>";
				} else {
					item.innerHTML = " <span class='upred'>COST "+healFact+" MAT</span>";
				}			
			} else {
				if ( enoughFor(refreshList[i]) != false ) {
					item.innerHTML += " <span class='upgreen'>UPGRADE FOR "+price+" MAT</span>";
				} else {
					item.innerHTML += " <span class='upred'>COST "+price+" MAT</span>";
				}
			}
			if(refreshList[i] == "SMART"){
				item = document.getElementById("SMARTspan");
				if( translate(refreshList[i]) == 1) {
					item.title = "Main Cannon SMART AI - Next level of SMART AI will grant you anticipation, to make the cannon more effective.";
				} else {
					item.title = "Main Cannon SMART AI - There is no more level of SMART AI available.";
				}
			}
		} else {
			item.innerHTML = " MAX";
		}
	}
	for ( iw=1; iw<=weaponList.length; iw++ ){
		item = document.getElementById("dispoW"+iw);
		if ( weaponList[iw-1].cannonNbr < 1 ) {
			item.style.display = "none";
		} else {
			item.style.display = "display";
		}
		modeUpdate ( weaponList[iw-1] );
	}
}

// function to determine the maximum update you can reach
function maxUpgrade(thing) {
	var max = 0;
	switch (thing) {
		case "gravSort" :
		case "gravPower" :
		case "gravShield" :
		case "mainPow" :
		case "mainSpeed" :
		case "mCMSpeed" :
		case "mCNumber" :
		case "recovery" :
		case "SaOCNumber" :
		case "SaOCFireRate" :
		case "SaOPow" :
		case "magneticCNumber" :
		case "magneticCFireRate" :
		case "magneticPow" :
		case "magneticSpeed" :
		case "HaBCNumber" :
		case "HaBCFireRate" :
		case "HaBPow" :
		case "HaBSpeed" :
		case "mCFireRate" : max = 5; break;
		case "MaxWAtATime" :
		case "gravPulse" :
		case "SMART" : max = 2; break;
		case "maxHealth" : max = 50; break;
		case "maxMat" : max = 1000; break;
		case "healing" : max = MyPlanet.maxLife; break;
		case "autoHeal" :
		case "healFact" : max = 10; break;
		case "SaOSpeed" :
		case "repulsion" : max = 1; break;
	}
	return max;
}

// function to upgrade things...
function upgrade(thing) {
	var price=enoughFor(thing);
	if ( thing == "healing") {
		var healFact = (maxUpgrade("healFact") - planetHealFact + 1 );
		var HPRecovery = priceToPay("healing") / healFact;
		if ( MyPlanet.mat >= healFact && price == false) {
			HPRecovery = Math.floor ( MyPlanet.mat / healFact );
			price = HPRecovery * healFact;
		}
	}
	if (price != false) {
		switch (thing) {
			case "gravSort" :
				MyGravitron.sort++;	break;
			case "gravPower" :
				MyGravitron.power++; break;
			case "gravShield" :
				MyGravitron.shield++; break;
			case "repulsion" :
				MyGravitron.repulsion++; break;
			case "gravPulse" :
				MyGravitron.pulse++; break;
			case "mainPow" :
				mainCannon.power++; break;
			case "mainSpeed" :
				mainCannon.speed++; break;
			case "mCMSpeed" :
				mainCanMovSpeed++; break;
			case "mCNumber" :
				mainCannon.cannonNbr++; break;
			case "mCFireRate" :
				mainCannon.fireRate-=2; break;
			case "SMART" :
				mainCannon.smart++; break;
			case "maxHealth" :
				MyPlanet.maxLife+=10; break;
			case "maxMat" :
				MyPlanet.maxMat+=100; break;
			case "healing" :
				planetHealPend += HPRecovery;
				nbrUpgrades--;
				break;
			case "healFact" :
				planetHealFact++; break;
			case "autoHeal" :
				planetAutoHeal++; break;
			case "recovery" :
				planetRecovery++; break;
			case "SaOCNumber" :
				spiralCannon.cannonNbr++; break;
			case "SaOCFireRate" :
				spiralCannon.fireRate-=2; break;
			case "SaOPow" :
				spiralCannon.power++; break;
			case "SaOSpeed" :
				spiralCannon.speed--; break;
			case "magneticCNumber" :
				magneticCannon.cannonNbr++; break;
			case "magneticCFireRate" :
				magneticCannon.fireRate-=2; break;
			case "magneticPow" :
				magneticCannon.power++; break;
			case "magneticSpeed" :
				magneticCannon.speed++; break;
			case "HaBCNumber" :
				hammerCannon.cannonNbr++; break;
			case "HaBCFireRate" :
				hammerCannon.fireRate-=2; break;
			case "HaBPow" :
				hammerCannon.power++; break;
			case "HaBSpeed" :
				hammerCannon.speed++; break;
			case "MaxWAtATime" :
				maxWAtATime++; break;
		}
		MyPlanet.mat -= price;
		nbrUpgrades++;
		nbrCost += price;
	}
	
	refresh();
}

// function to determine if enough mat
function enoughFor(what) {
	var price = priceToPay(what);
	if (MyPlanet.mat >= price) {
		return price;
	} else {
		return false;
	}
}

// function to return the price to pay for what
function priceToPay(what) {
	var type = "";
	switch (what) {
		case "gravSort" :
		case "gravPower" :
		case "mCMSpeed" :
			type = "5powtimes4"; break;
		case "gravShield" :
		case "mainSpeed" :
		case "magneticSpeed" :
		case "HaBSpeed" :
			type = "times10plus50";	break;
		case "mainPow" :
			type = "times3pow2"; break;
		case "magneticPow" :
		case "HaBPow" :
			type = "plus1times3pow2"; break;
		case "mCFireRate" :
		case "SaOCFireRate" :
		case "magneticCFireRate" :
			type = "expFrom26times1000squared"; break;
		case "HaBCFireRate" :
			type = "expFrom26times1000squared2"; break;
		case "SaOSpeed" :
			type = "from6times100"; break;
		case "mCNumber" :
		case "magneticCNumber" :
		case "HaBCNumber" :
		case "SaOCNumber" :
		case "SMART" :
		case "MaxWAtATime" :
			type = "times250"; break;
		case "maxHealth" :
			type = "times5"; break;
		case "healing" :
			type = "times-healFact";
			what = "leftToHeal";
			break;
		case "healFact" :
			type = "times100"; break;
		case "autoHeal" :
		case "recovery" :
		case "SaOPow" :
			type = "plus1times50"; break;
		case "maxMat" :
			type = "times0.75"; break;
		case "repulsion" :
			type = "plus250"; break;
		case "gravPulse" :
			type = "plus1times500"; break;
	}
	return calculate(type,translate(what));
}

// function to translate HTMl to ingame elements
function translate(that) {
	var itis;
	switch (that) {
		case "gravSort" :
			itis = MyGravitron.sort; break;
		case "gravPower" :
			itis = MyGravitron.power; break;
		case "gravShield" :
			itis = MyGravitron.shield; break;
		case "mainPow" :
			itis = mainCannon.power; break;
		case "SaOPow" :
			itis = spiralCannon.power; break;
		case "magneticPow" :
			itis = magneticCannon.power; break;
		case "HaBPow" :
			itis = hammerCannon.power; break;
		case "mainSpeed" :
			itis = mainCannon.speed; break;
		case "mCMSpeed" :
			itis = mainCanMovSpeed; break;
		case "SaOSpeed" :
			itis = spiralCannon.speed; break;
		case "magneticSpeed" :
			itis = magneticCannon.speed; break;
		case "HaBSpeed" :
			itis = hammerCannon.speed; break;
		case "mCFireRate" :
			itis = Math.floor(2500/mainCannon.fireRate)/100; break;
		case "SaOCFireRate" :
			itis = Math.floor(2500/spiralCannon.fireRate)/100; break;
		case "magneticCFireRate" :
			itis = Math.floor(2500/magneticCannon.fireRate)/100; break;
		case "HaBCFireRate" :
			itis = Math.floor(2500/hammerCannon.fireRate)/100; break;
		case "SMART" :
			itis = mainCannon.smart; break;
		case "maxHealth" :
			itis = MyPlanet.maxLife; break;
		case "maxMat" :
			itis = MyPlanet.maxMat; break;
		case "healing" :
			itis = MyPlanet.life + planetHealPend; break;
		case "leftToHeal" :
			itis = MyPlanet.maxLife - MyPlanet.life - planetHealPend; break;
		case "healFact" :
			itis = planetHealFact; break;
		case "autoHeal" :
			itis = planetAutoHeal; break;
		case "recovery" :
			itis = planetRecovery; break;
		case "repulsion" :
			itis = MyGravitron.repulsion; break;
		case "gravPulse" :
			itis = MyGravitron.pulse; break;
		case "mCNumber" :
			itis = mainCannon.cannonNbr; break;
		case "SaOCNumber" :
			itis = spiralCannon.cannonNbr; break;
		case "magneticCNumber" :
			itis = magneticCannon.cannonNbr; break;
		case "HaBCNumber" :
			itis = hammerCannon.cannonNbr; break;
		case "MaxWAtATime" :
			itis = maxWAtATime; break;
	}
	return itis;
}

// function to determine a price
function calculate(type,ref) {
	switch (type) {
		case "5powtimes4" :
			ref = 4 * Math.pow(5,ref);
			break;
		case "times10plus50" :
			ref = ( 10 * ref ) + 50;
			break;
		case "times3pow2" :
			ref = Math.pow((ref*3),2);
			break;
		case "plus1times3pow2" :
			ref = Math.pow(((ref+1)*3),2);
			break;
		case "expFrom26times1000squared" :
			ref = Math.floor(Math.sqrt(Math.exp(26-(25/ref))*1000));
			break;
		case "expFrom26times1000squared2" :
			ref = Math.floor(Math.sqrt(Math.exp(26-(12.5/ref))*1000));
			break;
		case "times250" :
			ref *= 250;
			break;
		case "times100" :
			ref *= 100;
			break;
		case "times0.75" :
			ref *= 0.75;
			break;
		case "plus1times50" :
			ref = ( ref + 1 ) * 50;
			break;
		case "times5" :
			ref *= 5;
			break;
		case "times-healFact" :
			ref *= ( maxUpgrade("healFact") - planetHealFact + 1 );
			break;
		case "plus250" :
			ref += 250;
			break;
		case "plus1times500" :
			ref = ( ref + 1 ) * 500;
			break;
		case "from6times100" :
			ref = ( 6 - ref ) * 100;
			break;
	}
	return ref;
}

// function to reset Hi-Scores
function resetHS() {
	localStorage.clear();
	resetHS.style.display = "none";
}

// function to make the reset Hi-Scores button appear or not (if there is no data to erase)
function enableResetHS(resetHS) {
	if( localStorage["totalMat"] === undefined ){
		resetHS.style.display = "none";
	}else{
		resetHS.style.display = "block";
	}
}

// function to display status as bars or digits
function displayStatus() {
	if ( displayS == "digits" ) {
		displayS = "bars";
	} else {
		displayS = "digits";
	}
	localStorage["displayS"] = displayS;
}

// function to anticipate asteroid's movement and intercept it ; returns an angle to shoot toward
// This function has been made with the help of Marc35 from the forum at ilephysique.net
function interception ( Vx, Vy, Vp, teta, r, d ) {
	
	var a1 = d*Vp*Math.sin(teta) - r*Vx;
	var b1 = r*Vy - d*Vp*Math.sin(teta);
	var c1 = Vy*d*Math.cos(teta) - Vx*d*Math.sin(teta);
	var d1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2) );	
	var K1 = c1 / d1;
	var L1 = a1 / b1;
	
	var a2 = r*Vx - d*Vp*Math.cos(teta);
	var b2 = d*Vp*Math.sin(teta) - r*Vy;
	var c2 = Vx*d*Math.sin(teta) - Vy*d*Math.cos(teta);
	var d2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2) );	
	var K2 = c2 / d2;
	var L2 = a2 / b2;
	
	var angle1 = Math.acos( K1 ) + Math.atan( L1 );
	var angle2 = Math.acos( -K1 ) + Math.atan( L1 );
	var angle3 = Math.acos( K1 ) + Math.atan( L1 ) + Math.PI;
	var angle4 = Math.acos( -K1 ) + Math.atan( L1 ) + Math.PI;
	var angle5 = Math.acos( K2 ) + Math.atan( L2 );
	var angle6 = Math.acos( -K2 ) + Math.atan( L2 );
	var angle7 = Math.acos( K2 ) + Math.atan( L2 ) + Math.PI;
	var angle8 = Math.acos( -K2 ) + Math.atan( L2 ) + Math.PI;
	
	var t1 = ( r*Math.cos( angle1 ) - d*Math.cos(teta) ) / ( Vx - Vp*Math.cos( angle1 ) );
	var t2 = ( r*Math.cos( angle2 ) - d*Math.cos(teta) ) / ( Vx - Vp*Math.cos( angle2 ) );
	var t3 = ( r*Math.cos( angle3 ) - d*Math.cos(teta) ) / ( Vx - Vp*Math.cos( angle3 ) );
	var t4 = ( r*Math.cos( angle4 ) - d*Math.cos(teta) ) / ( Vx - Vp*Math.cos( angle4 ) );
	var t5 = ( r*Math.sin( angle5 ) - d*Math.sin(teta) ) / ( Vy - Vp*Math.sin( angle5 ) );
	var t6 = ( r*Math.sin( angle6 ) - d*Math.sin(teta) ) / ( Vy - Vp*Math.sin( angle6 ) );
	var t7 = ( r*Math.sin( angle7 ) - d*Math.sin(teta) ) / ( Vy - Vp*Math.sin( angle7 ) );
	var t8 = ( r*Math.sin( angle8 ) - d*Math.sin(teta) ) / ( Vy - Vp*Math.sin( angle8 ) );
	
	var Xa1 = Math.round((d*Math.cos(teta) + t1*Vx)*100000)/100000;
	var Xp1 = Math.round((r*Math.cos(angle1) + t1*Vp*Math.cos(angle1))*100000)/100000;
	var Ya1 = Math.round((d*Math.sin(teta) + t1*Vy)*100000)/100000;
	var Yp1 = Math.round((r*Math.sin(angle1) + t1*Vp*Math.sin(angle1))*100000)/100000;
	if( Xa1 == Xp1 && Ya1 == Yp1 ){
		var angle = angle1;
	} else {
		var Xa2 = Math.round((d*Math.cos(teta) + t2*Vx)*100000)/100000;
		var Xp2 = Math.round((r*Math.cos(angle2) + t2*Vp*Math.cos(angle2))*100000)/100000;
		var Ya2 = Math.round((d*Math.sin(teta) + t2*Vy)*100000)/100000;
		var Yp2 = Math.round((r*Math.sin(angle2) + t2*Vp*Math.sin(angle2))*100000)/100000;
		if( Xa2 == Xp2 && Ya2 == Yp2 ){
			var angle = angle2;
		} else {
			var Xa3 = Math.round((d*Math.cos(teta) + t3*Vx)*100000)/100000;
			var Xp3 = Math.round((r*Math.cos(angle3) + t3*Vp*Math.cos(angle3))*100000)/100000;
			var Ya3 = Math.round((d*Math.sin(teta) + t3*Vy)*100000)/100000;
			var Yp3 = Math.round((r*Math.sin(angle3) + t3*Vp*Math.sin(angle3))*100000)/100000;
			if( Xa3 == Xp3 && Ya3 == Yp3 ){
				var angle = angle3;
			} else {
				var Xa4 = Math.round((d*Math.cos(teta) + t4*Vx)*100000)/100000;
				var Xp4 = Math.round((r*Math.cos(angle4) + t4*Vp*Math.cos(angle4))*100000)/100000;
				var Ya4 = Math.round((d*Math.sin(teta) + t4*Vy)*100000)/100000;
				var Yp4 = Math.round((r*Math.sin(angle4) + t4*Vp*Math.sin(angle4))*100000)/100000;
				if( Xa4 == Xp4 && Ya4 == Yp4 ){
					var angle = angle4;
				} else {
					var Xa5 = Math.round((d*Math.cos(teta) + t5*Vx)*100000)/100000;
					var Xp5 = Math.round((r*Math.cos(angle5) + t5*Vp*Math.cos(angle5))*100000)/100000;
					var Ya5 = Math.round((d*Math.sin(teta) + t5*Vy)*100000)/100000;
					var Yp5 = Math.round((r*Math.sin(angle5) + t5*Vp*Math.sin(angle5))*100000)/100000;
					if( Xa5 == Xp5 && Ya5 == Yp5 ){
						var angle = angle5;
					} else {
						var Xa6 = Math.round((d*Math.cos(teta) + t6*Vx)*100000)/100000;
						var Xp6 = Math.round((r*Math.cos(angle6) + t6*Vp*Math.cos(angle6))*100000)/100000;
						var Ya6 = Math.round((d*Math.sin(teta) + t6*Vy)*100000)/100000;
						var Yp6 = Math.round((r*Math.sin(angle6) + t6*Vp*Math.sin(angle6))*100000)/100000;
						if( Xa6 == Xp6 && Ya6 == Yp6 ){
							var angle = angle6;
						} else {
							var Xa7 = Math.round((d*Math.cos(teta) + t7*Vx)*100000)/100000;
							var Xp7 = Math.round((r*Math.cos(angle7) + t7*Vp*Math.cos(angle7))*100000)/100000;
							var Ya7 = Math.round((d*Math.sin(teta) + t7*Vy)*100000)/100000;
							var Yp7 = Math.round((r*Math.sin(angle7) + t7*Vp*Math.sin(angle7))*100000)/100000;
							if( Xa7 == Xp7 && Ya7 == Yp7 ){
								var angle = angle7;
							} else {
								var Xa8 = Math.round((d*Math.cos(teta) + t8*Vx)*100000)/100000;
								var Xp8 = Math.round((r*Math.cos(angle8) + t8*Vp*Math.cos(angle8))*100000)/100000;
								var Ya8 = Math.round((d*Math.sin(teta) + t8*Vy)*100000)/100000;
								var Yp8 = Math.round((r*Math.sin(angle8) + t8*Vp*Math.sin(angle8))*100000)/100000;
								if( Xa8 == Xp8 && Ya8 == Yp8 ){
									var angle = angle8;
								} else {
									var angle = teta;
								}
							}
						}
					}
				}
			}
		}
	}
	return angle;
}