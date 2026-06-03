import { useEffect, useState } from 'react';

/**
 * 拟真翻页时钟 (Flip Clock)
 * 采用拟真分割卡片设计，左右结构展示小时与分钟，极具复古工业风感。
 */
export default function FlipClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  return (
    <div className="w-[200px] h-[100px] flex items-center justify-center gap-3 rounded-2xl glass-widget-xl px-3 py-2 select-none">
      {/* 小时卡片 */}
      <div className="relative w-16 h-20 rounded-xl bg-neutral-900 border border-neutral-800 shadow-md flex items-center justify-center overflow-hidden">
        {/* 卡片上半部分阴影 */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/5 border-b border-black/30" />
        {/* 中间水平切线 */}
        <div className="absolute top-1/2 inset-x-0 h-[1px] bg-black/40 shadow-[0_1px_1px_rgba(255,255,255,0.05)]" />
        {/* 侧边切口圆孔模拟结构 */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950" />
        {/* 数字 */}
        <span className="text-4xl font-semibold font-mono text-neutral-100 tabular-nums">
          {hours}
        </span>
      </div>

      {/* 闪烁冒号 */}
      <div className="flex flex-col gap-2 justify-center py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-white/80 animate-ping" />
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-white/80 animate-ping" />
      </div>

      {/* 分钟卡片 */}
      <div className="relative w-16 h-20 rounded-xl bg-neutral-900 border border-neutral-800 shadow-md flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/5 border-b border-black/30" />
        <div className="absolute top-1/2 inset-x-0 h-[1px] bg-black/40 shadow-[0_1px_1px_rgba(255,255,255,0.05)]" />
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950" />
        <span className="text-4xl font-semibold font-mono text-neutral-100 tabular-nums">
          {minutes}
        </span>
      </div>
    </div>
  );
}
