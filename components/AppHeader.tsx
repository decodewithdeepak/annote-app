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
    <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 sm:px-7">
      <div className="flex items-center gap-3">
        <span className="text-lg text-emerald-400">◈</span>
        <span className="text-xs font-bold tracking-[0.3em] text-white">
          WAVEMARK
        </span>
        <span className="hidden text-xs tracking-wide text-white/30 sm:inline">
          Audio Annotation Studio
        </span>
      </div>

      <div className="flex items-center gap-3">
        {hasAudio && (
          <>
            <span className="hidden max-w-50 truncate text-xs text-white/35 md:inline">
              {fileName}
            </span>
            <button
              type="button"
              className="cursor-pointer rounded border border-white/15 bg-transparent px-3 py-1 text-[10px] tracking-[0.25em] text-white/40 transition-all hover:bg-white/5 hover:text-white/60 active:scale-95 sm:text-xs"
              onClick={onReset}
            >
              CHANGE
            </button>
          </>
        )}
      </div>
    </header>
  );
}
