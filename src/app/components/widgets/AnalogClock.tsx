import { useEffect, useState } from 'react'

/**
 * 模拟时钟 (Analog Clock)
 * 使用 SVG 渲染，玻璃拟态表盘配合平滑的刻度和指针设计。
 */
export default function AnalogClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // 指针旋转角度计算
  const hourDeg = (hours % 12) * 30 + minutes * 0.5
  const minuteDeg = minutes * 6 + seconds * 0.1
  const secondDeg = seconds * 6

  return (
    <div className="w-[160px] h-[160px] flex items-center justify-center rounded-full widget-private-clock relative select-none">
      {/* 表盘刻度 */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* 12个点 */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const isMajor = i % 3 === 0
          const r1 = isMajor ? 38 : 40
          const r2 = 43
          const x1 = 50 + r1 * Math.cos(angle)
          const y1 = 50 + r1 * Math.sin(angle)
          const x2 = 50 + r2 * Math.cos(angle)
          const y2 = 50 + r2 * Math.sin(angle)

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={
                isMajor
                  ? 'stroke-white/80 dark:stroke-white/60 stroke-[1.5]'
                  : 'stroke-white/40 dark:stroke-white/30 stroke-[0.8]'
              }
            />
          )
        })}

        {/* 时针 */}
        <line
          x1="50"
          y1="50"
          x2="72"
          y2="50"
          className="stroke-neutral-800 dark:stroke-white stroke-[2.5] stroke-linecap-round"
          style={{
            transformOrigin: '50px 50px',
            transform: `rotate(${hourDeg}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 1)',
          }}
        />

        {/* 分针 */}
        <line
          x1="50"
          y1="50"
          x2="85"
          y2="50"
          className="stroke-neutral-700 dark:stroke-neutral-200 stroke-[1.8] stroke-linecap-round"
          style={{
            transformOrigin: '50px 50px',
            transform: `rotate(${minuteDeg}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 1)',
          }}
        />

        {/* 秒针 */}
        <line
          x1="50"
          y1="50"
          x2="90"
          y2="50"
          className="stroke-red-500 stroke-[0.8]"
          style={{
            transformOrigin: '50px 50px',
            transform: `rotate(${secondDeg}deg)`,
            // 每秒顺滑 ticking 的弹簧阻尼过渡
            transition:
              secondDeg === 0 ? 'none' : 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        />

        {/* 表盘中心轴心圆 */}
        <circle cx="50" cy="50" r="2.5" className="fill-neutral-900 dark:fill-white" />
        <circle cx="50" cy="50" r="1.2" className="fill-red-500" />
      </svg>
    </div>
  )
}
