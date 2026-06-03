import { useEffect, useState } from 'react';

/**
 * 数字时钟 (Digital Clock)
 * 具备精致半透明背景与数字微光效，展示时间与日期。
 */
export default function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = time.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const weekdayString = time.toLocaleDateString('zh-CN', { weekday: 'long' });

  return (
    <div className="w-[220px] h-[100px] flex flex-col items-center justify-center rounded-2xl glass-widget-xl px-4 py-3 select-none text-text-primary">
      {/* 24小时制时间显示，带有毛玻璃发光投影 */}
      <span className="text-3xl font-light font-mono tracking-wider text-neutral-800 dark:text-neutral-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] tabular-nums">
        {timeString}
      </span>
      {/* 日期与星期显示 */}
      <span className="text-xs text-neutral-600 dark:text-neutral-300 font-normal mt-1 flex gap-1.5">
        <span>{dateString}</span>
        <span className="opacity-80">|</span>
        <span>{weekdayString}</span>
      </span>
    </div>
  );
}
