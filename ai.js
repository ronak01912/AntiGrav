// Tic-Tac-Toe AI Engine
// Features Easy, Medium, and Unbeatable (Minimax) difficulty algorithms.

class TicTacToeAI {
    constructor() {
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
    }

    getBestMove(board, aiSymbol, humanSymbol, difficulty = 'hard') {
        const available = this.getAvailableIndices(board);
        if (available.length === 0) return null;

        switch (difficulty) {
            case 'easy':
                return this.getEasyMove(board, available, aiSymbol, humanSymbol);
            case 'medium':
                return this.getMediumMove(board, available, aiSymbol, humanSymbol);
            case 'hard':
            default:
                return this.getMinimaxMove(board, aiSymbol, humanSymbol);
        }
    }

    getAvailableIndices(board) {
        const moves = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null || board[i] === '') {
                moves.push(i);
            }
        }
        return moves;
    }

    checkWinner(board) {
        for (const combo of this.winningCombos) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], combo };
            }
        }
        if (this.getAvailableIndices(board).length === 0) {
            return { winner: 'tie', combo: null };
        }
        return null;
    }

    // Easy AI: Mostly random moves with occasional lucky blocks
    getEasyMove(board, available, aiSymbol, humanSymbol) {
        // 25% chance to spot immediate win/block
        if (Math.random() < 0.25) {
            const winMove = this.findImmediateWinningMove(board, available, aiSymbol);
            if (winMove !== null) return winMove;
            const blockMove = this.findImmediateWinningMove(board, available, humanSymbol);
            if (blockMove !== null) return blockMove;
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    // Medium AI: Takes winning moves, blocks opponent wins, prioritizes center/corners, else random
    getMediumMove(board, available, aiSymbol, humanSymbol) {
        // 1. Check if AI can win immediately
        const winMove = this.findImmediateWinningMove(board, available, aiSymbol);
        if (winMove !== null) return winMove;

        // 2. Check if human can win and block
        const blockMove = this.findImmediateWinningMove(board, available, humanSymbol);
        if (blockMove !== null) return blockMove;

        // 3. Take center if free (70% probability)
        if (available.includes(4) && Math.random() < 0.7) {
            return 4;
        }

        // 4. Take random corner if free
        const corners = [0, 2, 6, 8].filter(c => available.includes(c));
        if (corners.length > 0 && Math.random() < 0.6) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // 5. Random available
        return available[Math.floor(Math.random() * available.length)];
    }

    findImmediateWinningMove(board, available, symbol) {
        for (const move of available) {
            board[move] = symbol;
            const res = this.checkWinner(board);
            board[move] = null;
            if (res && res.winner === symbol) {
                return move;
            }
        }
        return null;
    }

    // Unbeatable AI: Perfect Minimax with Alpha-Beta Pruning
    getMinimaxMove(board, aiSymbol, humanSymbol) {
        const available = this.getAvailableIndices(board);

        // Optimization: If board is completely empty, pick center or corner instantly
        if (available.length === 9) {
            const openers = [4, 0, 2, 6, 8];
            return openers[Math.floor(Math.random() * openers.length)];
        }

        // Optimization: If second move and center is empty, pick center
        if (available.length === 8 && available.includes(4)) {
            return 4;
        }

        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of available) {
            board[move] = aiSymbol;
            const score = this.minimax(board, 0, false, -Infinity, Infinity, aiSymbol, humanSymbol);
            board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        // Pick randomly among moves with equally best score to add variety
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    minimax(board, depth, isMaximizing, alpha, beta, aiSymbol, humanSymbol) {
        const state = this.checkWinner(board);
        if (state) {
            if (state.winner === aiSymbol) {
                return 10 - depth; // Win sooner is better
            } else if (state.winner === humanSymbol) {
                return depth - 10; // Lose later is better
            } else {
                return 0; // Draw
            }
        }

        const available = this.getAvailableIndices(board);

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of available) {
                board[move] = aiSymbol;
                const score = this.minimax(board, depth + 1, false, alpha, beta, aiSymbol, humanSymbol);
                board[move] = null;
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Pruning
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of available) {
                board[move] = humanSymbol;
                const score = this.minimax(board, depth + 1, true, alpha, beta, aiSymbol, humanSymbol);
                board[move] = null;
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Pruning
            }
            return minScore;
        }
    }
}

window.ticTacToeAI = new TicTacToeAI();
