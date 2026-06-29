import { closestCenter, DndContext } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { Layers, Plus } from 'lucide-react'
import { useState } from 'react'
import { resolveAssetUrl } from '@/app/services/api-client'
import { StackShortcut } from '../../constants/recommendedSitesData'
import { v4 as uuidv4 } from 'uuid'
import { GridDragOverlay, UnifiedDragItem } from '../ui/GridDragOverlay'
import { IconMap } from '../ui/IconMap'
import { SortableGridItem } from '../ui/SortableGridItem'
import { Tooltip } from '../ui/Tooltip'
import { DraggableShortcut } from './DraggableShortcut'
import { IconEntryModal } from './IconEntryModal'
import { StackExpandModal } from './StackExpandModal'
import { ShortcutStackItem } from './ShortcutStackItem'

/**
 * ShortcutGridProps 组件/功能描述
 */
export interface ShortcutGridProps {
  settings: any
  isEditMode: boolean
  displayShortcuts: any[]
  sensors: any
  handleDragStartGrid: (event: any) => void
  handleDragEndGrid: (event: any) => void
  handleDragCancelGrid: () => void
  activeDragShortcut: any
  handleEditShortcut: (index: number) => void
  handleDeleteShortcut: (index: number) => void
  setIsAddShortcutOpen: (v: boolean) => void
  handleAddStack: (stack: StackShortcut) => void
}

/**
 * ShortcutGrid 组件/功能描述
 */
