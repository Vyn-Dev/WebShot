'use client';

import { useState, useRef } from 'react';
import WebShotForm from '@/components/WebShotForm';
import ShotPreview from '@/components/ShotPreview';
import ShotHistory from '@/components/ShotHistory';

interface ShotData {
  screenshot: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    quality: number;
  };
  decorations: string[];
  theme: string;
  timestamp: number;
  id: number;
}

export default function Home() {
  const [shotData, setShotData] = useState<ShotData | null>(null);
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-block animate-float">
          <h1 className="text-6xl font-bold text-white mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500">
              WebShot Vyn
            </span>
          </h1>
        </div>
        <p className="text-gray-300 text-lg font-light">
          ✨ Professional Website Screenshot Tool
        </p>
        <div className="flex justify-center gap-2 mt-2">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">v1.0.0</span>
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">Next.js 14</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <WebShotForm 
            setShotData={setShotData}
            setLoading={setLoading}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-3">
          <ShotPreview 
            shotData={shotData}
            loading={loading}
            previewRef={previewRef}
          />
        </div>
      </div>

      {/* History Section */}
      <ShotHistory />
    </div>
  );
}
