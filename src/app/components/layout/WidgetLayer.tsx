import React, { type MutableRefObject } from 'react'
import BreatheWidget from '../widgets/BreatheWidget'
import CalendarWidget from '../widgets/CalendarWidget'
import ClockWidget from '../widgets/ClockWidget'
import PomodoroWidget from '../widgets/PomodoroWidget'
import WeatherWidget from '../widgets/WeatherWidget'

/**
 * WidgetLayerProps 组件/功能描述
 */
export interface WidgetLayerProps {
  isEditMode: boolean
  tempWidgets: any[]
  widgets: any[]
  clocksVisible: boolean
  calendarVisible: boolean
  weatherVisible: boolean
  activeDraggingId: string | null
  activeDraggingStyleRef: MutableRefObject<any>
  setActiveDraggingId: (id: string | null) => void
  setDragOffset: (offset: { x: number; y: number }) => void
  removeWidget: (id: string) => void
  updateWidgetMeta: (id: string, updater: (prev: any) => any) => void
}

/**
 * WidgetLayer 组件/功能描述
 */
export function WidgetLayer({
  isEditMode,
  tempWidgets,
  widgets,
  clocksVisible,
  calendarVisible,
  weatherVisible,
  activeDraggingId,
  activeDraggingStyleRef,
  setActiveDraggingId,
  setDragOffset,
  removeWidget,
  updateWidgetMeta,
}: WidgetLayerProps) {
  return (
    <>
      {(isEditMode ? tempWidgets : clocksVisible ? widgets : [])
        .filter((w) => w.type === 'clock')
        .map((widget) => (
          <ClockWidget
            key={widget.id}
            id={widget.id}
            style={widget.style as 'analog' | 'digital' | 'flip' | 'flip-seconds' | 'traditional'}
            x={widget.x}
            y={widget.y}
            isEditMode={isEditMode}
            isDragging={activeDraggingId === widget.id}
            onStartDrag={(id, style, ox, oy) => {
              activeDraggingStyleRef.current = style
              setActiveDraggingId(id)
              setDragOffset({ x: ox, y: oy })
            }}
            onDelete={removeWidget}
          />
        ))}

      {(isEditMode ? tempWidgets : clocksVisible ? widgets : [])
        .filter((w) => w.type === 'pomodoro')
        .map((widget) => (
          <PomodoroWidget
            key={widget.id}
            id={widget.id}
            x={widget.x}
            y={widget.y}
            isEditMode={isEditMode}
            isDragging={activeDraggingId === widget.id}
            onStartDrag={(id, type, ox, oy) => {
              activeDraggingStyleRef.current = type as any
              setActiveDraggingId(id)
              setDragOffset({ x: ox, y: oy })
            }}
            onDelete={removeWidget}
          />
        ))}

      {(isEditMode ? tempWidgets : clocksVisible ? widgets : [])
        .filter((w) => w.type === 'breathe')
        .map((widget) => (
          <BreatheWidget
            key={widget.id}
            id={widget.id}
            x={widget.x}
            y={widget.y}
            isEditMode={isEditMode}
            isDragging={activeDraggingId === widget.id}
            onStartDrag={(id, type, ox, oy) => {
              activeDraggingStyleRef.current = type as any
              setActiveDraggingId(id)
              setDragOffset({ x: ox, y: oy })
            }}
            onDelete={removeWidget}
          />
        ))}

      {(isEditMode ? tempWidgets : calendarVisible ? widgets : [])
        .filter((w) => w.type === 'calendar')
        .map((widget) => (
          <CalendarWidget
            key={widget.id}
            id={widget.id}
            style={widget.style}
            x={widget.x}
            y={widget.y}
            isEditMode={isEditMode}
            isDragging={activeDraggingId === widget.id}
            onStartDrag={(id, type, style, ox, oy) => {
              activeDraggingStyleRef.current = style as any
              setActiveDraggingId(id)
              setDragOffset({ x: ox, y: oy })
            }}
            onDelete={removeWidget}
          />
        ))}

      {(isEditMode ? tempWidgets : weatherVisible ? widgets : [])
        .filter((w) => w.type === 'weather')
        .map((widget) => (
          <WeatherWidget
            key={widget.id}
            id={widget.id}
            style={widget.style}
            x={widget.x}
            y={widget.y}
            meta={widget.meta}
            isEditMode={isEditMode}
            isDragging={activeDraggingId === widget.id}
            onStartDrag={(id, type, style, ox, oy) => {
              activeDraggingStyleRef.current = style as any
              setActiveDraggingId(id)
              setDragOffset({ x: ox, y: oy })
            }}
            onDelete={removeWidget}
            updateWidgetMeta={updateWidgetMeta}
          />
        ))}
    </>
  )
}
