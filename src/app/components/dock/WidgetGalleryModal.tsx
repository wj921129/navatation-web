import React, { useState } from 'react';
import { Clock, Calendar, Timer, CloudSun, Wind, X } from 'lucide-react';

interface WidgetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDragStart: (e: React.PointerEvent<HTMLButtonElement>, style: any) => void;
}

const CATEGORIES = [
  { id: 'clock', icon: Clock, label: '时钟组件' },
  { id: 'calendar', icon: Calendar, label: '日历组件' },
  { id: 'timer', icon: Timer, label: '效率组件' },
  { id: 'weather', icon: CloudSun, label: '天气组件' },
  { id: 'breathe', icon: Wind, label: '冥想组件' },
];

export function WidgetGalleryModal({ isOpen, onClose, onDragStart }: WidgetGalleryModalProps) {
  const [activeCategory, setActiveCategory] = useState('clock');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 遮罩层，点击关闭 */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* 居中主面板 */}
      <div className="relative w-[720px] h-[480px] bg-widget-bg/95 backdrop-blur-3xl border border-widget-border/40 rounded-3xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-4">
        {/* 左侧边栏 (Sidebar) */}
        <div className="w-[200px] bg-input-bg/30 border-r border-widget-border/30 p-4 flex flex-col gap-2">
          <div className="text-xs font-medium text-text-secondary mb-2 px-2">小组件中心</div>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-500 shadow-sm' 
                    : 'text-text-secondary hover:bg-input-bg/60 hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 右侧画廊 (Gallery) */}
        <div className="flex-1 p-6 relative overflow-y-auto">
          {/* 关闭按钮 */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-input-bg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              {CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>

            {/* 统一的网格布局，切换分类时外层不跳动 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-forwards" key={activeCategory}>
              
              {activeCategory === 'clock' && (
                <>
                  <WidgetCard title="翻页时钟" onDragStart={(e) => onDragStart(e, 'flip')}>
                    <div className="w-16 h-12 flex items-center justify-center gap-1 bg-input-bg border border-widget-border rounded-xl px-1">
                      <div className="w-6 h-8 rounded bg-widget-bg border border-widget-border flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold">12</span>
                      </div>
                      <div className="w-6 h-8 rounded bg-widget-bg border border-widget-border flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold">00</span>
                      </div>
                    </div>
                  </WidgetCard>

                  <WidgetCard title="翻页(秒)" onDragStart={(e) => onDragStart(e, 'flip-seconds')}>
                    <div className="w-20 h-12 flex items-center justify-center gap-1 bg-input-bg border border-widget-border rounded-xl px-1">
                      <div className="w-5 h-8 rounded bg-widget-bg border border-widget-border flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold">12</span>
                      </div>
                      <div className="w-5 h-8 rounded bg-widget-bg border border-widget-border flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold">00</span>
                      </div>
                      <div className="w-5 h-8 rounded bg-widget-bg border border-widget-border flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold">30</span>
                      </div>
                    </div>
                  </WidgetCard>

                  <WidgetCard title="极简时钟" onDragStart={(e) => onDragStart(e, 'analog')}>
                    <div className="w-12 h-12 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl">
                       <div className="w-8 h-8 rounded-full border-2 border-text-secondary flex justify-center items-center relative">
                          <div className="w-0.5 h-3 bg-text-secondary absolute bottom-1/2 origin-bottom rotate-[30deg] rounded-full" />
                          <div className="w-0.5 h-2.5 bg-text-secondary absolute bottom-1/2 origin-bottom rotate-[-45deg] rounded-full" />
                       </div>
                    </div>
                  </WidgetCard>

                  <WidgetCard title="经典时钟" onDragStart={(e) => onDragStart(e, 'traditional')}>
                    <div className="w-12 h-12 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl">
                       <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-widget-border flex justify-center items-center relative shadow-inner">
                          <div className="absolute inset-0 flex items-center justify-center"><div className="w-0.5 h-full py-0.5"><div className="w-full h-1 bg-text-secondary/50 rounded-full" /></div></div>
                          <div className="absolute inset-0 flex items-center justify-center rotate-90"><div className="w-0.5 h-full py-0.5"><div className="w-full h-1 bg-text-secondary/50 rounded-full" /></div></div>
                          <div className="w-0.5 h-2.5 bg-text-primary absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full" />
                          <div className="w-0.5 h-2 bg-text-secondary absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rotate-90 rounded-full" />
                          <div className="w-1 h-1 rounded-full bg-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       </div>
                    </div>
                  </WidgetCard>

                  <WidgetCard title="数字时钟" onDragStart={(e) => onDragStart(e, 'digital')}>
                    <div className="w-16 h-12 flex items-center justify-center bg-input-bg/40 border border-widget-border rounded-xl shadow-sm px-2">
                       <span className="text-xs font-mono font-bold tracking-wider text-text-primary">12:00</span>
                    </div>
                  </WidgetCard>
                </>
              )}

              {activeCategory === 'calendar' && (
                <WidgetCard title="月历" onDragStart={(e) => onDragStart(e, 'month')}>
                  <div className="w-16 h-16 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm overflow-hidden p-1">
                    <div className="w-full h-full flex flex-col gap-0.5">
                      <div className="w-full h-2 bg-blue-500/20 rounded-sm mb-1" />
                      <div className="flex justify-between w-full"><div className="w-2 h-2 rounded-sm bg-widget-border" /><div className="w-2 h-2 rounded-sm bg-widget-border" /><div className="w-2 h-2 rounded-sm bg-widget-border" /></div>
                      <div className="flex justify-between w-full"><div className="w-2 h-2 rounded-sm bg-widget-border" /><div className="w-2 h-2 rounded-sm bg-blue-500" /><div className="w-2 h-2 rounded-sm bg-widget-border" /></div>
                    </div>
                  </div>
                </WidgetCard>
              )}

              {activeCategory === 'timer' && (
                <WidgetCard title="番茄钟" onDragStart={(e) => onDragStart(e, 'pomodoro')}>
                  <div className="w-12 h-12 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500/60 flex items-center justify-center">
                      <div className="w-1 h-3 bg-blue-500/60 absolute top-2" />
                    </div>
                  </div>
                </WidgetCard>
              )}

              {activeCategory === 'weather' && (
                <WidgetCard title="简易天气" onDragStart={(e) => onDragStart(e, 'simple')}>
                  <div className="w-16 h-16 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm">
                    <CloudSun className="w-6 h-6 text-yellow-400" />
                  </div>
                </WidgetCard>
              )}

              {activeCategory === 'breathe' && (
                <WidgetCard title="冥想" onDragStart={(e) => onDragStart(e, 'breathe')}>
                  <div className="w-12 h-12 flex items-center justify-center relative bg-input-bg/20 border border-widget-border rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full border border-teal-500/30 flex items-center justify-center bg-teal-500/10">
                      <div className="w-4 h-4 rounded-full bg-teal-500/40" />
                    </div>
                  </div>
                </WidgetCard>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WidgetCard({ title, children, onDragStart }: { title: string, children: React.ReactNode, onDragStart: (e: React.PointerEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      onPointerDown={onDragStart}
      className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-input-bg/30 border border-widget-border/50 hover:bg-input-bg/80 hover:border-text-secondary/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
    >
      {/* 缩放以保持一致性 */}
      <div className="transform scale-110 group-hover:scale-125 transition-transform duration-300">
        {children}
      </div>
      <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">{title}</span>
    </button>
  );
}
