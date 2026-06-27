import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// Math utils for 3D to 2D projection
const normalize = (v: number[]) => {
  const len = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / len, v[1] / len, v[2] / len];
};
const cross = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function project3DTo2D(point3D: number[], cameraPos: number[], cameraTgt: number[], fov: number = 45) {
  // View Matrix
  const forward = normalize([cameraTgt[0] - cameraPos[0], cameraTgt[1] - cameraPos[1], cameraTgt[2] - cameraPos[2]]);
  // Sketchfab uses Z-up usually, so up vector is [0, 0, 1]
  let up = [0, 0, 1];
  // if forward is exactly up/down, handle singularity
  if (Math.abs(forward[2]) > 0.999) up = [0, 1, 0];
  
  const right = normalize(cross(forward, up));
  const newUp = cross(right, forward);

  // Vector from camera to point
  const v = [point3D[0] - cameraPos[0], point3D[1] - cameraPos[1], point3D[2] - cameraPos[2]];

  // Transform to view space
  const xView = dot(v, right);
  const yView = dot(v, newUp);
  const zView = dot(v, forward); // Distance in front of camera

  if (zView <= 0) return null; // Behind camera

  // Perspective Projection
  const fovRad = (fov * Math.PI) / 180;
  const f = 1.0 / Math.tan(fovRad / 2);
  const aspect = window.innerWidth / window.innerHeight;

  const xProj = (xView * f) / (zView * aspect);
  const yProj = (yView * f) / zView;

  // Convert to Screen Coordinates (0 to 1, then mapped to %)
  const screenX = (xProj + 1) / 2 * 100;
  const screenY = (1 - yProj) / 2 * 100;

  return [`${screenX}%`, `${screenY}%`];
}

interface MountainModelProps {
  activeStep: number;
  totalSteps: number;
  isStarted?: boolean;
}

