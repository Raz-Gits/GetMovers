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

function isValidDateString(str: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(str)) return false;
  const [year, month, day] = str.split('-').map(Number);
  if (month < 1 || month > 12) return false;
  const daysInMonth = getDaysInMonth(year, month - 1);
  if (day < 1 || day > daysInMonth) return false;
  return true;
}

export default function DatePicker({ value, onChange, placeholder = 'Select a date' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedValue, setTypedValue] = useState('');
  const [typeError, setTypeError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsTyping(false);
        setTypeError('');
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
    setIsTyping(false);
    setTypeError('');
  }

  function handleBarClick() {
    if (!isTyping) {
      setIsOpen(!isOpen);
    }
  }

  function handleTypeToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setIsTyping(true);
    setIsOpen(false);
    setTypedValue(value || '');
    setTypeError('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleTypedChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTypedValue(e.target.value);
    setTypeError('');
  }

  function handleTypedSubmit() {
    if (!typedValue.trim()) {
      setTypeError('Please enter a date');
      return;
    }

    let dateStr = typedValue.trim();

    const mdyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (mdyMatch) {
      const m = mdyMatch[1].padStart(2, '0');
      const d = mdyMatch[2].padStart(2, '0');
      dateStr = `${mdyMatch[3]}-${m}-${d}`;
    }

    const mdyShortMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
    if (mdyShortMatch) {
      const m = mdyShortMatch[1].padStart(2, '0');
      const d = mdyShortMatch[2].padStart(2, '0');
      const yr = parseInt(mdyShortMatch[3]) > 50 ? '19' + mdyShortMatch[3] : '20' + mdyShortMatch[3];
      dateStr = `${yr}-${m}-${d}`;
    }

    if (!isValidDateString(dateStr)) {
      setTypeError('Invalid date. Use MM/DD/YYYY format.');
      return;
    }

    const selected = new Date(dateStr + 'T00:00:00');
    if (selected < today) {
      setTypeError('Date cannot be in the past.');
      return;
    }

    onChange(dateStr);
    setIsTyping(false);
    setTypeError('');
  }

  function handleTypedKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleTypedSubmit();
    } else if (e.key === 'Escape') {
      setIsTyping(false);
      setTypeError('');
    }
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

      {isTyping ? (
        <div className="flex items-center w-full border-4 rounded-2xl overflow-hidden transition" style={{ borderColor: '#072233' }}>
          <input
            ref={inputRef}
            type="text"
            value={typedValue}
            onChange={handleTypedChange}
            onKeyDown={handleTypedKeyDown}
            onBlur={handleTypedSubmit}
            placeholder="MM/DD/YYYY"
            className="flex-1 pl-14 pr-4 py-5 outline-none text-lg font-medium"
          />
        </div>
      ) : (
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
          <button
            onClick={handleTypeToggle}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200 hover:bg-gray-100"
            style={{ color: '#072233' }}
            type="button"
          >
            Type it
          </button>
        </div>
      )}

      {typeError && (
        <p className="text-red-500 text-sm mt-2 ml-2 font-medium">{typeError}</p>
      )}

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
