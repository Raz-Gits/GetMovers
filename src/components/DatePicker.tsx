import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export default function DatePicker({ value, onChange, placeholder = 'Select a date' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleDayClick(day: number) {
    const month = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${month}-${dayStr}`;
    const selected = new Date(dateStr + 'T00:00:00');
    if (selected < today) return;
    onChange(dateStr);
    setIsOpen(false);
  }

  function handleBarClick() {
    setIsOpen(!isOpen);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDay = value ? new Date(value + 'T00:00:00') : null;

  return (
    <div ref={containerRef} className="relative">
      <Calendar className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 z-10 pointer-events-none" />

      <div
        onClick={handleBarClick}
        className="w-full pl-14 pr-5 py-5 border-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-lg font-medium cursor-pointer flex items-center justify-between bg-white"
        style={{ borderColor: '#072233' }}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 right-0 md:right-auto md:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" style={{ color: '#072233' }} />
            </button>
            <h3 className="text-sm md:text-base font-bold" style={{ color: '#072233' }}>
              {MONTHS_SHORT[viewMonth]} {viewYear}
            </h3>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" style={{ color: '#072233' }} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS.map((d, idx) => (
              <div key={`${d}-${idx}`} className="text-center text-[10px] md:text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} />;
              }

              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const thisDate = new Date(dateStr + 'T00:00:00');
              const isPast = thisDate < today;
              const isSelected = selectedDay && day === selectedDay.getDate() && viewMonth === selectedDay.getMonth() && viewYear === selectedDay.getFullYear();
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-full aspect-square rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 flex items-center justify-center
                    ${isPast ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600 cursor-pointer'}
                    ${isSelected ? 'bg-red-600 text-white hover:bg-red-700 hover:text-white' : ''}
                    ${isToday && !isSelected ? 'ring-1.5 ring-red-300' : ''}
                  `}
                  style={!isSelected && !isPast ? { color: '#072233' } : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
