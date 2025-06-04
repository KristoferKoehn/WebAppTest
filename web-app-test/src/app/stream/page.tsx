"use client";
import { useRef, useEffect, useState } from "react";
import Head from "next/head";

export default function ScreenViewer() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fps, setFps] = useState<number | null>(null);

  const screenStreamURL = "http://50.34.46.175:5000/screen";
  const fpsURL = "http://50.34.46.175:5000/fps";

  // Handle stream errors
  const handleStreamError = () => {
    setIsConnected(false);
    setTimeout(() => setRefreshKey((k) => k + 1), 3000);
  };

  // Reset connection status when refreshed
  useEffect(() => {
    setIsConnected(true);
  }, [refreshKey]);

  /*
  // Fetch FPS every second
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(fpsURL)
        .then((res) => res.json())
        .then((data) => setFps(data.fps))
        .catch(() => setFps(null));
    }, 1000);
    return () => clearInterval(interval);
  }, []);*/

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && imgRef.current) {
      imgRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <>
      <Head>
        <title>Live Screen Stream</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 text-white p-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold">📺 Live Screen Stream</h1>
          <p className="text-zinc-400 text-sm">Watch your computer remotely</p>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-zinc-700 max-w-[90vw] max-h-[80vh]">
          {!isConnected && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
              <p className="text-red-400 font-mono">🔌 Disconnected. Reconnecting...</p>
            </div>
          )}
          <img
            ref={imgRef}
            key={refreshKey}
            src={screenStreamURL}
            alt="Live Screen"
            onError={handleStreamError}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition"
          >
            {isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
          </button>

          <div className="text-xs text-zinc-400 font-mono">
            Status:{" "}
            <span className={isConnected ? "text-green-400" : "text-red-400"}>
              {isConnected ? "Connected" : "Reconnecting..."}
            </span>
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            Resolution: 1280x720 | FPS: {fps !== null ? fps : "…"}
          </div>
        </div>
      </div>
    </>
  );
}
