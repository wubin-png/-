export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export interface Point {
  x: number;
  y: number;
}

export interface OperatorMessage {
  id: string;
  text: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'angry';
  timestamp: number;
}

export type GameEvent = 'START' | 'EAT' | 'GAME_OVER' | 'HIGH_SCORE' | 'IDLE_CHAT';