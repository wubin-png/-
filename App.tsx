import React, { useState, useEffect, useCallback, useRef } from 'react';
import SnakeBoard from './components/SnakeBoard';
import OperatorPanel from './components/OperatorPanel';
import { useInterval } from './hooks/useInterval';
import { Direction, GameStatus, Point, OperatorMessage, GameEvent } from './types';
import { GRID_SIZE, INITIAL_SPEED, INITIAL_SNAKE, SPEED_DECREMENT, MIN_SPEED } from './constants';
import { getOperatorReaction } from './services/geminiService';
import { GoogleGenAI } from '@google/genai';

// Helper to generate random food that isn't on snake
const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!onSnake) break;
  }
  return newFood;
};

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // --- AI Operator State ---
  const [messages, setMessages] = useState<OperatorMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Refs for immediate updates (prevent rapid key press bugs)
  const directionRef = useRef<Direction>(Direction.RIGHT);

  // --- AI Interaction Helper ---
  const triggerAiReaction = useCallback(async (event: GameEvent, currentScore: number, context?: string) => {
    setIsAiLoading(true);
    const reaction = await getOperatorReaction(event, currentScore, context);
    const newMessage: OperatorMessage = {
      id: Date.now().toString(),
      text: reaction,
      emotion: 'neutral', // Simplified for now
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    setIsAiLoading(false);
  }, []);

  // --- Initialization ---
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snake_highscore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
    
    // Initial greeting
    triggerAiReaction('IDLE_CHAT', 0, "The player has just opened the game. Greet them.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Game Logic Methods ---
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(Direction.RIGHT);
    directionRef.current = Direction.RIGHT;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setStatus(GameStatus.PLAYING);
    setFood(generateFood(INITIAL_SNAKE));
    setMessages([]); // Clear chat on restart? Or keep history? Let's clear to keep it fresh.
    triggerAiReaction('START', 0);
  };

  const gameOver = () => {
    setStatus(GameStatus.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
      triggerAiReaction('HIGH_SCORE', score);
    } else {
      triggerAiReaction('GAME_OVER', score);
    }
  };

  const gameLoop = () => {
    const head = snake[0];
    const newHead = { ...head };

    switch (direction) {
      case Direction.UP: newHead.y -= 1; break;
      case Direction.DOWN: newHead.y += 1; break;
      case Direction.LEFT: newHead.x -= 1; break;
      case Direction.RIGHT: newHead.x += 1; break;
    }

    // Wall Collision
    if (
      newHead.x < 0 || 
      newHead.x >= GRID_SIZE || 
      newHead.y < 0 || 
      newHead.y >= GRID_SIZE
    ) {
      gameOver();
      return;
    }

    // Self Collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      gameOver();
      return;
    }

    const newSnake = [newHead, ...snake];

    // Eat Food
    if (newHead.x === food.x && newHead.y === food.y) {
      const newScore = score + 1;
      setScore(newScore);
      setFood(generateFood(newSnake));
      setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_DECREMENT));
      
      // AI Reaction on milestones
      if (newScore % 5 === 0) {
        triggerAiReaction('EAT', newScore);
      }
    } else {
      newSnake.pop(); // Remove tail if not eating
    }

    setSnake(newSnake);
  };

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) {
        if (e.code === 'Space' || e.code === 'Enter') {
          if (status === GameStatus.IDLE || status === GameStatus.GAME_OVER) startGame();
          else if (status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
        }
        return;
      }
      
      // Prevent reversing direction directly
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current !== Direction.DOWN) {
            setDirection(Direction.UP);
            directionRef.current = Direction.UP;
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current !== Direction.UP) {
            setDirection(Direction.DOWN);
            directionRef.current = Direction.DOWN;
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current !== Direction.RIGHT) {
            setDirection(Direction.LEFT);
            directionRef.current = Direction.LEFT;
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current !== Direction.LEFT) {
            setDirection(Direction.RIGHT);
            directionRef.current = Direction.RIGHT;
          }
          break;
        case 'Escape':
        case 'p':
        case 'P':
          setStatus(GameStatus.PAUSED);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, snake]); // Dependencies for pause toggling logic

  useInterval(gameLoop, status === GameStatus.PLAYING ? speed : null);

  // --- Render ---
  return (
    <div className="min-h-screen bg-cyber-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-purple/40 via-cyber-dark to-black text-white flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-tech font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink via-purple-400 to-cyber-cyan drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
            NEON SNAKE
          </h1>
          <p className="text-cyber-cyan/80 font-tech text-sm tracking-widest mt-1">SYSTEM V.2.0 // ONLINE</p>
        </div>
        <div className="text-right">
           <div className="text-xs text-gray-400 uppercase tracking-widest">Score</div>
           <div className="text-4xl font-bold font-tech text-cyber-pink">{score.toString().padStart(3, '0')}</div>
           <div className="text-xs text-gray-500 mt-1">HI: {highScore}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left: Game Board */}
        <div className="lg:col-span-2 order-2 lg:order-1 w-full">
           <SnakeBoard 
             snake={snake} 
             food={food} 
             status={status} 
             direction={direction} 
           />
           
           {/* Controls Hint */}
           <div className="mt-4 flex justify-between text-xs text-white/40 font-tech uppercase tracking-wider">
              <div className="flex gap-4">
                <span>[W/A/S/D] Move</span>
                <span>[SPACE] Start/Pause</span>
              </div>
              <div className="hidden md:block">
                Use keyboard for best experience
              </div>
           </div>

           {/* Mobile D-Pad */}
           <div className="mt-8 grid grid-cols-3 gap-2 w-48 mx-auto md:hidden">
              <div></div>
              <button 
                className="p-4 bg-white/10 rounded-lg active:bg-cyber-pink/50"
                onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== Direction.DOWN) { setDirection(Direction.UP); directionRef.current = Direction.UP; } }}
              >▲</button>
              <div></div>
              <button 
                className="p-4 bg-white/10 rounded-lg active:bg-cyber-pink/50"
                onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== Direction.RIGHT) { setDirection(Direction.LEFT); directionRef.current = Direction.LEFT; } }}
              >◀</button>
              <button 
                className="p-4 bg-white/10 rounded-lg active:bg-cyber-pink/50 font-bold"
                onClick={() => {
                   if (status === GameStatus.IDLE || status === GameStatus.GAME_OVER) startGame();
                   else if (status === GameStatus.PLAYING) setStatus(GameStatus.PAUSED);
                   else if (status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
                }}
              >⏯</button>
              <button 
                className="p-4 bg-white/10 rounded-lg active:bg-cyber-pink/50"
                onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== Direction.LEFT) { setDirection(Direction.RIGHT); directionRef.current = Direction.RIGHT; } }}
              >▶</button>
              <div></div>
              <button 
                className="p-4 bg-white/10 rounded-lg active:bg-cyber-pink/50"
                onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== Direction.UP) { setDirection(Direction.DOWN); directionRef.current = Direction.DOWN; } }}
              >▼</button>
              <div></div>
           </div>
        </div>

        {/* Right: Operator Panel */}
        <div className="lg:col-span-1 order-1 lg:order-2 w-full h-[300px] lg:h-[440px]">
          <OperatorPanel messages={messages} loading={isAiLoading} />
        </div>
      </div>

    </div>
  );
}