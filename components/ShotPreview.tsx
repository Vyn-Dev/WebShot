'use client';

import { useState } from 'react';

interface ShotPreviewProps {
  shotData: {
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
  } | null;
  loading: boolean;
  previewRef: React.RefObject<HTMLDivElement>;
}

export default function ShotPreview({ shotData, loading, previewRef }: ShotPreviewProps) {
  const [downloadFormat, setDownloadFormat] = useState('png');

  const handleDownload = async (format: string = 'png') => {
    if (!shotData?.screenshot) return;

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: shotData.screenshot,
          format,
          decorations: shotData.decorations,
          theme: shotData.theme,
        }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webshot-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image');
    }
  };

  const handleShare = async () => {
    if (!shotData?.screenshot) return;

    try {
      // Convert base64 to blob
      const base64Data = shotData.screenshot;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: 'WebShot Vyn',
          text: 'Check out this screenshot!',
          files: [new File([blob], 'screenshot.png', { type: 'image/png' })],
        });
      } else {
        // Fallback: copy link
        const shareUrl = `${window.location.origin}/share/${shotData.id}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Apply decoration styles
  const getDecorationStyles = () => {
    const styles: React.CSSProperties = {};
    const decorations = shotData?.decorations || [];

    if (decorations.includes('shadow')) {
      styles.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.5)';
    }

    if (decorations.includes('glow')) {
      styles.boxShadow = '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)';
      styles.border = '2px solid rgba(139, 92, 246, 0.3)';
    }

    if (decorations.includes('polaroid')) {
      styles.padding = '20px 20px 50px 20px';
      styles.backgroundColor = 'white';
      styles.borderRadius = '4px';
      styles.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
    }

    if (decorations.includes('frame')) {
      styles.border = '4px solid rgba(255,255,255,0.3)';
      styles.borderRadius = '12px';
    }

    return styles;
  };

  // Apply theme filters
  const getThemeStyles = () => {
    const styles: React.CSSProperties = {};
    const theme = shotData?.theme;

    switch (theme) {
      case 'neon':
        styles.filter = 'brightness(1.1) contrast(1.2) saturate(1.3)';
        break;
      case 'dark':
        styles.filter = 'brightness(0.8) contrast(1.1) saturate(0.8)';
        break;
      case 'retro':
        styles.filter = 'sepia(0.5) saturate(0.7) brightness(0.9)';
        break;
      case 'glass':
        styles.filter = 'brightness(1.05) blur(0.5px)';
        break;
      case 'minimal':
        styles.filter = 'grayscale(0.5) brightness(1.05)';
        break;
    }

    return styles;
  };

  return (
    <div className="glass-effect rounded-2xl p-6 shadow-2xl h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>👁️</span> Preview
      </h2>
      
      <div className="relative bg-gray-900/50 rounded-xl p-4 min-h-[400px] flex items-center justify-center">
        {loading ? (
          <div className="text-center text-white">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
            <p className="mt-4 text-white/60">Capturing screenshot...</p>
            <p className="text-sm text-white/40">Please wait</p>
          </div>
        ) : shotData?.screenshot ? (
          <div ref={previewRef} className="w-full">
            <div className="relative group">
              <img
                src={`data:image/png;base64,${shotData.screenshot}`}
                alt="Screenshot preview"
                className="w-full rounded-lg transition-all duration-300"
                style={{
                  ...getDecorationStyles(),
                  ...getThemeStyles(),
                }}
              />
              
              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-3">
                <button
                  onClick={() => handleDownload('png')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition transform hover:scale-105"
                >
                  💾 PNG
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
                >
                  📤 Share
                </button>
              </div>
            </div>

            {/* Download options */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition transform hover:scale-105 text-sm font-medium"
                >
                  📥 PNG
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition transform hover:scale-105 text-sm font-medium"
                >
                  📥 JPG
                </button>
                <button
                  onClick={() => handleDownload('webp')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105 text-sm font-medium"
                >
                  📥 WebP
                </button>
              </div>
            </div>

            {/* Metadata */}
            {shotData?.metadata && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="glass-effect rounded-lg p-2">
                  <span className="text-white/50">Size:</span>{' '}
                  <span className="text-white/80">{shotData.metadata.width}×{shotData.metadata.height}</span>
                </div>
                <div className="glass-effect rounded-lg p-2">
                  <span className="text-white/50">Quality:</span>{' '}
                  <span className="text-white/80">{shotData.metadata.quality}%</span>
                </div>
                <div className="glass-effect rounded-lg p-2">
                  <span className="text-white/50">Format:</span>{' '}
                  <span className="text-white/80 uppercase">{shotData.metadata.format}</span>
                </div>
                <div className="glass-effect rounded-lg p-2">
                  <span className="text-white/50">Theme:</span>{' '}
                  <span className="text-white/80 capitalize">{shotData.theme}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-white/60">
            <div className="text-7xl mb-4 animate-float">🖼️</div>
            <p className="text-lg font-medium">No Screenshot Yet</p>
            <p className="text-sm mt-2 text-white/40">Configure your options and click capture</p>
            <div className="mt-4 flex justify-center gap-4 text-xs text-white/20">
              <span>✦ Desktop</span>
              <span>✦ Tablet</span>
              <span>✦ Mobile</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
