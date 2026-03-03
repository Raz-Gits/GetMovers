import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { searchByZipPrefix, lookupZip, type ZipEntry } from '../lib/zipSearch';
import { searchCities, searchCityState, type CityResult } from '../lib/citySearch';

interface LocationInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  onValidationChange?: (isValid: boolean) => void;
}

interface Suggestion {
  zip: string;
  city: string;
  state: string;
  type: 'zip' | 'city';
}

function validateLocation(location: string): boolean {
  if (!location.trim()) return false;
  const zipCodePattern = /\b\d{5}(-\d{4})?\b/;
  const cityStatePattern = /^[a-zA-Z\s]+,\s*[a-zA-Z]{2}$/;
  const cityStateZipPattern = /^[a-zA-Z\s]+,\s*[a-zA-Z]{2}\s+\d{5}$/;
  return (
    zipCodePattern.test(location) ||
    cityStatePattern.test(location) ||
    cityStateZipPattern.test(location)
  );
}

function toSuggestions(entries: (ZipEntry | CityResult)[], type: 'zip' | 'city'): Suggestion[] {
  return entries.map(e => ({ ...e, type }));
}

export default function LocationInput({
  name,
  value,
  onChange,
  placeholder,
  onValidationChange,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [autofilledFrom, setAutofilledFrom] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validated = validateLocation(value);
    setIsValid(validated);
    onValidationChange?.(validated);
  }, [value, onValidationChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emitChange = useCallback(
    (newValue: string) => {
      const syntheticEvent = {
        target: { name, value: newValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    },
    [name, onChange]
  );

  const handleSelect = (suggestion: Suggestion) => {
    const formatted = suggestion.zip
      ? `${suggestion.city}, ${suggestion.state} ${suggestion.zip}`
      : `${suggestion.city}, ${suggestion.state}`;
    emitChange(formatted);
    setShowSuggestions(false);
    setSuggestions([]);
    setAutofilledFrom(suggestion.type === 'zip' ? suggestion.zip : suggestion.city);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(e);
    setSelectedIndex(-1);

    if (autofilledFrom && !inputValue.includes(autofilledFrom)) {
      setAutofilledFrom('');
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = inputValue.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    const isNumeric = /^\d+$/.test(trimmed);
    const hasComma = trimmed.includes(',');

    if (isNumeric) {
      setIsLoading(true);
      setShowSuggestions(true);

      debounceRef.current = setTimeout(async () => {
        if (trimmed.length === 5) {
          const exact = await lookupZip(trimmed);
          if (exact) {
            setSuggestions(toSuggestions([exact], 'zip'));
          } else {
            setSuggestions([]);
          }
        } else if (trimmed.length >= 2) {
          const results = await searchByZipPrefix(trimmed, 8);
          setSuggestions(toSuggestions(results, 'zip'));
        }
        setIsLoading(false);
      }, 150);
    } else if (hasComma) {
      setIsLoading(true);
      setShowSuggestions(true);

      debounceRef.current = setTimeout(async () => {
        const results = await searchCityState(trimmed);
        setSuggestions(toSuggestions(results, 'city'));
        setIsLoading(false);
        if (results.length === 0) {
          const cityResults = await searchCities(trimmed.split(',')[0].trim());
          setSuggestions(toSuggestions(cityResults, 'city'));
        }
      }, 300);
    } else if (trimmed.length >= 3) {
      setIsLoading(true);
      setShowSuggestions(true);

      debounceRef.current = setTimeout(async () => {
        const results = await searchCities(trimmed);
        setSuggestions(toSuggestions(results, 'city'));
        setIsLoading(false);
      }, 400);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const showError = value && !isValid && !isLoading && suggestions.length === 0 && !showSuggestions;

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
          className={`w-full px-6 py-5 pr-16 border-2 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition text-lg bg-white ${
            showError
              ? 'border-red-400 focus:border-red-500'
              : 'border-blue-900 focus:border-red-500'
          }`}
          placeholder={placeholder}
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-blue-900 animate-spin" />
          ) : (
            <MapPin
              className={`w-6 h-6 ${showError ? 'text-red-500' : 'text-blue-900'}`}
            />
          )}
        </div>
      </div>

      {autofilledFrom && isValid && (
        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          Location set: {value}
        </p>
      )}

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-blue-900 rounded-2xl shadow-xl max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="px-6 py-4 text-gray-500 text-center flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Looking up locations...
            </div>
          ) : (
            <ul>
              {suggestions.map((s, index) => (
                <li
                  key={`${s.zip}-${s.city}-${s.state}-${index}`}
                  onClick={() => handleSelect(s)}
                  className={`px-6 py-4 cursor-pointer transition border-b border-gray-100 last:border-b-0 flex items-center gap-3 ${
                    selectedIndex === index ? 'bg-red-50' : 'hover:bg-red-50'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {s.type === 'zip' ? (
                      <span className="text-gray-900">
                        <span className="font-semibold">{s.zip}</span>
                        <span className="text-gray-500"> — </span>
                        {s.city}, {s.state}
                      </span>
                    ) : (
                      <span className="text-gray-900">
                        {s.city}, {s.state}
                        {s.zip && (
                          <span className="text-gray-400 ml-1.5 text-sm">{s.zip}</span>
                        )}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showError && (
        <p className="text-red-500 text-sm mt-2">
          Enter a ZIP code (e.g., 902) or city name (e.g., Austin)
        </p>
      )}
    </div>
  );
}
