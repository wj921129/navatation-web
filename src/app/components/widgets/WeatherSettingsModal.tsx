import { useState, useCallback } from 'react';
import { Search, X, MapPin, Loader2, Plus, Trash2 } from 'lucide-react';
import { BaseModal } from '../ui/BaseModal';

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

interface WeatherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationData[];
  onLocationsChange: (locations: LocationData[]) => void;
}

export function WeatherSettingsModal({ isOpen, onClose, locations, onLocationsChange }: WeatherSettingsModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchCity = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=zh`);
      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          setResults(data.results.map((r: any) => ({
            name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}${r.country ? ', ' + r.country : ''}`,
            lat: r.latitude,
            lon: r.longitude
          })));
        } else {
          setResults([]);
        }
      }
    } catch (err) {
      console.error('Failed to search city:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  let debounceTimer: ReturnType<typeof setTimeout>;

  const handleAdd = (loc: LocationData) => {
    if (!locations.some(l => l.lat === loc.lat && l.lon === loc.lon)) {
      onLocationsChange([...locations, loc]);
    }
    setQuery('');
    setResults([]);
  };

  const handleRemove = (index: number) => {
    const newLocs = [...locations];
    newLocs.splice(index, 1);
    onLocationsChange(newLocs);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} animationType="scale" position="center">
      <div className="w-[400px] bg-widget-bg/95 backdrop-blur-2xl border border-widget-border rounded-3xl p-6 shadow-2xl flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">天气城市配置</h2>
          <button onClick={onClose} className="p-2 hover:bg-input-bg rounded-full transition-colors text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => searchCity(e.target.value), 500);
              }}
              placeholder="搜索全球城市..."
              className="w-full pl-10 pr-4 py-2.5 bg-input-bg border-none rounded-xl text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-text-secondary"
            />
            {isSearching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary animate-spin" />
            )}
          </div>
          
          {results.length > 0 && query && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-widget-bg border border-widget-border rounded-xl shadow-xl z-10 overflow-hidden max-h-[200px] overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="px-4 py-3 hover:bg-input-bg cursor-pointer flex items-center justify-between transition-colors group" onClick={() => handleAdd(r)}>
                  <div className="flex items-center gap-2 text-text-primary text-[14px]">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="truncate max-w-[280px]">{r.name}</span>
                  </div>
                  <Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">已选城市 ({locations.length})</h3>
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
            {locations.length === 0 ? (
              <div className="text-center py-4 text-text-secondary text-[13px]">
                未配置城市，将使用当前定位
              </div>
            ) : (
              locations.map((loc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-input-bg/50 border border-widget-border hover:bg-input-bg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-[14px] font-medium text-text-primary truncate max-w-[220px]">{loc.name.split(',')[0]}</span>
                  </div>
                  <button onClick={() => handleRemove(i)} className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" aria-label="移除城市">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
