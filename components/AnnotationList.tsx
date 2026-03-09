import { Segment } from "@/lib/audio";
import SegmentRow from "./SegmentRow";

interface AnnotationListProps {
  segments: Segment[];
  onDelete: (id: string) => void;
  onSeek: (t: number) => void;
  onClearAll: () => void;
  onExport: () => void;
  exported: boolean;
}

export default function AnnotationList({
  segments,
  onDelete,
  onSeek,
  onClearAll,
  onExport,
  exported,
}: AnnotationListProps) {
  const hasSegments = segments.length > 0;

  return (
    <section className="flex flex-1 flex-col px-4 sm:px-7 pb-7">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 py-3">
        <span className="text-xs tracking-[0.25em] text-white/35">
          ANNOTATIONS
        </span>
        <div className="flex items-center gap-3">
          {hasSegments && (
            <>
              <button
                type="button"
                className="cursor-pointer rounded border border-red-400/30 bg-transparent px-2 py-1 text-xs tracking-[0.25em] text-red-400/70 transition-all hover:bg-red-400/10 hover:text-red-400 active:scale-95"
                onClick={onClearAll}
              >
                CLEAR ALL
              </button>
              <button
                type="button"
                className={`flex items-center gap-2 cursor-pointer rounded border px-3 py-1 text-[10px] tracking-[0.25em] sm:text-xs transition-all active:scale-95 ${exported
                  ? "border-white/30 text-white/50"
                  : "border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/5 hover:border-emerald-400/60"
                  }`}
                onClick={onExport}
              >
                <span>{exported ? "✓ COPIED" : "EXPORT"}</span>
                {!exported && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400/20 text-[8px] font-bold tracking-normal text-emerald-400 ring-1 ring-emerald-400/30">
                    {segments.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {hasSegments ? (
        <div className="flex flex-col gap-2">
          {segments.map((seg, i) => (
            <SegmentRow
              key={seg.id}
              seg={seg}
              index={i}
              onDelete={onDelete}
              onSeek={onSeek}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-white/20">
          <span className="text-xs tracking-wide">
            No annotations yet. Drag across the waveform to mark a segment.
          </span>
        </div>
      )}
    </section>
  );
}
