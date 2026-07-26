"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";

export default function Home() {
  const [url, setUrl] = useState("");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const frameRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setImgSrc(null);

    try {
      const res = await fetch(`/api/screenshot?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Gagal memproses URL, pastikan web bisa diakses publik");
      
      const blob = await res.blob();
      setImgSrc(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!frameRef.current) return;
    const canvas = await html2canvas(frameRef.current, { scale: 2, backgroundColor: null });
    const link = document.createElement("a");
    link.download = "web-docs.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white p-6 flex flex-col items-center">
      <div className="bg-neutral-800 p-6 rounded-2xl shadow-lg w-full max-w-lg text-center mb-8 border border-neutral-700 mt-10">
        <h1 className="text-2xl font-bold mb-4">📸 WebShot Docs</h1>
        <p className="text-neutral-400 mb-4 text-sm">Dokumentasi website dengan frame macOS</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="google.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-600 p-3 rounded-xl outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleScreenshot}
            disabled={loading}
            className="bg-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Proses..." : "Potret"}
          </button>
        </div>
        {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
      </div>

      {imgSrc && (
        <div className="flex flex-col items-center w-full max-w-4xl">
          {/* Area Frame untuk di-download */}
          <div className="p-4 sm:p-8 w-full" ref={frameRef}>
            <div className="bg-white w-full rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header macOS */}
              <div className="bg-[#f1f1f1] px-4 py-3 flex items-center gap-2 border-b border-gray-300">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
              </div>
              {/* Hasil Screenshot */}
              <div className="w-full bg-white">
                <img src={imgSrc} alt="Screenshot" className="w-full h-auto block" />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="mt-4 mb-10 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg"
          >
            Unduh Dokumentasi
          </button>
        </div>
      )}
    </main>
  );
}
