# Planet Rescue

Defend your planet against a never-ending rain of asteroids: your weapons fire on their own, you steer the **Gravitron** to collect the debris, and every piece of material you gather goes into upgrades.

**[Play it in your browser](https://sylvainlano.github.io/PlanetRescue/index.html)**: no install, no build, plain HTML5 canvas and JavaScript.

## The game

Your planet, the Earth, sits in the middle of the screen and asteroids come from every direction. When one crashes on the planet, you lose as many million inhabitants as it had life left. If your population reaches zero, the game is over.

The asteroids get tougher as time passes, one more point of life each minute. After two minutes, a few **giants** come along: dark rusty red rocks, bigger, heavier and slower, with four times the life of the others. A giant crashing on your planet takes all its life left away: destroy it first.

- **The Gravitron** is an arc around your planet. Its open part pulls debris in, which turns them into **mat** (material), but it also pulls asteroids toward you. Its closed part can push them away once you buy the Repulsion upgrade. It can also become a shield and send out damaging pulses. The whole art is to gather debris without drawing the asteroids in: the Field Scanner upgrade shows the limits of the field, then which asteroids are pulled (red) or pushed (green).
- **The weapons fire automatically.** You start with a basic cannon guided by its SMART AI, which goes up to level 5: it learns to aim ahead of its targets, then to choose them wisely. You can also buy the Spiral & Orbital, Magnetic, and Hammer & Broom weapons, each with its own firing modes, one after the other: each one comes in the menu once the one before is bought.
- **The upgrade menu** opens with the pause. There you spend your mat on the Gravitron, the weapons and the planet: healing, maximum health, storage, auto-healing, and recovery of mat from crashed asteroids. Each section and each weapon tab tells, in green, how many things you can buy there with your mat, or else the price of the cheapest one. Some upgrades only come once they are worth buying: the Gravitron Pulse with the shield, the Repulsion with a stronger Gravity Generator, the Multiple weapon structure with a second weapon.
- **Three difficulty levels** can be chosen in the start menu, which tells what each one changes. Easy gives your planet more life and mat, sends the asteroids more slowly and lets your cannon anticipate from the start. Hard sends them faster and faster, sooner.
- **The research tree** grows with your achievements: each one of its branches opens for good with an achievement. In a game, your planet first needs a **Research Lab**, bought with its upgrades once a branch is open (its level 2, the Automation, then validates each research once complete and starts the next one by itself); then a research takes time, not mat: start one from the pause menu, and validate it there once complete to get its bonus. Only one research goes on at a time; you can stop it and go back to it later, its time is kept. A note at the bottom right tells you when a research waits for you. The first branch brings the **Missile Launcher**, a secondary weapon whose missiles explode on the asteroid they touch, damaging the others around, and then the **Homing Missiles**, which steer toward their target. The second branch, opened by the Demolisher achievement, brings the **Nitroglycerine**: a slow capsule turns an asteroid far from your planet into a glowing bomb, which explodes when it touches another asteroid, when it is destroyed, or as soon as your planet comes into its blast, damaging every asteroid in it but sparing your planet. Steer it into the others with your Gravitron. Then the **Chain Reaction** turns the asteroids a blast doesn't destroy into bombs too, with half its power, until the reaction fades out. The third branch, opened by the Sharpshooter achievement, brings the **Laser**: its beam burns an asteroid for two seconds, then cools down; it aims first at the giants, then at the asteroids going to crash on your planet. Then the **Piercing Beam** goes through its target and spreads behind it in a cone of light to the edge of space, burning at half power every other asteroid it reaches. The fourth branch, opened by the Bank Shot achievement, brings the **Rebound Shot**: a fast shot that flies to the main cannon's target, then ricochets on the asteroids it hits (going a bit astray on their rough rock), on the edges of space and on your planet's atmosphere, which it spares, until it has made all its rebounds; every asteroid it hits takes its power. Then the **Trick Shot** reckons the ricochets before each shot: among 72 angles around the planet, it takes the one whose way hits the most asteroids, foreseeing their moves, and its shots no longer go astray. The fifth branch, opened by the Collector achievement, is for your **Gravitron**, and each of its researches waits for an achievement of its own: the **Wide Net** (Collector) widens its field by 20 degrees on each side for the debris only, drawn dotted around the opening; the **Compactor** (Hoarder) brings an upgrade of the same name, bought up to five times, each level making 10% more mat from the debris; the **Gravity Brake** (Exterminator) slows down the asteroids in the opening, the heavy ones less; and the **Slingshot** (Bank Shot) makes an asteroid the Gravitron has turned from its way hit twice as hard the asteroids it runs into. The secondary weapons have their own row of tabs in the pause menu.
- **25 achievements** reward your feats, from your first destroyed asteroid to six minutes of survival, an asteroid you sent into another one with your Gravitron, a giant finished by a ricochet, or 8 researches completed in a game. Each one is a bronze, silver or gold medal, announced at the bottom of the game area when you get it. The Achievements page of the start menu shows your medals; the others stay secret until you get them. They are saved in your browser, whatever the difficulty level.
- At the end of a game, the Game Over screen shows your score and its details, your numbers (survival time, asteroids and giants destroyed, mat gathered, accuracy, hits taken and inhabitants lost, upgrades), the records you beat, and the medals of the achievements you got. The hi-scores of each difficulty level are saved in your browser, and the hi-scores page of the start menu shows them, one tab per level, where each level's hi-scores can be erased. The score is 10 points per asteroid destroyed (50 per giant), plus the mat gathered, plus the seconds survived.

### Controls

| Key | Action |
|---|---|
| ← → (or A, D; Q, D on an AZERTY keyboard) | rotate the Gravitron |
| ↑ (or W; Z on an AZERTY keyboard) | shorten the Gravitron's aperture |
| ↓ (or S) | widen the Gravitron's aperture |
| Space | pause and open the upgrade menu |
| Delete (or T, for Target) | change the cannon's target |
| End (or R, for Reset) | clear the target selection |
| M | sound on or off (off at first) |

Click the status bar at the top to switch between bars and digits. The letters are read by their place on the keyboard: W A S D on a QWERTY keyboard are Z Q S D on an AZERTY one, and the Infos page shows the letters of your own keyboard.

## History

Planet Rescue was made in **2010** by [Sylvain Lano](https://sylvainlano.github.io/). It was Sylvain's first real JavaScript game: until then, Sylvain's projects were whole PHP websites with Flash inside them. The HTML5 canvas was still brand new.

The project first lived on [SourceForge](https://sourceforge.net/projects/planetrescue/), in a Subversion repository. The hardest part of the code was computing trajectories and **meeting points between moving objects**, so that the cannon could aim where an asteroid *will be*. The equation was worked out with the help of Marc35 from the [ilephysique.net](https://www.ilephysique.net/) forum. It worked in about 80 % of the cases, never quite all of them, and the game stopped at version 0.4. Its to-do list (below) was full of ideas that never got coded.

In **2023** the code moved to GitHub, almost untouched.

In **2026** the game came back to life. The goals are to keep its spirit, make it fairer (it forgives nothing), finish what was never finished, and modernize it step by step.

### Changelog

| Version | What changed |
|---|---|
| 0.4 (2010) | The original game. |
| 0.4.1 | Clean-up: SourceForge leftovers, dead code, unused image. |
| 0.4.2 | Upgrade shop fixes: weapons cost their price, upgrade caps are enforced (MAX), bought weapons' upgrades are visible, and buying a weapon you can't afford no longer turns your cannon off. |
| 0.4.3 | Debris repulsion, asteroid collisions, shot counting and accuracy, a safe "reset hi-scores", and weapons that no longer break without a target. |
| 0.5.0 | The game area zooms to fit the window, with a sharp canvas at any size. |
| 0.5.1 | Interception rewritten as an exact equation, and the basic cannon waits to be aligned before firing. |
| 0.5.2 | The cannon now predicts the asteroid's path turn by turn, including the Gravitron's pull: 99.8 % of reachable asteroids are hit in our tests. |
| 0.6.0 | Asteroids now arrive on a timer that speeds up as time passes, so destroying them finally buys you some breathing room. All the starting values are gathered in one place (`startValues`). |
| 0.7.0 | Three difficulty levels (Easy, Normal, Hard) in the start menu, each with its own hi-scores. Normal is the 0.6.0 game, and its hi-scores are kept. |
| 0.8.0 | New Gravitron upgrade, the Field Scanner: level 1 shows the limits of the Gravitron's field, level 2 tints the asteroids it pulls in (red) or pushes away (green). |
| 0.9.0 | SMART AI levels 3 to 5, as designed in 2010: no wasted shots, then the target the cannon can hit the soonest, then the asteroids about to crash on the planet first. The End key now releases the target at once. |
| 0.10.0 | A new score: 10 points per asteroid destroyed, plus the mat gathered, plus the seconds survived (the 2010 score rewarded the inhabitants lost). Longest survival is a new record. Recovery, stuck at its maximum since 2010, now starts at 0 and can be bought. |
| 0.10.1 | Modernization, with no change in the game: the upgrades are described as data in one table, the pause menu is built from it without jQuery and its plugins (356 KB less), and the background images went from 8.9 MB of PNG to 350 KB of JPEG. |
| 0.11.0 | The asteroids are now rocks drawn by the game: each one has its own shape, color, grain and craters, spins slowly, and is lit from the top left like the planet. The Field Scanner tints their exact shape. The images are loaded once instead of at every frame. The tutorial no longer crashes when "Space" is pressed at the very moment a step begins. |
| 0.12.0 | Your planet is now the Earth, turning on itself once a minute: NASA's Blue Marble map is wrapped around a sphere at the screen's resolution, with its tilted axis, its atmosphere and its night side. The map is stored as text (`img/earth.js`), so that the game still works when `index.html` is opened from the disk. |
| 0.12.1 | Smooth animation: the game is still played 25 times a second, but it is drawn at each refresh of the screen, every moving object between its last two places. The 3, 2, 1, GO! countdown is now drawn on the game. A hidden browser tab now pauses the game instead of slowing it down. |
| 0.13.0 | The stars of the game area's sky twinkle: each star of the picture shines now and then at its own pace, the big ones with their cross, in the game as in the menus. Their places were found once in the picture (`img/stars.js`). The game area's sky is in line with the page's again, as a darker window on the same sky: the zoom of 0.5.0 had made it a smaller copy. |
| 0.14.0 | 18 achievements, the four of the 2010 to-do list and fourteen more: surviving, destroying, gathering, aiming, owning every weapon, finishing the tutorial, or deflecting an asteroid into another one (Bank Shot). Each one is a medal drawn by the game, announced when you get it, and shown on its own page of the start menu, where the others stay secret. The Game Over screen tells the ones of the game. |
| 0.15.0 | The research tree of 2010, in the pause menu: its branches open with achievements, and each research takes time in the game, then waits to be validated. A note at the bottom right of the game area tells when a research is available or complete. Its first branch, opened by the Survivor achievement, brings the Missile Launcher: a secondary weapon, firing missiles at the main cannon's target, which explode and damage every asteroid in their blast. |
| 0.16.0 | Second research of the missiles' branch, Homing Missiles (90 seconds, once the Missile Launcher is validated): the missiles steer toward their target, and look for another one if it is destroyed before they reach it. The asteroids get one more point of life each minute, and after two minutes one in ten comes as a giant: 40 points of life, bigger, three times heavier, slower, and worth 50 points. A missile now does its whole power to the asteroid it touches and half of it around, and it was made weaker (it nearly doubled the survival on its own): power 3, one every 4 seconds, blast of 25. Every weapon's power can now be raised up to 10. |
| 0.17.0 | The pause menu tells where to spend your mat: each section and each weapon tab shows how many things can be bought there, in green, or else the price of the cheapest one; the Researches section turns gold when a research waits for you. The page now tells its encoding (UTF-8). |
| 0.18.0 | A new Game Over screen: the score in large, with its details and the best one to beat, six tiles for the game's numbers, a badge on each record beaten, the medals of the achievements of the game, and real Retry and Main Menu buttons. It replaces the sentences of 2010 (and their typos), with the records saved as before. |
| 0.19.0 | A new hi-scores page, in the style of the Game Over screen: the best score in large, six tiles for the other records, and a tab for each difficulty level, to see their records without changing the level you play. |
| 0.20.0 | A new start menu: a large Start button, the difficulty levels as pills with a line telling what the chosen one changes, and buttons for the Tutorial, the Infos, the Achievements (with how many you have) and the Hi-Scores. The buttons and pills now share one style across the game. Erasing the hi-scores moved to the hi-scores page: it erases the level shown, once you confirm it. |
| 0.21.0 | A new Infos page: your mission and what is good to know (the giants, the research tree) on one side, the controls drawn as keyboard keys on the other, and the credits. It replaces the text of 2010 and its typos. The T and R keys now do what Delete and End do, for the keyboards without them, and the letters are read by their place on the keyboard: Z Q S D work on an AZERTY keyboard as W A S D on a QWERTY one. |
| 0.22.0 | A new pause menu, in the dark style of the other screens: the open section in red, the ones with something to buy in green, the researches in gold; each line shows its name on the left, its level and its price on the right, as a small green button when you can afford it; your mat in a pill at the top, and a dark tooltip. In each section, the names, the levels and the prices are aligned in three columns. |
| 0.23.0 | A new status bar: the life, the mat and the shield as colored gauges with their values, the inhabitants waiting to be healed shown lighter, in a dark strip at the top of the game area. A click still switches to digits only. This was the last screen of 2010 to be redone. |
| 0.24.0 | A lighter pause menu at the start of a game: some things only come once they are worth buying. The Magnetic weapon comes once the Spiral one is bought, the Hammer once the Magnetic one is; the Gravitron Pulse with the shield, the Repulsion with a stronger Gravity Generator, the Multiple weapon structure with a second weapon. The researches now need a Research Lab, a planet upgrade for 100 mat that comes once an achievement has opened a branch of the research tree. |
| 0.25.0 | A second branch of the research tree, the Explosives, opened by the Demolisher achievement. Its Nitroglycerine launcher fires a slow capsule at the asteroid farthest from your planet, which turns it into a glowing bomb, its blast's reach drawn around it. The bomb explodes when it touches another asteroid, or when it is destroyed, and every asteroid in its blast takes its whole power; crashing on your planet, it does that damage too. One bomb at a time: the launcher reloads once it is gone. Its own tab in the pause menu sells a shorter reload time, more blast power and a wider blast. A bomb steered by the Gravitron into another asteroid can make a Bank Shot. |
| 0.26.0 | A third branch of the research tree, the Lasers, opened by the Sharpshooter achievement. Its Laser burns an asteroid with a flickering beam for two seconds, 6 points of damage a second, then cools down for 14 seconds. It aims first at the giants, then at the asteroids going to crash on your planet, the soonest first, and takes another target if the one it burns is destroyed. Its own tab in the pause menu sells more beam power, a longer beam and a shorter cooldown. The weapons' tabs are a bit narrower, for the eight of them to stay on one row. |
| 0.27.0 | The Research Lab gets a level 2, the Automation, for 300 mat: a research complete is validated at once, and the next one starts by itself, the one to be done the soonest. A note at the bottom right tells which research was validated. You can still stop a research from the pause menu, and choose another one. |
| 0.28.0 | The second research of the Explosives branch, the Chain Reaction, after the Nitroglycerine: the asteroids a bomb's blast doesn't destroy become bombs too, with half its power, and so on until it is too weak to go on (12, 6, 3, 1). These weaker bombs glow less. The launcher fires again once they are all gone. Also, a bomb now explodes as soon as the planet comes into its blast (its dashed circle), which spares the planet, instead of crashing on it with more damage. The Nitroglycerine becomes an advantage even without steering it: 118 seconds of survival on average without playing, against 96 without it. |
| 0.29.0 | Four more achievements, for the research tree and its weapons: Lab Rat (validate your first research, bronze), Fireworks (destroy 3 asteroids with a single bomb, its Chain Reaction included, silver), Giant Slayer (finish a giant asteroid with your laser, silver) and Scholar (complete every research in a game, gold), each with its own medal. There are 22 of them now. |
| 0.30.0 | The second research of the Lasers branch, the Piercing Beam, after the Laser: the beam goes through its target and spreads behind it in a cone of light, 20 degrees on each side, to the edge of space; every other asteroid it reaches, on its way or in the cone, burns at half power. Each branch of the research tree now has two researches. |
| 0.31.0 | Sounds, a first for the game: shots, asteroids crumbling (lower for a giant), the planet hit, the shield, missiles and their blasts, the nitroglycerine's capsules and bombs, the laser's hum while it fires, and chimes for the achievements and the researches validated. The browser makes them itself (Web Audio), with no file to load. They are off at first: the M key or the start menu turns them on or off, and the browser remembers it; the pause menu tells their state. |
| 0.32.0 | The fourth branch of the research tree, the Ricochets, opened by the Bank Shot achievement: the Rebound Shot, a secondary weapon firing every 5 seconds a fast shot at the main cannon's target. It ricochets on the asteroids it hits, each one taking its power, on the edges of space and on the planet's atmosphere, which it spares, until its 2 rebounds are made. Its tab, Rebound, upgrades its reload time (down to 2 seconds), its hit power (up to 8) and its rebounds (up to 8). The secondary weapons' tabs now have their own row in the pause menu. |
| 0.33.0 | The second research of the Ricochets branch, the Trick Shot, after the Rebound Shot: before each shot, the rebound cannon follows its way for 72 angles around the planet, with the asteroids' foreseen moves and every rebound, and fires at the angle hitting the most asteroids (straight at its target on a tie). Its shots no longer go astray on the rock, for its reckoning to come true. The Rebounds upgrade now gives two rebounds at a time (2, 4, 6, 8), since a shot going to and fro between an asteroid and the planet only hits it again every two rebounds. Each branch of the research tree now has two researches. |
| 0.34.0 | Three achievements for the rebound shot: Boomerang (destroy an asteroid with a rebound shot sent back by your planet, bronze), Pinball (hit 3 different asteroids with a single rebound shot, silver: it needs more rebounds than the 2 of the start) and David and Goliath (finish a giant asteroid with a rebound shot after a ricochet, gold), each with its own medal. There are 25 of them now; the Achievements page scrolls to its fifth row. |
| 0.35.0 | The fifth branch of the research tree, the Gravitron, opened by the Collector achievement; each of its researches also waits for an achievement of its own, which stays secret until you get it. Wide Net (Collector): the field widens by 20 degrees on each side for the debris only, drawn dotted around the opening. Compactor (Hoarder): a new Gravitron upgrade, bought up to five times, each level making 10% more mat from the debris gathered. Gravity Brake (Exterminator): the asteroids in the opening slow down, the heavy ones less. Slingshot (Bank Shot): an asteroid the Gravitron has turned from its way hits twice as hard the asteroids it runs into. The Scholar achievement now asks for 8 researches completed in a game, instead of all of them, which would take a quarter of an hour. |

## Roadmap (2026)

The order may change as we go.

1. **Fairer difficulty:** difficulty levels (done in 0.7.0), the Field Scanner (done in 0.8.0), and SMART AI levels 3 to 5 as designed in 2010 (done in 0.9.0).
2. **Modernization:** upgrades described as data, a pause menu without jQuery (ready for the research tree), lighter assets (all done in 0.10.1).
3. **Graphics:** rocky asteroids (done in 0.11.0) and the Earth as your planet (done in 0.12.0), both drawn at the screen's resolution, a smooth animation (done in 0.12.1) and twinkling stars (done in 0.13.0), then a hand-made animated background.
4. **Touch screens:** given up. Playing without a keyboard would take simpler Gravitron controls, which would change the game too much.
5. **The 2010 ideas:** achievements (done in 0.14.0), then the research tree (started in 0.15.0 with its first branch, the missiles, then the explosives in 0.25.0, the lasers in 0.26.0 and the ricochets in 0.32.0; each branch has two researches since 0.33.0), then the free-play mode, new secondary weapons, and maybe one day the story mode.

## The original to-do list (2010)

Kept as it was written back then.

### Weapons

**Basic weapon**
- add SMART3 (only shoot the number of shots required to destroy an asteroid before choosing another target)
- add SMART4 (select the asteroids that are closest to the current shooting angle)
- add SMART5 (starts with the asteroids which are going to hit the planet before destroying the other)

**Secondary weapons**
- missile, leading to homing missile, exploding when encountering an asteroid, damaging an area around
- nitroglycerine nature, turning asteroid into a massive bomb, destroying anything it encounters
- ? rebound shot, bouncing on the screen borders (what happens when it hits the planet ?) ?
- LASER

### Upgrade menu

NO MORE OPTIONS TO IMPLEMENT ( PLEASE FIND IDEAS )

### Achievements

- first play?
- first use of the menu?
- first destroyed asteroid?
- first upgrade?

### Researches

- create a tree to unlock weapons and stuff, based on purchases and achievements

### Game modes

Current mode is Arcade.
There could be a free-play mode, where purchases are kept for the next game.
There could be a story mode, with some of these :
- Travel through galaxies to save planets from destruction.
- Not only asteroids hit you, but aliens trying to invade planets too.
- Each planet have its own skin and missions. Upgrades can be different too.
- After a mission on one planet, a previously cleared planet can need help again, making you in front of a choice : going back to help it or leave it to its fate. If planet has been well upgraded, it can repell the enemy or fall to it. If a planet falls to the enemy, the upgrades are lost, and the missions are lost one by one (one is lost each time you play a mission on another planet).
- When a galaxy is cleared from threat, then you can travel to another one, more difficult.

## Under the hood

No build step and no dependencies to install: open `index.html` in a browser and play.

| File | Role |
|---|---|
| `index.html` | page and menus |
| `css/main.css` | layout and look |
| `src/main.js` | start-up: canvas, zoom, game loop (25 turns a second, drawn at each refresh of the screen), keyboard |
| `src/engine.js` | the game's turn and its states (menu, tutorial, countdown, playing, hi-scores), and `drawGame`, which draws them |
| `src/functions.js` | debris, pulses, Gravitron, weapons, SMART AI, interception |
| `src/shop.js` | the upgrades, described as data (`upgrades`, `shopLayout`), and the shop |
| `src/menu.js` | the pause menu, built from the upgrades: sections, weapon tabs, tooltips |
| `src/achievements.js` | the achievements, described as data (`achievements`), their medals, their saving, their announcement and their page |
| `src/researches.js` | the research tree, described as data (`researchBranches`, `researches`): the research going on, its section of the pause menu, and its note at the bottom right |
| `src/sound.js` | the sounds, made by the browser itself (Web Audio), with no file: off until the player turns them on |
| `src/secondary.js` | the secondary weapons, which take no place among the active ones: the missile launcher, its missiles and their blasts; the nitroglycerine launcher, its capsules and its bombs; the laser and its beam; the rebound cannon, its shots and the sparks of their ricochets, and the ways the Trick Shot foresees |
| `src/gameover.js` | the Game Over screen (the score, the game's numbers, the records saved and beaten, the achievements of the game) and the hi-scores page |
| `src/objects.js`, `src/prototypes.js` | game objects and their drawing: the turning Earth and the asteroids' rocks |
| `img/earth.js` | the Earth's map, written as text: a browser opening `index.html` from the disk would not let the game read the pixels of an image file |
| `img/stars.js` | the stars of the game area's sky, found once in its picture, for the game to make them twinkle |
| `src/parameters.js` | settings, the starting values that tune the difficulty (`startValues`), and what each difficulty level changes (`difficultyLevels`) |

Adding an upgrade only takes a line in `upgrades` and its place in `shopLayout`. The game uses no library: the pause menu used jQuery 1.4.3, jQuery UI 1.8.5 and three plugins until 0.10.1.

## Credits

- Game and code: [Sylvain Lano](https://sylvainlano.github.io/)
- Help with the 2010 interception equation: Marc35, from the [ilephysique.net](https://www.ilephysique.net/) forum
- Earth map: [The Blue Marble](https://visibleearth.nasa.gov/images/57735) (2002), NASA Goddard Space Flight Center, image by Reto Stöckli, enhancements by Robert Simmon, from NASA Visible Earth (public domain)

*This program is distributed in the hope that it will be fun and useful, but WITHOUT ANY WARRANTY. If it doesn't work well, contact us or improve the code and share it alike!*
