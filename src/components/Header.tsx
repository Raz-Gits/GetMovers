import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import logo from '../assets/mcmovers_logo.png';
import secondLogo from '../assets/2ecfc5b1-4ff7-4135-940f-56ae4c9001d9 copy.png';
import { trackCallClick } from '../lib/trackCallClick';

interface HeaderProps {
  forceCollapsed?: boolean;
  hideEstimators?: boolean;
}

function getEstimatorCount(): number {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const isBusinessHours =
    (day >= 1 && day <= 5 && hour >= 9 && hour < 22) ||
    (day === 0 && hour >= 9 && hour < 16);

  if (!isBusinessHours) return 2;

  const seed = Math.floor(now.getTime() / (12 * 60 * 60 * 1000));
  const rng = ((seed * 1664525 + 1013904223) >>> 0) % 5;
  return 5 + rng;
}

export default function Header({ forceCollapsed = false, hideEstimators = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [estimatorCount, setEstimatorCount] = useState(getEstimatorCount);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEstimatorCount(getEstimatorCount());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const collapsed = isMobile ? false : (scrolled || forceCollapsed);
  const mobileScrolled = isMobile && scrolled;

  return (
    <>
      <div
        className="bg-red-700 text-white text-[10px] md:text-sm font-medium"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 px-4 py-2">
          <span className="tracking-wide uppercase">Licensed & Insured Carrier</span>
          <span className="w-px h-3.5 bg-red-400" />
          <span className="tracking-wide">MC #: 00882866</span>
          <span className="w-px h-3.5 bg-red-400" />
          <span className="tracking-wide">DOT #: 2538365</span>
        </div>
      </div>

      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          collapsed
            ? 'top-0 py-0.5'
            : mobileScrolled
              ? 'top-0 py-2'
              : 'top-[36px] py-2 md:py-2.5'
        }`}
      >
        <div className="relative mx-2 md:mx-8">
          <div
            className={`bg-white rounded-2xl transition-all duration-300 ${
              collapsed
                ? 'px-2 md:px-5 py-0 shadow-md rounded-xl'
                : 'px-3 md:px-8 py-1.5 md:py-3 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <a href="/" className="flex-shrink-0 flex items-center gap-2 md:gap-4">
                <img
                  src={logo}
                  alt="MC Movers"
                  className={`transition-all duration-300 ${
                    collapsed ? 'h-8 md:h-12' : 'h-14 md:h-28'
                  }`}
                />
                <div className={`w-px bg-black transition-all duration-300 ${
                  collapsed ? 'h-6 md:h-8' : 'h-10 md:h-16'
                }`} />
                <img
                  src={secondLogo}
                  alt="MC Movers Badge"
                  className={`transition-all duration-300 ${
                    collapsed ? 'h-3 sm:h-2 md:h-4' : 'h-4 sm:h-2.5 md:h-6'
                  }`}
                />
              </a>

              <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:block">
                <div
                  className={`font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                    collapsed
                      ? 'text-sm md:text-sm lg:text-base [@media(min-width:820px)_and_(max-width:1024px)]:opacity-100 [@media(min-width:820px)_and_(max-width:1024px)]:scale-100'
                      : 'text-lg md:text-xl lg:text-2xl [@media(min-width:820px)_and_(max-width:1024px)]:opacity-0 [@media(min-width:820px)_and_(max-width:1024px)]:scale-0'
                  }`}
                >
                  <span style={{ color: '#072233' }}>My Community </span>
                  <span className="text-red-600">Movers</span>
                </div>
              </div>

              <a
                href="tel:2405990097#click-id#"
                onClick={() => trackCallClick('header_phone')} // call_source: header_phone
                className="flex items-center gap-2 md:gap-2.5 hover:opacity-90 transition-opacity duration-300 flex-shrink-0"
              >
                <div
                  className={`bg-red-600 rounded-full lg:flex items-center justify-center transition-all duration-300 hidden ${
                    collapsed ? 'p-2 lg:p-2.5' : 'p-3 lg:p-3.5'
                  }`}
                >
                  <Phone
                    className={`text-white transition-all duration-300 ${
                      collapsed ? 'w-3.5 h-3.5 lg:w-4 lg:h-4' : 'w-5 h-5 lg:w-6 lg:h-6'
                    }`}
                  />
                </div>
                <div className="text-left">
                  <div
                    className={`text-gray-400 uppercase tracking-wider font-medium hidden lg:block transition-all duration-300 ${
                      collapsed ? 'text-[10px]' : 'text-xs'
                    }`}
                  >
                    CALL NOW
                  </div>
                  <div
                    className={`text-red-600 font-bold transition-all duration-300 phone-pop whitespace-nowrap ${
                      collapsed ? 'text-xs md:text-base lg:text-lg' : 'text-xs md:text-xl lg:text-2xl'
                    }`}
                  >
                    (240) 599-0097
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div
            className={`absolute right-0 transition-all duration-300 ${
              collapsed || hideEstimators ? 'opacity-0 pointer-events-none top-full mt-1' : 'opacity-100 top-full mt-2'
            }`}
          >
            <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-md border border-gray-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] md:text-xs text-gray-500 font-medium whitespace-nowrap">
                <span className="text-green-600 font-semibold">{estimatorCount} Estimators</span> Available Now
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
