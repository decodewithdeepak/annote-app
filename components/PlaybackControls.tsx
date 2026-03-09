import { formatTime } from "@/lib/audio";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (t: number) => void;
}

export default function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
}: PlaybackControlsProps) {
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-3">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10 text-sm text-emerald-400 transition-all hover:scale-110 hover:bg-emerald-400/20 active:scale-90"
        onClick={onTogglePlay}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      <span className="flex shrink-0 items-baseline gap-1">
        <span className="text-sm font-semibold text-white">
          {formatTime(currentTime)}
        </span>
        <span className="text-xs text-white/25">/</span>
        <span className="text-xs text-white/35">
          {formatTime(duration)}
        </span>
      </span>

      <div
        className="flex-1 cursor-pointer overflow-hidden rounded bg-white/10"
        style={{ height: 3 }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - r.left) / r.width) * duration);
        }}
      >
        <div
          className="h-full rounded bg-emerald-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="hidden sm:inline shrink-0 text-xs text-white/20">
        DRAG to annotate · click to seek
      </span>
    </div>
  );
}
