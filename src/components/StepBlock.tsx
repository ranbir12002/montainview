import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface StepBlockProps {
  data: any;
  index: number;
  onVisible: (index: number) => void;
}

export const StepBlock: React.FC<StepBlockProps> = ({ data, index, onVisible }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bizType, setBizType] = useState('');
  const [stuckPoint, setStuckPoint] = useState('');
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onVisible(index);
        }
      });
    }, { 
      threshold: 0.5,
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index, onVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div ref={ref} className="min-h-screen w-full max-w-2xl flex flex-col items-end justify-center py-12 md:py-16">
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, margin: "-100px" }}
        className="w-full max-w-xl bg-black/95 backdrop-blur-xl border border-[#d35400]/20 rounded-none p-5 md:p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle orange corner accent */}
        <div className="absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-r from-transparent to-[#d35400]" />
        <div className="absolute top-0 right-0 h-16 w-[1px] bg-gradient-to-b from-[#d35400] to-transparent" />

        <div className="flex items-center gap-4 mb-4">
           <div className="flex flex-col items-end min-w-[65px]">
             <span className="text-[8px] tracking-[0.2em] text-[#d35400]/75 uppercase mb-0.5">ALT</span>
             <span className="font-mono text-lg md:text-xl text-white font-light leading-none">{data.alt}</span>
             <span className="text-[9px] text-white/40 mt-0.5">ft</span>
           </div>
           <div className="w-px h-10 bg-gradient-to-b from-white/0 via-[#d35400]/30 to-white/0"></div>
           <div>
             <h2 className="text-lg md:text-xl font-display font-medium text-white tracking-tight leading-none uppercase">{data.title}</h2>
             {data.id !== 'base' && data.id !== 'summit' && (
               <h3 className="text-xs text-white/60 mt-0.5">{data.subtitle}</h3>
             )}
           </div>
        </div>

        {data.id === 'base' ? (
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-display font-light tracking-tight text-white/90 uppercase">{data.subtitle}</h1>
            <p className="text-xs md:text-sm text-white/50 font-light max-w-lg leading-relaxed">{data.description}</p>
            <div className="p-4 bg-white/[0.02] border border-white/5">
              <h4 className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[#d35400]/85 mb-1">Ascend To Summit</h4>
              <p className="text-white/80 leading-relaxed text-xs">{data.extra}</p>
            </div>
            <div className="pt-2 flex justify-center animate-bounce text-[#d35400]">
              <ChevronDown size={20} strokeWidth={2} />
            </div>
          </div>
        ) : data.id === 'summit' ? (
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-display font-light tracking-tight text-[#d35400] uppercase font-bold">{data.subtitle}</h1>
            <p className="text-xs md:text-sm text-white/60 font-light max-w-lg leading-relaxed">{data.description}</p>
            
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-gradient-to-br from-[#d35400]/10 to-black border border-[#d35400]/40 rounded-none text-center space-y-2"
              >
                <span className="text-[#d35400] text-3xl">▲</span>
                <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-white">ENGINE EN ROUTE</h4>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  We will analyze your altitude challenge and map out a vertical climb strategy within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-semibold tracking-[0.2em] uppercase text-white/40 block">Our business is...</label>
                  <input 
                    type="text" 
                    required
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value)}
                    placeholder="e.g. B2B Enterprise SaaS, DTC Skincare, Restaurant Group"
                    className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d35400] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-semibold tracking-[0.2em] uppercase text-white/40 block">We are currently stuck at...</label>
                  <textarea 
                    required
                    value={stuckPoint}
                    onChange={(e) => setStuckPoint(e.target.value)}
                    rows={2}
                    placeholder="e.g. Footfall plateaued, high acquisition costs, demo flatlining"
                    className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d35400] transition-colors resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#d35400] text-white py-3 px-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-200 hover:bg-white hover:text-black hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>START THE CLIMB</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/40 text-[11px] leading-none uppercase tracking-wider">{data.meta}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/[0.01] border border-white/5">
              <div>
                <h4 className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#d35400] mb-1">Height cleared</h4>
                <p className="text-2xl md:text-3xl font-display font-light text-white mb-0.5">{data.metric}</p>
                <p className="text-[10px] text-white/50">{data.metricLabel}</p>
              </div>
              
              <div className="md:border-l md:border-white/5 md:pl-4">
                <h4 className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-1">The ceiling</h4>
                <p className="text-white/70 leading-relaxed text-xs">{data.ceiling}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
              <div>
                <h4 className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-1.5">What we built</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.built?.map((b: string) => (
                    <span key={b} className="px-2 py-0.5 text-[9px] font-medium bg-[#d35400]/10 border border-[#d35400]/30 rounded-none text-white/90 tracking-wide">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="shrink-0 flex items-end">
                 <button 
                   onClick={() => setIsExpanded(!isExpanded)}
                   className="flex items-center gap-1.5 text-xs tracking-wide text-[#d35400] hover:text-white transition-colors group uppercase font-semibold"
                 >
                   {isExpanded ? 'Hide the climb' : 'Read full climb'} 
                   <ArrowRight size={14} className={`group-hover:translate-x-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                 </button>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && data.details && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4 border-t border-white/5 space-y-3"
                >
                  <div>
                    <h4 className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#d35400] mb-1">Objective</h4>
                    <p className="text-xs text-white/80 leading-relaxed">{data.details.objective}</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-1">What we did</h4>
                    <p className="text-xs text-white/70 leading-relaxed">{data.details.whatWeDid}</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-1">Outcome</h4>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">{data.details.outcome}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
