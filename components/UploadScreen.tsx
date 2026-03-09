"use client";

import { useRef, useState } from "react";

interface UploadScreenProps {
  onFile: (file: File) => void;
  onSample: () => void;
}

export default function UploadScreen({ onFile, onSample }: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("audio/")) onFile(f);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg px-20 py-14 text-center transition-all
        border-[1.5px] border-dashed
        ${over
            ? "border-emerald-400/10 bg-emerald-400/5"
            : "border-white/10 bg-white/5"
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <span className="mb-1 text-4xl text-emerald-400">◈</span>

        <span className="text-base font-bold tracking-[0.3em] text-white">
          DROP AUDIO FILE
        </span>

        <span className="text-xs tracking-wide text-white/30">
          or click to browse · MP3, WAV, M4A, OGG, FLAC
        </span>

        <button
          className="mt-2 rounded border border-emerald-400/50 bg-emerald-400/10 px-7 py-2 text-xs tracking-[0.25em] text-emerald-400"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          CHOOSE FILE
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />

        <span
          className="mt-1 cursor-pointer text-xs text-white/30 underline underline-offset-4"
          onClick={(e) => {
            e.stopPropagation();
            onSample();
          }}
        >
          or try with sample audio
        </span>
      </div>
    </div>
  );
}
