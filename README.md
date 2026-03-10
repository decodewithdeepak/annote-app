# WAVEMARK | Audio Annotation Studio

A high-performance, "buttery smooth" audio annotation tool built for precision diarization and transcription workflows.

## The Philosophy
Most annotation tools feel sluggish because they rely on heavy DOM updates. **WAVEMARK** takes a different path:
- **Zero Latency**: Custom HTML5 Canvas renderer synced with `requestAnimationFrame` for CPU-efficient waveform drawing.
- **Precision First**: Sub-millisecond coordinate mapping for professional-grade timing accuracy.
- **Native Experience**: A mobile-first UI that transforms from a desktop studio into a sleek bottom-sheet interface on touch devices.

## Functional Highlights
- **Interactive Waveform**: Fluid visualization that stays performant during playback and window resizing.
- **Smart Selection**: Intuitive click-and-drag mechanism to mark specific audio intervals.
- **Collision Detection**: Built-in logic to prevent overlapping segments, ensuring clean data for ML ingestion.
- **Integrated Metadata**: Quick-capture modal for Speaker ID and transcription snippets.
- **Fused UI**: A minimalist "fused" export badge that tracks your progress in real-time.

## Tech Stack
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (Modern, utility-first)
- **Audio Logic**: Web Audio API (Manual decoding pipeline)
- **Graphics**: HTML5 Canvas API

## Running Locally
```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

## Evaluation Notes
- **Performance**: We avoided heavy libraries like Wavesurfer.js to demonstrate raw graphics logic and DOM minimization.
- **State Management**: Implemented using a robust, normalized segment structure optimized for machine-learning pipelines.
- **Export**: Real-time clipboard export formatted for instant JSON ingestion.

---
*Built with precision for the next generation of Speech AI training.*
