"use client";

import { useRef, useCallback, useEffect } from "react";
import { SPEAKER_COLORS } from "@/lib/audio";
import { useAudio } from "@/lib/AudioContext";

interface WaveformCanvasProps {
  onSelectionStart: (t: number) => void;
  onSelectionEnd: (t: number) => void;
}

export default function WaveformCanvas({ onSelectionStart, onSelectionEnd }: WaveformCanvasProps) {
  const { audioSource, segments, selection, setSelection, audioRef, isPlaying } = useAudio();
  const { peaks, duration } = audioSource;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastSyncRef = useRef({ time: 0, stamp: 0 });
  const stateRef = useRef({ peaks, duration, segments, selection, isPlaying });
  stateRef.current = { peaks, duration, segments, selection, isPlaying };

  const draw = useCallback(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext("2d"), audio = audioRef.current;
    if (!canvas || !ctx || !audio) return;

    const getTimeAt = (e: React.MouseEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return (Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width) * stateRef.current.duration;
    };

    const { peaks, duration, segments, selection, isPlaying } = stateRef.current;
    let frameTime = audio.currentTime;
    const now = performance.now();

    if (isPlaying && !audio.paused) {
      if (frameTime !== lastSyncRef.current.time) lastSyncRef.current = { time: frameTime, stamp: now };
      else if (lastSyncRef.current.stamp > 0) {
        const delta = (now - lastSyncRef.current.stamp) / 1000;
        if (delta < 0.2) frameTime += delta;
      }
    } else lastSyncRef.current = { time: frameTime, stamp: isPlaying ? now : 0 };

    const W = canvas.width, H = canvas.height, mid = H / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i <= 10; i++) { ctx.moveTo((i / 10) * W, 0); ctx.lineTo((i / 10) * W, H); }
    ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
    if (duration <= 0) { rafRef.current = requestAnimationFrame(draw); return; }

    segments.forEach((s) => {
      const x1 = (s.startTime / duration) * W, x2 = (s.endTime / duration) * W, c = SPEAKER_COLORS[s.speakerID] || "#38bdf8";
      ctx.fillStyle = c + "33"; ctx.fillRect(x1, 0, x2 - x1, H);
      ctx.strokeStyle = c + "90"; ctx.strokeRect(x1, 0, x2 - x1, H);
    });

    const barW = W / peaks.length, pX = (frameTime / duration) * W;
    for (let i = 0; i < peaks.length; i++) {
      const x = i * barW, bH = peaks[i] * mid * 0.9, t = (x / W) * duration;
      const s = segments.find(seg => t >= seg.startTime && t <= seg.endTime), c = s ? SPEAKER_COLORS[s.speakerID] : null;
      ctx.fillStyle = x < pX ? (c ? c + "ee" : "#34d399") : (c ? c + "77" : "rgba(255,255,255,0.32)");
      ctx.fillRect(x, mid - bH, Math.max(barW - 0.5, 0.5), bH * 2);
    }

    if (selection) {
      const x1 = (Math.min(selection.startTime, selection.endTime) / duration) * W, x2 = (Math.max(selection.startTime, selection.endTime) / duration) * W;
      ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(x1, 0, x2 - x1, H);
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.setLineDash([4, 3]); ctx.strokeRect(x1, 0, x2 - x1, H); ctx.setLineDash([]);
    }

    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pX, 0); ctx.lineTo(pX, H); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(pX - 5, 0); ctx.lineTo(pX + 5, 0); ctx.lineTo(pX, 8); ctx.closePath(); ctx.fill();
    rafRef.current = requestAnimationFrame(draw);
  }, [audioRef, peaks]);

  useEffect(() => {
    const c = canvasRef.current, drawLoop = () => { rafRef.current = requestAnimationFrame(draw); };
    const ro = new ResizeObserver(() => {
      if (c?.offsetWidth && c?.offsetHeight) { c.width = c.offsetWidth * window.devicePixelRatio; c.height = c.offsetHeight * window.devicePixelRatio; }
    });
    if (c) ro.observe(c);
    drawLoop();
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [draw]);

  return (
    <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair"
      onMouseDown={(e) => {
        if (e.button === 0) {
          const t = ((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width) * stateRef.current.duration;
          onSelectionStart(t); setSelection({ startTime: t, endTime: t });
        }
      }}
      onMouseMove={(e) => {
        if (stateRef.current.selection) {
          const t = ((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width) * stateRef.current.duration;
          setSelection({ ...stateRef.current.selection, endTime: t });
        }
      }}
      onMouseUp={(e) => {
        const t = ((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width) * stateRef.current.duration;
        onSelectionEnd(t);
      }}
    />
  );
}
