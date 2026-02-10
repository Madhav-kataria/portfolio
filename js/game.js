// ===========================
// Pathfinder Game
// ===========================

class PathfinderGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.gridSize = 7;
    this.board = [];
    this.playerPos = { row: 0, col: 0 };
    this.endPos = { row: 0, col: 0 };
    this.gameStatus = 'loading';
    this.playerOrientation = 'right';
    this.touchStart = { x: 0, y: 0 };
    this.gameWon = false;
    
    // Audio
    this.audioInitialized = false;
    this.sounds = {};
    
    this.init();
  }
  
  init() {
    this.render();
    this.generateBoard();
    this.setupEventListeners();
  }
  
  initAudio() {
    if (this.audioInitialized || typeof Tone === 'undefined') return;
    
    try {
      this.sounds.win = new Tone.PolySynth(Tone.Synth, {
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.5 }
      }).toDestination();
      
      this.sounds.lose = new Tone.NoiseSynth({
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.3 }
      }).toDestination();
      
      this.sounds.move = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 }
      }).toDestination();
      
      this.audioInitialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }
  
  async playSound(type) {
    if (!this.audioInitialized) this.initAudio();
    if (!this.audioInitialized) return;
    
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      switch (type) {
        case 'win':
          this.sounds.win?.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n");
          break;
        case 'lose':
          this.sounds.lose?.triggerAttackRelease("4n");
          break;
        case 'move':
          this.sounds.move?.triggerAttackRelease("C2", "16n");
          break;
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }
  
  render() {
    this.container.innerHTML = `
      <div class="game-container">
        <div class="game-info">
          <p class="game-instructions">
            🎮 Navigate the maze to unlock my professional journey!<br>
            Use <strong>Arrow Keys</strong> or <strong>Swipe</strong> to move
          </p>
        </div>
        <div class="game-board-wrapper">
          <div id="game-board" class="game-board"></div>
          <div class="game-controls-mobile">
            <button class="control-btn" data-direction="up">↑</button>
            <button class="control-btn" data-direction="left">←</button>
            <button class="control-btn" data-direction="down">↓</button>
            <button class="control-btn" data-direction="right">→</button>
          </div>
        </div>
        <button class="game-reset-btn">Reset Game</button>
        <div id="game-message" class="game-message hidden"></div>
      </div>
    `;
  }
  
  generateBoard() {
    let validBoard = false;
    
    while (!validBoard) {
      this.board = Array(this.gridSize).fill(0).map(() => Array(this.gridSize).fill(''));
      
      // Generate start and end positions
      let startR, startC, endR, endC;
      do {
        startR = Math.floor(Math.random() * this.gridSize);
        startC = Math.floor(Math.random() * this.gridSize);
        endR = Math.floor(Math.random() * this.gridSize);
        endC = Math.floor(Math.random() * this.gridSize);
      } while (
        (startR === endR && startC === endC) ||
        (Math.abs(startR - endR) + Math.abs(startC - endC) < Math.floor(this.gridSize / 0.7))
      );
      
      this.board[startR][startC] = 'S';
      this.board[endR][endC] = 'E';
      this.playerPos = { row: startR, col: startC };
      this.endPos = { row: endR, col: endC };
      
      // Add obstacles
      const numObstacles = Math.floor(this.gridSize * this.gridSize * 0.35);
      for (let i = 0; i < numObstacles; i++) {
        let r, c;
        do {
          r = Math.floor(Math.random() * this.gridSize);
          c = Math.floor(Math.random() * this.gridSize);
        } while (this.board[r][c] !== '');
        this.board[r][c] = 'X';
      }
      
      // Check if path exists
      validBoard = this.isPathAvailable(this.playerPos, this.endPos);
    }
    
    this.gameStatus = 'playing';
    this.playerOrientation = 'right';
    this.renderBoard();
  }
  
  isPathAvailable(start, end) {
    const visited = Array(this.gridSize).fill(0).map(() => Array(this.gridSize).fill(false));
    const queue = [start];
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const { row, col } = current;
      
      if (row === end.row && col === end.col) return true;
      
      if (
        row < 0 || row >= this.gridSize ||
        col < 0 || col >= this.gridSize ||
        visited[row][col] ||
        this.board[row][col] === 'X'
      ) {
        continue;
      }
      
      visited[row][col] = true;
      directions.forEach(dir => {
        queue.push({ row: row + dir.row, col: col + dir.col });
      });
    }
    
    return false;
  }
  
  renderBoard() {
    const boardEl = document.getElementById('game-board');
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        
        const isPlayer = this.playerPos.row === r && this.playerPos.col === c;
        const isStart = this.board[r][c] === 'S';
        const isEnd = this.board[r][c] === 'E';
        const isObstacle = this.board[r][c] === 'X';
        
        if (isPlayer) {
          cell.classList.add('player-cell');
          cell.innerHTML = `<span class="${this.playerOrientation === 'left' ? 'player-flip' : ''}">👻</span>`;
        } else if (isStart) {
          cell.classList.add('start-cell');
          cell.textContent = '🏠';
        } else if (isEnd) {
          cell.classList.add('end-cell');
          cell.textContent = '🏁';
        } else if (isObstacle) {
          cell.classList.add('obstacle-cell');
          cell.textContent = '🚧';
        }
        
        boardEl.appendChild(cell);
      }
    }
  }
  
  movePlayer(direction) {
    if (this.gameStatus !== 'playing') return;
    
    let newRow = this.playerPos.row;
    let newCol = this.playerPos.col;
    
    switch (direction) {
      case 'up': newRow--; break;
      case 'down': newRow++; break;
      case 'left': 
        newCol--; 
        this.playerOrientation = 'left';
        break;
      case 'right': 
        newCol++; 
        this.playerOrientation = 'right';
        break;
    }
    
    // Check boundaries
    if (newRow < 0 || newRow >= this.gridSize || newCol < 0 || newCol >= this.gridSize) {
      return;
    }
    
    // Check obstacle
    if (this.board[newRow][newCol] === 'X') {
      this.gameStatus = 'lost';
      this.playSound('lose');
      this.showMessage('❌ Hit an obstacle! Resetting...', 'error');
      setTimeout(() => this.generateBoard(), 2000);
      return;
    }
    
    // Update position
    this.playerPos = { row: newRow, col: newCol };
    this.playSound('move');
    this.renderBoard();
    
    // Check win
    if (this.playerPos.row === this.endPos.row && this.playerPos.col === this.endPos.col) {
      this.gameStatus = 'won';
      this.gameWon = true;
      this.playSound('win');
      this.showMessage('🎉 Congratulations! You found the path!', 'success');
      setTimeout(() => this.unlockJourney(), 2000);
    }
  }
  
  unlockJourney() {
    // Show victory animation
    const container = this.container;
    container.innerHTML = `
      <div class="journey-unlocked">
        <div class="unlock-animation">
          <div class="unlock-icon">🎉</div>
          <h3>Journey Unlocked!</h3>
          <p>You've proven your problem-solving skills. Now discover my professional journey...</p>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      this.renderTimeline();
    }, 3000);
  }
  
  renderTimeline() {
    const timelineData = [
      {
        icon: '🎓',
        title: "Started Bachelor's at IIT Guwahati",
        date: 'Present',
        description: 'Pursuing Data Science & AI from one of India\'s premier institutions.',
        details: 'Comprehensive program covering machine learning, AI, data analytics, and advanced statistics. Actively engaged in research and practical projects.'
      },
      {
        icon: '📚',
        title: 'HCL TechBee Training',
        date: 'Sept 2022 - Mar 2023',
        description: '6-month intensive training in IT infrastructure and cloud technologies.',
        details: 'Covered Data Centre Operations, Linux CLI, networking, AWS cloud services, and programming fundamentals in Python, C, SQL, and Oracle.'
      },
      {
        icon: '💼',
        title: 'Technical Support Intern',
        date: 'Mar 2023 - Sept 2023',
        description: 'Ericsson Global - Technical Support Engineer role.',
        details: 'Provided first and second-line support for complex technical issues. Achieved high resolve rates and user satisfaction. Contributed to knowledge base articles.'
      },
      {
        icon: '🤖',
        title: 'Automation Engineer',
        date: 'Sept 2023 - Present',
        description: 'Full-time role focusing on Power Platform automation.',
        details: 'Developing enterprise applications with Power Apps, automating workflows with Power Automate, and creating analytics dashboards with Power BI.'
      },
      {
        icon: '🚀',
        title: 'Power Platform Projects',
        date: 'Ongoing',
        description: 'Delivered key automation solutions.',
        details: 'Developed Attendance Tracker and KBA Review applications. Integrated AI, automated workflows, and provided real-time analytics. Served clients including Mondelēz International.'
      },
      {
        icon: '🏆',
        title: 'Recognition & Awards',
        date: 'Ongoing',
        description: 'Multiple certifications and client appreciations.',
        details: 'Microsoft certifications in Power Platform, Google Cloud Associate, Azure. 50+ client appreciations. Recognition from Ericsson Global Quality Head.'
      }
    ];
    
    let timelineHTML = `
      <div class="timeline-container">
        <h3 class="timeline-header">My Professional Journey</h3>
        <div class="timeline">
    `;
    
    timelineData.forEach((item, index) => {
      timelineHTML += `
        <div class="timeline-item scroll-reveal" style="animation-delay: ${index * 0.1}s">
          <div class="timeline-icon">${item.icon}</div>
          <div class="timeline-content" onclick="this.classList.toggle('expanded')">
            <h4 class="timeline-title">${item.title}</h4>
            <span class="timeline-date">${item.date}</span>
            <p class="timeline-description">${item.description}</p>
            <div class="timeline-details">${item.details}</div>
          </div>
        </div>
      `;
    });
    
    timelineHTML += `
        </div>
        <button class="btn btn-primary" onclick="window.gameInstance.resetGame()">Play Again</button>
      </div>
    `;
    
    this.container.innerHTML = timelineHTML;
    
    // Trigger scroll reveal
    setTimeout(() => {
      document.querySelectorAll('.scroll-reveal').forEach(el => {
        el.classList.add('revealed');
      });
    }, 100);
  }
  
  showMessage(text, type) {
    const messageEl = document.getElementById('game-message');
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = `game-message ${type}`;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
      messageEl.classList.add('hidden');
    }, 3000);
  }
  
  setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (this.gameStatus !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.movePlayer('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.movePlayer('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.movePlayer('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.movePlayer('right');
          break;
      }
    });
    
    // Touch controls (delegated event listener)
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('control-btn')) {
        const direction = e.target.dataset.direction;
        this.movePlayer(direction);
      }
      
      if (e.target.classList.contains('game-reset-btn')) {
        this.resetGame();
      }
    });
    
    // Swipe controls
    let touchStartX = 0;
    let touchStartY = 0;
    
    const board = document.getElementById('game-board');
    if (board) {
      board.addEventListener('touchstart', (e) => {
        if (this.gameStatus !== 'playing') return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      
      board.addEventListener('touchmove', (e) => {
        if (this.gameStatus !== 'playing') return;
        
        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const dx = touchCurrentX - touchStartX;
        const dy = touchCurrentY - touchStartY;
        
        // Prevent horizontal page scroll when swiping on game
        if (Math.abs(dx) > Math.abs(dy)) {
          e.preventDefault();
        }
      });
      
      board.addEventListener('touchend', (e) => {
        if (this.gameStatus !== 'playing') return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const threshold = 30;
        
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
          this.movePlayer(dx > 0 ? 'right' : 'left');
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold) {
          this.movePlayer(dy > 0 ? 'down' : 'up');
        }
      }, { passive: true });
    }
  }
  
  resetGame() {
    this.gameWon = false;
    this.render();
    this.generateBoard();
    this.setupEventListeners();
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('journey-content')) {
    window.gameInstance = new PathfinderGame('journey-content');
  }
});
