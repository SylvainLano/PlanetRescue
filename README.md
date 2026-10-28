# Planet Rescue

Defend your planet against a never-ending rain of asteroids: your weapons fire on their own, you steer the **Gravitron** to collect the debris, and every piece of material you gather goes into upgrades.

**[Play it in your browser](https://sylvainlano.github.io/PlanetRescue/index.html)**: no install, no build, plain HTML5 canvas and JavaScript.

## The game

Your planet sits in the middle of the screen and asteroids come from every direction. When one crashes on the planet, you lose as many million inhabitants as it had life left. If your population reaches zero, the game is over.

- **The Gravitron** is an arc around your planet. Its open part pulls debris in, which turns them into **mat** (material), but it also pulls asteroids toward you. Its closed part can push them away once you buy the Repulsion upgrade. It can also become a shield and send out damaging pulses.
- **The weapons fire automatically.** You start with a basic cannon guided by its SMART AI, and you can buy the Spiral & Orbital, Magnetic, and Hammer & Broom weapons, each with its own firing modes.
- **The upgrade menu** opens with the pause. There you spend your mat on the Gravitron, the weapons and the planet: healing, maximum health, storage, auto-healing, and recovery of mat from crashed asteroids.
- **Three difficulty levels** can be chosen in the start menu. Easy gives your planet more life and mat, sends the asteroids more slowly and lets your cannon anticipate from the start. Hard sends them faster and faster, sooner.
- At the end of a game you get your statistics (mat gathered, accuracy, crashes, inhabitants lost, upgrades) and the hi-scores of your difficulty level, which are saved in your browser.

### Controls

| Key | Action |
|---|---|
| ← → (or A, D) | rotate the Gravitron |
| ↑ (or W) | shorten the Gravitron's aperture |
| ↓ (or S) | widen the Gravitron's aperture |
| Space | pause and open the upgrade menu |
| Delete | change the cannon's target |
| End | clear the target selection |

Click the status bar at the top to switch between bars and digits.

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

## Roadmap (2026)

The order may change as we go.

1. **Fairer difficulty:** difficulty levels (done in 0.7.0), an impact warning, and SMART AI levels 3 to 5 as designed in 2010.
2. **Modernization:** weapons and upgrades described as data, a pause menu without jQuery (ready for the research tree), lighter assets.
3. **Graphics:** the Earth as your planet, real rock textures for the asteroids, high-resolution images, a hand-made animated background.
4. **Touch screens.**
5. **The 2010 ideas:** achievements, then the research tree, then the free-play mode, new secondary weapons, and maybe one day the story mode.

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
| `index.html` | page, menus and upgrade shop |
| `css/main.css` | layout and look |
| `src/main.js` | start-up: canvas, zoom, game loop at 25 frames per second, keyboard |
| `src/engine.js` | the game loop and its states (menu, tutorial, countdown, playing, hi-scores) |
| `src/functions.js` | debris, pulses, Gravitron, weapons, shop, interception |
| `src/objects.js`, `src/prototypes.js` | game objects and their drawing |
| `src/parameters.js` | settings, the starting values that tune the difficulty (`startValues`), and what each difficulty level changes (`difficultyLevels`) |

The pause menu still uses the libraries of the time: jQuery 1.4.3, jQuery UI 1.8.5, jQuery Easing, Coda Slider and jQuery Tooltip.

## Credits

- Game and code: [Sylvain Lano](https://sylvainlano.github.io/)
- Help with the 2010 interception equation: Marc35, from the [ilephysique.net](https://www.ilephysique.net/) forum

*This program is distributed in the hope that it will be fun and useful, but WITHOUT ANY WARRANTY. If it doesn't work well, contact us or improve the code and share it alike!*
