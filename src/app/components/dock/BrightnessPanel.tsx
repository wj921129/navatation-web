/**
 * 文件名：BrightnessPanel.tsx
 * 描述：屏幕亮度调节面板
 * 创建时间：2026-06-09
 */
import React from 'react';

interface BrightnessPanelProps {
  isBrightnessOpen: boolean;
  isBrightnessClosing: boolean;
  theme: string;
  bgBrightness: number;
  setBgBrightness: (val: number) => void;
  setIsHoveringBrightness: (val: boolean) => void;
  setIsBrightnessClosing: (val: boolean) => void;
  clearBrightnessTimer: () => void;
  brightnessTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  triggerCloseBrightness: () => void;
}

export function BrightnessPanel({
  isBrightnessOpen,
  isBrightnessClosing,
  theme,
  bgBrightness,
  setBgBrightness,
  setIsHoveringBrightness,
  setIsBrightnessClosing,
  clearBrightnessTimer,
  brightnessTimerRef,
  triggerCloseBrightness
}: BrightnessPanelProps) {
  if (!isBrightnessOpen || theme !== 'dark') {
    return null;
  }

  return (
    <div
      onMouseEnter={() => {
        setIsHoveringBrightness(true);
        setIsBrightnessClosing(false);
        clearBrightnessTimer();
      }}
      onMouseLeave={() => {
        setIsHoveringBrightness(false);
        clearBrightnessTimer();
        brightnessTimerRef.current = setTimeout(() => {
          triggerCloseBrightness();
        }, 1000);
      }}
      className={`absolute top-[71px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/45 border border-white/10 shadow-xl backdrop-blur-md text-white select-none cursor-default whitespace-nowrap ${
        isBrightnessClosing ? 'brightness-panel-exit' : 'brightness-panel-enter'
      }`}
    >
      <span className="text-[11px] font-medium tracking-wide text-neutral-200">屏幕亮度</span>
      <input
        type="range"
        min="30"
        max="100"
        value={bgBrightness}
        onChange={(e) => {
          const val = Number(e.target.value);
          setBgBrightness(val);
          localStorage.setItem('navatation_bg_brightness', val.toString());
        }}
        className="w-24 h-1 rounded-lg appearance-none cursor-pointer bg-white/20 accent-white outline-none focus:outline-none"
        style={{
          WebkitAppearance: 'none',
          background: `linear-gradient(to right, #fff 0%, #fff ${(bgBrightness - 30) / 70 * 100}%, rgba(255, 255, 255, 0.2) ${(bgBrightness - 30) / 70 * 100}%, rgba(255, 255, 255, 0.2) 100%)`
        }}
      />
      <span className="text-[10px] font-mono font-semibold text-neutral-300 min-w-[28px] text-right">
        {bgBrightness}%
      </span>
    </div>
  );
}
