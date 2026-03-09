interface AppHeaderProps {
  fileName?: string;
  hasAudio: boolean;
  onReset: () => void;
  segmentCount: number;
  onExport: () => void;
  exported: boolean;
}

export default function AppHeader({
  fileName,
  hasAudio,
  onReset,
  segmentCount,
  onExport,
  exported,
}: AppHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-7 py-3">
      <div className="flex items-center gap-3">
        <span className="text-lg text-emerald-400">◈</span>
        <span className="text-xs font-bold tracking-[0.3em] text-white">
          WAVEMARK
        </span>
        <span className="text-xs tracking-wide text-white/30">
          Audio Annotation Studio
        </span>
      </div>

      <div className="flex items-center gap-3">
        {hasAudio && (
          <>
            <span className="max-w-50 truncate text-xs text-white/35">
              {fileName}
            </span>
            <button
              type="button"
              className="cursor-pointer rounded border border-white/15 bg-transparent px-3 py-1 text-xs tracking-[0.25em] text-white/40"
              onClick={onReset}
            >
              CHANGE FILE
            </button>
          </>
        )}

        {segmentCount > 0 && (
          <>
            <span className="text-xs tracking-[0.25em] text-white/30">
              {segmentCount} SEG
            </span>
            <button
              type="button"
              className={`cursor-pointer rounded border px-4 py-1 text-xs tracking-[0.25em] ${exported
                ? "border-white/30 text-white/50"
                : "border-emerald-400/40 text-emerald-400"
                }`}
              onClick={onExport}
            >
              {exported ? "✓ EXPORTED" : "EXPORT JSON"}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
