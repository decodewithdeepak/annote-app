"use client";

import { useRef, useCallback, useEffect } from "react";
import { SPEAKER_COLORS, Segment, Selection } from "@/lib/audio";

interface WaveformCanvasProps {
  peaks: number[];
  duration: number;
  currentTime: number;
  segments: Segment[];
  selection: Selection | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export default function WaveformCanvas({
  peaks,
  duration,
  currentTime,
  segments,
  selection,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({ peaks, duration, currentTime, segments, selection });
  stateRef.current = { peaks, duration, currentTime, segments, selection };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { peaks, duration, currentTime, segments, selection } =
      stateRef.current;
    const W = canvas.width,
      H = canvas.height,
      mid = H / 2;
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) { ctx.moveTo((i / 10) * W, 0); ctx.lineTo((i / 10) * W, H); }
    ctx.moveTo(0, mid);
    ctx.lineTo(W, mid);
    ctx.stroke();

    // Saved segment overlays
    segments.forEach((seg) => {
      const x1 = (seg.startTime / duration) * W,
        x2 = (seg.endTime / duration) * W;
      const col = SPEAKER_COLORS[seg.speakerID] || "#00d4aa";
      ctx.fillStyle = col + "20";
      ctx.fillRect(x1, 0, x2 - x1, H);
      ctx.strokeStyle = col + "70";
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, 0, x2 - x1, H);
      ctx.fillStyle = col;
      ctx.font = "bold 9px monospace";
      ctx.fillText(seg.speakerID.replace("Speaker ", "Spk "), x1 + 4, 13);
    });

    // Active drag selection
    if (selection?.startTime != null && selection?.endTime != null) {
      const x1 =
        (Math.min(selection.startTime, selection.endTime) / duration) * W;
      const x2 =
        (Math.max(selection.startTime, selection.endTime) / duration) * W;
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(x1, 0, x2 - x1, H);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x1, 0, x2 - x1, H);
      ctx.setLineDash([]);
    }

    // Waveform bars
    const barW = W / peaks.length;
    const playedX = duration > 0 ? (currentTime / duration) * W : 0;
    for (let i = 0; i < peaks.length; i++) {
      const x = i * barW,
        barH = peaks[i] * mid * 0.92;
      const t = (x / W) * duration;
      const seg = segments.find((s) => t >= s.startTime && t <= s.endTime);
      const col = seg ? SPEAKER_COLORS[seg.speakerID] : null;
      const played = x < playedX;
      ctx.fillStyle = played
        ? col
          ? col + "ee"
          : "#00d4aa"
        : col
          ? col + "77"
          : "rgba(255,255,255,0.32)";
      ctx.fillRect(x, mid - barH, Math.max(barW - 0.6, 0.6), barH * 2);
    }

    // Playhead
    if (duration > 0) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playedX, 0);
      ctx.lineTo(playedX, H);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(playedX - 5, 0);
      ctx.lineTo(playedX + 5, 0);
      ctx.lineTo(playedX, 8);
      ctx.closePath();
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (w && h) { canvas.width = w * dpr; canvas.height = h * dpr; }
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "crosshair",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}
