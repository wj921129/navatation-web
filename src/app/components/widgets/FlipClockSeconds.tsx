import { useEffect, useState } from 'react';

/**
 * 带秒钟的拟真翻页时钟 (Flip Clock with Seconds)
 * 采用拟真分割卡片设计，展示小时、分钟与秒钟。
 */
export default function FlipClockSeconds() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="w-fit h-[100px] flex items-center justify-center gap-3 rounded-2xl widget-private-clock px-3 py-2 select-none">
      {/* 小时卡片 */}
      <div className="relative w-16 h-20 rounded-xl bg-widget-bg border border-widget-border shadow-md flex items-center justify-center overflow-hidden">
        {/* 卡片上半部分阴影 */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/5 border-b border-black/30" />
        {/* 中间水平切线 */}
        <div className="absolute top-1/2 inset-x-0 h-[1px] bg-black/40 shadow-[0_1px_1px_rgba(255,255,255,0.05)]" />
        {/* 侧边切口圆孔模拟结构 */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-background" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-background" />
        {/* 数字 */}
        <span className="text-4xl font-semibold font-mono text-text-primary tabular-nums">
          {hours}
        </span>
      </div>

      {/* 闪烁冒号 */}
      <div className="flex flex-col gap-2 justify-center py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-[flip-colon-blink_1s_ease-in-out_infinite]" />
        <div className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-[flip-colon-blink_1s_ease-in-out_infinite_0.5s]" />
      </div>

      {/* 分钟卡片 */}
      <div className="relative w-16 h-20 rounded-xl bg-widget-bg border border-widget-border shadow-md flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/5 border-b border-black/30" />
        <div className="absolute top-1/2 inset-x-0 h-[1px] bg-black/40 shadow-[0_1px_1px_rgba(255,255,255,0.05)]" />
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-background" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-background" />
        <span className="text-4xl font-semibold font-mono text-text-primary tabular-nums">
          {minutes}
        </span>
      </div>

      {/* 闪烁冒号 */}
      <div className="flex flex-col gap-2 justify-center py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-[flip-colon-blink_1s_ease-in-out_infinite]" />
        <div className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-[flip-colon-blink_1s_ease-in-out_infinite_0.5s]" />
      </div>

      {/* 秒钟卡片 */}
      <div className="relative w-16 h-20 rounded-xl bg-widget-bg border border-widget-border shadow-md flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/5 border-b border-black/30" />
        <div className="absolute top-1/2 inset-x-0 h-[1px] bg-black/40 shadow-[0_1px_1px_rgba(255,255,255,0.05)]" />
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-background" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-background" />
        <span className="text-4xl font-semibold font-mono text-text-primary tabular-nums">
          {seconds}
        </span>
      </div>
    </div>
  );
}
