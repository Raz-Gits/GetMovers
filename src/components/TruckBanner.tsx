import { useState, useEffect, useRef } from 'react';
import truckMovingVideo from '../assets/truckmoving.mov';
import { trackCtaClick } from '../lib/trackCallClick';

function useSlideIn(direction: 'left' | 'right') {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const base = 'transition-all duration-700 ease-out';
  const from = direction === 'left' ? 'opacity-0 -translate-x-16' : 'opacity-0 translate-x-16';
  const to = 'opacity-100 translate-x-0';
  return { ref, className: `${base} ${visible ? to : from}` };
}

function getDailyCount(): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const hash = ((seed * 2654435761) >>> 0) % 30;
  return 20 + hash;
}

interface TruckBannerProps {
  onGetQuote: () => void;
}

export default function TruckBanner({ onGetQuote }: TruckBannerProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const finalCount = getDailyCount();
  const slideLeft = useSlideIn('left');
  const slideRight = useSlideIn('right');
  const slideUp = useSlideIn('left');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const delay = setTimeout(() => {
          const duration = 3000;
          const steps = 60;
          const stepTime = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 5);
            const current = Math.round(eased * finalCount);
            setDisplayCount(Math.min(current, finalCount));
            if (step >= steps) {
              setDisplayCount(finalCount);
              clearInterval(timer);
            }
          }, stepTime);
          }, 1000);
          return () => { clearTimeout(delay); clearInterval(0); };
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [finalCount, hasAnimated]);
  return (
    <div ref={sectionRef} className="relative w-full overflow-hidden border-t border-white border-b border-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={truckMovingVideo}
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(7, 34, 51, 0.65)' }} />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <div ref={slideLeft.ref} className={slideLeft.className} style={{ transitionDelay: '500ms' }}>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-4xl">
            Affordable Long Distance Moving With Unmatched Quality
          </h2>
        </div>

        <div ref={slideRight.ref} className={slideRight.className} style={{ transitionDelay: '650ms' }}>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">
            Long distance moving starting at just $1999
          </p>
        </div>

        <div ref={slideUp.ref} className={slideUp.className} style={{ transitionDelay: '800ms' }}>
          <button
            onClick={() => { trackCtaClick('truck_banner_cta'); onGetQuote(); }} // cta_source: truck_banner_cta
            className="inline-block font-bold text-xs md:text-sm tracking-widest uppercase px-10 py-4 rounded transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 whitespace-nowrap"
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(220,38,38,0.4)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
          >
            Start Your Move - Get $500 Off
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <span className="text-5xl md:text-7xl font-extrabold tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ color: '#dc2626' }}>{displayCount}</span><span className="text-white">+</span>
          </span>
          <span className="mt-1 text-base md:text-lg text-white/80 font-medium tracking-wide">
            Booked a move Today
          </span>
        </div>
      </div>
    </div>
  );
}
