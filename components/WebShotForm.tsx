'use client';

import { useState } from 'react';
import Select from 'react-select';

// Constants
const SHOT_TYPES = [
  { value: 'desktop', label: '🖥️ Desktop Full Page' },
  { value: 'desktop-viewport', label: '🖥️ Desktop Viewport' },
  { value: 'tablet', label: '📱 Tablet' },
  { value: 'mobile', label: '📱 Mobile Full Page' },
  { value: 'mobile-viewport', label: '📱 Mobile Viewport' },
  { value: 'social', label: '📸 Social Media (1200x630)' },
  { value: 'custom', label: '🎨 Custom Size' },
];

const THEMES = [
  { value: 'modern', label: '✨ Modern' },
  { value: 'minimal', label: '🎯 Minimal' },
  { value: 'dark', label: '🌙 Dark' },
  { value: 'glass', label: '🔮 Glass' },
  { value: 'neon', label: '💫 Neon' },
  { value: 'retro', label: '📺 Retro' },
];

const DECORATIONS = [
  { value: 'shadow', label: 'Shadow Effect' },
  { value: 'gradient', label: 'Gradient Border' },
  { value: 'glow', label: 'Neon Glow' },
  { value: 'corner', label: 'Corner Accent' },
  { value: 'frame', label: 'Frame Border' },
  { value: 'polaroid', label: 'Polaroid Style' },
];

interface WebShotFormProps {
  setShotData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

export default function WebShotForm({ setShotData, setLoading, loading }: WebShotFormProps) {
  const [url, setUrl] = useState('');
  const [shotType, setShotType] = useState(SHOT_TYPES[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [selectedDecorations, setSelectedDecorations] = useState([DECORATIONS[0]]);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [delay, setDelay] = useState(2000);
  const [quality, setQuality] = useState(90);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      alert('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          shotType: shotType.value,
          theme: theme.value,
          decorations: selectedDecorations.map(d => d.value),
          customSize: shotType.value === 'custom' ? {
            width: customWidth,
            height: customHeight
          } : null,
          delay,
          quality,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to capture screenshot');
      }

      const data = await response.json();
      setShotData(data);

      // Save to history
      const history = JSON.parse(localStorage.getItem('webshot_history') || '[]');
      history.unshift({
        id: data.id,
        url,
        screenshot: data.screenshot,
        timestamp: data.timestamp,
        metadata: data.metadata,
      });
      localStorage.setItem('webshot_history', JSON.stringify(history.slice(0, 20)));

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      background: 'rgba(255,255,255,0.1)',
      borderColor: state.isFocused ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
      padding: '2px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(139, 92, 246, 0.3)' : 'none',
      '&:hover': {
        borderColor: 'rgba(139, 92, 246, 0.5)',
      }
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
      color: state.isFocused ? '#fff' : '#333',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderRadius: '8px',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: '#fff',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: '#fff',
      '&:hover': {
        backgroundColor: 'rgba(255,0,0,0.3)',
        borderRadius: '8px',
      }
    }),
    input: (base: any) => ({
      ...base,
      color: '#fff',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#fff',
    }),
  };

  return (
    <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>⚙️</span> Configuration
      </h2>

      <div className="space-y-5">
        {/* URL Input */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            🌐 Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            required
          />
        </div>

        {/* Shot Type */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            📸 Shot Type
          </label>
          <Select
            options={SHOT_TYPES}
            value={shotType}
            onChange={(option) => setShotType(option || SHOT_TYPES[0])}
            styles={customSelectStyles}
            className="text-white"
          />
        </div>

        {/* Custom Size */}
        {shotType.value === 'custom' && (
          <div className="grid grid-cols-2 gap-3 animate-fadeIn">
            <div>
              <label className="block text-white text-sm font-medium mb-1">Width</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                min={100}
                max={4096}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-1">Height</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                min={100}
                max={4096}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Theme */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            🎨 Theme
          </label>
          <Select
            options={THEMES}
            value={theme}
            onChange={(option) => setTheme(option || THEMES[0])}
            styles={customSelectStyles}
            className="text-white"
          />
        </div>

        {/* Decorations */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            ✨ Decorations
          </label>
          <Select
            options={DECORATIONS}
            isMulti
            value={selectedDecorations}
            onChange={(options) => setSelectedDecorations(options || [])}
            styles={customSelectStyles}
            className="text-white"
          />
        </div>

        {/* Delay */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            ⏱️ Delay: <span className="text-purple-400">{delay}ms</span>
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>500ms</span>
            <span>2000ms</span>
            <span>5000ms</span>
          </div>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            📊 Quality: <span className="text-purple-400">{quality}%</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            <span>📸 Capture Screenshot</span>
          )}
        </button>

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl">
          <p className="text-white/40 text-xs">
            💡 Tip: Use delay for dynamic content or lazy-loaded images
          </p>
        </div>
      </div>
    </form>
  );
}
