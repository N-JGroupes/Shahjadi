
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react'; // Only import ArrowUp as ArrowDown is no longer needed

interface Props {
  scrollRef: React.RefObject<HTMLDivElement>;
}

const PageScroller: React.FC<Props> = ({ scrollRef }) => {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Show immediately after very slight scroll (10px) to ensure visibility
      if (container.scrollTop > 10) {
        setShowButtons(true);
      } else {
        setShowButtons(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showButtons) return null;

  return (
    <div className="fixed bottom-32 right-4 flex flex-col gap-3 z-[100] print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
      <button 
        onClick={scrollToTop}
        className="w-11 h-11 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 shadow-2xl active:scale-90 transition-all hover:bg-emerald-50"
        title="উপরে যান"
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>
      {/* Removed the scroll to bottom button */}
    </div>
  );
};

export default PageScroller;
