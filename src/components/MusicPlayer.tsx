import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: "0x01",
    title: "ERR_FILE_NOT_FOUND",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/glitch1/200/200?grayscale"
  },
  {
    id: "0x02",
    title: "BUFFER_OVERFLOW",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/glitch2/200/200?grayscale"
  },
  {
    id: "0x03",
    title: "KERNEL_PANIC",
    artist: "ROOTKIT",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/glitch3/200/200?grayscale"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  return (
    <div className="bg-black border-2 border-cyan-glitch p-6 w-full max-w-md flex flex-col items-center relative glitch-border">
      <div className="absolute top-0 left-0 bg-cyan-glitch text-black font-pixel text-[10px] px-2 py-1">
        AUDIO_STREAM_ACTIVE
      </div>
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />
      
      <div className="relative w-full h-40 mb-6 border-2 border-magenta-glitch overflow-hidden mt-4 group">
        <img 
          src={currentTrack.cover} 
          alt="Data Block" 
          className={`w-full h-full object-cover filter contrast-150 grayscale ${isPlaying ? 'animate-pulse' : ''}`} 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-cyan-glitch mix-blend-overlay opacity-50"></div>
        {isPlaying && (
          <div className="absolute inset-0 bg-magenta-glitch mix-blend-color opacity-30 animate-[flicker_0.2s_infinite]"></div>
        )}
        <div className="absolute bottom-2 right-2 bg-black text-cyan-glitch font-pixel text-[10px] px-1">
          ID: {currentTrack.id}
        </div>
      </div>

      <div className="text-left w-full mb-6 border-l-4 border-magenta-glitch pl-4">
        <h3 className="text-xl font-pixel text-white uppercase truncate">{currentTrack.title}</h3>
        <p className="text-cyan-glitch text-lg uppercase mt-2">AUTHOR: {currentTrack.artist}</p>
      </div>

      <div className="w-full bg-black h-4 border-2 border-cyan-glitch mb-6 relative">
        <div 
          className="h-full bg-magenta-glitch"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2JhKDAsMCwwLDAuNSkiLz4KPC9zdmc+')] opacity-50 pointer-events-none"></div>
      </div>

      <div className="flex items-center justify-between w-full px-4">
        <button 
          onClick={prevTrack}
          className="text-cyan-glitch hover:text-magenta-glitch hover:scale-110 transition-transform"
        >
          <SkipBack size={32} strokeWidth={1} />
        </button>
        
        <button 
          onClick={togglePlay}
          className="w-16 h-16 flex items-center justify-center bg-black border-2 border-cyan-glitch text-cyan-glitch hover:bg-cyan-glitch hover:text-black transition-colors"
        >
          {isPlaying ? <Pause size={32} strokeWidth={1} /> : <Play size={32} strokeWidth={1} className="ml-1" />}
        </button>
        
        <button 
          onClick={nextTrack}
          className="text-cyan-glitch hover:text-magenta-glitch hover:scale-110 transition-transform"
        >
          <SkipForward size={32} strokeWidth={1} />
        </button>
      </div>
    </div>
  );
}
