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
- **The research tree** grows with your achievements: each one of its branches opens for good with an achievement. In a game, your planet first needs a **Research Lab**, bought with its upgrades once a branch is open; then a research takes time, not mat: start one from the pause menu, and validate it there once complete to get its bonus. Only one research goes on at a time; you can stop it and go back to it later, its time is kept. A note at the bottom right tells you when a research waits for you. The first branch brings the **Missile Launcher**, a secondary weapon whose missiles explode on the asteroid they touch, damaging the others around, and then the **Homing Missiles**, which steer toward their target.
- **18 achievements** reward your feats, from your first destroyed asteroid to six minutes of survival, or an asteroid you sent into another one with your Gravitron. Each one is a bronze, silver or gold medal, announced at the bottom of the game area when you get it. The Achievements page of the start menu shows your medals; the others stay secret until you get them. They are saved in your browser, whatever the difficulty level.
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

## Roadmap (2026)

The order may change as we go.

1. **Fairer difficulty:** difficulty levels (done in 0.7.0), the Field Scanner (done in 0.8.0), and SMART AI levels 3 to 5 as designed in 2010 (done in 0.9.0).
2. **Modernization:** upgrades described as data, a pause menu without jQuery (ready for the research tree), lighter assets (all done in 0.10.1).
3. **Graphics:** rocky asteroids (done in 0.11.0) and the Earth as your planet (done in 0.12.0), both drawn at the screen's resolution, a smooth animation (done in 0.12.1) and twinkling stars (done in 0.13.0), then a hand-made animated background.
4. **Touch screens:** given up. Playing without a keyboard would take simpler Gravitron controls, which would change the game too much.
5. **The 2010 ideas:** achievements (done in 0.14.0), then the research tree (started in 0.15.0 with its first branch, the missiles), then the free-play mode, new secondary weapons, and maybe one day the story mode.

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
| `src/secondary.js` | the secondary weapons, which take no place among the active ones: the missile launcher, its missiles and their blasts |
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
