"use client";

import { useState } from "react";
import { SPEAKER_COLORS, SPEAKER_OPTIONS, formatTime } from "@/lib/audio";
import { useAudio } from "@/lib/AudioContext";

export default function AnnotationModal() {
  const { pendingSel, addSegment, closeModal } = useAudio();
  const [speakerID, setSpeakerID] = useState<string | null>(null);
  const [text, setText] = useState("");

  if (!pendingSel) return null;
  const { startTime: start, endTime: end } = pendingSel;

  const handleSave = () => text.trim() && speakerID && addSegment({ speakerID, text: text.trim() });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="w-full overflow-hidden rounded-t-xl border-x border-t border-white/10 bg-[#12121a] shadow-2xl sm:w-96 sm:rounded-lg sm:border-b">
        <div className="flex items-center justify-between bg-white/[0.03] px-5 py-3 border-b border-white/10">
          <span className="text-xs tracking-[0.3em] text-white/45">NEW SEGMENT</span>
          <span className="text-xs tracking-wide text-white">
            {formatTime(start)} → {formatTime(end)}
            <span className="ml-2 text-white/35">{(end - start).toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 pb-8 sm:pb-4">
          <label className="text-xs tracking-[0.3em] text-white/30">TRANSCRIPTION SNIPPET</label>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave(); if (e.key === "Escape") closeModal(); }}
            placeholder="Words spoken in this segment..."
            className="w-full resize-none rounded border border-white/10 bg-white/[0.05] p-3 text-sm leading-relaxed text-[#e8e8e8] outline-none sm:resize-y sm:text-xs min-h-[90px]"
          />
          <span className="hidden text-xs text-white/30 sm:block">⌘↵ save · Esc discard</span>

          <label className="text-xs tracking-[0.3em] text-white/30">SPEAKER ID</label>
          <div className="grid grid-cols-2 gap-2">
            {SPEAKER_OPTIONS.map((s) => {
              const col = SPEAKER_COLORS[s];
              const active = speakerID === s;
              return (
                <button
                  key={s}
                  type="button"
                  className="flex cursor-pointer items-center rounded border px-3 py-2 text-xs tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ borderColor: active ? col : "rgba(255,255,255,0.1)", color: active ? col : "rgba(255,255,255,0.45)", backgroundColor: active ? `${col}14` : "transparent" }}
                  onClick={() => setSpeakerID(s)}
                >
                  <span className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: col }} />
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-3 pb-10 sm:pb-3">
          <button
            type="button"
            className="cursor-pointer rounded border border-white/10 bg-transparent px-4 py-2 text-sm tracking-[0.25em] text-white/40 transition-all hover:bg-white/5 hover:text-white/60 active:scale-95 sm:text-xs"
            onClick={closeModal}
          >
            DISCARD
          </button>
          <button
            type="button"
            className="cursor-pointer rounded border px-4 py-2 text-xs font-bold tracking-[0.25em] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed"
            disabled={!text.trim() || !speakerID}
            style={{
              borderColor: speakerID ? SPEAKER_COLORS[speakerID] : "rgba(255,255,255,0.1)",
              color: speakerID ? SPEAKER_COLORS[speakerID] : "rgba(255,255,255,0.2)",
              opacity: (text.trim() && speakerID) ? 1 : 0.4
            }}
            onClick={handleSave}
          >
            SAVE SEGMENT
          </button>
        </div>
      </div>
    </div>
  );
}
