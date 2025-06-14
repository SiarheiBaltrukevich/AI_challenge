// Import the game classes and constants
const { Ship, Board, Player, CPU, Game, SYMBOLS, BOARD_SIZE, NUM_SHIPS, SHIP_LENGTH } = require('./seabattle');

// Mock readline interface
jest.mock('readline', () => ({
    createInterface: jest.fn(() => ({
        question: jest.fn(),
        close: jest.fn()
    }))
}));

describe('Ship', () => {
    let ship;

    beforeEach(() => {
        ship = new Ship();
    });

    test('should initialize with empty locations and hits', () => {
        expect(ship.locations).toEqual([]);
        expect(ship.hits).toEqual([]);
    });

    test('should correctly identify when ship is sunk', () => {
        ship.hits = ['hit', 'hit', 'hit'];
        expect(ship.isSunk()).toBe(true);
    });

    test('should correctly identify when ship is not sunk', () => {
        ship.hits = ['hit', '', 'hit'];
        expect(ship.isSunk()).toBe(false);
    });
});

describe('Board', () => {
    let board;

    beforeEach(() => {
        board = new Board();
    });

    test('should initialize with water symbols', () => {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                expect(board.grid[i][j]).toBe(SYMBOLS.WATER);
            }
        }
    });

    test('should place ship horizontally correctly', () => {
        const ship = new Ship();
        const startRow = 0;
        const startCol = 0;
        board.placeShip(ship, startRow, startCol, true);

        for (let i = 0; i < SHIP_LENGTH; i++) {
            expect(board.grid[startRow][startCol + i]).toBe(SYMBOLS.SHIP);
        }
        expect(ship.locations).toHaveLength(SHIP_LENGTH);
    });

    test('should place ship vertically correctly', () => {
        const ship = new Ship();
        const startRow = 0;
        const startCol = 0;
        board.placeShip(ship, startRow, startCol, false);

        for (let i = 0; i < SHIP_LENGTH; i++) {
            expect(board.grid[startRow + i][startCol]).toBe(SYMBOLS.SHIP);
        }
        expect(ship.locations).toHaveLength(SHIP_LENGTH);
    });

    test('should validate placement correctly', () => {
        // Valid placement
        expect(board.isValidPlacement(0, 0, true)).toBe(true);
        
        // Invalid placement - out of bounds
        expect(board.isValidPlacement(BOARD_SIZE - 1, BOARD_SIZE - 1, true)).toBe(false);
        
        // Place a ship and test overlapping
        const ship = new Ship();
        board.placeShip(ship, 0, 0, true);
        expect(board.isValidPlacement(0, 0, true)).toBe(false);
    });

    test('should make and update guesses correctly', () => {
        const ship = new Ship();
        board.placeShip(ship, 0, 0, true);
        
        // Test hit
        expect(board.makeGuess(0, 0)).toBe(SYMBOLS.SHIP);
        board.updateCell(0, 0, SYMBOLS.HIT);
        expect(board.grid[0][0]).toBe(SYMBOLS.HIT);
        
        // Test miss
        expect(board.makeGuess(1, 1)).toBe(SYMBOLS.WATER);
        board.updateCell(1, 1, SYMBOLS.MISS);
        expect(board.grid[1][1]).toBe(SYMBOLS.MISS);
    });
});

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player();
    });

    test('should initialize with correct properties', () => {
        expect(player.ships).toEqual([]);
        expect(player.guesses).toBeInstanceOf(Set);
        expect(player.remainingShips).toBe(NUM_SHIPS);
    });

    test('should validate guesses correctly', () => {
        // Valid guesses
        expect(player.isValidGuess('00')).toBe(true);
        expect(player.isValidGuess('99')).toBe(true);
        
        // Invalid guesses
        expect(player.isValidGuess('')).toBe(false);
        expect(player.isValidGuess('0')).toBe(false);
        expect(player.isValidGuess('000')).toBe(false);
        expect(player.isValidGuess('ab')).toBe(false);
        expect(player.isValidGuess('10')).toBe(true);
        
        // Test duplicate guesses
        player.makeGuess('00');
        expect(player.isValidGuess('00')).toBe(false);
    });

    test('should make guesses correctly', () => {
        const guess = player.makeGuess('00');
        expect(guess).toEqual({ row: 0, col: 0 });
        expect(player.guesses.has('00')).toBe(true);
    });
});

describe('CPU', () => {
    let cpu;

    beforeEach(() => {
        cpu = new CPU();
    });

    test('should initialize with hunt mode', () => {
        expect(cpu.mode).toBe('hunt');
        expect(cpu.targetQueue).toEqual([]);
    });

    test('should generate valid guesses', () => {
        const guess = cpu.generateGuess();
        expect(guess.length).toBe(2);
        expect(parseInt(guess[0])).toBeGreaterThanOrEqual(0);
        expect(parseInt(guess[0])).toBeLessThan(BOARD_SIZE);
        expect(parseInt(guess[1])).toBeGreaterThanOrEqual(0);
        expect(parseInt(guess[1])).toBeLessThan(BOARD_SIZE);
    });

    test('should update strategy after hits', () => {
        cpu.updateStrategy('00', true);
        expect(cpu.mode).toBe('target');
        expect(cpu.targetQueue.length).toBeGreaterThan(0);
    });

    test('should switch back to hunt mode when target queue is empty', () => {
        cpu.mode = 'target';
        cpu.updateStrategy('00', false);
        expect(cpu.mode).toBe('hunt');
    });
});

describe('Game', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    test('should initialize game correctly', () => {
        game.initialize();
        expect(game.player.ships.length).toBe(NUM_SHIPS);
        expect(game.cpu.ships.length).toBe(NUM_SHIPS);
    });

    test('should process player guesses correctly', () => {
        // Place a ship for testing
        const ship = new Ship();
        game.cpu.board.placeShip(ship, 0, 0, true);
        
        // Test hit
        expect(game.processPlayerGuess('00')).toBe(true);
        expect(game.cpu.board.grid[0][0]).toBe(SYMBOLS.HIT);
        
        // Test miss
        expect(game.processPlayerGuess('11')).toBe(true);
        expect(game.cpu.board.grid[1][1]).toBe(SYMBOLS.MISS);
        
        // Test invalid guess
        expect(game.processPlayerGuess('invalid')).toBe(false);
    });

    test('should process CPU turns correctly', () => {
        // Place a ship for testing
        const ship = new Ship();
        game.player.board.placeShip(ship, 0, 0, true);
        
        // Mock CPU guess
        game.cpu.generateGuess = jest.fn().mockReturnValue('00');
        
        game.processCPUTurn();
        expect(game.player.board.grid[0][0]).toBe(SYMBOLS.HIT);
    });
}); 