import React from 'react';
import { Point, GameStatus, Direction } from '../types';
import { GRID_SIZE } from '../constants';

interface SnakeBoardProps {
  snake: Point[];
  food: Point;
  status: GameStatus;
  direction: Direction;
}

const SnakeBoard: React.FC<SnakeBoardProps> = ({ snake, food, status, direction }) => {
  // Create grid cells
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isFood = food.x === x && food.y === y;
        
        // Determine snake part
        const snakeIndex = snake.findIndex(s => s.x === x && s.y === y);
        const isHead = snakeIndex === 0;
        const isBody = snakeIndex > 0;

        let cellClass = "w-full h-full rounded-sm transition-all duration-100 ";
        
        if (isHead) {
          cellClass += "bg-cyber-pink shadow-[0_0_10px_#d946ef] z-10 relative ";
          // Add eyes based on direction
          // Simplified visual direction indication
        } else if (isBody) {
          // Gradient fade for tail
          const opacity = Math.max(0.3, 1 - snakeIndex / (snake.length + 5));
          cellClass += `bg-cyber-cyan shadow-[0_0_5px_#06b6d4] `;
          // We apply opacity via inline style below
        } else if (isFood) {
          cellClass += "bg-yellow-400 animate-pulse shadow-[0_0_15px_#facc15] rounded-full scale-75 ";
        } else {
          cellClass += "bg-white/5 ";
        }

        cells.push(
          <div 
            key={`${x}-${y}`} 
            className="relative aspect-square border border-white/5 flex items-center justify-center"
          >
            <div 
              className={cellClass} 
              style={isBody ? { opacity: Math.max(0.4, 1 - snakeIndex / snake.length) } : {}}
            >
              {isHead && (
                <>
                  <div className={`absolute w-1 h-1 bg-black rounded-full ${direction === 'LEFT' ? 'left-0.5 top-0.5' : direction === 'RIGHT' ? 'right-0.5 top-0.5' : 'top-0.5 left-0.5'}`}></div>
                  <div className={`absolute w-1 h-1 bg-black rounded-full ${direction === 'LEFT' ? 'left-0.5 bottom-0.5' : direction === 'RIGHT' ? 'right-0.5 bottom-0.5' : 'top-0.5 right-0.5'}`}></div>
                </>
              )}
            </div>
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="relative p-1 bg-cyber-purple/30 backdrop-blur-xl rounded-xl border border-cyber-pink/30 shadow-[0_0_50px_rgba(217,70,239,0.2)]">
      <div 
        className="grid gap-px bg-black/20 rounded-lg overflow-hidden"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {renderGrid()}
      </div>
      
      {/* Overlay for Paused/Game Over */}
      {(status === GameStatus.GAME_OVER || status === GameStatus.PAUSED || status === GameStatus.IDLE) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-20">
          <div className="text-center animate-float">
            <h2 className="text-4xl md:text-5xl font-tech font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink to-cyber-cyan drop-shadow-lg">
              {status === GameStatus.GAME_OVER ? "SYNC BROKEN" : status === GameStatus.PAUSED ? "SYSTEM PAUSED" : "NEON SNAKE"}
            </h2>
            <p className="text-cyber-neon mt-2 text-lg tracking-widest">
              {status === GameStatus.IDLE ? "PRESS START TO INITIALIZE" : "WAITING FOR INPUT..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeBoard;