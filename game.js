/* ---------- CONFIG ---------- */
const W = 480, H = 640;
const PLAYER_W = 40, PLAYER_H = 20;
const BULLET_W = 4, BULLET_H = 10;
const ALIEN_W = 30, ALIEN_H = 20;
const ALIEN_ROWS = 5, ALIEN_COLS = 10;
const BASE_ALIEN_SPEED = 20;            // renamed, kept const
let currentAlienSpeed = BASE_ALIEN_SPEED; // mutable copy
const ALIEN_DROP = 20;
/* ---------- CANVAS & INPUT ---------- */
const cvs = document.getElementById('gameCanvas');
const ctx = cvs.getContext('2d');
const keys = {};
onkeydown = e => keys[e.code] = true;
onkeyup   = e => keys[e.code] = false;

/* ---------- RESPONSIVE SCALING ---------- */
let scale = 1;
function resizeCanvas() {
    // Get the UI element height
    const uiHeight = document.getElementById('ui').offsetHeight;
    
    // Calculate available space
    const availableWidth = window.innerWidth - 10; // Small margin for border
    const availableHeight = window.innerHeight - uiHeight - 10; // UI height + margin
    
    // Calculate scale to fit the screen while maintaining aspect ratio
    const scaleX = availableWidth / W;
    const scaleY = availableHeight / H;
    scale = Math.min(scaleX, scaleY);
    
    // Set canvas display size
    cvs.style.width = (W * scale) + 'px';
    cvs.style.height = (H * scale) + 'px';
    
    // Keep internal resolution for crisp graphics
    cvs.width = W;
    cvs.height = H;
}

// Initialize canvas size and listen for resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Touch controls for mobile
let touchTargetX = null;
let touchStartTime = 0;
let touchMoved = false;

cvs.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = cvs.getBoundingClientRect();
    const touchX = (touch.clientX - rect.left) / scale;
    
    // Track target position for smooth movement
    touchTargetX = touchX;
    touchStartTime = Date.now();
    touchMoved = false;
    
    // Immediate shoot on tap
    keys['Space'] = true;
    setTimeout(() => keys['Space'] = false, 100);
});

cvs.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = cvs.getBoundingClientRect();
    const touchX = (touch.clientX - rect.left) / scale;
    
    // Update target position for smooth movement
    touchTargetX = touchX;
    touchMoved = true;
});

cvs.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    // If it was a quick tap without movement, ensure we shoot
    if (!touchMoved && (Date.now() - touchStartTime < 200)) {
        keys['Space'] = true;
        setTimeout(() => keys['Space'] = false, 100);
    }
    
    touchTargetX = null;
    touchMoved = false;
});

/* ---------- ALIEN SPRITE ---------- */
const alienImage = new Image();
alienImage.onload = () => console.log('Alien sprite loaded');

// Create alien sprite programmatically on a canvas
const spriteCanvas = document.createElement('canvas');
spriteCanvas.width = 30;
spriteCanvas.height = 20;
const spriteCtx = spriteCanvas.getContext('2d');

// Draw a bright green space invader
spriteCtx.fillStyle = '#00ff00';
// Body
spriteCtx.fillRect(8, 4, 14, 8);
// Arms
spriteCtx.fillRect(4, 8, 4, 8);
spriteCtx.fillRect(22, 8, 4, 8);
// Eyes
spriteCtx.fillStyle = '#000';
spriteCtx.fillRect(10, 6, 2, 2);
spriteCtx.fillRect(18, 6, 2, 2);
// Antennae
spriteCtx.fillStyle = '#00ff00';
spriteCtx.fillRect(10, 0, 2, 4);
spriteCtx.fillRect(18, 0, 2, 4);

alienImage.src = spriteCanvas.toDataURL();

/* ---------- PLAYER SHIP SPRITE ---------- */
const shipImage = new Image();
shipImage.onload = () => console.log('Ship sprite loaded');

// Create ship sprite programmatically on a canvas
const shipCanvas = document.createElement('canvas');
shipCanvas.width = 40;
shipCanvas.height = 20;
const shipCtx = shipCanvas.getContext('2d');