export function ShortcutGrid({
  settings,
  isEditMode,
  displayShortcuts,
  sensors,
  handleDragStartGrid,
  handleDragEndGrid,
  handleDragCancelGrid,
  activeDragShortcut,
  handleEditShortcut,
  handleDeleteShortcut,
  setIsAddShortcutOpen,
  handleAddStack,
}: ShortcutGridProps) {
  const [isIconEntryOpen, setIsIconEntryOpen] = useState(false)
  const [isStackExpandOpen, setIsStackExpandOpen] = useState(false)
  const [activeStack, setActiveStack] = useState<StackShortcut | null>(null)

  const iconInnerSize = settings.iconSize * 0.5
  const borderRadius = `${settings.iconRadius}%`

  return (
    <>
      <div
        className="flex flex-wrap justify-center w-full mx-auto"
        style={{
          gap: `${settings.iconSpacingY}px ${settings.iconSpacingX}px`,
          maxWidth: '1200px',
          paddingLeft: `${settings.iconsMarginX}%`,
          paddingRight: `${settings.iconsMarginX}%`,
        }}
      >
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStartGrid}
            onDragEnd={handleDragEndGrid}
            onDragCancel={handleDragCancelGrid}
          >
            <SortableContext
              items={displayShortcuts.map((s, idx) => s.dragId || `shortcut-edit-${idx}`)}
              strategy={rectSortingStrategy}
            >
              {displayShortcuts.map((shortcut, globalIndex) => (
                <SortableGridItem
                  key={shortcut.dragId || `shortcut-edit-${globalIndex}`}
                  id={shortcut.dragId || `shortcut-edit-${globalIndex}`}
                >
                  {({ dragHandleProps }: any) => (
                    <DraggableShortcut
                      shortcut={shortcut}
                      iconInnerSize={iconInnerSize}
                      iconSize={settings.iconSize}
                      iconRadius={settings.iconRadius}
                      iconTextGap={settings.iconTextGap}
                      textSize={settings.textSize}
                      onEdit={() => handleEditShortcut(globalIndex)}
                      onDelete={() => handleDeleteShortcut(globalIndex)}
                      dragHandleProps={dragHandleProps}
                    />
                  )}
                </SortableGridItem>
              ))}
            </SortableContext>
            <GridDragOverlay>
              {activeDragShortcut ? (
                <UnifiedDragItem
                  shortcut={activeDragShortcut}
                  iconSize={settings.iconSize}
                  borderRadius={borderRadius}
                  iconInnerSize={iconInnerSize}
                  showText={true}
                  textSize={settings.textSize}
                  className="bg-icon-bg border-2 border-blue-500/60"
                />
              ) : null}
            </GridDragOverlay>
          </DndContext>
        ) : (
          <>
            {displayShortcuts.map((shortcut, globalIndex) => {
              const isStack = shortcut.type === 'stack'
              return (
                <div
                  key={shortcut.dragId || `shortcut-${globalIndex}`}
                  className="flex flex-col items-center group relative"
                  style={{
                    width: `${settings.iconSize + 32}px`,
                    gap: `${settings.iconTextGap}px`,
                  }}
                >
                  {isStack ? (
                    <div className="flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-110">
                      <ShortcutStackItem
                        shortcut={shortcut}
                        iconSize={settings.iconSize}
                        borderRadius={borderRadius}
                        onClick={() => {
                          setActiveStack(shortcut)
                          setIsStackExpandOpen(true)
                        }}
                      />
                    </div>
                  ) : (
                    <a
                      href={shortcut.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-110"
                      style={{
                        width: `${settings.iconSize}px`,
                        height: `${settings.iconSize}px`,
                      }}
                    >
                      <div
                        className="bg-icon-bg border border-widget-border flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden w-full h-full"
                        style={{
                          borderRadius: borderRadius,
                        }}
                      >
                        {(() => {
                          if (
                            shortcut.iconType === 'CUSTOM_URL' ||
                            shortcut.iconType === 'FAVICON' ||
                            shortcut.iconType === 'CUSTOM_UPLOAD'
                          ) {
                            return (
                              <img
                                src={resolveAssetUrl(shortcut.iconValue)}
                                alt={shortcut.name}
                                style={{
                                  width: '50%',
                                  height: '50%',
                                  objectFit: 'contain',
                                }}
                              />
                            )
                          }
                          let IconComp = IconMap.Link
                          const iconName = shortcut.iconValue
                          if (iconName && IconMap[iconName]) {
                            IconComp = IconMap[iconName]
                          }
                          return (
                            <IconComp
                              style={{
                                color: shortcut.color || '#333',
                                width: `${iconInnerSize}px`,
                                height: `${iconInnerSize}px`,
                              }}
                              strokeWidth={2}
                            />
                          )
                        })()}
                      </div>
                    </a>
                  )}
                  <span
                    className="text-white font-light tracking-wide drop-shadow-lg text-center w-full truncate px-1"
                    style={{ fontSize: `${settings.textSize}px` }}
                  >
                    {shortcut.name}
                  </span>
                </div>
              )
            })}
          </>
        )}

        {/* Add Shortcut Button */}
        {isEditMode ? (
          <Tooltip content="添加图标" side="top">
            <button
              onClick={() => setIsIconEntryOpen(true)}
              className="flex flex-col items-center group"
              style={{
                gap: `${settings.iconTextGap}px`,
                width: `${settings.iconSize + 32}px`,
              }}
            >
              <div
                className="bg-icon-bg/80 border border-widget-border/80 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer hover:bg-icon-bg hover:border-widget-border shrink-0"
                style={{
                  width: `${settings.iconSize}px`,
                  height: `${settings.iconSize}px`,
                  borderRadius: borderRadius,
                }}
              >
                <Plus
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                  style={{
                    width: `${iconInnerSize}px`,
                    height: `${iconInnerSize}px`,
                  }}
                  strokeWidth={2}
                />
              </div>
            </button>
          </Tooltip>
        ) : null}
      </div>

      <IconEntryModal
        isOpen={isIconEntryOpen}
        onClose={() => setIsIconEntryOpen(false)}
        onSelectSingle={() => {
          setIsIconEntryOpen(false)
          setIsAddShortcutOpen(true)
        }}
        onSelectStack={() => {
          setIsIconEntryOpen(false)
          const newStack: StackShortcut = {
            type: 'stack',
            dragId: uuidv4(),
            name: '未命名文件夹',
            children: [],
          }
          handleAddStack(newStack)
        }}
      />

      <StackExpandModal
        isOpen={isStackExpandOpen}
        onClose={() => setIsStackExpandOpen(false)}
        stack={activeStack}
      />
    </>
  )
}
