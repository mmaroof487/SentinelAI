# SentinelAI Frontend 🚀

This is the Next.js frontend application for the SentinelAI Traffic Movement Intelligence Platform, built for the Flipkart Gridlock Hackathon.

## Features

- **Command Center**: The primary dashboard showing the Digital Twin map, active alerts, repeat offenders, enforcement simulator, and live performance metrics.
- **Evidence Processing**: An interface to upload traffic camera snapshots, optionally enhance low-quality images, run inference (including wrong-side driving detection), view bounded boxes, blur bystanders via the Privacy Shield, and export PDF Dossiers.
- **Intelligence Engine**: A conversational AI interface backed by Google Gemini 2.0 Flash to query real-time database stats.
- **Simulation**: Tools for predicting impact of targeted deployments and large-scale urban events.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Icons**: Lucide React
- **Mapping**: React Leaflet
- **Data Visualization**: Recharts
- **PDF Export**: html2canvas, jsPDF

## Getting Started

First, install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Status

- ✅ Command Center & Live Telemetry
- ✅ Privacy Shield (Gaussian Blur implementation)
- ✅ YOLOv8 + OCR Evidence Viewer
- ✅ PDF Dossier Export
- ✅ Gemini 2.0 Flash Integration

All endpoints expect the backend to be running on `http://localhost:8000` locally. This is configured automatically via the Next.js `next.config.ts` rewrite rules.
