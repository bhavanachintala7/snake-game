import { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 80;

type Point = { x: number; y: number };

export default function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 0, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 0, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const lastRenderTimeRef = useRef(0);
  const requestRef = useRef<number>();

  const generateFood = useCallback((): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 0, y: 0 };
    nextDirectionRef.current = { x: 0, y: 0 };
    foodRef.current = generateFood();
    gameOverRef.current = false;
    pausedRef.current = false;
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setHasStarted(false);
    onScoreChange(0);
  }, [generateFood, onScoreChange]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas - pure black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid - harsh cyan lines
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Draw food - solid magenta block
    ctx.fillStyle = '#ff00ff';
    // Glitch effect on food occasionally
    if (Math.random() > 0.9) {
      ctx.fillRect(foodRef.current.x * CELL_SIZE - 2, foodRef.current.y * CELL_SIZE, CELL_SIZE + 4, CELL_SIZE);
    } else {
      ctx.fillRect(foodRef.current.x * CELL_SIZE, foodRef.current.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    // Draw snake - solid cyan blocks
    snakeRef.current.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#ffffff'; // Head is white
      } else {
        // Alternating cyan and magenta for a glitchy look, or just stark cyan
        ctx.fillStyle = index % 2 === 0 ? '#00ffff' : '#00cccc';
      }
      
      // Draw solid block with a tiny gap for pixel art feel
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  }, []);

  const update = useCallback(() => {
    if (gameOverRef.current || pausedRef.current || (directionRef.current.x === 0 && directionRef.current.y === 0)) return;

    directionRef.current = nextDirectionRef.current;
    const head = snakeRef.current[0];
    const newHead = {
      x: head.x + directionRef.current.x,
      y: head.y + directionRef.current.y,
    };

    // Check wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      gameOverRef.current = true;
      setGameOver(true);
      return;
    }

    // Check self collision
    if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      gameOverRef.current = true;
      setGameOver(true);
      return;
    }

    snakeRef.current.unshift(newHead);

    // Check food collision
    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      onScoreChange(scoreRef.current);
      foodRef.current = generateFood();
      speedRef.current = Math.max(30, speedRef.current - 2);
    } else {
      snakeRef.current.pop();
    }
  }, [generateFood, onScoreChange]);

  const gameLoop = useCallback((currentTime: number) => {
    if (requestRef.current !== undefined) {
      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current);
      if (secondsSinceLastRender >= speedRef.current) {
        update();
        draw();
        lastRenderTimeRef.current = currentTime;
      }
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOverRef.current) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      if (e.key === ' ' || e.key === 'Escape') {
        pausedRef.current = !pausedRef.current;
        setIsPaused(pausedRef.current);
        return;
      }

      if (pausedRef.current) return;

      if (!hasStarted) {
        setHasStarted(true);
      }

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame, hasStarted]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="mb-2 flex justify-between w-full max-w-[400px] px-2 border-b-2 border-cyan-glitch pb-2">
        <div className="text-cyan-glitch font-pixel text-sm">
          SYS_SCORE: {score.toString().padStart(4, '0')}
        </div>
        <div className="text-magenta-glitch font-pixel text-sm animate-pulse">
          {isPaused ? 'HALTED' : 'EXEC_SNAKE'}
        </div>
      </div>
      
      <div className="relative p-2 bg-black border-4 border-cyan-glitch glitch-border mt-4">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black block"
        />
        
        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-magenta-glitch font-pixel text-sm mb-4 glitch-text text-center leading-loose" data-text="AWAITING_INPUT">
              AWAITING_INPUT
            </p>
            <p className="text-cyan-glitch font-terminal text-xl animate-pulse">
              [PRESS ARROW KEYS]
            </p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center border-4 border-magenta-glitch">
            <h2 className="text-2xl font-pixel text-magenta-glitch mb-4 glitch-text text-center" data-text="CRITICAL_FAILURE">
              CRITICAL_FAILURE
            </h2>
            <p className="text-white font-pixel text-sm mb-8">
              DATA_LOST: {score}
            </p>
            <button
              onClick={resetGame}
              className="px-4 py-3 bg-magenta-glitch text-black font-pixel text-xs hover:bg-cyan-glitch hover:text-black transition-colors uppercase"
            >
              REBOOT_SYSTEM
            </button>
          </div>
        )}

        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <h2 className="text-2xl font-pixel text-cyan-glitch glitch-text" data-text="PROCESS_SUSPENDED">
              PROCESS_SUSPENDED
            </h2>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex gap-4 text-cyan-glitch font-terminal text-xl">
        <div className="flex items-center gap-2">
          <span>INPUT_VECTORS:</span>
          <kbd className="px-2 bg-magenta-glitch text-black">W A S D</kbd>
          <span>||</span>
          <kbd className="px-2 bg-cyan-glitch text-black">ARROWS</kbd>
        </div>
      </div>
    </div>
  );
}
