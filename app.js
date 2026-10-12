// ==========================================================================
// NEON STRIKE — Game Controller & State Management
// ==========================================================================

class TicTacToeApp {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameMode = 'pve'; // 'pve' or 'pvp'
        this.difficulty = 'hard'; // 'easy', 'medium', 'hard'
        this.ruleVariant = 'classic'; // 'classic' or 'fading'
        this.isGameOver = false;
        this.isAiThinking = false;
        
        // Move history for undo: array of snapshots
        this.history = [];

        // Fading memory mode tracking: separate queues for X and O
        // Each entry is cell index. Max length 3.
        this.movesX = [];
        this.movesO = [];

        // Scores
        this.scores = {
            x: 0,
            o: 0,
            ties: 0
        };

        this.winningCombos = [
            { combo: [0, 1, 2], line: { x1: 5, y1: 16.66, x2: 95, y2: 16.66 } },
            { combo: [3, 4, 5], line: { x1: 5, y1: 50, x2: 95, y2: 50 } },
            { combo: [6, 7, 8], line: { x1: 5, y1: 83.33, x2: 95, y2: 83.33 } },
            { combo: [0, 3, 6], line: { x1: 16.66, y1: 5, x2: 16.66, y2: 95 } },
            { combo: [1, 4, 7], line: { x1: 50, y1: 5, x2: 50, y2: 95 } },
            { combo: [2, 5, 8], line: { x1: 83.33, y1: 5, x2: 83.33, y2: 95 } },
            { combo: [0, 4, 8], line: { x1: 8, y1: 8, x2: 92, y2: 92 } },
            { combo: [2, 4, 6], line: { x1: 92, y1: 8, x2: 8, y2: 92 } }
        ];

