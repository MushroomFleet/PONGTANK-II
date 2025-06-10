// Advanced Maze Generation with Sector-Based Complexity Biomes
// Creates varied battlefield layouts with different density zones

export class MazeGenerator {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.maze = [];
        
        // Biome configuration
        this.biomes = {
            SPARSE: { wallDensity: 0.15, brickDensity: 0.05 },    // Combat areas
            MODERATE: { wallDensity: 0.25, brickDensity: 0.10 },  // Balanced zones
            DENSE: { wallDensity: 0.35, brickDensity: 0.15 }      // Maze-like areas
        };
        
        // Sector layout (3x3 grid)
        this.sectorLayout = [
            ['SPARSE', 'DENSE', 'MODERATE'],
            ['MODERATE', 'SPARSE', 'DENSE'],
            ['DENSE', 'MODERATE', 'SPARSE']
        ];
    }
    
    generate() {
        this.initializeEmpty();
        this.createBorderWalls();
        this.generateSectorBiomes();
        this.ensureConnectivity();
        this.addStrategicRooms();
        return this.maze;
    }
    
    initializeEmpty() {
        this.maze = Array(this.height).fill().map(() => Array(this.width).fill(0));
    }
    
    createBorderWalls() {
        // Create walls around the entire perimeter
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    this.maze[y][x] = 1; // Wall
                }
            }
        }
    }
    
    generateSectorBiomes() {
        const sectorWidth = Math.floor(this.width / 3);
        const sectorHeight = Math.floor(this.height / 3);
        
        for (let sectorY = 0; sectorY < 3; sectorY++) {
            for (let sectorX = 0; sectorX < 3; sectorX++) {
                const biomeType = this.sectorLayout[sectorY][sectorX];
                const biome = this.biomes[biomeType];
                
                const startX = sectorX * sectorWidth;
                const startY = sectorY * sectorHeight;
                const endX = Math.min(startX + sectorWidth, this.width - 1);
                const endY = Math.min(startY + sectorHeight, this.height - 1);
                
                this.fillSector(startX, startY, endX, endY, biome);
            }
        }
    }
    
    fillSector(startX, startY, endX, endY, biome) {
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                // Skip border cells (already walls)
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    continue;
                }
                
                // Add walls based on biome density
                if (Math.random() < biome.wallDensity) {
                    this.maze[y][x] = 1; // Wall
                } else if (Math.random() < biome.brickDensity) {
                    this.maze[y][x] = 2; // Destructible brick
                }
            }
        }
    }
    
    ensureConnectivity() {
        // Ensure each sector has pathways to adjacent sectors
        const sectorWidth = Math.floor(this.width / 3);
        const sectorHeight = Math.floor(this.height / 3);
        
        // Create horizontal connections
        for (let sectorY = 0; sectorY < 3; sectorY++) {
            for (let sectorX = 0; sectorX < 2; sectorX++) {
                const connectionX = (sectorX + 1) * sectorWidth;
                const connectionY = sectorY * sectorHeight + Math.floor(sectorHeight / 2);
                
                // Clear a 3-wide passage
                for (let i = -1; i <= 1; i++) {
                    if (connectionY + i > 0 && connectionY + i < this.height - 1) {
                        this.maze[connectionY + i][connectionX - 1] = 0;
                        this.maze[connectionY + i][connectionX] = 0;
                        this.maze[connectionY + i][connectionX + 1] = 0;
                    }
                }
            }
        }
        
        // Create vertical connections
        for (let sectorX = 0; sectorX < 3; sectorX++) {
            for (let sectorY = 0; sectorY < 2; sectorY++) {
                const connectionX = sectorX * sectorWidth + Math.floor(sectorWidth / 2);
                const connectionY = (sectorY + 1) * sectorHeight;
                
                // Clear a 3-wide passage
                for (let i = -1; i <= 1; i++) {
                    if (connectionX + i > 0 && connectionX + i < this.width - 1) {
                        this.maze[connectionY - 1][connectionX + i] = 0;
                        this.maze[connectionY][connectionX + i] = 0;
                        this.maze[connectionY + 1][connectionX + i] = 0;
                    }
                }
            }
        }
    }
    
    addStrategicRooms() {
        // Add strategic combat rooms in sparse sectors
        const sectorWidth = Math.floor(this.width / 3);
        const sectorHeight = Math.floor(this.height / 3);
        
        for (let sectorY = 0; sectorY < 3; sectorY++) {
            for (let sectorX = 0; sectorX < 3; sectorX++) {
                const biomeType = this.sectorLayout[sectorY][sectorX];
                
                if (biomeType === 'SPARSE') {
                    const centerX = sectorX * sectorWidth + Math.floor(sectorWidth / 2);
                    const centerY = sectorY * sectorHeight + Math.floor(sectorHeight / 2);
                    
                    // Create a small clearing
                    const roomSize = 3;
                    for (let y = centerY - roomSize; y <= centerY + roomSize; y++) {
                        for (let x = centerX - roomSize; x <= centerX + roomSize; x++) {
                            if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
                                this.maze[y][x] = 0;
                            }
                        }
                    }
                }
            }
        }
    }
    
    getSectorType(x, y) {
        const sectorWidth = Math.floor(this.width / 3);
        const sectorHeight = Math.floor(this.height / 3);
        
        const sectorX = Math.floor(x / sectorWidth);
        const sectorY = Math.floor(y / sectorHeight);
        
        if (sectorX >= 0 && sectorX < 3 && sectorY >= 0 && sectorY < 3) {
            return this.sectorLayout[sectorY][sectorX];
        }
        return 'MODERATE';
    }
    
    // Find suitable spawn positions in sparse sectors
    findSpawnPositions(count) {
        const positions = [];
        const sectorWidth = Math.floor(this.width / 3);
        const sectorHeight = Math.floor(this.height / 3);
        
        // Try to spawn in sparse sectors first
        let attempts = 0;
        while (positions.length < count && attempts < 100) {
            const x = Math.floor(Math.random() * (this.width - 4)) + 2;
            const y = Math.floor(Math.random() * (this.height - 4)) + 2;
            
            if (this.maze[y][x] === 0 && this.getSectorType(x, y) === 'SPARSE') {
                // Check if position is clear in a 3x3 area
                let clear = true;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (this.maze[y + dy][x + dx] !== 0) {
                            clear = false;
                            break;
                        }
                    }
                    if (!clear) break;
                }
                
                if (clear) {
                    positions.push({
                        x: x * this.tileSize + this.tileSize / 2,
                        y: y * this.tileSize + this.tileSize / 2
                    });
                }
            }
            attempts++;
        }
        
        // Fill remaining positions in any clear area
        while (positions.length < count && attempts < 200) {
            const x = Math.floor(Math.random() * (this.width - 4)) + 2;
            const y = Math.floor(Math.random() * (this.height - 4)) + 2;
            
            if (this.maze[y][x] === 0) {
                positions.push({
                    x: x * this.tileSize + this.tileSize / 2,
                    y: y * this.tileSize + this.tileSize / 2
                });
            }
            attempts++;
        }
        
        return positions;
    }
}
