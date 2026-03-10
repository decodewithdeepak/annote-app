export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  speakerID: string;
  text: string;
}

export interface Selection {
  startTime: number;
  endTime: number;
}

export const SPEAKER_COLORS: Record<string, string> = {
  "Speaker A": "#38bdf8",
  "Speaker B": "#ff6b6b",
  "Speaker C": "#ffd93d",
  "Speaker D": "#a78bfa",
};

export const SPEAKER_OPTIONS = Object.keys(SPEAKER_COLORS);

export const formatTime = (s: number | null | undefined): string => {
  if (s == null || isNaN(s)) return "0:00.0";
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, "0");
  return `${m}:${sec}`;
};

export const generateId = (): string => Math.random().toString(36).slice(2, 9);

export const decodeAudioFile = async (
  file: File,
  n = 900,
): Promise<{ peaks: number[]; duration: number }> => {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioCtx();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();
  const numCh = audioBuffer.numberOfChannels;
  const mono = new Float32Array(audioBuffer.length);
  for (let c = 0; c < numCh; c++) {
    const ch = audioBuffer.getChannelData(c);
    ch.forEach((val, i) => (mono[i] += val / numCh));
  }
  const blockSize = Math.floor(audioBuffer.length / n);
  const peaks = new Array<number>(n);
  let globalMax = 0;
  for (let i = 0; i < n; i++) {
    const start = i * blockSize;
    let max = 0;
    for (let j = start; j < start + blockSize; j++) {
      const abs = Math.abs(mono[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
    if (max > globalMax) globalMax = max;
  }
  const norm = Math.max(globalMax, 0.001);
  return { peaks: peaks.map((p) => p / norm), duration: audioBuffer.duration };
};
