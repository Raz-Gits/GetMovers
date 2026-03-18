import { Check } from 'lucide-react';

type FormStep = 'select_type' | 'location' | 'move_date_size' | 'contact_info';

const steps = [
  { label: 'Location', keys: ['select_type', 'location'] },
  { label: 'Details', keys: ['move_date_size'] },
  { label: 'Quote', keys: ['contact_info'] },
];

function getActiveIndex(currentStep: FormStep): number {
  return steps.findIndex((s) => s.keys.includes(currentStep));
}

interface StepIndicatorProps {
  currentStep: FormStep;
  variant?: 'light' | 'dark';
}

export default function StepIndicator({ currentStep, variant = 'dark' }: StepIndicatorProps) {
  const activeIndex = getActiveIndex(currentStep);

  return (
    <div className="flex items-center justify-center w-full max-w-md mx-auto">
      {steps.map((step, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;
        const isUpcoming = i > activeIndex;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-base md:text-lg font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'text-white'
                    : isActive
                      ? 'text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                }`}
                style={
                  isCompleted || isActive
                    ? { backgroundColor: '#072233', boxShadow: isActive ? '0 10px 15px -3px rgba(7,34,51,0.3)' : undefined }
                    : undefined
                }
              >
                {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`mt-2 text-sm md:text-base font-semibold transition-colors duration-300 ${
                  isCompleted || isActive
                    ? variant === 'light' ? 'text-white' : 'text-gray-800'
                    : variant === 'light' ? 'text-white/50' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="flex-1 mx-2 md:mx-3 mb-6">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i < activeIndex ? '' : 'bg-gray-200'
                  }`}
                  style={i < activeIndex ? { backgroundColor: '#072233' } : undefined}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
