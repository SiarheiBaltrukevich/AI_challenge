// Game constants
const BOARD_SIZE = 10;
const NUM_SHIPS = 3;
const SHIP_LENGTH = 3;

// Game symbols
const SYMBOLS = {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
};

// Game modes
const CPU_MODES = {
    HUNT: 'hunt',
    TARGET: 'target'
};

class Ship {
    constructor() {
        this.locations = [];
        this.hits = [];
    }

    isSunk() {
        return this.hits.every(hit => hit === 'hit');
    }
}

class Board {
    constructor() {
        this.grid = Array(BOARD_SIZE).fill().map(() => 
            Array(BOARD_SIZE).fill(SYMBOLS.WATER)
        );
    }

    placeShip(ship, startRow, startCol, isHorizontal) {
        const locations = [];
        for (let i = 0; i < SHIP_LENGTH; i++) {
            const row = isHorizontal ? startRow : startRow + i;
            const col = isHorizontal ? startCol + i : startCol;
            locations.push(`${row}${col}`);
            this.grid[row][col] = SYMBOLS.SHIP;
        }
        ship.locations = locations;
        ship.hits = Array(SHIP_LENGTH).fill('');
    }

    isValidPlacement(startRow, startCol, isHorizontal) {
        for (let i = 0; i < SHIP_LENGTH; i++) {
            const row = isHorizontal ? startRow : startRow + i;
            const col = isHorizontal ? startCol + i : startCol;
            
            if (row >= BOARD_SIZE || col >= BOARD_SIZE || 
                this.grid[row][col] !== SYMBOLS.WATER) {
                return false;
            }
        }
        return true;
    }

    placeShipsRandomly(ships) {
        let placedShips = 0;
        while (placedShips < NUM_SHIPS) {
            const isHorizontal = Math.random() < 0.5;
            const startRow = isHorizontal ? 
                Math.floor(Math.random() * BOARD_SIZE) : 
                Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1));
            const startCol = isHorizontal ? 
                Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1)) : 
                Math.floor(Math.random() * BOARD_SIZE);

            if (this.isValidPlacement(startRow, startCol, isHorizontal)) {
                const ship = new Ship();
                this.placeShip(ship, startRow, startCol, isHorizontal);
                ships.push(ship);
                placedShips++;
            }
        }
    }

    makeGuess(row, col) {
        return this.grid[row][col];
    }

    updateCell(row, col, symbol) {
        this.grid[row][col] = symbol;
    }
}

class Player {
    constructor() {
        this.board = new Board();
        this.ships = [];
        this.guesses = new Set();
        this.remainingShips = NUM_SHIPS;
    }

    placeShips() {
        this.board.placeShipsRandomly(this.ships);
    }

    isValidGuess(guess) {
        if (!guess || guess.length !== 2) return false;
        
        const row = parseInt(guess[0]);
        const col = parseInt(guess[1]);
        
        return !isNaN(row) && !isNaN(col) && 
               row >= 0 && row < BOARD_SIZE && 
               col >= 0 && col < BOARD_SIZE &&
               !this.guesses.has(guess) &&
               guess.length === 2 && // Ensure exactly 2 digits
               /^\d{2}$/.test(guess); // Ensure only digits
    }

    makeGuess(guess) {
        if (!this.isValidGuess(guess)) return null;
        
        this.guesses.add(guess);
        const row = parseInt(guess[0]);
        const col = parseInt(guess[1]);
        return { row, col };
    }
}

class CPU extends Player {
    constructor() {
        super();
        this.mode = CPU_MODES.HUNT;
        this.targetQueue = [];
    }

    generateGuess() {
        let guess;
        
        if (this.mode === CPU_MODES.TARGET && this.targetQueue.length > 0) {
            guess = this.targetQueue.shift();
        } else {
            do {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                guess = `${row}${col}`;
            } while (this.guesses.has(guess));
        }

        return guess;
    }

    updateStrategy(lastGuess, wasHit) {
        if (wasHit) {
            this.mode = CPU_MODES.TARGET;
            const [row, col] = lastGuess.split('').map(Number);
            
            // Add adjacent cells to target queue
            const adjacent = [
                { r: row - 1, c: col },
                { r: row + 1, c: col },
                { r: row, c: col - 1 },
                { r: row, c: col + 1 }
            ];

            for (const { r, c } of adjacent) {
                if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                    const guess = `${r}${c}`;
                    if (!this.guesses.has(guess) && !this.targetQueue.includes(guess)) {
                        this.targetQueue.push(guess);
                    }
                }
            }
        } else if (this.mode === CPU_MODES.TARGET && this.targetQueue.length === 0) {
            this.mode = CPU_MODES.HUNT;
        }
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.cpu = new CPU();
        this.readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    initialize() {
        this.player.placeShips();
        this.cpu.placeShips();
        console.log("\nLet's play Sea Battle!");
        console.log(`Try to sink the ${NUM_SHIPS} enemy ships.`);
    }

