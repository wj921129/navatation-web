import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, RefreshCw, MapPin } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  icon: any;
  city: string;
}

export default function SimpleWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // 获取用户粗略位置或默认使用北京
      const lat = 39.9042;
      const lon = 116.4074;
      
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
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
        
        setWeather({
          temp: Math.round(current.temperature),
          description: desc,
          icon,
          city: "本地" 
        });
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
  }, []);

  return (
    <div className="w-[140px] h-[140px] rounded-3xl widget-private-card p-4 flex flex-col justify-between overflow-hidden relative">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-1 text-text-secondary">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] font-medium">{weather?.city || '定位中'}</span>
        </div>
        <button onClick={fetchWeather} className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer" aria-label="刷新天气">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
      
      <div className="flex flex-col items-center gap-1 mt-1">
        {weather ? weather.icon : <div className="w-8 h-8 animate-pulse bg-input-bg rounded-full"></div>}
        <span className="text-[32px] font-semibold text-text-primary tracking-tighter leading-none mt-1.5 drop-shadow-sm">
          {weather ? `${weather.temp}°` : '--°'}
        </span>
      </div>
      
      <div className="text-center text-[12px] font-medium text-text-secondary tracking-wide">
        {weather ? weather.description : '加载中...'}
      </div>
    </div>
  );
}
