/* ============================================================
   Tic Tac Toe – Orion Battle Arena
   Game logic, animations & particle background
   ============================================================ */

(() => {
  'use strict';

  // ───── DOM References ─────
  const welcomeScreen = document.getElementById('welcome-screen');
  const gameScreen    = document.getElementById('game-screen');
  const p1Input       = document.getElementById('player1-input');
  const p2Input       = document.getElementById('player2-input');
  const startBtn      = document.getElementById('start-btn');
  const p1Display     = document.getElementById('p1-display');
  const p2Display     = document.getElementById('p2-display');
  const playerXCard   = document.getElementById('player-x-card');
  const playerOCard   = document.getElementById('player-o-card');
  const turnText      = document.getElementById('turn-text');
  const turnDot       = document.querySelector('.turn-dot');
  const board         = document.getElementById('board');
  const cells         = document.querySelectorAll('.cell');
  const restartBtn    = document.getElementById('restart-btn');
  const modalOverlay  = document.getElementById('modal-overlay');
  const modalTitle    = document.getElementById('modal-title');
  const modalSub      = document.getElementById('modal-sub');
  const playAgainBtn  = document.getElementById('play-again-btn');
  const winLineSvg    = document.getElementById('win-line-svg');
  const winLine       = document.getElementById('win-line');
  const confettiBurst = document.getElementById('confetti-burst');

  // ───── Game State (in-memory only, no storage) ─────
  let player1 = '';
  let player2 = '';
  let currentPlayer = 'X';    // 'X' or 'O'
  let boardState = Array(9).fill('');
  let gameActive = false;

  // All winning combinations (indices on the 3×3 grid)
  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
    [0, 4, 8], [2, 4, 6]              // diagonals
  ];

  // ───── Start Game ─────
  startBtn.addEventListener('click', () => {
    player1 = p1Input.value.trim() || 'Player 1';
    player2 = p2Input.value.trim() || 'Player 2';
    p1Display.textContent = player1;
    p2Display.textContent = player2;
    currentPlayer = 'X';
    boardState.fill('');
    gameActive = true;
    updateTurnUI();
    clearBoard();
    welcomeScreen.classList.remove('active');
    gameScreen.classList.add('active');
  });

  // ───── Cell Click ─────
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = Number(cell.dataset.index);
      if (!gameActive || boardState[idx]) return;

      // Place mark
      boardState[idx] = currentPlayer;
      cell.textContent = currentPlayer;
      cell.classList.add(currentPlayer.toLowerCase(), 'taken');

      // Check for winner
      const winCombo = checkWinner();
      if (winCombo) {
        gameActive = false;
        highlightWin(winCombo);
        const winnerName = currentPlayer === 'X' ? player1 : player2;
        setTimeout(() => showModal(winnerName), 700);
        return;
      }

      // Check for draw
      if (boardState.every(c => c !== '')) {
        gameActive = false;
        setTimeout(() => showModal(null), 500);
        return;
      }

      // Switch turn
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateTurnUI();
    });
  });

  // ───── Check Winner ─────
  function checkWinner() {
    for (const combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return combo;
      }
    }
    return null;
  }

  // ───── Highlight Winning Cells & Draw Line ─────
  function highlightWin(combo) {
    combo.forEach(i => cells[i].classList.add('winner-cell'));
    drawWinLine(combo);
  }

  function drawWinLine(combo) {
    // Calculate centre positions for each winning cell within the SVG viewBox (300×300)
    const cellPx = 300 / 3;
    const coords = combo.map(i => ({
      x: (i % 3) * cellPx + cellPx / 2,
      y: Math.floor(i / 3) * cellPx + cellPx / 2
    }));
    winLine.setAttribute('x1', coords[0].x);
    winLine.setAttribute('y1', coords[0].y);
    winLine.setAttribute('x2', coords[2].x);
    winLine.setAttribute('y2', coords[2].y);
    // Trigger animation
    requestAnimationFrame(() => winLine.classList.add('draw'));
  }

  // ───── Turn UI Update ─────
  function updateTurnUI() {
    const name = currentPlayer === 'X' ? player1 : player2;
    turnText.textContent = `${name}'s Turn`;

    // Highlight active player card
    playerXCard.classList.toggle('active-turn', currentPlayer === 'X');
    playerOCard.classList.toggle('active-turn', currentPlayer === 'O');

    // Dot colour
    turnDot.style.background = currentPlayer === 'X' ? 'var(--neon-purple)' : 'var(--neon-blue)';
    turnDot.style.boxShadow  = currentPlayer === 'X'
      ? '0 0 8px var(--neon-purple)'
      : '0 0 8px var(--neon-blue)';
  }

  // ───── Modal ─────
  function showModal(winnerName) {
    if (winnerName) {
      modalTitle.textContent = `🎉 Congratulations ${winnerName}!`;
      modalSub.textContent   = 'You Won The Game!';
      spawnConfetti();
    } else {
      modalTitle.textContent = "It's a Draw!";
      modalSub.textContent   = 'No one wins this round.';
    }
    modalOverlay.classList.add('visible');
  }

  function hideModal() {
    modalOverlay.classList.remove('visible');
    confettiBurst.innerHTML = '';
  }

  playAgainBtn.addEventListener('click', () => {
    hideModal();
    resetGame();
  });

  // ───── Restart / Reset ─────
  restartBtn.addEventListener('click', resetGame);

  function resetGame() {
    boardState.fill('');
    currentPlayer = 'X';
    gameActive = true;
    clearBoard();
    updateTurnUI();
  }

  function clearBoard() {
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
    });
    winLine.classList.remove('draw');
    winLine.setAttribute('x1', 0);
    winLine.setAttribute('y1', 0);
    winLine.setAttribute('x2', 0);
    winLine.setAttribute('y2', 0);
  }

  // ───── Confetti (CSS-only particles) ─────
  function spawnConfetti() {
    confettiBurst.innerHTML = '';
    const colours = ['#a855f7', '#38bdf8', '#22d3ee', '#ec4899', '#facc15', '#34d399'];
    for (let i = 0; i < 40; i++) {
      const dot = document.createElement('span');
      const size = Math.random() * 8 + 4;
      dot.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        background: ${colours[Math.floor(Math.random() * colours.length)]};
        border-radius: ${Math.random() > .5 ? '50%' : '2px'};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: 0;
        animation: confettiPop ${Math.random() * 1 + .8}s ease ${Math.random() * .3}s forwards;
      `;
      confettiBurst.appendChild(dot);
    }
    // Inject keyframes once
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confettiPop {
          0%   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translateY(${window.innerHeight > 500 ? '-120px' : '-80px'}) scale(.3) rotate(${Math.random() > .5 ? '' : '-'}360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ───── Particle Background (Canvas) ─────
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.r = Math.random() * 2 + .5;
      this.dx = (Math.random() - .5) * .4;
      this.dy = (Math.random() - .5) * .4;
      this.opacity = Math.random() * .5 + .1;
      const hues = [270, 210, 190];
      this.color = `hsla(${hues[Math.floor(Math.random() * hues.length)]}, 80%, 65%, ${this.opacity})`;
    }
    update() {
      this.x += this.dx;
      this.y += this.dy;
      if (this.x < 0 || this.x > canvas.width)  this.dx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.dy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Spawn particles
  const count = Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 12000));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw faint connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${.08 * (1 - dist / 120)})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

})();