    printBoards() {
        console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
        const header = '  ' + Array(BOARD_SIZE).fill().map((_, i) => i).join(' ');
        console.log(header + '     ' + header);

        for (let i = 0; i < BOARD_SIZE; i++) {
            let rowStr = i + ' ';
            
            // CPU board - hide ships
            for (let j = 0; j < BOARD_SIZE; j++) {
                const cell = this.cpu.board.grid[i][j];
                // Only show hits and misses, hide ships
                rowStr += (cell === SYMBOLS.SHIP ? SYMBOLS.WATER : cell) + ' ';
            }
            
            rowStr += '    ' + i + ' ';
            
            // Player board
            for (let j = 0; j < BOARD_SIZE; j++) {
                rowStr += this.player.board.grid[i][j] + ' ';
            }
            
            console.log(rowStr);
        }
        console.log('\n');
    }

    processPlayerGuess(guess) {
        const guessResult = this.player.makeGuess(guess);
        if (!guessResult) {
            console.log('Invalid guess! Please enter two digits (e.g., 00, 34, 98).');
            return false;
        }

        const { row, col } = guessResult;
        const cell = this.cpu.board.makeGuess(row, col);
        
        if (cell === SYMBOLS.SHIP) {
            this.cpu.board.updateCell(row, col, SYMBOLS.HIT);
            console.log('PLAYER HIT!');
            
            // Find and update the hit ship
            const hitShip = this.cpu.ships.find(ship => 
                ship.locations.includes(guess)
            );
            
            if (hitShip) {
                const hitIndex = hitShip.locations.indexOf(guess);
                hitShip.hits[hitIndex] = 'hit';
                
                if (hitShip.isSunk()) {
                    console.log('You sunk an enemy battleship!');
                    this.cpu.remainingShips--;
                }
            }
        } else {
            this.cpu.board.updateCell(row, col, SYMBOLS.MISS);
            console.log('PLAYER MISS.');
        }
        
        return true;
    }

    processCPUTurn() {
        console.log("\n--- CPU's Turn ---");
        const guess = this.cpu.generateGuess();
        const { row, col } = this.cpu.makeGuess(guess);
        
        const cell = this.player.board.makeGuess(row, col);
        let wasHit = false;
        
        if (cell === SYMBOLS.SHIP) {
            this.player.board.updateCell(row, col, SYMBOLS.HIT);
            console.log(`CPU HIT at ${guess}!`);
            wasHit = true;
            
            const hitShip = this.player.ships.find(ship => 
                ship.locations.includes(guess)
            );
            
            if (hitShip) {
                const hitIndex = hitShip.locations.indexOf(guess);
                hitShip.hits[hitIndex] = 'hit';
                
                if (hitShip.isSunk()) {
                    console.log('CPU sunk your battleship!');
                    this.player.remainingShips--;
                }
            }
        } else {
            this.player.board.updateCell(row, col, SYMBOLS.MISS);
            console.log(`CPU MISS at ${guess}.`);
        }
        
        this.cpu.updateStrategy(guess, wasHit);
    }

    async gameLoop() {
        if (this.cpu.remainingShips === 0) {
            console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
            this.printBoards();
            this.readline.close();
            return;
        }
        
        if (this.player.remainingShips === 0) {
            console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
            this.printBoards();
            this.readline.close();
            return;
        }

        this.printBoards();
        
        const answer = await new Promise(resolve => {
            this.readline.question('Enter your guess (e.g., 00): ', resolve);
        });

        const playerGuessed = this.processPlayerGuess(answer);
        
        if (playerGuessed) {
            if (this.cpu.remainingShips === 0) {
                await this.gameLoop();
                return;
            }
            
            this.processCPUTurn();
            
            if (this.player.remainingShips === 0) {
                await this.gameLoop();
                return;
            }
        }
        
        await this.gameLoop();
    }

    async start() {
        this.initialize();
        await this.gameLoop();
    }
}

// Start the game
const game = new Game();
game.start();

// Export classes and constants for testing
module.exports = {
    Ship,
    Board,
    Player,
    CPU,
    Game,
    SYMBOLS,
    BOARD_SIZE,
    NUM_SHIPS,
    SHIP_LENGTH
}; 