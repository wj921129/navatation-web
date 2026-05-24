import { Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SearchEngine {
  name: string;
  value: string;
  url: string;
  icon: string;
}

const searchEngines: SearchEngine[] = [
  { name: '谷歌', value: 'google', url: 'https://www.google.com/search?q=', icon: '/icons/google.svg' },
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd=', icon: '/icons/baidu.svg' },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q=', icon: '/icons/bing.svg' },
];

interface SearchEngineSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchEngineSelect({ value, onChange }: SearchEngineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentEngine = searchEngines.find(e => e.value === value) || searchEngines[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <img src={currentEngine.icon} alt={currentEngine.name} className="w-5 h-5 object-contain" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden z-20 min-w-[140px]">
          {searchEngines.map((engine) => (
            <button
              key={engine.value}
              type="button"
              onClick={() => {
                onChange(engine.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <img src={engine.icon} alt={engine.name} className="w-5 h-5 object-contain" />
                <span className="text-gray-800 text-sm">{engine.name}</span>
              </div>
              {engine.value === value && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { searchEngines };
