"use client";

import { useState } from "react";
import {
  SPEAKER_COLORS,
  SPEAKER_OPTIONS,
  formatTime,
  Selection,
} from "@/lib/audio";

interface AnnotationModalProps {
  selection: Selection;
  onSave: (data: { speakerID: string; text: string }) => void;
  onDiscard: () => void;
}

export default function AnnotationModal({
  selection,
  onSave,
  onDiscard,
}: AnnotationModalProps) {
  const [speakerID, setSpeakerID] = useState("Speaker A");
  const [text, setText] = useState("");

  const start = Math.min(selection.startTime, selection.endTime);
  const end = Math.max(selection.startTime, selection.endTime);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ speakerID, text: text.trim() });
  };

  const activeColor = SPEAKER_COLORS[speakerID];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-96 overflow-hidden rounded-lg border border-white/10 bg-[#12121a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/[0.03] px-5 py-3 border-b border-white/10">
          <span className="text-xs tracking-[0.3em] text-white/45">
            NEW SEGMENT
          </span>
          <span className="text-xs tracking-wide text-white">
            {formatTime(start)} → {formatTime(end)}
            <span className="ml-2 text-white/35">
              {(end - start).toFixed(2)}s
            </span>
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 px-5 py-4">
          <label className="text-xs tracking-[0.3em] text-white/30">
            SPEAKER ID
          </label>

          <div className="grid grid-cols-2 gap-2">
            {SPEAKER_OPTIONS.map((s) => {
              const col = SPEAKER_COLORS[s];
              const active = speakerID === s;
              return (
                <button
                  key={s}
                  type="button"
                  className="flex items-center rounded border px-3 py-2 text-xs tracking-wide transition-all"
                  style={{
                    borderColor: active ? col : "rgba(255,255,255,0.1)",
                    color: active ? col : "rgba(255,255,255,0.45)",
                    backgroundColor: active ? `${col}14` : "transparent",
                  }}
                  onClick={() => setSpeakerID(s)}
                >
                  <span
                    className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: col }}
                  />
                  {s}
                </button>
              );
            })}
          </div>

          <label className="text-xs tracking-[0.3em] text-white/30">
            TRANSCRIPTION SNIPPET
          </label>

          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave();
              if (e.key === "Escape") onDiscard();
            }}
            placeholder="Words spoken in this segment..."
            className="w-full resize-y rounded border border-white/10 bg-white/[0.05] p-3 text-xs leading-relaxed text-[#e8e8e8] outline-none"
            style={{ minHeight: 78 }}
          />

          <span className="text-xs text-white/30">
            ⌘↵ save · Esc discard
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-3">
          <button
            type="button"
            className="cursor-pointer rounded border border-white/10 bg-transparent px-4 py-2 text-xs tracking-[0.25em] text-white/40"
            onClick={onDiscard}
          >
            DISCARD
          </button>
          <button
            type="button"
            className="cursor-pointer rounded border px-4 py-2 text-xs font-bold tracking-[0.25em]"
            style={{
              borderColor: activeColor,
              color: activeColor,
              opacity: text.trim() ? 1 : 0.35,
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