        this.dom = {};
    }

    init() {
        this.cacheDom();
        this.loadSavedData();
        this.bindEvents();
        
        // Initialize effects
        if (window.effectsEngine) {
            window.effectsEngine.init();
        }

        this.updateSoundIcon();
        this.renderScores();
        this.resetGame(false);
    }

    cacheDom() {
        this.dom = {
            cells: Array.from(document.querySelectorAll('.board-cell')),
            gameBoard: document.getElementById('game-board'),
            strikeLine: document.getElementById('strike-line'),
            boardBanner: document.getElementById('board-banner'),
            bannerIcon: document.getElementById('banner-icon'),
            bannerTitle: document.getElementById('banner-title'),
            bannerSub: document.getElementById('banner-sub'),
            btnBannerRematch: document.getElementById('btn-banner-rematch'),
            cardPlayerX: document.getElementById('card-player-x'),
            cardPlayerO: document.getElementById('card-player-o'),
            namePlayerX: document.getElementById('name-player-x'),
            namePlayerO: document.getElementById('name-player-o'),
            scorePlayerX: document.getElementById('score-player-x'),
            scorePlayerO: document.getElementById('score-player-o'),
            scoreTies: document.getElementById('score-ties'),
            statusPill: document.getElementById('status-pill'),
            statusText: document.getElementById('status-text'),
            btnSound: document.getElementById('btn-sound'),
            soundIconOn: document.getElementById('sound-icon-on'),
            soundIconOff: document.getElementById('sound-icon-off'),
            btnRules: document.getElementById('btn-rules'),
            rulesModal: document.getElementById('rules-modal'),
            btnCloseModal: document.getElementById('btn-close-modal'),
            btnModalGotIt: document.getElementById('btn-modal-got-it'),
            modePve: document.getElementById('mode-pve'),
            modePvp: document.getElementById('mode-pvp'),
            diffButtons: Array.from(document.querySelectorAll('.difficulty-group .chip-btn')),
            diffGroup: document.getElementById('difficulty-group'),
            variantButtons: Array.from(document.querySelectorAll('.rule-variant-group .chip-btn')),
            btnUndo: document.getElementById('btn-undo'),
            btnRestart: document.getElementById('btn-restart'),
            btnResetScores: document.getElementById('btn-reset-scores')
        };
    }

    loadSavedData() {
        const savedScores = localStorage.getItem('ttt_scores');
        if (savedScores) {
            try {
                this.scores = JSON.parse(savedScores);
            } catch (e) {
                console.warn('Failed to parse saved scores', e);
            }
        }

        const savedMode = localStorage.getItem('ttt_mode');
        if (savedMode && (savedMode === 'pve' || savedMode === 'pvp')) {
            this.gameMode = savedMode;
        }

        const savedDiff = localStorage.getItem('ttt_diff');
        if (savedDiff && ['easy', 'medium', 'hard'].includes(savedDiff)) {
            this.difficulty = savedDiff;
        }

        const savedVariant = localStorage.getItem('ttt_variant');
        if (savedVariant && ['classic', 'fading'].includes(savedVariant)) {
            this.ruleVariant = savedVariant;
        }

        this.updateConfigUI();
    }

    saveScores() {
        localStorage.setItem('ttt_scores', JSON.stringify(this.scores));
    }

    bindEvents() {
        // Board Cells
        this.dom.cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const index = parseInt(cell.getAttribute('data-index'), 10);
                this.handleCellClick(index);
            });
        });

        // Mode Toggles
        this.dom.modePve.addEventListener('click', () => this.setGameMode('pve'));
        this.dom.modePvp.addEventListener('click', () => this.setGameMode('pvp'));

        // AI Difficulty
        this.dom.diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.getAttribute('data-diff');
                this.setDifficulty(diff);
            });
        });

        // Rule Variant
        this.dom.variantButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const variant = btn.getAttribute('data-variant');
                this.setRuleVariant(variant);
            });
        });

        // Actions
        this.dom.btnUndo.addEventListener('click', () => this.undoMove());
        this.dom.btnRestart.addEventListener('click', () => {
            if (window.soundFX) window.soundFX.playClick();
            this.resetGame(false);
        });
        this.dom.btnBannerRematch.addEventListener('click', () => {
            if (window.soundFX) window.soundFX.playClick();
            this.resetGame(false);
        });
        this.dom.btnResetScores.addEventListener('click', () => this.resetScores());

        // Sound Toggle
        this.dom.btnSound.addEventListener('click', () => this.toggleSound());

        // Rules Modal
        this.dom.btnRules.addEventListener('click', () => this.openRulesModal());
        this.dom.btnCloseModal.addEventListener('click', () => this.closeRulesModal());
        this.dom.btnModalGotIt.addEventListener('click', () => this.closeRulesModal());
        this.dom.rulesModal.addEventListener('click', (e) => {
            if (e.target === this.dom.rulesModal) this.closeRulesModal();
        });

        // Keyboard Controls
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // --- State Handlers ---
    setGameMode(mode) {
        if (this.gameMode === mode) return;
        this.gameMode = mode;
        localStorage.setItem('ttt_mode', mode);
        this.updateConfigUI();
        if (window.soundFX) window.soundFX.playClick();
        this.resetGame(false);
    }

    setDifficulty(diff) {
        if (this.difficulty === diff) return;
        this.difficulty = diff;
        localStorage.setItem('ttt_diff', diff);
        this.updateConfigUI();
        if (window.soundFX) window.soundFX.playClick();
        if (this.gameMode === 'pve') {
            this.resetGame(false);
        }
    }

    setRuleVariant(variant) {
        if (this.ruleVariant === variant) return;
        this.ruleVariant = variant;
        localStorage.setItem('ttt_variant', variant);
        this.updateConfigUI();
        if (window.soundFX) window.soundFX.playClick();
        this.resetGame(false);
    }

    updateConfigUI() {
        // Mode buttons
        if (this.gameMode === 'pve') {
            this.dom.modePve.classList.add('active');
            this.dom.modePve.setAttribute('aria-checked', 'true');
            this.dom.modePvp.classList.remove('active');
            this.dom.modePvp.setAttribute('aria-checked', 'false');
            this.dom.diffGroup.classList.remove('hidden');
            this.dom.namePlayerO.textContent = this.getAiDisplayName();
        } else {
            this.dom.modePvp.classList.add('active');
            this.dom.modePvp.setAttribute('aria-checked', 'true');
            this.dom.modePve.classList.remove('active');
            this.dom.modePve.setAttribute('aria-checked', 'false');
            this.dom.diffGroup.classList.add('hidden');
            this.dom.namePlayerO.textContent = 'Player 2';
        }

        // Difficulty buttons
        this.dom.diffButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-diff') === this.difficulty;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });

        // Variant buttons
        this.dom.variantButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-variant') === this.ruleVariant;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    getAiDisplayName() {
        switch (this.difficulty) {
            case 'easy': return 'AI Novice';
            case 'medium': return 'AI Tactician';
            case 'hard': return 'AI Master';
            default: return 'Computer';
        }
    }

    toggleSound() {
        if (window.soundFX) {
            window.soundFX.toggleMute();
            this.updateSoundIcon();
            if (!window.soundFX.isMuted()) {
                window.soundFX.playClick();
            }
        }
    }

    updateSoundIcon() {
        const isMuted = window.soundFX ? window.soundFX.isMuted() : false;
        if (isMuted) {
            this.dom.soundIconOn.classList.add('hidden');
            this.dom.soundIconOff.classList.remove('hidden');
            this.dom.btnSound.setAttribute('aria-label', 'Sound FX Muted');
        } else {
            this.dom.soundIconOn.classList.remove('hidden');
            this.dom.soundIconOff.classList.add('hidden');
            this.dom.btnSound.setAttribute('aria-label', 'Sound FX Active');
        }
    }

    openRulesModal() {
        if (window.soundFX) window.soundFX.playClick();
        this.dom.rulesModal.classList.remove('hidden');
    }

    closeRulesModal() {
        if (window.soundFX) window.soundFX.playClick();
        this.dom.rulesModal.classList.add('hidden');
    }

    resetScores() {
        if (window.soundFX) window.soundFX.playClick();
        this.scores = { x: 0, o: 0, ties: 0 };
        this.saveScores();
        this.renderScores();
    }

    renderScores() {
        this.dom.scorePlayerX.textContent = this.scores.x;
        this.dom.scorePlayerO.textContent = this.scores.o;
        this.dom.scoreTies.textContent = this.scores.ties;
    }

    // --- Core Game Flow ---
    resetGame(preserveStarter = false) {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.isAiThinking = false;
        this.history = [];
        this.movesX = [];
        this.movesO = [];

        // Hide overlay banner & clear strike line
        this.dom.boardBanner.classList.add('hidden');
        this.dom.strikeLine.classList.remove('active');
        this.dom.strikeLine.setAttribute('x1', '0');
        this.dom.strikeLine.setAttribute('y1', '0');
        this.dom.strikeLine.setAttribute('x2', '0');
        this.dom.strikeLine.setAttribute('y2', '0');

        if (window.effectsEngine) {
            window.effectsEngine.clearConfetti();
        }

        // Render clean board
        this.renderBoard();
        this.updateTurnHUD();
    }

    handleCellClick(index) {
        if (this.isGameOver || this.isAiThinking) return;
        if (this.board[index] !== null) {
            if (window.soundFX) window.soundFX.playWarning();
            return;
        }

        this.executeMove(index, this.currentPlayer);

        // Check if game continues and it's AI turn
        if (!this.isGameOver && this.gameMode === 'pve' && this.currentPlayer === 'O') {
            this.triggerAiTurn();
        }
    }

    executeMove(index, player) {
        // Save history snapshot for Undo
        this.history.push({
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            movesX: [...this.movesX],
            movesO: [...this.movesO]
        });

        // Fading Memory Mode logic:
        // Each player can only have max 3 marks on the board.
        // If placing a 4th, the oldest mark from this player is removed!
        if (this.ruleVariant === 'fading') {
            const playerQueue = player === 'X' ? this.movesX : this.movesO;
            if (playerQueue.length >= 3) {
                const oldestIndex = playerQueue.shift();
                this.board[oldestIndex] = null;
            }
            playerQueue.push(index);
        }

        // Place mark on board
        this.board[index] = player;

        // Play sound
        if (window.soundFX) {
            if (player === 'X') {
                window.soundFX.playPlaceX();
            } else {
                window.soundFX.playPlaceO();
            }
        }

        // Check for victory or tie
        const outcome = this.checkWinOrTie();
        this.renderBoard();

        if (outcome) {
            this.handleGameOver(outcome);
        } else {
            // Next player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateTurnHUD();
        }
    }

    triggerAiTurn() {
        this.isAiThinking = true;
        this.dom.statusPill.classList.add('thinking');
        this.dom.statusText.textContent = `${this.getAiDisplayName()} Thinking...`;

        // Slight human-like delay for natural feeling (350 - 550ms)
        const thinkDelay = Math.floor(Math.random() * 200) + 350;

        setTimeout(() => {
            if (this.isGameOver) {
                this.isAiThinking = false;
                return;
            }

            let bestIndex = null;
            if (window.ticTacToeAI) {
                bestIndex = window.ticTacToeAI.getBestMove(
                    [...this.board],
                    'O',
                    'X',
                    this.difficulty
                );
            }

            // Fallback if AI returned null
            if (bestIndex === null) {
                const available = [];
                for (let i = 0; i < 9; i++) {
                    if (this.board[i] === null) available.push(i);
                }
                if (available.length > 0) {
                    bestIndex = available[Math.floor(Math.random() * available.length)];
                }
            }

            this.isAiThinking = false;
            this.dom.statusPill.classList.remove('thinking');

            if (bestIndex !== null && !this.isGameOver) {
                this.executeMove(bestIndex, 'O');
            }
        }, thinkDelay);
    }

    undoMove() {
        if (this.isAiThinking) return;
        if (this.history.length === 0) {
            if (window.soundFX) window.soundFX.playWarning();
            return;
        }

        if (window.soundFX) window.soundFX.playClick();

        // If playing vs AI and it's currently human's turn, we should revert 2 moves (AI move and Human move)
        // unless game is over and AI won on the last step.
        let stepsToUndo = 1;
        if (this.gameMode === 'pve' && !this.isGameOver && this.history.length >= 2) {
            stepsToUndo = 2;
        }

        while (stepsToUndo > 0 && this.history.length > 0) {
            const prevState = this.history.pop();
            this.board = prevState.board;
            this.currentPlayer = prevState.currentPlayer;
            this.movesX = prevState.movesX;
            this.movesO = prevState.movesO;
            stepsToUndo--;
        }

        this.isGameOver = false;
        this.dom.boardBanner.classList.add('hidden');
        this.dom.strikeLine.classList.remove('active');
        if (window.effectsEngine) window.effectsEngine.clearConfetti();

        this.renderBoard();
        this.updateTurnHUD();
    }

    checkWinOrTie() {
        for (const item of this.winningCombos) {
            const [a, b, c] = item.combo;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return { winner: this.board[a], item };
            }
        }

        // In Fading Memory mode, ties almost never happen unless 9 cells are full without 3 in a row
        // In classic mode, check if board is full
        const isFull = this.board.every(cell => cell !== null);
        if (isFull) {
            return { winner: 'tie', item: null };
        }

        return null;
    }

    handleGameOver(outcome) {
        this.isGameOver = true;

        if (outcome.winner === 'tie') {
            this.scores.ties++;
            this.saveScores();
            this.renderScores();
            
            if (window.soundFX) window.soundFX.playDraw();

            this.dom.statusPill.classList.remove('thinking');
            this.dom.statusText.textContent = "It's a Stalemate!";
            
            this.showBanner('tie', "IT'S A DRAW!", "Equal intellects clash in perfect balance");
            return;
        }

        const winner = outcome.winner; // 'X' or 'O'
        if (winner === 'X') {
            this.scores.x++;
        } else {
            this.scores.o++;
        }
        this.saveScores();
        this.renderScores();

        // Draw winning strike line
        this.drawWinningLine(outcome.item.line);

        // Highlight winning cells
        outcome.item.combo.forEach(idx => {
            this.dom.cells[idx].classList.add('winning-cell');
        });

        // Trigger victory sound & celebration confetti
        if (window.soundFX) window.soundFX.playWin();
        if (window.effectsEngine) window.effectsEngine.fireConfetti(winner);

        const winnerName = winner === 'X' 
            ? 'Player 1' 
            : (this.gameMode === 'pve' ? this.getAiDisplayName() : 'Player 2');

        this.dom.statusText.textContent = `${winnerName} Wins!`;

        setTimeout(() => {
            this.showBanner(winner, `${winnerName.toUpperCase()} WINS!`, `Victory claimed by mark ${winner}`);
        }, 650);
    }

    drawWinningLine(lineCoords) {
        this.dom.strikeLine.setAttribute('x1', `${lineCoords.x1}%`);
        this.dom.strikeLine.setAttribute('y1', `${lineCoords.y1}%`);
        this.dom.strikeLine.setAttribute('x2', `${lineCoords.x2}%`);
        this.dom.strikeLine.setAttribute('y2', `${lineCoords.y2}%`);
        this.dom.strikeLine.classList.add('active');
    }

    showBanner(type, title, subtitle) {
        this.dom.bannerTitle.textContent = title;
        this.dom.bannerSub.textContent = subtitle;

        if (type === 'tie') {
            this.dom.bannerIcon.textContent = '🤝';
        } else if (type === 'X') {
            this.dom.bannerIcon.textContent = '⚡';
        } else {
            this.dom.bannerIcon.textContent = '👑';
        }

        this.dom.boardBanner.classList.remove('hidden');
    }

    updateTurnHUD() {
        const isX = this.currentPlayer === 'X';

        this.dom.cardPlayerX.classList.toggle('active', isX);
        this.dom.cardPlayerO.classList.toggle('active', !isX);

        this.dom.statusPill.classList.toggle('o-turn', !isX);
        this.dom.statusPill.classList.remove('thinking');

        if (!this.isGameOver) {
            const currentName = isX 
                ? 'Player 1' 
                : (this.gameMode === 'pve' ? this.getAiDisplayName() : 'Player 2');
            this.dom.statusText.textContent = `${currentName}'s Turn`;
        }

        // Update cell ghost hover class
        const ghostClassToAdd = isX ? 'ghost-x' : 'ghost-o';
        const ghostClassToRemove = isX ? 'ghost-o' : 'ghost-x';

        this.dom.cells.forEach(cell => {
            cell.classList.remove(ghostClassToRemove);
            if (!cell.hasAttribute('disabled')) {
                cell.classList.add(ghostClassToAdd);
            }
        });
    }

    renderBoard() {
        // Find which marks are about to fade in Fading Memory mode
        let oldestX = null;
        let oldestO = null;
        if (this.ruleVariant === 'fading') {
            if (this.movesX.length === 3) oldestX = this.movesX[0];
            if (this.movesO.length === 3) oldestO = this.movesO[0];
        }

        this.dom.cells.forEach((cell, idx) => {
            const val = this.board[idx];
            cell.innerHTML = '';
            cell.classList.remove('winning-cell', 'fading-warning');

            if (val === 'X') {
                cell.innerHTML = this.getSvgX();
                cell.setAttribute('disabled', 'true');
                cell.setAttribute('aria-label', `Row ${Math.floor(idx / 3) + 1}, Col ${(idx % 3) + 1}: X`);
                if (idx === oldestX && this.currentPlayer === 'X') {
                    cell.classList.add('fading-warning');
                }
            } else if (val === 'O') {
                cell.innerHTML = this.getSvgO();
                cell.setAttribute('disabled', 'true');
                cell.setAttribute('aria-label', `Row ${Math.floor(idx / 3) + 1}, Col ${(idx % 3) + 1}: O`);
                if (idx === oldestO && this.currentPlayer === 'O') {
                    cell.classList.add('fading-warning');
                }
            } else {
                cell.removeAttribute('disabled');
                cell.setAttribute('aria-label', `Row ${Math.floor(idx / 3) + 1}, Col ${(idx % 3) + 1}: Empty`);
            }
        });
    }

    getSvgX() {
        return `
            <svg class="mark-svg mark-x" viewBox="0 0 100 100" fill="none">
                <line class="line-1" x1="18" y1="18" x2="82" y2="82" stroke="currentColor" stroke-width="12"/>
                <line class="line-2" x1="82" y1="18" x2="18" y2="82" stroke="currentColor" stroke-width="12"/>
            </svg>
        `;
    }

    getSvgO() {
        return `
            <svg class="mark-svg mark-o" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="34" stroke="currentColor" stroke-width="11"/>
            </svg>
        `;
    }

    // Keyboard Accessibility Handler
    handleKeyboard(e) {
        // Ignore if user is inside an input or modal is open
        if (!this.dom.rulesModal.classList.contains('hidden')) {
            if (e.key === 'Escape') this.closeRulesModal();
            return;
        }

        if (e.key === 'Escape') {
            return;
        }

        if (e.key === 'r' || e.key === 'R') {
            this.resetGame(false);
            return;
        }

        if (e.key === 'u' || e.key === 'U') {
            this.undoMove();
            return;
        }

        // Numeric keypad or regular numbers 1-9
        // Mapping: 1->0, 2->1, ... 9->8
        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
            const cellIndex = keyNum - 1;
            this.handleCellClick(cellIndex);
        }
    }
}

// Boot application upon DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.ticTacToeApp = new TicTacToeApp();
    window.ticTacToeApp.init();
});