// Draw a cyan/blue gradient spaceship
const gradient = shipCtx.createLinearGradient(0, 0, 0, 20);
gradient.addColorStop(0, '#00ffff');
gradient.addColorStop(1, '#0080ff');

shipCtx.fillStyle = gradient;
// Main body (triangle shape)
shipCtx.beginPath();
shipCtx.moveTo(20, 0);     // Top center
shipCtx.lineTo(35, 20);    // Bottom right
shipCtx.lineTo(5, 20);     // Bottom left
shipCtx.closePath();
shipCtx.fill();

// Cockpit
shipCtx.fillStyle = '#ffffff';
shipCtx.fillRect(18, 5, 4, 4);

// Wing details
shipCtx.fillStyle = '#00ffff';
shipCtx.fillRect(0, 15, 8, 5);
shipCtx.fillRect(32, 15, 8, 5);

shipImage.src = shipCanvas.toDataURL();

/* ---------- GAME OBJECTS ---------- */
let player = { x: W/2 - PLAYER_W/2, y: H - 60, vx: 0 };
let bullets = [];
let aliens = [];
let alienBullets = [];
let alienDir = 1; // 1 right, -1 left
let lastAlienMove = 0;
let score = 0, lives = 3;
let gameOver = false;

/* ---------- INIT ---------- */
function initAliens() {
  aliens = [];
  for (let r = 0; r < ALIEN_ROWS; r++) {
    for (let c = 0; c < ALIEN_COLS; c++) {
      aliens.push({
        x: c * (ALIEN_W + 10) + 40,
        y: r * (ALIEN_H + 10) + 40,
        alive: true,
        type: r === 0 ? 30 : r < 3 ? 20 : 10 // different points
      });
    }
  }
}
initAliens();

