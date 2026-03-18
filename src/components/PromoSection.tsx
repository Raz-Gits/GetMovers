import { useEffect, useRef, useState } from 'react';
import autoTransportImg from '../assets/autotrucknew.jpeg';
import { trackCallClick, trackCtaClick } from '../lib/trackCallClick';

export default function PromoSection({ onGetQuote }: { onGetQuote: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-white py-16 md:py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div
          ref={sectionRef}
          className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(48px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div
            className="flex-1 text-center md:text-left"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
            }}
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ color: '#072233', fontFamily: "'Playfair Display', serif" }}
            >
              Looking to Ship your Car?
            </h2>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
              MC Movers takes the stress out of every relocation. Our experienced crew handles everything from packing to delivery, so you can focus on settling into your new home. Contact us today for a free quote and discover why families trust us with every move.
            </p>
            <p className="text-gray-700 font-semibold text-base tracking-wide mb-5">
              CALL{' '}
              <a
                href="tel:2405990097"
                onClick={() => trackCallClick('promo_section_call')} // call_source: promo_section_call
                className="phone-pop transition-all duration-200 inline-block"
                style={{ color: '#072233' }}
              >
                (240) 599-0097
              </a>
            </p>
            <button
              onClick={() => { trackCtaClick('promo_section_cta'); onGetQuote(); }} // cta_source: promo_section_cta
              className="inline-block font-bold text-sm tracking-widest uppercase px-10 py-4 rounded transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
              style={{
                backgroundColor: '#dc2626',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            >
              Request Free Quote
            </button>
          </div>

          <div
            className="flex-1 w-full"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s',
            }}
          >
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src={autoTransportImg}
                alt="Auto transport truck on the highway"
                className="w-full h-72 md:h-96 object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
