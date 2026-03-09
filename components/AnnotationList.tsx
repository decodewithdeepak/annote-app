import { Segment } from "@/lib/audio";
import SegmentRow from "./SegmentRow";

interface AnnotationListProps {
  segments: Segment[];
  onDelete: (id: string) => void;
  onSeek: (t: number) => void;
  onClearAll: () => void;
}

export default function AnnotationList({
  segments,
  onDelete,
  onSeek,
  onClearAll,
}: AnnotationListProps) {
  const hasSegments = segments.length > 0;

  return (
    <section className="flex flex-1 flex-col px-7 pb-7">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 py-3">
        <span className="text-xs tracking-[0.25em] text-white/35">
          ANNOTATIONS
        </span>
        {hasSegments && (
          <button
            type="button"
            className="cursor-pointer rounded border border-red-400/30 bg-transparent px-2 py-1 text-xs tracking-[0.25em] text-red-400/70"
            onClick={onClearAll}
          >
            CLEAR ALL
          </button>
        )}
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
