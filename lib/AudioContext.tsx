"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Segment, Selection, decodeAudioFile, generateId } from "./audio";

interface AudioContextType {
    audioSource: { file: File | null; url: string | null; peaks: number[]; duration: number };
    isPlaying: boolean;
    segments: Segment[];
    selection: Selection | null;
    pendingSel: Selection | null;
    loading: boolean;
    loadError: string | null;
    errorMsg: string | null;
    exported: boolean;
    audioRef: React.RefObject<HTMLAudioElement | null>;

    handleFile: (file: File) => Promise<void>;
    handleSample: () => Promise<void>;
    togglePlay: () => void;
    seekTo: (t: number) => void;
    stopPlayback: () => void;
    resetAll: () => void;
    addSegment: (data: { speakerID: string; text: string }) => void;
    deleteSegment: (id: string) => void;
    clearAllSegments: () => void;
    setSelection: (s: Selection | null) => void;
    commitDrag: (endT: number, startT?: number) => void;
    handleExport: () => void;
    closeModal: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [audioSource, setAudioSource] = useState<{ file: File | null; url: string | null; peaks: number[]; duration: number }>({ file: null, url: null, peaks: [], duration: 0 });
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [selection, setSelection] = useState<Selection | null>(null);
    const [pendingSel, setPendingSel] = useState<Selection | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [exported, setExported] = useState(false);
    const [playRequested, setPlayRequested] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const audioUrlRef = useRef<string | null>(null);

    const stopPlayback = useCallback(() => {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
    }, []);

    const resetAll = useCallback(() => {
        stopPlayback();
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
        setAudioSource({ file: null, url: null, peaks: [], duration: 0 });
        setSegments([]); setSelection(null); setPendingSel(null);
        setLoadError(null); setPlayRequested(false);
    }, [stopPlayback]);

    useEffect(() => () => resetAll(), [resetAll]);
    useEffect(() => { if (errorMsg) { const t = setTimeout(() => setErrorMsg(null), 2000); return () => clearTimeout(t); } }, [errorMsg]);

    const handleFile = async (file: File) => {
        resetAll(); setLoading(true);
        try {
            const url = URL.createObjectURL(file);
            audioUrlRef.current = url;
            const { peaks, duration } = await decodeAudioFile(file, 900);
            setAudioSource({ file, url, peaks, duration });
        } catch (err) {
            setLoadError("Could not decode audio. Try a different file.");
            console.error(err);
        } finally { setLoading(false); }
    };

    const handleSample = async () => {
        setLoading(true);
        try {
            const blob = await (await fetch("/sample.mp3")).blob();
            await handleFile(new File([blob], "sample.mp3", { type: "audio/mpeg" }));
        } catch { setLoadError("Could not load sample audio."); setLoading(false); }
    };

    useEffect(() => {
        if (!playRequested || !audioRef.current || !audioUrlRef.current) return;
        setPlayRequested(false);
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => { console.error(e); setIsPlaying(false); });
    }, [playRequested]);

    const togglePlay = useCallback(() => {
        if (!audioRef.current || !audioUrlRef.current) return;
        isPlaying ? stopPlayback() : setPlayRequested(true);
    }, [isPlaying, stopPlayback]);

    const seekTo = useCallback((t: number) => {
        const clamped = Math.max(0, Math.min(t, audioSource.duration));
        if (audioRef.current) audioRef.current.currentTime = clamped;
    }, [audioSource.duration]);

    const commitDrag = useCallback((endT: number, startT?: number) => {
        const start = startT ?? 0;
        const [s, e] = [Math.min(start, endT), Math.max(start, endT)];
        if (e - s < 0.08) { seekTo(s); setSelection(null); }
        else if (segments.some((seg) => s < seg.endTime && e > seg.startTime)) { setErrorMsg("OVERLAP DETECTED"); setSelection(null); }
        else { stopPlayback(); setPendingSel({ startTime: s, endTime: e }); setSelection({ startTime: s, endTime: e }); }
    }, [seekTo, stopPlayback, segments]);

    const addSegment = useCallback(({ speakerID, text }: { speakerID: string; text: string }) => {
        if (!pendingSel) return;
        const seg: Segment = { id: generateId(), startTime: parseFloat(pendingSel.startTime.toFixed(3)), endTime: parseFloat(pendingSel.endTime.toFixed(3)), speakerID, text: text.trim() };
        setSegments((segs) => [...segs, seg].sort((a, b) => a.startTime - b.startTime));
        setPendingSel(null); setSelection(null); setPlayRequested(true);
    }, [pendingSel]);

    const deleteSegment = (id: string) => setSegments(p => p.filter(s => s.id !== id));
    const clearAllSegments = () => setSegments([]);

    const handleExport = () => {
        const data = JSON.stringify(segments.map(s => ({ ...s, duration: parseFloat((s.endTime - s.startTime).toFixed(3)) })), null, 2);
        console.log(data);
        navigator.clipboard.writeText(data);
        setExported(true); setTimeout(() => setExported(false), 2000);
    };

    const value = {
        audioSource, isPlaying, segments, selection, pendingSel, loading, loadError, errorMsg, exported, audioRef,
        handleFile, handleSample, togglePlay, seekTo, stopPlayback, resetAll, addSegment, deleteSegment, clearAllSegments, setSelection, commitDrag, handleExport,
        closeModal: () => { setPendingSel(null); setSelection(null); setPlayRequested(true); }
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error("useAudio must be used within an AudioProvider");
    return context;
};