/* ---------- LOOP ---------- */
let last = 0;
function gameLoop(timestamp) {
  if (last === 0) last = timestamp;
  const dt = (timestamp - last) / 1000;
  last = timestamp;

  if (!gameOver) {
    update(dt);
    draw();
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = '40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W/2, H/2);
    ctx.fillText('Press R to restart', W/2, H/2 + 50);
    if (keys['KeyR']) restart();
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

/* ---------- NEW HELPERS ---------- */
const explosions = [];                 // {x, y, frame}
function addExplosion(x, y) {
  explosions.push({ x, y, frame: 0 });
}

/* ---------- UPDATED UPDATE ---------- */
function update(dt) {
  /* ---- player movement ---- */
  // Keyboard controls
  player.vx = 0;
  if (keys['ArrowLeft'])  player.vx = -300;
  if (keys['ArrowRight']) player.vx = 300;
  
  // Touch controls - smooth movement to touch position
  if (touchTargetX !== null) {
    const targetX = touchTargetX - PLAYER_W / 2;
    const diff = targetX - player.x;
    const speed = 800; // Faster speed for responsive movement
    
    if (Math.abs(diff) > 2) {
      player.vx = diff > 0 ? Math.min(speed, diff * 10) : Math.max(-speed, diff * 10);
    }
  }
  
  player.x += player.vx * dt;
  player.x = Math.max(0, Math.min(W - PLAYER_W, player.x));

  /* ---- player shoot ---- */
  if (keys['Space'] && !bullets.find(b => b.fromPlayer)) {
    bullets.push({
      x: player.x + PLAYER_W/2 - BULLET_W/2,
      y: player.y,
      vy: -500,
      fromPlayer: true
    });
    keys['Space'] = false;
  }

  /* ---- bullets ---- */
  bullets.forEach(b => b.y += b.vy * dt);
  bullets = bullets.filter(b => b.y > -BULLET_H && b.y < H);

  /* ---- aliens move & shoot ---- */
  lastAlienMove += dt;
  const moveInterval = 0.5;
  if (lastAlienMove > moveInterval) {
    lastAlienMove = 0;
    let hitEdge = false;
    aliens.forEach(a => {
      if (!a.alive) return;
      a.x += currentAlienSpeed * alienDir * moveInterval;
      if (a.x <= 0 || a.x + ALIEN_W >= W) hitEdge = true;
    });
    if (hitEdge) {
      alienDir *= -1;
      aliens.forEach(a => a.y += ALIEN_DROP);
    }
    const shooters = aliens.filter(a => a.alive);
    if (shooters.length && Math.random() < 0.3) {
      const a = shooters[Math.floor(Math.random()*shooters.length)];
      alienBullets.push({
        x: a.x + ALIEN_W/2 - BULLET_W/2,
        y: a.y + ALIEN_H,
        vy: 300,
        fromPlayer: false
      });
    }
  }

  /* ---- alien bullets ---- */
  alienBullets.forEach(b => b.y += b.vy * dt);
  alienBullets = alienBullets.filter(b => b.y > -BULLET_H && b.y < H);

  /* ---- collisions ---- */
  bullets.forEach((b, bi) => {
    if (!b.fromPlayer) return;
    aliens.forEach(a => {
      if (!a.alive) return;
      if (rectIntersect(b, a)) {
        a.alive = false;
        bullets.splice(bi, 1);
        score += a.type;
        updateUI();
      }
    });
  });

  alienBullets.forEach((b, bi) => {
    if (b.fromPlayer) return;
    if (rectIntersect(b, player)) {
      alienBullets.splice(bi, 1);
      lives--;
      updateUI();
      addExplosion(player.x + PLAYER_W/2, player.y + PLAYER_H/2);
      if (lives <= 0) gameOver = true;
    }
  });

  /* ---- alien reaches bottom ---- */
  if (aliens.some(a => a.alive && a.y + ALIEN_H >= player.y)) {
    gameOver = true;
  }

  /* ---- win level ---- */
  if (aliens.every(a => !a.alive)) {
    setTimeout(() => {
      initAliens();
      alienDir = 1;
      currentAlienSpeed *= 1.1;
    }, 0);
  }

  /* ---- animate explosions ---- */
  explosions.forEach(e => e.frame += dt * 32); // 32 fps
  for (let i = explosions.length - 1; i >= 0; i--) {
    if (explosions[i].frame >= 16) explosions.splice(i, 1);
  }
}

/* ---------- UPDATED DRAW ---------- */
function draw() {
  ctx.clearRect(0, 0, W, H);

  /* draw player spaceship */
  if (explosions.length === 0) {   // hide ship while exploding
    if (shipImage.complete) {
      ctx.drawImage(shipImage, player.x, player.y, PLAYER_W, PLAYER_H);
    } else {
      // Fallback to gradient rectangle if image not loaded
      const g = ctx.createLinearGradient(player.x, player.y,
                                         player.x, player.y + PLAYER_H);
      g.addColorStop(0, '#00ffff');
      g.addColorStop(1, '#0080ff');
      ctx.fillStyle = g;
      ctx.fillRect(player.x, player.y, PLAYER_W, PLAYER_H);
    }
  }

  /* draw bullets */
  ctx.fillStyle = '#fff';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H));
  ctx.fillStyle = '#f00';
  alienBullets.forEach(b => ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H));

  /* draw aliens */
  aliens.forEach(a => {
    if (a.alive) {
      if (alienImage.complete) {
        ctx.drawImage(alienImage, a.x, a.y, ALIEN_W, ALIEN_H);
      } else {
        // Fallback to green rectangles if image not loaded
        ctx.fillStyle = '#0f0';
        ctx.fillRect(a.x, a.y, ALIEN_W, ALIEN_H);
      }
    }
  });

  /* draw explosions (concentric circles shrinking) */
  explosions.forEach(e => {
    const radius = (16 - e.frame) * 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, ${Math.floor(e.frame * 10)}, 0, ${1 - e.frame/16})`;
    ctx.fill();
  });
}
/* ---------- UTILS ---------- */
function rectIntersect(a, b) {
  return a.x < b.x + ALIEN_W &&
         a.x + BULLET_W > b.x &&
         a.y < b.y + ALIEN_H &&
         a.y + BULLET_H > b.y;
}
function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
}
function restart() {
  score = 0; lives = 3;
  initAliens();
  alienDir = 1;
  currentAlienSpeed = BASE_ALIEN_SPEED;
  bullets = []; alienBullets = [];
  gameOver = false;
  updateUI();
}