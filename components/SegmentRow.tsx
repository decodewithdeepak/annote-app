import { SPEAKER_COLORS, formatTime, Segment } from "@/lib/audio";

interface SegmentRowProps {
  seg: Segment;
  index: number;
  onDelete: (id: string) => void;
  onSeek: (t: number) => void;
}

export default function SegmentRow({
  seg,
  index,
  onDelete,
  onSeek,
}: SegmentRowProps) {
  const col = SPEAKER_COLORS[seg.speakerID] || "#00d4aa";

  return (
    <div
      className="flex items-start gap-2 rounded-r border border-white/10 bg-white/5 px-3 py-2"
      style={{
        borderLeftWidth: "2.5px",
        borderLeftColor: col,
      }}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span
          className="min-w-7 text-xs font-bold"
          style={{ color: col }}
        >
          #{String(index + 1).padStart(2, "0")}
        </span>

        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: col }}
        >
          {seg.speakerID}
        </span>

        <span className="flex items-center gap-1 text-xs">
          <button
            className="cursor-pointer bg-transparent px-1 text-xs text-white/40"
            onClick={() => onSeek(seg.startTime)}
          >
            {formatTime(seg.startTime)}
          </button>

          <span className="text-[10px] text-white/20">→</span>

          <button
            className="cursor-pointer bg-transparent px-1 text-xs text-white/40"
            onClick={() => onSeek(seg.endTime)}
          >
            {formatTime(seg.endTime)}
          </button>

          <span className="ml-1 text-xs text-white/25">
            {(seg.endTime - seg.startTime).toFixed(2)}s
          </span>
        </span>
      </div>

      <div className="flex-1 text-xs leading-relaxed text-white/70">
        {seg.text}
      </div>

      <button
        className="shrink-0 cursor-pointer bg-transparent px-1 text-xs text-white/15 hover:text-white/40"
        onClick={() => onDelete(seg.id)}
      >
        ✕
      </button>
    </div>
  );
}
