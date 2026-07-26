'use client';

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: number;
  url: string;
  screenshot: string;
  timestamp: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    quality: number;
  };
}

export default function ShotHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem('webshot_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('webshot_history');
      setHistory([]);
      setSelectedItem(null);
    }
  };

  const deleteItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem('webshot_history', JSON.stringify(newHistory));
    setHistory(newHistory);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="mt-12">
      <div className="glass-effect rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">📜 History</h2>
            <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/40">
              {history.length} items
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-red-400 hover:text-red-300 text-sm font-medium hover:bg-red-500/10 rounded-lg transition"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                className={`group relative bg-white/5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedItem?.id === item.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-800">
                  <img
                    src={`data:image/png;base64,${item.screenshot}`}
                    alt={`Screenshot of ${item.url}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-2">
                  <div className="text-white/60 text-xs truncate">
                    {truncateUrl(item.url)}
                  </div>
                  <div className="text-white/40 text-[10px] mt-1">
                    {formatDate(item.timestamp)}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Badge */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] text-white/60">
                  {item.metadata.width}×{item.metadata.height}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-20">📭</div>
            <p className="text-white/40 text-lg">No history yet</p>
            <p className="text-white/20 text-sm mt-1">Your screenshots will appear here</p>
          </div>
        )}

        {/* Selected item detail */}
        {selectedItem && (
          <div className="mt-6 p-4 glass-effect rounded-xl">
            <div className="flex items-start gap-4">
              <img
                src={`data:image/png;base64,${selectedItem.screenshot}`}
                alt="Selected screenshot"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-white font-medium">{selectedItem.url}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-white/60">
                  <div>📅 {formatDate(selectedItem.timestamp)}</div>
                  <div>📐 {selectedItem.metadata.width}×{selectedItem.metadata.height}</div>
                  <div>📊 Quality: {selectedItem.metadata.quality}%</div>
                  <div>📁 Format: {selectedItem.metadata.format.toUpperCase()}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
