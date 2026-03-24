import { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [highScore, setHighScore] = useState(0);

  const handleScoreChange = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <div className="min-h-screen bg-black text-cyan-glitch font-terminal selection:bg-magenta-glitch selection:text-black overflow-hidden relative crt-flicker">
      <div className="scanlines"></div>
      <div className="static-noise"></div>
      
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center relative z-10">
        
        <header className="w-full max-w-5xl flex justify-between items-start mb-12 border-b-4 border-magenta-glitch pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-pixel text-white glitch-text" data-text="SYS.CORE_OVERRIDE">
              SYS.CORE_OVERRIDE
            </h1>
            <p className="text-magenta-glitch font-terminal text-xl tracking-widest mt-2 uppercase">
              [MODULE_01: SNAKE_PROTOCOL] // [MODULE_02: AUDIO_STREAM]
            </p>
          </div>
          
          <div className="hidden md:flex flex-col items-end border-l-2 border-cyan-glitch pl-4">
            <span className="text-cyan-glitch font-pixel text-xs uppercase animate-pulse">MAX_SYS_SCORE</span>
            <span className="text-3xl font-pixel text-magenta-glitch mt-2">
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
        </header>

        <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left/Top side: Music Player */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end order-2 lg:order-1 w-full">
            <MusicPlayer />
          </div>

          {/* Right/Center side: Snake Game */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start order-1 lg:order-2 w-full">
            <SnakeGame onScoreChange={handleScoreChange} />
          </div>

        </main>
        
        <footer className="absolute bottom-4 text-center w-full text-magenta-glitch font-pixel text-[10px] uppercase tracking-widest">
          <span className="glitch-text" data-text="CONNECTION_ESTABLISHED // SECURE_CHANNEL">CONNECTION_ESTABLISHED // SECURE_CHANNEL</span>
        </footer>
      </div>
    </div>
  );
}
