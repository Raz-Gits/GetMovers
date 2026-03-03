import { Star } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

function useSlideIn(direction: 'left' | 'right', delay = 0) {
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
  return { ref, className: base + ' ' + (visible ? to : from), style: { transitionDelay: `${delay}ms` } };
}

const reviews = [
  {
    name: 'Joseph Billisi',
    text: 'I used MC Movers for my local move from a 2-bedroom apartment in Miami to a new house in California on November 15, 2025. I was initially stressed about the process, but the entire experience was fantastic from start to finish. I would absolutely use MC Movers and have already recommended them to my friends and family. If you\'re looking for reliable, professional, and careful movers, these are your guys!',
    url: 'https://maps.app.goo.gl/H5rjD16HRakfVUR4A',
  },
  {
    name: 'Cameron Kay',
    text: 'I recently relocated from Miami to Orlando, and MC Movers Miami made the entire process seamless and stress-free! They handled my belongings with care, ensuring everything arrived in perfect condition. A huge shoutout to David for providing exceptional customer service—his professionalism, patience, and dedication went above and beyond my expectations. Without MC Movers Miami, I don\'t know how I would\'ve managed to get my child to school on time during this move. They truly saved the day! If you\'re looking for a reliable, top-notch moving company, MC Movers Miami is the way to go. Highly recommend!',
    url: 'https://maps.app.goo.gl/tYbmwsBYantwJDh76',
  },
  {
    name: 'John Farah',
    text: 'MC Movers truly impressed me. I moved from Arizona to Georgia and THE BEST EXPERIENCE EVER. Their customer service team kept me informed every step of the way and made the whole process easy to handle. The drivers were outstanding — extremely professional, careful with every piece, and very respectful throughout the move. Delivery was right on schedule and everything arrived in perfect condition. This company really goes the extra mile, and I wouldn\'t hesitate to use them again for my next move.',
    url: 'https://maps.app.goo.gl/KwncgjddxvqZDLhX8',
  },
  {
    name: 'Freeman Ha',
    text: 'I moved with this company on February 2 and it was the best experience ever. I moved from Colorado to New York and it was a great move. the customer service was very helpful the driver themselves were professional. It was a pretty long move so it took some time for delivery but I understood there procedures so at the end of the day I did receive my items in perfect condition.',
    url: 'https://maps.app.goo.gl/H5rjD16HRakfVUR4A',
  },
  {
    name: 'Guy K',
    text: 'My Name is Guy and I recently reserved my house-hold goods move with MC Movers. My wife chose those company and could not have made a better decision. No fragile broken or missing pieces. Boxes are percect. I honestly have been so far pleased with the entire move! Thank you All. Especially David and Berto. We moved from Seattle, Washington to Dallas Texas.',
    url: 'https://maps.app.goo.gl/m6iam5ptFGrpCfkZA',
  },
];

const duplicated = [...reviews, ...reviews, ...reviews];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function GoogleReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const slideLeft = useSlideIn('left', 500);
  const slideRight = useSlideIn('right', 650);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.4;

    const step = () => {
      if (!pausedRef.current) {
        posRef.current += speed;
        const half = track.scrollWidth / 3;
        if (posRef.current >= half) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <section className="py-16 md:py-20 overflow-hidden border-b border-white" style={{ background: 'linear-gradient(to bottom, #dc2626 0%, #b91c1c 100%)' }}>
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center">
          <div ref={slideLeft.ref} className={slideLeft.className} style={slideLeft.style}>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: '#072233' }}
            >
              What our 18,000+ Customers Say
            </h2>
          </div>
          <div ref={slideRight.ref} className={slideRight.className} style={slideRight.style}>
            <p className="text-white/80 text-lg">Real reviews from real customers on Google</p>
          </div>
        </div>
      </div>

      <div
        className="relative w-full"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
      >
        <div
          ref={trackRef}
          className="flex gap-5 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {duplicated.map((review, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm flex flex-col"
              style={{ width: '420px', padding: '28px 32px' }}
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed italic flex-1 mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                "{review.text}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#072233' }}>{review.name}</p>
                </div>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors group"
                >
                  <GoogleIcon />
                  <span className="group-hover:underline">Google</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24" style={{ background: 'linear-gradient(to left, white, transparent)' }} />
      </div>
    </section>
  );
}
