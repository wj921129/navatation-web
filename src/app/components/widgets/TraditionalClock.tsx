import { useEffect, useState } from 'react'

/**
 * 传统挂钟样式 (Traditional Clock)
 * 使用 SVG 渲染，表盘包含 1 至 12 的正向阿拉伯数字、细腻的刻度以及平滑扫秒（Sweep）的指针。
 */
export default function TraditionalClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    // 每 50ms 更新一次以实现平滑的扫秒效果
    const timer = setInterval(() => {
      setTime(new Date())
    }, 50)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()
  const ms = time.getMilliseconds()

  // 计算平滑的角度
  const smoothSeconds = seconds + ms / 1000
  const smoothMinutes = minutes + smoothSeconds / 60
  const smoothHours = (hours % 12) + smoothMinutes / 60

  const hourDeg = smoothHours * 30
  const minuteDeg = smoothMinutes * 6
  const secondDeg = smoothSeconds * 6

  // 生成 1-12 阿拉伯数字
  const numbers = [...Array(12)].map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180
    // 半径 33
    const x = 50 + 33 * Math.cos(angle)
    const y = 50 + 33 * Math.sin(angle)
    const label = i === 0 ? '12' : String(i)
    return { x, y, label }
  })

  // 将 animate-fade-in 移至最外层包裹 div 上，以确保整个时钟组件（包含毛玻璃背景）同步淡入，
  // 防止外层容器与内部 SVG 因渲染时机/淡入动画不一致引发的背景闪烁问题。
  return (
    <div className="w-[160px] h-[160px] flex items-center justify-center rounded-full widget-private-opaque relative select-none animate-fade-in">
      {/* 表盘 SVG，逆时针旋转 90 度以使 0 弧度对应 12 点方向（移除了 animate-fade-in 以免与外层动画冲突导致背景色闪烁） */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* 60 个分/秒刻度 */}
        {[...Array(60)].map((_, i) => {
          const angle = (i * 6 * Math.PI) / 180
          const isHour = i % 5 === 0
          const r1 = isHour ? 41 : 44
          const r2 = 46
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
                isHour
                  ? 'stroke-neutral-800 dark:stroke-neutral-200 stroke-[1.2]'
                  : 'stroke-neutral-400 dark:stroke-neutral-600 stroke-[0.6]'
              }
            />
          )
        })}

        {/* 1 至 12 的正向数字，通过局部顺时针旋转 90 度抵消父容器的逆时针旋转 */}
        {numbers.map(({ x, y, label }) => (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(90 ${x} ${y})`}
            className="fill-neutral-800 dark:fill-neutral-200 font-sans font-semibold text-[8px] select-none"
          >
            {label}
          </text>
        ))}

        {/* 时针 */}
        <line
          x1="50"
          y1="50"
          x2="70"
          y2="50"
          className="stroke-neutral-800 dark:stroke-neutral-100 stroke-[2.8] stroke-linecap-round"
          style={{
            transformOrigin: '50px 50px',
            transform: `rotate(${hourDeg}deg)`,
          }}
        />

        {/* 分针 */}
        <line
          x1="50"
          y1="50"
          x2="84"
          y2="50"
          className="stroke-neutral-600 dark:stroke-neutral-300 stroke-[1.8] stroke-linecap-round"
          style={{
            transformOrigin: '50px 50px',
            transform: `rotate(${minuteDeg}deg)`,
          }}
        />

        {/* 秒针 */}
        <line
          x1="40"
          y1="50"
          x2="90"
          y2="50"
          className="stroke-red-500 dark:stroke-red-400 stroke-[0.8] stroke-linecap-round"
          style={{
            transformOrigin: '50px 50px',
            transform: `rotate(${secondDeg}deg)`,
          }}
        />

        {/* 中心轴心装饰 */}
        <circle cx="50" cy="50" r="3" className="fill-neutral-800 dark:fill-neutral-100" />
        <circle cx="50" cy="50" r="1.2" className="fill-red-500 dark:fill-red-400" />
      </svg>
    </div>
  )
}
