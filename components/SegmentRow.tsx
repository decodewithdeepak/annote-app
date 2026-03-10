"use client";

import { SPEAKER_COLORS, formatTime, Segment } from "@/lib/audio";
import { useAudio } from "@/lib/AudioContext";

interface SegmentRowProps {
  seg: Segment;
  index: number;
}

export default function SegmentRow({ seg, index }: SegmentRowProps) {
  const { deleteSegment, seekTo } = useAudio();
  const col = SPEAKER_COLORS[seg.speakerID] || "#38bdf8";

  return (
    <div className="relative flex flex-col items-stretch gap-2 rounded-r border border-white/10 bg-white/10 px-3 py-2 sm:flex-row sm:items-start border-l-[2.5px]" style={{ borderLeftColor: col }}>
      <div className="flex shrink-0 items-center justify-between gap-2 pr-6 sm:justify-start sm:pr-0">
        <div className="flex items-center gap-2">
          <span className="min-w-7 text-xs font-bold" style={{ color: col }}>#{String(index + 1).padStart(2, "0")}</span>
          <span className="text-xs font-semibold tracking-wide" style={{ color: col }}>{seg.speakerID}</span>
        </div>
        <span className="flex items-center gap-1 text-xs sm:ml-2">
          <button className="cursor-pointer bg-transparent px-1 text-xs text-white/40 transition-colors hover:text-white/80" onClick={() => seekTo(seg.startTime)}>{formatTime(seg.startTime)}</button>
          <span className="text-[10px] text-white/20">→</span>
          <button className="cursor-pointer bg-transparent px-1 text-xs text-white/40 transition-colors hover:text-white/80" onClick={() => seekTo(seg.endTime)}>{formatTime(seg.endTime)}</button>
          <span className="ml-1 hidden text-xs text-white/25 sm:inline">{(seg.endTime - seg.startTime).toFixed(2)}s</span>
        </span>
      </div>
      <div className="flex-1 text-xs leading-relaxed text-white/70 sm:mt-0">{seg.text}</div>
      <button
        className="absolute right-2 top-2 shrink-0 cursor-pointer bg-transparent px-1 text-xs text-white/10 transition-all hover:scale-110 hover:text-red-400 active:scale-90 sm:static"
        onClick={() => deleteSegment(seg.id)}
      >
        ✕
      </button>
    </div>
  );
}
