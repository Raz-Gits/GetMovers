import { useRef, useEffect, useState, useCallback } from 'react';
import { Award } from 'lucide-react';
import bestRelocationImg from '../assets/2ecfc5b1-4ff7-4135-940f-56ae4c9001d9 copy.png';
import bestMovingImg from '../assets/NewTop10Logo.png';
import dotTransportImg from '../assets/United_States_Department_of_Transportation_seal.svg.png';
import bbbImg from '../assets/bbb_a_rating_logo.jpg';
import googleBusinessImg from '../assets/googlebusinessclear.png';
import fmcsaImg from '../assets/US-FMCSA-Logo.svg';
import usMovingProtectImg from '../assets/USmovingprotect.webp';
import bestMovingServicesImg from '../assets/best-moving-services-provider-150x150.webp';

interface Badge {
  id: number;
  name: string;
  image?: string;
}

const badges: Badge[] = [
  { id: 1, name: 'Best Relocation', image: bestRelocationImg },
  { id: 2, name: 'Consumer Voice', image: bbbImg },
  { id: 3, name: 'TrustLink', image: dotTransportImg },
  { id: 4, name: 'Best Moving', image: bestMovingImg },
  { id: 5, name: 'Google Business', image: googleBusinessImg },
  { id: 6, name: 'US FMCSA', image: fmcsaImg },
  { id: 7, name: 'US Moving Protect', image: usMovingProtectImg },
  { id: 8, name: 'Best Moving Services Provider', image: bestMovingServicesImg },
];

export default function BadgeCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  const isPaused = useRef(false);
  const speed = 0.5;

  const measureWidth = useCallback(() => {
    if (!trackRef.current) return;
    const children = trackRef.current.children;
    let width = 0;
    for (let i = 0; i < badges.length; i++) {
      const child = children[i] as HTMLElement;
      if (child) {
        const style = window.getComputedStyle(child);
        width += child.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      }
    }
    setSingleSetWidth(width);
  }, []);

  useEffect(() => {
    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, [measureWidth]);

  useEffect(() => {
    if (singleSetWidth === 0) return;

    let animationId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused.current) {
        setOffset((prev) => {
          const next = prev + speed * (delta / 16);
          return next >= singleSetWidth ? next - singleSetWidth : next;
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [singleSetWidth]);

  const tripled = [...badges, ...badges, ...badges];

  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold" style={{ color: '#072233' }}>Certified & Trusted</h3>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => { isPaused.current = true; }}
        onMouseLeave={() => { isPaused.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ transform: `translateX(-${offset}px)` }}
        >
          {tripled.map((badge, index) => (
            <div
              key={`${badge.id}-${index}`}
              className="flex-shrink-0 mx-4 md:mx-8 transition-opacity duration-300 hover:scale-110"
              style={{ width: '150px' }}
            >
              <div className="bg-gray-50 rounded-xl p-4 shadow-md border border-gray-200 h-24 flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 hover:shadow-lg">
                {badge.image ? (
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <>
                    <Award className="w-8 h-8 mb-2" style={{ color: '#072233' }} />
                    <span className="text-xs font-semibold text-center" style={{ color: '#072233' }}>
                      {badge.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
