"use client";

import { useAudio } from "@/lib/AudioContext";
import { formatTime } from "@/lib/audio";
import WaveformCanvas from "@/components/WaveformCanvas";
import UploadScreen from "@/components/UploadScreen";
import AnnotationModal from "@/components/AnnotationModal";
import AppHeader from "@/components/AppHeader";
import PlaybackControls from "@/components/PlaybackControls";
import AnnotationList from "@/components/AnnotationList";
import { useRef, useCallback } from "react";

export default function AudioAnnotator() {
  const {
    audioSource, loading, loadError, segments, pendingSel, errorMsg, audioRef, resetAll, commitDrag, stopPlayback
  } = useAudio();

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<number | null>(null);

  const hasAudio = audioSource.peaks.length > 0 && audioSource.duration > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <audio
        ref={audioRef}
        src={audioSource.url ?? undefined}
        preload="auto"
        className="hidden"
        onEnded={() => { stopPlayback(); if (audioRef.current) audioRef.current.currentTime = 0; }}
      />

      <AppHeader />

      {errorMsg && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-[100] px-4 py-1 bg-red-500/90 text-[10px] tracking-[0.3em] font-bold text-white rounded border border-red-400/50 shadow-2xl backdrop-blur-sm">
          {errorMsg}
        </div>
      )}

      {!hasAudio && !loading && !loadError && <UploadScreen />}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-3xl text-emerald-400">◈</span>
          <span className="text-xs tracking-widest text-white/35">DECODING AUDIO...</span>
        </div>
      )}

      {loadError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#ff6b6b]">
          <span className="text-sm">{loadError}</span>
          <button className="text-xs px-5 py-2 rounded cursor-pointer border border-[#ff6b6b66] bg-transparent" onClick={resetAll}>TRY AGAIN</button>
        </div>
      )}

      {hasAudio && (
        <>
          <section className="px-4 sm:px-7 pt-5 shrink-0">
            <div className="relative mb-1" style={{ height: 18 }}>
              {Array.from({ length: 11 }, (_, i) => (
                <span key={i} className="absolute select-none -translate-x-1/2 text-[9px] text-white/25" style={{ left: `${(i / 10) * 100}%` }}>
                  {formatTime((i / 10) * audioSource.duration)}
                </span>
              ))}
            </div>
            <div className="overflow-hidden rounded h-[140px] bg-white/[0.025] border border-white/10">
              <WaveformCanvas
                onSelectionStart={(t: number) => { isDraggingRef.current = true; dragStartRef.current = t; }}
                onSelectionEnd={(t: number) => { if (isDraggingRef.current) { commitDrag(t, dragStartRef.current!); isDraggingRef.current = false; } }}
              />
            </div>
            <PlaybackControls />
          </section>
          <AnnotationList />
        </>
      )}

      {pendingSel && <AnnotationModal />}
    </div>
  );
}
