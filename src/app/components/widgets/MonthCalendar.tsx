import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * MonthCalendar 组件/功能描述
 */
export default function MonthCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-6 h-6"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = 
      new Date().getDate() === i &&
      new Date().getMonth() === currentDate.getMonth() &&
      new Date().getFullYear() === currentDate.getFullYear();
      
    days.push(
      <div key={`day-${i}`} className={`w-6 h-6 flex items-center justify-center text-[10px] rounded-full ${isToday ? 'bg-blue-500 text-white font-bold shadow-md' : 'text-text-primary hover:bg-input-bg transition-colors cursor-default'}`}>
        {i}
      </div>
    );
  }

  return (
    <div className="w-[200px] h-fit rounded-3xl widget-private-card p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] font-bold text-text-primary tracking-wider">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-input-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-input-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 place-items-center mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-[9px] text-text-secondary font-medium w-6 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {days}
      </div>
    </div>
  );
}
