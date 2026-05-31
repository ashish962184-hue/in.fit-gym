import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles, Image } from "lucide-react";
import { getStoredGallery } from "../cmsDefaults";
export default function VisualGallery({ isOpen, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!isOpen) return null;
  const galleryItems = getStoredGallery();
  if (galleryItems.length === 0) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={onClose} />
        <div className="relative w-full max-w-md bg-[#121215] border border-white/10 rounded-sm p-8 text-center z-10 space-y-3">
          <Image className="w-8 h-8 text-[#EF4444] mx-auto" />
          <h4 className="font-serif italic text-lg font-bold">No Active Visual Assets</h4>
          <p className="text-xs text-zinc-200/60">Configure photographs using the Admin CMS panel.</p>
          <button onClick={onClose} className="px-5 py-2.5 bg-[#1A1A1E] hover:bg-[#EF4444] text-white text-[10px] font-bold tracking-wider uppercase rounded-sm cursor-pointer">
            Dismiss
          </button>
        </div>
      </div>;
  }
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  };
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };
  const activeItem = galleryItems[activeIndex] || galleryItems[0];
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {
    /* Backdrop */
  }
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#121215] border border-white/10 rounded-sm overflow-hidden shadow-2xl z-10">
        
        {
    /* Header bar */
  }
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C]">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-[#EF4444]" />
            <span className="text-[10px] text-[#EF4444] font-bold uppercase tracking-[0.2em] leading-none block">
              VIRTUAL FACILITY EXPLORATION
            </span>
          </div>
          <button
    onClick={onClose}
    className="text-zinc-200/60 hover:text-[#EF4444] p-1 pr-2 uppercase text-[10px] font-bold tracking-widest flex items-center gap-1 cursor-pointer"
  >
            DISMISS <X className="w-4 h-4" />
          </button>
        </div>

        {
    /* Slideshow area */
  }
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
          <img
    src={activeItem.image}
    alt={activeItem.title}
    referrerPolicy="no-referrer"
    className="w-full h-full object-cover select-none transition-transform duration-700"
  />
          
          {
    /* Edge shadow gradient overlays */
  }
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/45 pointer-events-none" />

          {
    /* Navigation Arrows */
  }
          <button
    onClick={handlePrev}
    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-sm bg-black/50 border border-white/10 hover:border-white text-white transition-all cursor-pointer"
  >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
    onClick={handleNext}
    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-sm bg-black/50 border border-white/10 hover:border-white text-white transition-all cursor-pointer"
  >
            <ChevronRight className="w-5 h-5" />
          </button>

          {
    /* Title banner */
  }
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent text-left">
            <span className="text-[9px] text-[#EF4444] bg-[#121215] border border-white/20 px-2.5 py-0.5 rounded-sm uppercase tracking-widest font-bold font-sans">
              {activeItem.category}
            </span>
            <h4 className="font-serif italic text-2xl text-white font-bold tracking-tight mt-1">
              {activeItem.title}
            </h4>
            <p className="text-white/80 text-xs mt-1.5 leading-relaxed max-w-2xl">
              {activeItem.description}
            </p>
          </div>

          {
    /* Indicators dots */
  }
          <div className="absolute top-4 right-4 flex gap-1.5 bg-black/50 backdrop-blur-sm p-1.5 rounded-sm border border-white/10">
            {galleryItems.map((_, i) => <button
    key={i}
    onClick={() => setActiveIndex(i)}
    className={`w-2.5 h-1 transition-all cursor-pointer ${activeIndex === i ? "bg-[#EF4444] w-6" : "bg-[#121215]/30 hover:bg-[#121215]/60"}`}
  />)}
          </div>
        </div>

        {
    /* Footer specifications */
  }
        <div className="p-4 bg-[#0B0B0C] border-t border-white/10 flex justify-between items-center text-xs text-zinc-200/60 font-sans">
          <span>
            Section {activeIndex + 1} of {galleryItems.length}
          </span>
          <span className="text-[#EF4444] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> STRENGTH HARDWARE INSIDE
          </span>
        </div>

      </div>
    </div>;
}
