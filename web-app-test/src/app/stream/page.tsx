"use client";
import { useRef, useEffect, useState } from "react";
import Head from "next/head";

export default function ScreenViewer() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fps, setFps] = useState<number | null>(null);
  const [region, setRegion] = useState({ left: 0, top: 0, width: 640, height: 480 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const lastUpdateTime = useRef<number>(0);
  const THROTTLE_MS = 200; // You can tweak this

  const FPS_POLLING_TIME = 3000;

  const screenStreamURL = "http://50.34.46.175:5000/screen";
  const updateRegionURL = "http://50.34.46.175:5001/update-region";
  const fpsURL = "http://50.34.46.175:5001/fps";

  const handleStreamError = () => {
    setIsConnected(false);
    setTimeout(() => setRefreshKey((k) => k + 1), 3000);
  };

  useEffect(() => {
    setIsConnected(true);
  }, [refreshKey]);

  useEffect(() => {
    if (dragStart) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // prevent pull-down refresh and other gestures
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
  }, [dragStart]);  

  //fps polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(fpsURL)
        .then((res) => {
          if (!res.ok) throw new Error(`FPS fetch failed: ${res.status}`);
          return res.json();
        })
        .then((data) => setFps(data.fps))
        .catch((err) => {
          console.error("FPS fetch error:", err);
          setFps(null); // Optionally show “…” or fallback UI
        });
    }, FPS_POLLING_TIME);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && imgRef.current) {
      imgRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

 const updateRegion = () => {
    fetch(updateRegionURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(region),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Update region failed: ${res.status}`);
        return res.json();
      })
      .then((data) => console.log("Updated region:", data))
      .catch((err) => {
        console.error("Region update error:", err);
      });
  };
  

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart) return;
  
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
  
    const now = Date.now();
  
    setRegion((prev) => {
      const updated = {
        ...prev,
        left: Math.max(0, Math.round(prev.left - dx)),
        top: Math.max(0, Math.round(prev.top - dy)),
      };
  
      // Throttle backend update (leading)
      if (now - lastUpdateTime.current > THROTTLE_MS) {
        lastUpdateTime.current = now;
        fetch(updateRegionURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        })
          .then((res) => res.json())
          .then((data) => console.log("Updated region:", data))
          .catch((err) => console.error(err));
      }
  
      return updated;
    });
  
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  }; 

  return (
    <>
      <Head>
        <title>Live Screen Stream</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold">📺 Live Screen Stream</h1>
          <p className="text-zinc-400 text-sm">Drag or swipe to move the viewable area</p>
        </div>

        <div
          className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-zinc-700 max-w-[90vw] max-h-[80vh] touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {!isConnected && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
              <p className="text-red-400 font-mono">🔌 Disconnected. Reconnecting...</p>
            </div>
          )}

          <img
            ref={imgRef}
            key={refreshKey}
            src={screenStreamURL}  
            draggable={false}
            alt="Live Screen"
            onError={handleStreamError}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition"
          >
            {isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
          </button>

          <button
            onClick={updateRegion}
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-500 transition"
          >
            💾 Update Region
          </button>

          <div className="text-xs text-zinc-400 font-mono">
            FPS: {fps !== null ? fps : "…"}
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            Region: L{Math.round(region.left)} T{Math.round(region.top)} W{region.width} H{region.height}
          </div>
        </div>

        <div className="flex gap-2 mt-2 text-sm text-zinc-300">
          <label>
            Width:
            <input
              type="number"
              className="ml-1 w-20 p-1 rounded bg-zinc-800 border border-zinc-600"
              value={region.width}
              onChange={(e) => setRegion({ ...region, width: parseInt(e.target.value) || 1 })}
            />
          </label>
          <label>
            Height:
            <input
              type="number"
              className="ml-1 w-20 p-1 rounded bg-zinc-800 border border-zinc-600"
              value={region.height}
              onChange={(e) => setRegion({ ...region, height: parseInt(e.target.value) || 1 })}
            />
          </label>
        </div>
      </div>
    </>
  );
}
