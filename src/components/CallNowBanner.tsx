import { Phone } from 'lucide-react';
import { trackCallClick } from '../lib/trackCallClick';

interface CallNowBannerProps {
  isLandingPage?: boolean;
}

export default function CallNowBanner({ isLandingPage = false }: CallNowBannerProps) {
  if (isLandingPage) {
    return (
      <div className="text-center pt-0 pb-6 space-y-3">
        <a
          href="tel:2405990097#click-id#"
          onClick={() => trackCallClick('landing_banner_phone')} // call_source: landing_banner_phone
          className="inline-flex items-center gap-4 md:gap-5 hover:opacity-90 transition-opacity duration-300"
          style={{ color: '#072233' }}
        >
          <div className="bg-red-600 rounded-full p-2.5 md:p-4 lg:p-5 flex items-center justify-center shadow-lg">
            <Phone className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <div className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-red-600 phone-pop whitespace-nowrap">
            (240) 599-0097
          </div>
        </a>
        <a href="tel:2405990097#click-id#" onClick={() => trackCallClick('landing_banner_text')} className="block text-xl md:text-2xl text-white font-bold hover:opacity-90 transition-opacity duration-300"> {/* call_source: landing_banner_text */}
          Call Today - Phone Reservations get $500 off!
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-6 space-y-3">
      <a
        href="tel:2405990097#click-id#"
        onClick={() => trackCallClick('form_step_banner_phone')} // call_source: form_step_banner_phone
        className="inline-flex items-center gap-4 md:gap-5 hover:opacity-90 transition-opacity duration-300"
        style={{ color: '#072233' }}
      >
        <div className="bg-red-600 rounded-full p-3 md:p-5 flex items-center justify-center shadow-lg lg:hidden">
          <Phone className="w-6 h-6 md:w-10 md:h-10 text-white" />
        </div>
        <div className="text-2xl md:text-5xl lg:text-6xl font-bold text-red-600 phone-pop whitespace-nowrap">
          (240) 599-0097
        </div>
      </a>
      <a href="tel:2405990097#click-id#" onClick={() => trackCallClick('form_step_banner_text')} className="block text-xl md:text-2xl font-bold hover:opacity-90 transition-opacity duration-300" style={{ color: '#072233' }}> {/* call_source: form_step_banner_text */}
        Call Now
      </a>
    </div>
  );
}
