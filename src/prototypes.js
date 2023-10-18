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


Planet.prototype.GetDetail=GetDetail;
Planet.prototype.Draw=Draw;
Planet.prototype.ShowLife=ShowLife;

Asteroid.prototype.GetDetail=GetDetail;
Asteroid.prototype.Draw=Draw;
Asteroid.prototype.ShowLife=ShowLife;

Weapon.prototype.GetDetail=GetDetail;

function GetDetail() {
	with (this) document.write('This '+type+' has '+life+' HP and worth '+mat+' material. </br>');
}

function Draw() {
	img=new Image();
	with (this) img.src=this.skin;
	with (this) this.context.drawImage(img,(this.x-this.radius),(this.y-this.radius),(this.radius*2),(this.radius*2));
	delete img;
}

function ShowLife() {
	this.context.fillStyle    = '#fff';
	this.context.font         = 'italic 10px sans-serif';
	this.context.textBaseline = 'bottom';
	this.context.fillText  (this.life, (this.x - 5), (this.y - 5) );
}


