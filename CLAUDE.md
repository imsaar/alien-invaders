# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a classic Space Invaders arcade game implementation using HTML5 Canvas and vanilla JavaScript. The game is designed to be responsive and playable on both desktop and mobile devices.

## Architecture

The game consists of three main files:
- `index.html` - Entry point with canvas element and UI
- `styles.css` - Responsive styling with mobile-first approach
- `game.js` - Complete game logic in vanilla JavaScript

### Key Game Components

The game architecture in `game.js` follows a simple structure:
- Configuration constants at the top (canvas dimensions, sprite sizes, game speeds)
- Canvas setup and responsive scaling logic
- Touch and keyboard input handling
- Sprite creation (aliens and player ship created programmatically)
- Game state management (player, aliens, bullets, score, lives)
- Main game loop with update and render cycles
- Collision detection between bullets and entities

### Mobile Support

The game includes full mobile support with:
- Dynamic canvas scaling based on viewport size
- Touch controls (left/right screen halves for movement, upper half for shooting)
- Responsive CSS that maximizes game area on small screens

## Development

This is a static HTML/JavaScript game with no build process required. To run:
- Open `index.html` directly in a web browser
- Or serve the directory with any static file server

## Deployment

The repository includes GitHub Actions workflow (`.github/workflows/static.yml`) that automatically deploys to GitHub Pages on push to main branch.

## Game Constants

Key game dimensions and speeds defined at the top of `game.js`:
- Canvas: 480x640 pixels (scaled responsively)
- Player ship: 40x20 pixels
- Aliens: 30x20 pixels in a 5x10 grid
- Base alien speed increases 10% each level

When modifying game difficulty or layout, adjust these constants rather than hardcoded values throughout the code.