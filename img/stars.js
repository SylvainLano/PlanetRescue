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


// The stars of the game area's background (img/background1.jpg), found once in the picture, for the game to make them twinkle.
// They are written here because a browser opening index.html from the disk would not let the game read the pixels of an image file.
var backgroundWidth		= 3072;		// the picture's size, in pixels
var backgroundHeight	= 2048;

// each star : its place in the picture (in pixels), its size (1 small, 2 big with its cross, 3 the big glow), and its color
var backgroundStars = [
	[953,148,1,"#ffd58f"], [2067,194,1,"#fff4e6"], [1584,256,1,"#ffeee0"], [470,286,1,"#dae0ff"],
	[563,314,1,"#dbe1ff"], [581,404,1,"#d4e4ff"], [2517,449,1,"#fcffac"], [957,454,1,"#e6fff5"],
	[2250,516,1,"#ffeebe"], [1805,530,1,"#fbffd9"], [725,584,1,"#fbfff2"], [1621,636,1,"#ffeddf"],
	[781,653,1,"#fbfff3"], [948,706,1,"#d5e3ff"], [769,729,1,"#d1dfff"], [2083,765,1,"#fffaf6"],
	[2447,765,1,"#fffbff"], [892,780,3,"#ffffff"], [1900,789,1,"#dcffff"], [1391,799,1,"#ffead2"],
	[986,813,1,"#e4f3ff"], [2434,840,1,"#ffdfb6"], [2525,872,1,"#e6ffff"], [665,877,1,"#ffe5b1"],
	[1661,880,1,"#f1f5ff"], [894,899,1,"#badeff"], [2412,924,2,"#ebf5ff"], [1905,944,1,"#cde6ff"],
	[1509,952,1,"#e7ebff"], [1430,1005,1,"#d9e7ff"], [1519,1013,2,"#ffffff"], [2400,1029,1,"#afd3ff"],
	[587,1080,1,"#ffffeb"], [1885,1094,1,"#e8ecff"], [2516,1109,1,"#b9deff"], [2339,1130,2,"#fcfcff"],
	[952,1217,1,"#f0edff"], [1217,1226,1,"#ffe2c9"], [1200,1287,1,"#e6f7ff"], [2296,1287,2,"#e7ffff"],
	[1663,1365,1,"#cdf2ff"], [2279,1384,1,"#f1f5ff"], [2221,1393,1,"#e0f0ff"], [1352,1399,2,"#def2ff"],
	[2551,1406,1,"#f2f2ff"], [2569,1407,1,"#ededff"], [2597,1429,1,"#f2f2ff"], [1906,1434,1,"#ecfaff"],
	[1296,1452,1,"#dcecff"], [2062,1453,1,"#ffddbe"], [1821,1461,1,"#f5fcff"], [1845,1473,1,"#b2d1ff"],
	[930,1503,1,"#a6c6ff"], [1412,1517,1,"#ffeacb"], [952,1530,1,"#c6d7ff"], [1581,1530,1,"#d0deff"],
	[1876,1543,1,"#ddfaff"], [1433,1586,1,"#fff3ef"], [2408,1591,2,"#f8fffc"], [1644,1679,1,"#ffeabf"],
	[1069,1695,1,"#faffff"], [1297,1696,1,"#fffbe4"], [1101,1732,1,"#d5e5ff"], [1691,1734,1,"#fff6ff"],
	[1669,1767,1,"#dde3ff"], [862,1787,1,"#e0e4ff"], [1750,1901,1,"#ffebad"], [2137,2013,1,"#f5f5ff"]
];
