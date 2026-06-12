import { useState, useEffect, useRef } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, RefreshCw, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { LocationData } from './WeatherSettingsModal';

interface WeatherData {
  temp: number;
  description: string;
  icon: any;
  city: string;
}

interface SimpleWeatherProps {
  meta?: Record<string, any>;
}

/**
 * SimpleWeather 组件/功能描述
 */
export default function SimpleWeather({ meta }: SimpleWeatherProps) {
  const [weatherDataList, setWeatherDataList] = useState<(WeatherData | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedLocations, setResolvedLocations] = useState<LocationData[]>([]);

  // 1. 获取位置列表：从 meta 中读取，或依次使用定位、IP解析、默认北京
  useEffect(() => {
    let isMounted = true;

    const resolveLocations = async () => {
      if (meta?.locations && meta.locations.length > 0) {
        setResolvedLocations(meta.locations);
        return;
      }

      // 如果未配置，尝试获取当前位置
      setLoading(true);

      const fetchByIpOrFallback = async () => {
        try {
          const ipRes = await fetch('http://ip-api.com/json/');
          if (ipRes.ok) {
            const data = await ipRes.json();
            if (data && data.lat && data.lon && isMounted) {
              setResolvedLocations([{ name: data.city || '当前位置', lat: data.lat, lon: data.lon }]);
              return;
            }
          }
        } catch (e) {
          console.error("IP 定位失败", e);
        }
        
        // 兜底：北京
        if (isMounted) {
          setResolvedLocations([{ name: '北京', lat: 39.9042, lon: 116.4074 }]);
        }
      };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              setResolvedLocations([{
                name: '当前位置',
                lat: position.coords.latitude,
                lon: position.coords.longitude
              }]);
            }
          },
          (error) => {
            console.warn("Geolocation failed or denied, fallback to IP:", error);
            fetchByIpOrFallback();
          },
          { timeout: 5000 }
        );
      } else {
        fetchByIpOrFallback();
      }
    };

    resolveLocations();

    return () => { isMounted = false; };
  }, [meta?.locations]);

  // 2. 根据获取到的位置列表批量拉取天气数据
  const fetchWeather = async () => {
    if (resolvedLocations.length === 0) return;
    
    setLoading(true);
    try {
      const promises = resolvedLocations.map(async (loc) => {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
        if (res.ok) {
          const data = await res.json();
          const current = data.current_weather;
          
          let icon = <Sun className="w-8 h-8 text-yellow-400 drop-shadow-md" />;
          let desc = "晴";
          
          if (current.weathercode >= 1 && current.weathercode <= 3) {
             icon = <Cloud className="w-8 h-8 text-gray-400 drop-shadow-md" />;
             desc = "多云";
          } else if (current.weathercode >= 51 && current.weathercode <= 67) {
             icon = <CloudRain className="w-8 h-8 text-blue-400 drop-shadow-md" />;
             desc = "雨";
          } else if (current.weathercode >= 71 && current.weathercode <= 82) {
             icon = <CloudSnow className="w-8 h-8 text-sky-200 drop-shadow-md" />;
             desc = "雪";
          } else if (current.weathercode >= 95) {
             icon = <CloudLightning className="w-8 h-8 text-purple-400 drop-shadow-md" />;
             desc = "雷阵雨";
          }
          
          return {
            temp: Math.round(current.temperature),
            description: desc,
            icon,
            city: loc.name.split(',')[0] // 仅显示第一部分名称，避免过长
          };
        }
        return null;
      });

      const results = await Promise.all(promises);
      setWeatherDataList(results);
      // 避免索引越界
      if (currentIndex >= results.length) {
        setCurrentIndex(0);
      }
    } catch (e) {
      console.error("Failed to fetch weather", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // 30 mins
    return () => clearInterval(interval);
  }, [resolvedLocations]);

  // 3. 多城市轮播逻辑
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (weatherDataList.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % weatherDataList.length);
    }, 8000); // 8秒轮播
    return () => clearInterval(interval);
  }, [weatherDataList.length, isHovered]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + weatherDataList.length) % weatherDataList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % weatherDataList.length);
  };

  const currentWeather = weatherDataList[currentIndex];
  const hasMultiple = weatherDataList.length > 1;

  return (
    <div 
      className="w-[140px] h-[140px] rounded-3xl widget-private-card p-4 flex flex-col justify-between overflow-hidden relative group/weather"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-1 text-text-secondary w-[80%]">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-[10px] font-medium truncate" title={currentWeather?.city || '定位中'}>
            {currentWeather?.city || '定位中'}
          </span>
        </div>
        <button onClick={fetchWeather} className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer" aria-label="刷新天气">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
      
      {hasMultiple && (
        <>
          <button onClick={handlePrev} className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary opacity-0 group-hover/weather:opacity-100 transition-opacity z-10 bg-widget-bg/50 backdrop-blur rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleNext} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary opacity-0 group-hover/weather:opacity-100 transition-opacity z-10 bg-widget-bg/50 backdrop-blur rounded-full">
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      <div className="flex flex-col items-center gap-1 mt-1 transition-opacity duration-300 relative z-0">
        {currentWeather ? currentWeather.icon : <div className="w-8 h-8 animate-pulse bg-input-bg rounded-full"></div>}
        <span className="text-[32px] font-semibold text-text-primary tracking-tighter leading-none mt-1.5 drop-shadow-sm">
          {currentWeather ? `${currentWeather.temp}°` : '--°'}
        </span>
      </div>
      
      <div className="text-center text-[12px] font-medium text-text-secondary tracking-wide flex flex-col items-center gap-1 relative z-10">
        {currentWeather ? currentWeather.description : '加载中...'}
        
        {/* Pagination Dots */}
        {hasMultiple && (
          <div className="flex items-center gap-1 mt-0.5">
            {weatherDataList.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-3 bg-blue-500' : 'w-1 bg-text-secondary/30'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
