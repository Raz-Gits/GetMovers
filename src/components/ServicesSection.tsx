import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import militaryImg from '../assets/military.jpg';
import imageTruck2 from '../assets/imagetruck2.png';
import { trackCallClick } from '../lib/trackCallClick';

const services = [
  {
    id: 1,
    title: 'Long Distance Moves',
    description:
      'No matter how far you\'re headed, our team of experienced movers and dedicated coordinators are here to make every mile of your long distance move stress-free.',
    image: 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Highway long distance moving',
  },
  {
    id: 2,
    title: 'Packing and Storage',
    description:
      'Let us handle the hard part. Our skilled packing crew and secure storage solutions keep your belongings protected every step of the way, before, during, and after your move.',
    image: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Professional packing and storage',
  },
  {
    id: 3,
    title: 'Office Moves',
    description:
      'Relocating your business? We\'ll manage the entire process so your team can stay focused. From cubicles to conference rooms, we move it all efficiently and on schedule.',
    image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Office relocation',
  },
  {
    id: 4,
    title: 'Military Moves',
    description:
      'We proudly serve the men and women who serve our country. MC Movers specializes in military relocations, offering flexible scheduling and trusted service for military families nationwide.',
    image: militaryImg,
    alt: 'Smiling military service member',
  },
];

export default function ServicesSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full bg-white py-16 md:py-20 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${imageTruck2})` }}
      />
      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-14" style={{ color: '#072233' }}>
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, i) => (
            <div
              key={service.id}
              className="flex flex-col transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${500 + i * 100}ms`,
              }}
            >
              <div className="relative overflow-hidden rounded-xl shadow-md group">
                <img
                  src={service.image}
                  alt={service.alt}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: '#c0392b' }}
                />
              </div>
              <div className="pt-5 pb-2">
                <h3 className="text-xl md:text-2xl font-bold mb-3 leading-tight" style={{ color: '#072233' }}>
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <a
            href="tel:2405990097"
            onClick={() => trackCallClick('services_section_call')} // call_source: services_section_call
            className="inline-flex items-center gap-3 px-10 py-4 rounded font-bold text-base md:text-lg tracking-widest uppercase text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: '#072233',
              boxShadow: '0 4px 24px rgba(7,34,51,0.25)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0a3347';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(7,34,51,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#072233';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgba(7,34,51,0.25)';
            }}
          >
            <Phone size={20} />
            (240) 599-0097
          </a>
        </div>
      </div>
    </div>
  );
}