export const MountainModel: React.FC<MountainModelProps> = ({ activeStep, totalSteps, isStarted }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const stepConfigs = [
    { pos: [7.21, 25.61, 1.98], tgt: [6.47, 2.59, -1.61], surfacePoint: [6.51, 17.73, 0.35], coords: ['20%', '40%'], title: 'Base Camp', elevation: '2,400m' },
    { pos: [9.29, 9.54, 5.4], tgt: [-0.8, -1.96, 1.73], surfacePoint: [5.31, 4.88, 2.47], coords: ['30%', '35%'], title: 'Ascent', elevation: '3,800m' },
    { pos: [6.49, 1.91, 6.08], tgt: [-0.48, -4.77, 3.56], surfacePoint: [3.72, -2.89, 5.49], coords: ['40%', '45%'], title: 'Ridge', elevation: '5,100m' },
    { pos: [5.81, -9.04, 10.01], tgt: [-0.48, -4.77, 3.54], surfacePoint: [1.12, -7.6, 6.28], coords: ['50%', '30%'], title: 'High Camp', elevation: '6,400m' },
    { pos: [-5.8, -11.4, 11.89], tgt: [-0.45, -4.73, 3.54], surfacePoint: [0.14, -8.47, 8.02], coords: ['60%', '20%'], title: 'The Summit', elevation: '8,848m' },
    { pos: [-3.8, -10.0, 10.2], tgt: [0.14, -8.47, 8.02], surfacePoint: [0.14, -8.47, 8.02], coords: ['50%', '50%'], title: 'Your Summit', elevation: '8,848m' }
  ];

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
            setIsReady(true);
          });
        },
        error: () => console.error('Sketchfab API error'),
        autostart: 1,
        ui_infos: 0,
        ui_controls: 0,
        ui_watermark: 0,
        ui_stop: 0,
        scrollwheel: 0,
        transparent: 1,
      });
    };

    init();
    
    return () => { isMounted = false; };
  }, []);

  const [pointCoords, setPointCoords] = useState<{[key: number]: [string, string]}>(() => {
    const initial: {[key: number]: [string, string]} = {};
    stepConfigs.forEach((config, idx) => {
      initial[idx] = config.coords as [string, string];
    });
    return initial;
  });

  useEffect(() => {
    if (!apiRef.current || !isReady || !isStarted) return;
    
    // Clamp the activeStep to ensure we always have a valid config
    const safeStepIndex = Math.min(Math.max(activeStep, 0), stepConfigs.length - 1);
    const config = stepConfigs[safeStepIndex];
    
    // Zoom out the camera position slightly to prevent label trimming on the sides
    const zoomOutFactor = 1.35;
    const zoomedPos = [
      config.tgt[0] + (config.pos[0] - config.tgt[0]) * zoomOutFactor,
      config.tgt[1] + (config.pos[1] - config.tgt[1]) * zoomOutFactor,
      config.tgt[2] + (config.pos[2] - config.tgt[2]) * zoomOutFactor,
    ];
    
    // Animate smoothly to the next step
    apiRef.current.setCameraLookAt(zoomedPos, config.tgt, 2.5);
    
    // Update 3D to 2D coords
    const updateCoords = () => {
      apiRef.current.getCameraLookAt((err: any, camera: any) => {
        if (err || !camera) return;
        
        stepConfigs.forEach((c, idx) => {
          if (!c.surfacePoint) return;
          
          const coord2D = project3DTo2D(c.surfacePoint, camera.position, camera.target);
          
          if (coord2D) {
            setPointCoords(prev => ({
              ...prev,
              [idx]: [coord2D[0], coord2D[1]]
            }));
          }
        });
      });
    };

    updateCoords();
    
    // Update coords continuously while camera might be moving
    const interval = setInterval(updateCoords, 33);
    return () => clearInterval(interval);

  }, [activeStep, isReady, isStarted]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030407]">
      <iframe
        ref={iframeRef}
        className="w-[130vw] h-[130vh] -ml-[25vw] md:-ml-[35vw] lg:-ml-[40vw] -mt-[15vh] opacity-90 contrast-125 brightness-110 mix-blend-screen scale-110 pointer-events-none"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        style={{ pointerEvents: 'none' }}
      ></iframe>
      <div className="absolute inset-0 bg-gradient-to-b from-[#030407]/0 via-[#030407]/40 to-[#030407] pointer-events-none" />

      {/* Summit Fog */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: activeStep === totalSteps - 1 ? 1 : 0 }}
        transition={{ duration: 3 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <motion.div
          animate={{ y: ['5%', '-5%', '5%'], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] left-[-20%] right-[-20%] h-[80vh] bg-gradient-to-t from-white/60 via-white/20 to-transparent blur-[80px]"
        />
        <motion.div
          animate={{ x: ['-5%', '5%', '-5%'], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] left-[-30%] right-[-30%] h-[90vh] bg-gradient-to-t from-blue-50/40 via-white/10 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{ x: ['5%', '-5%', '5%'], scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[-20%] right-[-20%] h-[50vh] bg-white/10 blur-[100px] rounded-[100%]"
        />
      </motion.div>
      
      {/* 3D Labels that appear based on activeStep */}
      {isStarted && (
        <div className="absolute top-0 left-0 w-[130vw] h-[130vh] -ml-[25vw] md:-ml-[35vw] lg:-ml-[40vw] -mt-[15vh] scale-110 pointer-events-none perspective-[1000px]">
          {stepConfigs.map((config, idx) => {
            const coords = pointCoords[idx];
            if (!coords) return null;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: activeStep >= idx ? 1 : 0, 
                  scale: activeStep === idx ? 1.1 : 0.9,
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-white"
                style={{ left: coords[0], top: coords[1], zIndex: 10 + idx }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[#d35400] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d35400] shadow-[0_0_12px_#d35400] border border-white/20"></span>
                  </div>
                  {activeStep === idx && (
                    <>
                      <div className="h-10 w-[1px] bg-gradient-to-t from-transparent to-[#d35400]"></div>
                      <h2 className="text-lg md:text-xl font-light tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] bg-black/90 px-4 py-1.5 border border-[#d35400]/50 whitespace-nowrap">
                        {config.title}
                      </h2>
                      <p className="text-[9px] md:text-[10px] text-[#d35400] font-mono tracking-widest uppercase bg-black/90 px-2 py-0.5 border border-white/10">
                        Elevation: {config.elevation}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
          

        </div>
      )}
    </div>
  );
};
