"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Segment,
  Selection,
  formatTime,
  generateId,
  decodeAudioFile,
} from "@/lib/audio";
import WaveformCanvas from "@/components/WaveformCanvas";
import UploadScreen from "@/components/UploadScreen";
import AnnotationModal from "@/components/AnnotationModal";
import AppHeader from "@/components/AppHeader";
import PlaybackControls from "@/components/PlaybackControls";
import AnnotationList from "@/components/AnnotationList";

export default function AudioAnnotator() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pendingSel, setPendingSel] = useState<Selection | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const [playRequested, setPlayRequested] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);
  const waveWrapRef = useRef<HTMLDivElement>(null);
  const rafSyncRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<number | null>(null);

  const startRafSync = useCallback(() => {
    cancelAnimationFrame(rafSyncRef.current);
    const sync = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
      rafSyncRef.current = requestAnimationFrame(sync);
    };
    rafSyncRef.current = requestAnimationFrame(sync);
  }, []);

  const stopPlayback = useCallback(() => {
    cancelAnimationFrame(rafSyncRef.current);
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const resetAll = useCallback(() => {
    stopPlayback();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioFile(null);
    setAudioUrl(null);
    setPeaks([]);
    setDuration(0);
    setSegments([]);
    setSelection(null);
    setPendingSel(null);
    setCurrentTime(0);
    setLoadError(null);
    setPlayRequested(false);
  }, [stopPlayback]);

  useEffect(() => () => resetAll(), [resetAll]);

  const handleFile = async (file: File) => {
    resetAll();
    setLoading(true);
    try {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      audioUrlRef.current = url;
      setAudioFile(file);
      const { peaks: p, duration: d } = await decodeAudioFile(file, 900);
      setPeaks(p);
      setDuration(d);
    } catch (err) {
      resetAll();
      setLoadError("Could not decode audio. Try a different file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSample = async () => {
    setLoading(true);
    try {
      const blob = await (await fetch("/sample.mp3")).blob();
      await handleFile(new File([blob], "sample.mp3", { type: "audio/mpeg" }));
    } catch {
      setLoadError("Could not load sample audio.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!playRequested) return;
    const audio = audioRef.current;
    if (!audio || !audioUrlRef.current) return;
    setPlayRequested(false);
    audio.play().then(() => {
      setIsPlaying(true);
      startRafSync();
    }).catch(err => {
      console.error("Playback failed:", err);
      setIsPlaying(false);
    });
  }, [playRequested, startRafSync]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrlRef.current) return;
    if (isPlaying) {
      stopPlayback();
    } else {
      setPlayRequested(true);
    }
  }, [isPlaying, stopPlayback]);

  const seekTo = useCallback((t: number) => {
    const clamped = Math.max(0, Math.min(t, duration));
    if (audioRef.current) audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const getTimeAt = useCallback((e: React.MouseEvent) => {
    const wrap = waveWrapRef.current;
    if (!wrap || !duration) return 0;
    const rect = wrap.getBoundingClientRect();
    return (Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width) * duration;
  }, [duration]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const t = getTimeAt(e);
    isDraggingRef.current = true;
    dragStartRef.current = t;
    setSelection({ startTime: t, endTime: t });
  }, [getTimeAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    setSelection({ startTime: dragStartRef.current!, endTime: getTimeAt(e) });
  }, [getTimeAt]);

  const commitDrag = useCallback((endT: number) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const ds = dragStartRef.current;
    dragStartRef.current = null;
    if (ds === null) return;
    const [start, end] = [Math.min(ds, endT), Math.max(ds, endT)];
    if (end - start < 0.08) {
      seekTo(start);
      setSelection(null);
    } else if (segments.some((s) => start < s.endTime && end > s.startTime)) {
      setErrorMsg("OVERLAP DETECTED");
      setTimeout(() => setErrorMsg(null), 2000);
      setSelection(null);
    } else {
      stopPlayback();
      setPendingSel({ startTime: start, endTime: end });
      setSelection({ startTime: start, endTime: end });
    }
  }, [seekTo, stopPlayback, segments]);



  const handleSave = useCallback(({ speakerID, text }: { speakerID: string; text: string }) => {
    if (!pendingSel) return;
    const seg: Segment = {
      id: generateId(),
      startTime: parseFloat(pendingSel.startTime.toFixed(3)),
      endTime: parseFloat(pendingSel.endTime.toFixed(3)),
      speakerID,
      text: text.trim(),
    };
    setSegments((segs) => [...segs, seg].sort((a, b) => a.startTime - b.startTime));
    setPendingSel(null);
    setSelection(null);
    setPlayRequested(true);
  }, [pendingSel]);

  const handleDiscard = useCallback(() => {
    setPendingSel(null);
    setSelection(null);
    setPlayRequested(true);
  }, []);

  const handleExport = () => {
    const data = JSON.stringify(segments.map(s => ({ ...s, duration: parseFloat((s.endTime - s.startTime).toFixed(3)) })), null, 2);
    console.log(data);
    navigator.clipboard.writeText(data).catch(err => console.error("Copy failed", err));
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const hasAudio = peaks.length > 0 && duration > 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#0a0a0f",
        color: "#e8e8e8",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        preload="auto"
        onEnded={() => { stopPlayback(); setCurrentTime(0); }}
        className="hidden"
      />

      <AppHeader
        fileName={audioFile?.name}
        hasAudio={hasAudio}
        onReset={resetAll}
        segmentCount={segments.length}
        onExport={handleExport}
        exported={exported}
      />

      {errorMsg && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-[100] px-4 py-1 bg-red-500/90 text-[10px] tracking-[0.3em] font-bold text-white rounded border border-red-400/50 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
          {errorMsg}
        </div>
      )}

      {!hasAudio && !loading && !loadError && (
        <UploadScreen onFile={handleFile} onSample={handleSample} />
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-3xl text-emerald-400">◈</span>
          <span className="text-xs tracking-widest text-white/35">DECODING AUDIO...</span>
        </div>
      )}

      {loadError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#ff6b6b]">
          <span className="text-sm">{loadError}</span>
          <button
            className="text-xs px-5 py-2 rounded cursor-pointer border border-[#ff6b6b66] bg-transparent"
            onClick={resetAll}
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {hasAudio && (
        <>
          <section className="px-4 sm:px-7 pt-5 shrink-0">
            <div className="relative mb-1" style={{ height: 18 }}>
              {Array.from({ length: 11 }, (_, i) => (
                <span
                  key={i}
                  className="absolute select-none"
                  style={{ left: `${(i / 10) * 100}%`, fontSize: 9, color: "rgba(255,255,255,0.22)", transform: "translateX(-50%)" }}
                >
                  {formatTime((i / 10) * duration)}
                </span>
              ))}
            </div>
            <div
              ref={waveWrapRef}
              className="overflow-hidden rounded"
              style={{ height: 140, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseLeave={(e) => { if (isDraggingRef.current) commitDrag(getTimeAt(e)); }}
            >
              <WaveformCanvas
                peaks={peaks}
                duration={duration}
                currentTime={currentTime}
                segments={segments}
                selection={selection}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={(e) => commitDrag(getTimeAt(e))}
              />
            </div>
            <PlaybackControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onTogglePlay={togglePlay}
              onSeek={seekTo}
            />
          </section>

          <AnnotationList
            segments={segments}
            onDelete={(id) => setSegments((p) => p.filter((s) => s.id !== id))}
            onSeek={seekTo}
            onClearAll={() => setSegments([])}
            onExport={handleExport}
            exported={exported}
          />
        </>
      )}

      {pendingSel && (
        <AnnotationModal
          selection={pendingSel}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      )}
    </div >
  );
}
