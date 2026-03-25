import { useState, useEffect, useRef } from 'react';
import { ArrowRight, MapPin, Phone, Mail, BedDouble, User, X } from 'lucide-react';
import LocationInput from './LocationInput';
import DatePicker from './DatePicker';
import StepIndicator from './StepIndicator';
import CallNowBanner from './CallNowBanner';
import { trackCallClick } from '../lib/trackCallClick';

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
}

interface ContactErrors {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

export default function BottomQuoteForm() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<FormStep>('select_type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInStateModal, setShowInStateModal] = useState(false);
  const [showLocationCallModal, setShowLocationCallModal] = useState(false);
  const [isFromValid, setIsFromValid] = useState(false);
  const [isToValid, setIsToValid] = useState(false);
  const [contactErrors, setContactErrors] = useState<ContactErrors>({
    firstName: '', lastName: '', email: '', phone: '',
  });
  const [formData, setFormData] = useState<FormData>({
    moveType: null, firstName: '', lastName: '', email: '', phone: '',
    currentAddress: '', destinationAddress: '', moveDate: '', homeSize: '',
  });

  const bottomStepPagePaths: Record<FormStep, string> = {
    select_type: '/bottom-form/step-select_type',
    location: '/bottom-form/step-location',
    move_date_size: '/bottom-form/step-move_date_size',
    contact_info: '/bottom-form/step-contact_info',
  };

  const bottomStepPageTitles: Record<FormStep, string> = {
    select_type: 'Bottom Quote - Select Move Type',
    location: 'Bottom Quote - Moving Locations',
    move_date_size: 'Bottom Quote - Date & Size',
    contact_info: 'Bottom Quote - Contact Info',
  };

  useEffect(() => {
    if (step !== 'select_type') {
      gtag('event', 'page_view', {
        page_path: bottomStepPagePaths[step],
        page_title: bottomStepPageTitles[step],
      });
    }
  }, [step]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToForm = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleMoveTypeSelect = (type: MoveType) => {
    gtag('event', 'form_step', {
      step_number: 1,
      step_name: 'bottom_location',
      move_type: type,
    });
    setFormData({ ...formData, moveType: type });
    setStep('location');
    scrollToForm();
  };

  const handleLocationNext = () => {
    if (isFromValid && isToValid) {
      gtag('event', 'form_step', {
        step_number: 2,
        step_name: 'bottom_moving_locations',
      });
      setShowLocationCallModal(true);
    }
  };

  const handleLocationContinue = () => {
    setShowLocationCallModal(false);
    setStep('move_date_size');
    scrollToForm();
  };

  const handleHomeSizeSelect = (size: string) => {
    gtag('event', 'form_step', {
      step_number: 3,
      step_name: 'bottom_home_size',
      bedroom_count: size,
    });
    setFormData({ ...formData, homeSize: size });
  };

  const handleMoveDateSizeNext = () => {
    if (formData.homeSize && formData.moveDate) {
      setStep('contact_info');
      scrollToForm();
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
    const errors: ContactErrors = { firstName: '', lastName: '', email: '', phone: '' };
    let isValid = true;
    if (!formData.firstName.trim()) { errors.firstName = 'First name is required'; isValid = false; }
    else if (formData.firstName.trim().length < 2) { errors.firstName = 'First name must be at least 2 characters'; isValid = false; }
    if (!formData.lastName.trim()) { errors.lastName = 'Last name is required'; isValid = false; }
    else if (formData.lastName.trim().length < 2) { errors.lastName = 'Last name must be at least 2 characters'; isValid = false; }
    if (!formData.email.trim()) { errors.email = 'Email address is required'; isValid = false; }
    else if (!validateEmail(formData.email)) { errors.email = 'Please enter a valid email address'; isValid = false; }
    if (!formData.phone.trim()) { errors.phone = 'Phone number is required'; isValid = false; }
    else if (!validatePhone(formData.phone)) { errors.phone = 'Please enter a valid 10-digit phone number'; isValid = false; }
    setContactErrors(errors);
    return isValid;
  };

  const handleContactNext = () => {
    if (validateContactFields()) {
      gtag('event', 'form_step', {
        step_number: 4,
        step_name: 'bottom_contact_info',
      });
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
          moveType: formData.moveType, firstName: formData.firstName,
          lastName: formData.lastName, email: formData.email, phone: formData.phone,
          currentAddress: formData.currentAddress, destinationAddress: formData.destinationAddress,
          moveDate: formData.moveDate, homeSize: formData.homeSize,
        }),
      });
      if (!response.ok) throw new Error('Submission failed');
      gtag('event', 'form_submitted', {
        step_number: 4,
        step_name: 'bottom_quote_submitted',
        lead_cost: 170,
      });
      gtag('event', 'generate_lead', {
        value: 170,
        currency: 'USD',
        form_type: 'bottom_quote_request',
      });
      setShowConfirmation(true);
      setStep('select_type');
      setFormData({
        moveType: null, firstName: '', lastName: '', email: '', phone: '',
        currentAddress: '', destinationAddress: '', moveDate: '', homeSize: '',
      });
      setContactErrors({ firstName: '', lastName: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        ref={sectionRef}
        className="w-full py-16 md:py-24"
        style={{ backgroundColor: '#072233' }}
      >
        <div
          className="container mx-auto px-4 md:px-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="max-w-3xl mx-auto">
            {step === 'select_type' && (
              <div className="space-y-8">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Request a FREE Moving Quote Today!
                </h2>

                <StepIndicator currentStep={step} variant="light" />

                <p className="text-xl md:text-2xl text-white font-bold">
                  Are you moving In-state or Out-of State?
                </p>

                <div className="grid grid-cols-2 gap-5 md:gap-8">
                  <button
                    onClick={() => handleMoveTypeSelect('out_of_state')}
                    className="group bg-white border-4 border-white rounded-2xl aspect-square md:aspect-auto p-4 md:p-8 hover:bg-red-50 hover:border-red-600 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-2 md:space-y-4">
                      <ArrowRight className="w-20 h-20 md:w-16 md:h-16 lg:w-20 lg:h-20 group-hover:text-red-600 stroke-[2] transition-colors duration-300" style={{ color: '#072233' }} />
                      <span className="text-base md:text-xl font-bold group-hover:text-red-600 transition-colors duration-300" style={{ color: '#072233' }}>
                        Out of State
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      gtag('event', 'form_step', {
                        step_number: 1,
                        step_name: 'bottom_location',
                        move_type: 'in_state',
                      });
                      setShowInStateModal(true);
                    }}
                    className="group bg-white border-4 border-white rounded-2xl aspect-square md:aspect-auto p-4 md:p-8 hover:bg-red-50 hover:border-red-600 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-2 md:space-y-4">
                      <MapPin className="w-20 h-20 md:w-16 md:h-16 lg:w-20 lg:h-20 group-hover:text-red-600 stroke-[2] transition-colors duration-300" style={{ color: '#072233' }} />
                      <span className="text-base md:text-xl font-bold group-hover:text-red-600 transition-colors duration-300" style={{ color: '#072233' }}>
                        In State
                      </span>
                    </div>
                  </button>
                </div>

                <div className="text-center pt-2 space-y-3">
                  <a
                    href="tel:2405990097#click-id#"
                    onClick={() => trackCallClick('bottom_form_phone')} // call_source: bottom_form_phone
                    className="inline-flex items-center gap-4 md:gap-5 hover:opacity-90 transition-opacity duration-300"
                  >
                    <div className="bg-red-600 rounded-full p-2.5 md:p-4 flex items-center justify-center shadow-lg">
                      <Phone className="w-5 h-5 md:w-8 md:h-8 text-white" />
                    </div>
                    <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-red-600 phone-pop whitespace-nowrap">
                      (240) 599-0097
                    </span>
                  </a>
                  <a href="tel:2405990097#click-id#" onClick={() => trackCallClick('bottom_form_text')} className="block text-lg md:text-2xl text-white font-bold hover:opacity-90 transition-opacity duration-300"> {/* call_source: bottom_form_text */}
                    Call Today - Phone Reservations get $500 off!
                  </a>
                </div>
              </div>
            )}

            {step === 'location' && (
              <div className="space-y-8">
                <StepIndicator currentStep={step} variant="light" />

                <button
                  onClick={() => { setStep('select_type'); scrollToForm(); }}
                  className="text-white/70 hover:text-white flex items-center text-lg font-medium transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180 mr-2" />
                  Back
                </button>

                <h2
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
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
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 text-xl disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {step === 'move_date_size' && (
              <div className="space-y-8">
                <StepIndicator currentStep={step} variant="light" />

                <button
                  onClick={() => { setStep('location'); scrollToForm(); }}
                  className="text-white/70 hover:text-white flex items-center text-lg font-medium transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180 mr-2" />
                  Back
                </button>

                <h2
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  How many bedrooms are you moving?
                </h2>

                <div className="grid grid-cols-2 gap-5">
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
                      className={`group bg-white border-4 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl ${
                        formData.homeSize === option.value
                          ? 'border-red-600 bg-red-50 shadow-lg'
                          : 'border-white hover:bg-red-50 hover:border-red-600'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center transition-colors duration-300 ${
                            formData.homeSize === option.value
                              ? 'border-red-600'
                              : 'group-hover:border-red-600'
                          }`}
                          style={{ borderColor: formData.homeSize === option.value ? undefined : '#072233' }}
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${
                                formData.homeSize === option.value ? 'text-red-600' : 'group-hover:text-red-600'
                              }`}
                              style={{ color: formData.homeSize === option.value ? undefined : '#072233' }}
                            >
                              {option.icon}
                            </span>
                            <BedDouble
                              className={`w-4 h-4 md:w-5 md:h-5 -mt-0.5 transition-colors duration-300 ${
                                formData.homeSize === option.value ? 'text-red-600' : 'group-hover:text-red-600'
                              }`}
                              style={{ color: formData.homeSize === option.value ? undefined : '#072233' }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                            formData.homeSize === option.value ? 'text-red-600' : 'group-hover:text-red-600'
                          }`}
                          style={{ color: formData.homeSize === option.value ? undefined : '#072233' }}
                        >
                          {option.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <h2
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  When are you planning to move?
                </h2>

                <DatePicker
                  value={formData.moveDate}
                  onChange={handleDateChange}
                  placeholder="Select your moving date"
                />

                <button
                  onClick={handleMoveDateSizeNext}
                  disabled={!formData.homeSize || !formData.moveDate}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 text-xl disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {step === 'contact_info' && (
              <div className="space-y-8">
                <StepIndicator currentStep={step} variant="light" />

                <button
                  onClick={() => { setStep('move_date_size'); scrollToForm(); }}
                  className="text-white/70 hover:text-white flex items-center text-lg font-medium transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180 mr-2" />
                  Back
                </button>

                <h2
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
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
                          contactErrors.firstName ? 'border-red-500' : 'border-white'
                        }`}
                      />
                    </div>
                    {contactErrors.firstName && <p className="text-red-400 text-sm mt-2 ml-2 font-medium">{contactErrors.firstName}</p>}
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
                          contactErrors.lastName ? 'border-red-500' : 'border-white'
                        }`}
                      />
                    </div>
                    {contactErrors.lastName && <p className="text-red-400 text-sm mt-2 ml-2 font-medium">{contactErrors.lastName}</p>}
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
                          contactErrors.phone ? 'border-red-500' : 'border-white'
                        }`}
                      />
                    </div>
                    {contactErrors.phone && <p className="text-red-400 text-sm mt-2 ml-2 font-medium">{contactErrors.phone}</p>}
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
                          contactErrors.email ? 'border-red-500' : 'border-white'
                        }`}
                      />
                    </div>
                    {contactErrors.email && <p className="text-red-400 text-sm mt-2 ml-2 font-medium">{contactErrors.email}</p>}
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
              </div>
            )}
          </div>
        </div>
      </div>

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
                href="tel:2405990097#click-id#"
                onClick={() => trackCallClick('bottom_location_modal_call')} // call_source: bottom_location_modal_call
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
                href="tel:2405990097#click-id#"
                onClick={() => trackCallClick('bottom_confirmation_modal_call')} // call_source: bottom_confirmation_modal_call
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 text-lg shadow-md w-full justify-center"
              >
                <Phone className="w-5 h-5" />
                <span className="phone-pop">(240) 599-0097</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
