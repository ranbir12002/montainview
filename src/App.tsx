import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MountainModel } from './components/MountainModel';
import { StepBlock } from './components/StepBlock';
import { Studio } from './components/Studio';
import { cases } from './data';

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <>
      {isStudioMode && <Studio onClose={() => setIsStudioMode(false)} />}
      
      <div className="relative w-full min-h-screen bg-[#030407] text-white font-sans selection:bg-white/20 overflow-x-hidden">
        <MountainModel activeStep={activeStep} totalSteps={cases.length} isStarted={hasStarted} />
        
        <AnimatePresence>
          {!hasStarted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            >
              <div className="text-center font-display uppercase font-black leading-[0.85] tracking-tight text-5xl md:text-8xl select-none mb-10">
                <span className="text-white">Ceilings</span><br />
                <span className="text-[#d35400]">Broken.</span>
              </div>
              <button 
                onClick={() => setHasStarted(true)}
                className="px-10 py-4 bg-[#d35400] text-white font-bold tracking-[0.2em] uppercase text-xs rounded-none border border-[#d35400] hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-xl hover:scale-105"
              >
                Start The Climb
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {hasStarted && (
          <div className="relative z-10 w-full flex flex-col items-end px-4 md:px-8 lg:pr-12 xl:pr-16">
            {cases.map((c, index) => (
              <StepBlock 
                key={c.id} 
                data={c} 
                index={index} 
                onVisible={setActiveStep} 
              />
            ))}
          </div>
        )}
        
        {/* Extra padding to allow scrolling past the last item comfortably */}
        <div className="h-[10vh]" />
        
        <button 
          onClick={() => setIsStudioMode(true)}
          className="fixed bottom-6 left-6 z-40 px-4 py-2 bg-black/80 backdrop-blur border border-white/10 rounded-full text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          [ Studio Mode ]
        </button>
      </div>
    </>
  );
}
