import React, { useEffect, useRef, useState } from 'react';

export const Studio: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiRef = useRef<any>(null);
  const [camData, setCamData] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (!iframeRef.current) return;
      
      const loadApi = () => new Promise<any>((resolve) => {
        if ((window as any).Sketchfab) {
          resolve((window as any).Sketchfab);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
        script.onload = () => resolve((window as any).Sketchfab);
        document.head.appendChild(script);
      });

      const Sketchfab = await loadApi();
      if (!isMounted) return;

      const client = new Sketchfab('1.12.1', iframeRef.current);
      client.init('76619a9fb77d465b863b1e69ce03f947', {
        success: (api: any) => {
          api.start();
          api.addEventListener('viewerready', () => {
            apiRef.current = api;
            
            api.addEventListener('click', (info: any) => {
              if (info.position3D) {
                const surfacePoint = info.position3D.map((v: number) => Number(v.toFixed(2)));
                const data = JSON.stringify({
                  surfacePoint: surfacePoint
                });
                setCamData((prev) => prev ? prev + '\n\n// Surface Point:\n' + data : '// Surface Point:\n' + data);
              }
            });
          });
        },
        error: () => console.error('Sketchfab API error'),
        autostart: 1,
        ui_infos: 1,
        ui_controls: 1,
        ui_watermark: 0,
        ui_stop: 0,
        scrollwheel: 1,
        transparent: 1,
      });
    };

    init();
    
    return () => { isMounted = false; };
  }, []);

  const handleGetCamera = () => {
    if (apiRef.current) {
      apiRef.current.getCameraLookAt((err: any, camera: any) => {
        if (!err) {
          const data = JSON.stringify({
            pos: camera.position.map((v: number) => Number(v.toFixed(2))),
            tgt: camera.target.map((v: number) => Number(v.toFixed(2)))
          });
          setCamData(data);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#030407] flex font-sans selection:bg-white/20">
      <iframe
        ref={iframeRef}
        className="flex-1 h-full pointer-events-auto"
        allow="autoplay; fullscreen; xr-spatial-tracking"
      ></iframe>
      
      <div className="w-80 bg-black/90 border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-medium text-white">Studio Mode</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm">Close</button>
        </div>
        
        <p className="text-sm text-white/50">
          Left click + drag to rotate. Right click + drag to pan. Scroll to zoom.<br/><br/>
          <strong>To get camera view:</strong> Frame your shot, then click Capture Coordinates.<br/>
          <strong>To get surface points:</strong> Click anywhere directly on the model surface.
        </p>

        <div className="flex gap-2">
          <button 
            onClick={handleGetCamera}
            className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg border border-emerald-500/50 transition-colors font-medium shadow-lg text-sm"
          >
            Capture Camera
          </button>
          <button 
            onClick={() => setCamData('')}
            className="px-4 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg border border-red-500/50 transition-colors font-medium shadow-lg text-sm"
          >
            Clear
          </button>
        </div>

        {camData && (
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-white/40 mb-2">JSON Result</h3>
            <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap break-all mb-4 bg-black/50 p-3 rounded">
              {camData}
            </pre>
            <button 
              onClick={() => navigator.clipboard.writeText(camData)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
