# Space Invaders

A classic Space Invaders arcade game implementation using HTML5 Canvas and vanilla JavaScript.

## How to Play

- **Arrow Keys** (← →) - Move your spaceship left and right
- **Spacebar** - Fire bullets at the aliens
- **R** - Restart the game when game over

## Game Features

- Classic arcade-style gameplay
- Progressive difficulty - aliens speed up with each level
- Score tracking based on alien types:
  - Top row aliens: 30 points
  - Middle rows: 20 points
  - Bottom rows: 10 points
- Player lives system (3 lives)
- Visual explosion effects when hit
- Cyan gradient player ship design

## Files

- `invaders.html` - Main HTML file
- `styles.css` - Game styling
- `game.js` - Game logic and mechanics

## Running the Game

Simply open `invaders.html` in a web browser to start playing.

## Game Mechanics

- Aliens move horizontally and drop down when reaching screen edges
- Aliens randomly shoot bullets downward
- Game ends when aliens reach the player or all lives are lost
- New waves of aliens appear after clearing each level
- Each new level increases alien movement speed by 10%