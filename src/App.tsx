import { useState, useEffect, useRef } from 'react';
import { ArrowRight, MapPin, Phone, Mail, BedDouble, User, X } from 'lucide-react';
import Header from './components/Header';
import LocationInput from './components/LocationInput';
import DatePicker from './components/DatePicker';
import CallNowBanner from './components/CallNowBanner';
import BadgeCarousel from './components/BadgeCarousel';
import ServicesSection from './components/ServicesSection';
import TruckBanner from './components/TruckBanner';
import PromoSection from './components/PromoSection';
import BottomQuoteForm from './components/BottomQuoteForm';
import GoogleReviewsSection from './components/GoogleReviewsSection';
import StepIndicator from './components/StepIndicator';
import couchboxBg from './assets/newbackground.png';
import mcMoversLogo from './assets/mcmovers_logo.png';
import shakingHandsImg from './assets/shakinghandsmovers.png';

type MoveType = 'in_state' | 'out_of_state' | null;
type FormStep = 'select_type' | 'location' | 'move_date_size' | 'contact_info';

interface FormData {
  moveType: MoveType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentAddress: string;
  destinationAddress: string;
  moveDate: string;
  homeSize: string;
  additionalNotes: string;
}

interface ContactErrors {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function App() {
  const [step, setStep] = useState<FormStep>('select_type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInStateModal, setShowInStateModal] = useState(false);
  const [showLocationCallModal, setShowLocationCallModal] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [highlightMoveType, setHighlightMoveType] = useState(false);
  const promoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promoReshowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promoDismissCountRef = useRef(0);
  const moveTypeSelectedRef = useRef(false);
  const [isFromValid, setIsFromValid] = useState(false);
  const [isToValid, setIsToValid] = useState(false);
  const [contactErrors, setContactErrors] = useState<ContactErrors>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [formData, setFormData] = useState<FormData>({
    moveType: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentAddress: '',
    destinationAddress: '',
    moveDate: '',
    homeSize: '',
    additionalNotes: '',
  });

  useEffect(() => {
    const promoDismissed = localStorage.getItem('promoDismissed');
    if (promoDismissed) return;
    promoTimerRef.current = setTimeout(() => {
      if (!moveTypeSelectedRef.current) {
        setShowPromo(true);
      }
    }, 25000);
    return () => {
      if (promoTimerRef.current) clearTimeout(promoTimerRef.current);
      if (promoReshowTimerRef.current) clearTimeout(promoReshowTimerRef.current);
    };
  }, []);

  const handleMoveTypeSelect = (type: MoveType) => {
    moveTypeSelectedRef.current = true;
    if (promoTimerRef.current) clearTimeout(promoTimerRef.current);
    if (promoReshowTimerRef.current) clearTimeout(promoReshowTimerRef.current);
    setShowPromo(false);
    setFormData({ ...formData, moveType: type });
    setStep('location');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocationNext = () => {
    if (isFromValid && isToValid) {
      setShowLocationCallModal(true);
    }
  };

  const handleLocationContinue = () => {
    setShowLocationCallModal(false);
    setStep('move_date_size');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeSizeSelect = (size: string) => {
    setFormData({ ...formData, homeSize: size });
  };

  const handleMoveDateSizeNext = () => {
    if (formData.homeSize && formData.moveDate) {
      setStep('contact_info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData({ ...formData, phone: formatPhone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name in contactErrors) {
      setContactErrors({ ...contactErrors, [name]: '' });
    }
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, moveDate: date });
  };

  const validateContactFields = (): boolean => {
    const errors: ContactErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    setContactErrors(errors);
    return isValid;
  };

  const handleContactNext = () => {
    if (validateContactFields()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          moveType: formData.moveType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          currentAddress: formData.currentAddress,
          destinationAddress: formData.destinationAddress,
          moveDate: formData.moveDate,
          homeSize: formData.homeSize,
          additionalNotes: formData.additionalNotes,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      setStep('select_type');
      setShowConfirmation(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetQuote = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHighlightMoveType(true);
    setTimeout(() => setHighlightMoveType(false), 2500);
  };

  const resetForm = () => {
    setFormData({
      moveType: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      currentAddress: '',
      destinationAddress: '',
      moveDate: '',
      homeSize: '',
      additionalNotes: '',
    });
    setContactErrors({ firstName: '', lastName: '', email: '', phone: '' });
    setStep('select_type');
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header forceCollapsed={step !== 'select_type'} hideEstimators={step !== 'select_type'} />

      {step === 'select_type' && (
        <div
          className="relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${couchboxBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="container mx-auto px-4 pt-36 md:pt-56 pb-12 md:pb-20">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-8 pt-4 pb-8 md:px-8 md:pt-4 md:pb-6 lg:px-12 lg:pt-6 lg:pb-12 shadow-2xl border border-white/30">
                <div className="relative z-20 flex justify-center items-center">
                  <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl font-bold leading-tight px-2 whitespace-nowrap text-white text-center w-full" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Request a FREE Moving Quote Today!
                  </h1>
                </div>

                <div className="relative z-20 max-w-4xl mx-auto space-y-4 md:space-y-4 lg:space-y-8 mt-4 md:mt-4 lg:mt-6">
                  <StepIndicator currentStep={step} variant="light" />

                  <div
                    className={`text-xl md:text-2xl text-left font-bold transition-all duration-500 rounded-lg px-3 py-2 -mx-3 ${
                      highlightMoveType
                        ? 'text-yellow-300 scale-105 drop-shadow-[0_0_16px_rgba(253,224,71,0.9)]'
                        : 'text-white'
                    }`}
                  >
                    Are you moving In-state or Out-of State?
                  </div>

                  <div className="grid grid-cols-2 gap-6 md:gap-4 lg:gap-8">
                  <button
                    onClick={() => handleMoveTypeSelect('out_of_state')}
                    className={`group bg-white border-4 rounded-2xl aspect-square md:aspect-auto p-4 md:p-5 lg:p-10 hover:bg-red-50 hover:border-red-600 transition-all duration-300 hover:shadow-xl ${highlightMoveType ? 'animate-pulse shadow-[0_0_20px_rgba(253,224,71,0.7)]' : ''}`}
                    style={{ borderColor: highlightMoveType ? '#fde047' : '#072233' }}
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-2 md:space-y-2 lg:space-y-4">
                      <ArrowRight className="w-28 h-28 md:w-14 md:h-14 lg:w-20 lg:h-20 group-hover:text-red-600 stroke-[2] transition-colors duration-300" style={{ color: '#072233' }} />
                      <span className="text-base md:text-2xl font-bold group-hover:text-red-600 transition-colors duration-300" style={{ color: '#072233' }}>
                        Out of State
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowInStateModal(true)}
                    className={`group bg-white border-4 rounded-2xl aspect-square md:aspect-auto p-4 md:p-5 lg:p-10 hover:bg-red-50 hover:border-red-600 transition-all duration-300 hover:shadow-xl ${highlightMoveType ? 'animate-pulse shadow-[0_0_20px_rgba(253,224,71,0.7)]' : ''}`}
                    style={{ borderColor: highlightMoveType ? '#fde047' : '#072233' }}
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-2 md:space-y-2 lg:space-y-4">
                      <MapPin className="w-28 h-28 md:w-14 md:h-14 lg:w-20 lg:h-20 group-hover:text-red-600 stroke-[2] transition-colors duration-300" style={{ color: '#072233' }} />
                      <span className="text-base md:text-2xl font-bold group-hover:text-red-600 transition-colors duration-300" style={{ color: '#072233' }}>
                        In State
                      </span>
                    </div>
                  </button>
                </div>

                <CallNowBanner isLandingPage />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'select_type' && <BadgeCarousel />}
      {step === 'select_type' && <ServicesSection />}
      {step === 'select_type' && <TruckBanner onGetQuote={handleGetQuote} />}
      {step === 'select_type' && <GoogleReviewsSection />}
      {step === 'select_type' && <PromoSection onGetQuote={handleGetQuote} />}
      {step === 'select_type' && <BottomQuoteForm />}

      <div className={`container mx-auto px-4 pb-12 md:pb-20 transition-all duration-300 ${
        step === 'select_type' ? 'hidden' : 'pt-24 md:pt-28'
      }`}>
        <div className="max-w-6xl mx-auto">
          {step === 'location' && (
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
              <StepIndicator currentStep={step} />

              <button
                onClick={() => { setStep('select_type'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-slate-800 hover:text-red-600 flex items-center text-lg font-medium transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180 mr-2" />
                Back
              </button>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#072233' }}>
                Where are you moving from and to?
              </h2>

              <div className="space-y-5">
                <LocationInput
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  placeholder="I'm moving from... (e.g., 12345 or Austin, TX)"
                  onValidationChange={setIsFromValid}
                />

                <LocationInput
                  name="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={handleInputChange}
                  placeholder="I'm moving to... (e.g., 90210 or Miami, FL)"
                  onValidationChange={setIsToValid}
                />
              </div>

              <button
                onClick={handleLocationNext}
                disabled={!isFromValid || !isToValid}
                className="w-full text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 text-xl disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#072233' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a2d42'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#072233'}
              >
                Next
              </button>

              <CallNowBanner />
            </div>
          )}

          {step === 'move_date_size' && (
            <div className="max-w-4xl mx-auto space-y-10 md:space-y-12">
              <StepIndicator currentStep={step} />

              <button
                onClick={() => { setStep('location'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-slate-800 hover:text-red-600 flex items-center text-lg font-medium transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180 mr-2" />
                Back
              </button>

              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#072233' }}>
                  How many bedrooms are you moving?
                </h2>

                <div className="grid grid-cols-2 gap-5 md:gap-6">
                  {[
                    { value: 'studio', label: 'Studio Apartment', icon: '' },
                    { value: '1_bedroom', label: '1 Bedroom', icon: '1' },
                    { value: '2_bedroom', label: '2 Bedrooms', icon: '2' },
                    { value: '3_plus_bedroom', label: '3+ Bedrooms', icon: '3+' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleHomeSizeSelect(option.value)}
                      className={`group bg-white border-4 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl ${
                        formData.homeSize === option.value
                          ? 'border-red-600 bg-red-50 shadow-lg'
                          : 'hover:bg-red-50 hover:border-red-600'
                      }`}
                      style={{ borderColor: formData.homeSize === option.value ? undefined : '#072233' }}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div
                          className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 flex items-center justify-center transition-colors duration-300 ${
                            formData.homeSize === option.value
                              ? 'border-red-600'
                              : 'group-hover:border-red-600'
                          }`}
                          style={{ borderColor: formData.homeSize === option.value ? undefined : '#072233' }}
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${
                                formData.homeSize === option.value
                                  ? 'text-red-600'
                                  : 'group-hover:text-red-600'
                              }`}
                              style={{ color: formData.homeSize === option.value ? undefined : '#072233' }}
                            >
                              {option.icon}
                            </span>
                            <BedDouble
                              className={`w-5 h-5 md:w-6 md:h-6 -mt-0.5 transition-colors duration-300 ${
                                formData.homeSize === option.value
                                  ? 'text-red-600'
                                  : 'group-hover:text-red-600'
                              }`}
                              style={{ color: formData.homeSize === option.value ? undefined : '#072233' }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-base md:text-lg font-bold transition-colors duration-300 ${
                            formData.homeSize === option.value
                              ? 'text-red-600'
                              : 'group-hover:text-red-600'
                          }`}
                          style={{ color: formData.homeSize === option.value ? undefined : '#072233' }}
                        >
                          {option.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full -mx-4 md:-mx-0 px-4 md:px-0">
                <div className="w-full bg-red-600/10 border-l-4 border-red-600 py-3 md:py-4 px-6">
                  <p className="text-base md:text-lg lg:text-xl font-bold tracking-wide text-red-600">Moves Starting at $1,999</p>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#072233' }}>
                  When are you planning to move?
                </h2>

                <DatePicker
                  value={formData.moveDate}
                  onChange={handleDateChange}
                  placeholder="Select your moving date"
                />
              </div>

              <button
                onClick={handleMoveDateSizeNext}
                disabled={!formData.homeSize || !formData.moveDate}
                className="w-full text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 text-xl disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#072233' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a2d42'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#072233'}
              >
                Next
              </button>

              <CallNowBanner />
            </div>
          )}

          {step === 'contact_info' && (
            <div className="max-w-4xl mx-auto space-y-10 md:space-y-12">
              <StepIndicator currentStep={step} />

              <button
                onClick={() => { setStep('move_date_size'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-slate-800 hover:text-red-600 flex items-center text-lg font-medium transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180 mr-2" />
                Back
              </button>

              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#072233' }}>
                  How can we reach you?
                </h2>

                <div className="space-y-5">
                  <div>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none z-10" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        className={`w-full pl-14 pr-5 py-5 border-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-lg font-medium ${
                          contactErrors.firstName ? 'border-red-500' : ''
                        }`}
                        style={contactErrors.firstName ? undefined : { borderColor: '#072233' }}
                      />
                    </div>
                    {contactErrors.firstName && (
                      <p className="text-red-500 text-sm mt-2 ml-2 font-medium">{contactErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none z-10" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className={`w-full pl-14 pr-5 py-5 border-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-lg font-medium ${
                          contactErrors.lastName ? 'border-red-500' : ''
                        }`}
                        style={contactErrors.lastName ? undefined : { borderColor: '#072233' }}
                      />
                    </div>
                    {contactErrors.lastName && (
                      <p className="text-red-500 text-sm mt-2 ml-2 font-medium">{contactErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none z-10" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className={`w-full pl-14 pr-5 py-5 border-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-lg font-medium ${
                          contactErrors.phone ? 'border-red-500' : ''
                        }`}
                        style={contactErrors.phone ? undefined : { borderColor: '#072233' }}
                      />
                    </div>
                    {contactErrors.phone && (
                      <p className="text-red-500 text-sm mt-2 ml-2 font-medium">{contactErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none z-10" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        className={`w-full pl-14 pr-5 py-5 border-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-lg font-medium ${
                          contactErrors.email ? 'border-red-500' : ''
                        }`}
                        style={contactErrors.email ? undefined : { borderColor: '#072233' }}
                      />
                    </div>
                    {contactErrors.email && (
                      <p className="text-red-500 text-sm mt-2 ml-2 font-medium">{contactErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleContactNext}
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Get My Quote'}</span>
                {!isSubmitting && <ArrowRight className="w-6 h-6" />}
              </button>

              <CallNowBanner />
            </div>
          )}

        </div>
      </div>

      {showPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] md:max-w-5xl mx-auto overflow-hidden flex flex-row animate-fadeInScale" style={{ maxHeight: '90vh', minHeight: '260px' }}>
            <button
              onClick={() => {
                setShowPromo(false);
                promoDismissCountRef.current += 1;
                if (promoDismissCountRef.current >= 2 || moveTypeSelectedRef.current) {
                  localStorage.setItem('promoDismissed', '1');
                } else {
                  if (promoReshowTimerRef.current) clearTimeout(promoReshowTimerRef.current);
                  promoReshowTimerRef.current = setTimeout(() => {
                    if (!moveTypeSelectedRef.current) {
                      setShowPromo(true);
                    }
                  }, 40000);
                }
              }}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full w-7 h-7 md:w-9 md:h-9 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex-1 p-3 md:p-16 flex flex-col justify-center overflow-y-auto" style={{ backgroundColor: '#2563EB' }}>
              <h2 className="text-base md:text-4xl font-extrabold text-white mb-1.5 md:mb-6 leading-tight">
                Save Up to 40% When You Call Today
              </h2>
              <p className="text-white text-[11px] md:text-lg leading-relaxed mb-2 md:mb-8" style={{ opacity: 0.92 }}>
                Starting at $1,999 — call us now and lock in your exclusive discount before it's gone.
              </p>
              <a
                href="tel:2405990097"
                className="bg-red-600 text-white font-bold py-2 md:py-4 px-3 md:px-8 rounded-lg md:rounded-2xl transition-all duration-200 text-[11px] md:text-lg flex items-center justify-center gap-1 md:gap-2 hover:bg-red-700 hover:-translate-y-1 hover:shadow-lg w-full"
              >
                <Phone className="w-3 h-3 md:w-5 md:h-5" /> Call (240) 599-0097
              </a>
            </div>
            <div className="relative w-[160px] md:w-[500px] flex-shrink-0">
              <img
                src={shakingHandsImg}
                alt="Happy customers shaking hands with mover"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
            </div>
          </div>
        </div>
      )}

      {showInStateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto p-8 md:p-10 relative animate-fadeInScale">
            <button
              onClick={() => setShowInStateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#e8f0f5' }}>
                <MapPin className="w-8 h-8" style={{ color: '#072233' }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Outside Our Service Area
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Unfortunately, MC Movers is not currently licensed to service in-state moves in your area. We want to make sure you're in good hands.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                We recommend visiting <a href="https://getmovers.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 underline underline-offset-2 hover:opacity-70 transition-opacity">GetMovers.com</a> to find a <span className="font-semibold text-red-600">Local Mover</span> near you.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://getmovers.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full font-bold py-4 px-8 rounded-2xl transition-all duration-300 text-base text-white hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: '#072233' }}
              >
                <ArrowRight className="w-5 h-5" />
                Find a Mover on GetMovers.com
              </a>
              <button
                onClick={() => setShowInStateModal(false)}
                className="w-full py-3 px-8 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:text-gray-800 transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showLocationCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto p-8 md:p-10 relative animate-fadeInScale">
            <button
              onClick={handleLocationContinue}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#e8f0f5' }}>
                <Phone className="w-10 h-10" style={{ color: '#072233' }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Want an Instant Quote?
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Skip the wait and get a personalized estimate right now over the phone. Our estimators are standing by!
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Call Now & Save $500</h3>
              <p className="text-gray-600 text-sm mb-5">Exclusive phone-only discount for a limited time.</p>
              <a
                href="tel:2405990097"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 text-lg shadow-md w-full justify-center"
              >
                <Phone className="w-5 h-5" />
                <span className="phone-pop">(240) 599-0097</span>
              </a>
            </div>

            <button
              onClick={handleLocationContinue}
              className="w-full py-3 px-8 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:text-gray-800 transition-all duration-200"
            >
              Continue with Online Quote
            </button>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto p-8 md:p-10 relative animate-fadeInScale">
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Quote Request Sent!
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                We've received your moving request. An estimator will review your information and contact you as soon as possible.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Don't Want to Wait?</h3>
              <p className="text-gray-600 text-sm mb-5">Get $500 off for a Phone Estimate Today!</p>
              <a
                href="tel:2405990097"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 text-lg shadow-md w-full justify-center"
              >
                <Phone className="w-5 h-5" />
                <span className="phone-pop">(240) 599-0097</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6 md:px-12 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="space-y-5">
              <img
                src={mcMoversLogo}
                alt="MC Movers logo"
                className="h-16 w-auto object-contain"
              />
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Professional moving services you can trust. Licensed, insured, and committed to making your move stress-free.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg tracking-wide">Contact Info</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                  <a href="tel:2405990097" className="hover:text-white transition-colors phone-pop">(240) 599-0097</a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                  <a href="mailto:support@mc-movers.com" className="hover:text-white transition-colors">support@mc-movers.com</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                  <span>1021 Ives Dairy Rd St 212, Miami, FL 33179</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/>
                  </svg>
                  <span>Mon–Fri 9AM–6PM &nbsp;|&nbsp; Sun 9AM–4PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-gray-500 text-xs">
            <p>&copy; {new Date().getFullYear()} MC Movers. All rights reserved.</p>
            <p className="text-right whitespace-nowrap text-[10px] md:whitespace-normal md:text-xs">
              LICENSED &amp; INSURED CARRIER &nbsp;|&nbsp; MC #: 00882866 &nbsp;|&nbsp; DOT #: 2538365
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
