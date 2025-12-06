class WordleGame {
    constructor() {
        this.sessionId = null;
        this.wordLength = 5;
        this.maxAttempts = 6;
        this.currentRow = 0;
        this.currentGuess = '';
        this.gameOver = false;
        this.won = false;
        this.board = [];
        this.eventListenersAttached = false;
        
        // API endpoint
        this.API_URL = window.location.origin + '/api';
        
        this.init();
    }
    
    async init() {
        try {
            // Inicjalizacja gry przez API
            const response = await fetch(`${this.API_URL}/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Nie udało się zainicjalizować gry');
            }
            
            const data = await response.json();
            this.sessionId = data.sessionId;
            this.wordLength = data.wordLength;
            this.maxAttempts = data.maxAttempts;
            
            // Aktualizuj UI
            document.getElementById('word-length').textContent = this.wordLength;
            document.getElementById('attempts-left').textContent = this.maxAttempts;
            
            this.createBoard();
            this.attachEventListeners();
            this.loadStats();
            
        } catch (error) {
            console.error('Błąd inicjalizacji:', error);
            this.showMessage('Błąd połączenia z serwerem', 'error');
        }
    }
    
    createBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < this.maxAttempts; i++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            row.dataset.row = i;
            
            for (let j = 0; j < this.wordLength; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = i;
                tile.dataset.col = j;
                row.appendChild(tile);
            }
            
            boardElement.appendChild(row);
            this.board.push(row);
        }
    }
    
    attachEventListeners() {
        // Usuń stare event listenery jeśli istnieją
        if (this.eventListenersAttached) return;
        
        // Klawiatura ekranowa
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', (e) => {
                const keyValue = e.currentTarget.dataset.key;
                this.handleKeyPress(keyValue);
            });
        });
        
        // Klawiatura fizyczna - użyj strzałki funkcji żeby zachować kontekst
        this.keydownHandler = (e) => {
            if (this.gameOver) return;
            
            const key = e.key.toLowerCase();
            
            if (key === 'enter') {
                this.submitGuess();
            } else if (key === 'backspace') {
                this.deleteLetter();
            } else if (/^[a-ząćęłńóśźż]$/.test(key)) {
                this.addLetter(key);
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
        
        // Przycisk nowej gry
        document.getElementById('new-game-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        this.eventListenersAttached = true;
    }
    
    handleKeyPress(key) {
        if (this.gameOver) return;
        
        if (key === 'enter') {
            this.submitGuess();
        } else if (key === 'backspace') {
            this.deleteLetter();
        } else if (this.currentGuess.length < this.wordLength) {
            if (/^[a-ząćęłńóśźż]$/.test(key)) {
                this.addLetter(key);
            }
        }
    }
    
    addLetter(letter) {
        if (this.currentGuess.length >= this.wordLength) return;
        
        this.currentGuess += letter;
        this.updateCurrentRow();
    }
    
    deleteLetter() {
        if (this.currentGuess.length === 0) return;
        
        this.currentGuess = this.currentGuess.slice(0, -1);
        this.updateCurrentRow();
    }
    
    updateCurrentRow() {
        const row = this.board[this.currentRow];
        if (!row) return;
        
        const tiles = row.querySelectorAll('.tile');
        if (!tiles) return;
        
        tiles.forEach((tile, index) => {
            if (index < this.currentGuess.length) {
                tile.textContent = this.currentGuess[index].toUpperCase();
                tile.classList.add('filled');
            } else {
                tile.textContent = '';
                tile.classList.remove('filled');
            }
        });
    }
    
    async submitGuess() {
        if (this.currentGuess.length !== this.wordLength) {
            this.showMessage(`Słowo musi mieć ${this.wordLength} liter!`, 'warning');
            this.shakeRow(this.currentRow);
            return;
        }
        
        try {
            const response = await fetch(`${this.API_URL}/guess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    guess: this.currentGuess
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                
                // Jeśli gra się zakończyła, wymuś reset
                if (error.error === 'Gra już się zakończyła') {
                    this.showMessage('Gra zakończona. Rozpocznij nową grę!', 'warning');
                    return;
                }
                
                throw new Error(error.error || 'Błąd serwera');
            }
            
            const data = await response.json();
            this.processGuessResult(data);
            
        } catch (error) {
            console.error('Błąd podczas zgadywania:', error);
            this.showMessage(error.message, 'error');
            this.shakeRow(this.currentRow);
        }
    }
    
    processGuessResult(data) {
        const row = this.board[this.currentRow];
        if (!row) return;
        
        const tiles = row.querySelectorAll('.tile');
        if (!tiles) return;
        
        // Animacja odwracania kafelków
        data.result.forEach((letterResult, index) => {
            setTimeout(() => {
                const tile = tiles[index];
                tile.classList.add('flip');
                
                setTimeout(() => {
                    tile.classList.add(letterResult.status);
                    this.updateKeyboard(letterResult.letter, letterResult.status);
                }, 250);
            }, index * 300);
        });
        
        // Czekaj na zakończenie animacji
        setTimeout(() => {
            if (data.isWin) {
                this.handleWin(data);
            } else if (data.gameOver) {
                this.handleLoss(data);
            } else {
                this.currentRow++;
                this.currentGuess = '';
                document.getElementById('attempts-left').textContent = data.attemptsLeft;
            }
        }, data.result.length * 300 + 500);
    }
    
    updateKeyboard(letter, status) {
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        if (!key) return;
        
        const currentStatus = key.dataset.status;
        
        // Hierarchia statusów: correct > present > absent
        if (currentStatus === 'correct') return;
        if (currentStatus === 'present' && status === 'absent') return;
        
        key.dataset.status = status;
        key.classList.remove('correct', 'present', 'absent');
        key.classList.add(status);
    }
    
    handleWin(data) {
        this.gameOver = true;
        this.won = true;
        
        setTimeout(() => {
            this.showMessage(`Gratulacje! Wygrałeś w ${data.totalAttempts} próbach! 🎉`, 'success');
            this.celebrateWin();
            this.updateStats(true, data.totalAttempts);
        }, 500);
    }
    
    handleLoss(data) {
        this.gameOver = true;
        this.won = false;
        
        setTimeout(() => {
            this.showMessage(`Przegrana! Słowo to: ${data.solution.toUpperCase()} 😔`, 'error');
            this.updateStats(false, this.maxAttempts);
        }, 500);
    }
    
    celebrateWin() {
        const row = this.board[this.currentRow];
        const tiles = row.querySelectorAll('.tile');
        
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('bounce');
            }, index * 100);
        });
        
        // Konfetti
        this.createConfetti();
    }
    
    createConfetti() {
        const container = document.getElementById('animations-container');
        const colors = ['#6aaa64', '#c9b458', '#787c7e', '#ff6b6b', '#4ecdc4'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                container.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 2000);
            }, i * 30);
        }
    }
    
    shakeRow(rowIndex) {
        const row = this.board[rowIndex];
        if (!row) return;
        
        row.classList.add('shake');
        setTimeout(() => row.classList.remove('shake'), 500);
    }
    
    showMessage(text, type = 'info') {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = text;
        messageElement.className = `game-message ${type} show`;
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
    
    loadStats() {
        const stats = JSON.parse(localStorage.getItem('wordleStats')) || {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        this.updateStatsDisplay(stats);
    }
    
    updateStats(won, attempts) {
        const stats = JSON.parse(localStorage.getItem('wordleStats')) || {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        stats.gamesPlayed++;
        
        if (won) {
            stats.gamesWon++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        } else {
            stats.currentStreak = 0;
        }
        
        localStorage.setItem('wordleStats', JSON.stringify(stats));
        this.updateStatsDisplay(stats);
    }
    
    updateStatsDisplay(stats) {
        const winRate = stats.gamesPlayed > 0 
            ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
            : 0;
        
        document.getElementById('win-streak').textContent = stats.currentStreak;
        document.getElementById('win-rate').textContent = winRate + '%';
        
        // Aktualizuj numer dnia
        const startDate = new Date('2024-01-01');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('day-number').textContent = diffDays;
    }
    
    async resetGame() {
        // Zablokuj input podczas resetu
        this.gameOver = true;
        
        // Reset stanu gry
        this.currentRow = 0;
        this.currentGuess = '';
        this.won = false;
        this.board = [];
        
        // Wyczyść klawiaturę
        const keys = document.querySelectorAll('.key');
        if (keys) {
            keys.forEach(key => {
                key.classList.remove('correct', 'present', 'absent');
                delete key.dataset.status;
            });
        }
        
        // Ukryj komunikaty i przyciski
        const messageElement = document.getElementById('game-message');
        if (messageElement) {
            messageElement.className = 'game-message';
            messageElement.textContent = '';
        }
        
        // Pobierz nową sesję z backendu
        try {
            const response = await fetch(`${this.API_URL}/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Nie udało się zainicjalizować gry');
            }
            
            const data = await response.json();
            this.sessionId = data.sessionId;
            this.wordLength = data.wordLength;
            this.maxAttempts = data.maxAttempts;
            
            // Aktualizuj UI
            document.getElementById('word-length').textContent = this.wordLength;
            document.getElementById('attempts-left').textContent = this.maxAttempts;
            
            // Odtwórz planszę
            this.createBoard();
            
            // Odblokuj input
            this.gameOver = false;
            
        } catch (error) {
            console.error('Błąd resetu gry:', error);
            this.showMessage('Błąd połączenia z serwerem', 'error');
            this.gameOver = true; // Zostaw zablokowane przy błędzie
        }
    }
}

// Inicjalizacja gry po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    new WordleGame();
});
