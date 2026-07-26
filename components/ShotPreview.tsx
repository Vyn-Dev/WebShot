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
      <h2 className="text-2xl font-bold
