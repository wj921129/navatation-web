import { X, CheckSquare, Trash2, Loader2, CheckCircle2, Circle, Copy, RotateCcw, ArrowLeft, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { TodoItem } from '../services/todo-service';
import { authStore } from '../stores/auth-store';
import { todoStore } from '../stores/todo-store';

interface TodoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 格式化日期时间为 yyyy-MM-dd HH:mm:ss */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  } catch {
    return '';
  }
}

/**
 * 待办事项面板 - 从右侧滑出的面板组件
 * 支持创建、切换完成、双击编辑、删除和清除已完成功能。
 * 使用 todoStore 实现全局状态共享，使首页其他挂载的小组件能实时联动。
 */
export function TodoPanel({ isOpen, onClose }: TodoPanelProps) {
  const [todoState, setTodoState] = useState(todoStore.getState());
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [authState, setAuthState] = useState(authStore.getState());
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);
  const [detailEditValue, setDetailEditValue] = useState('');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // 监听全局暗色主题切换
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // 动态生成的黑/白 SVG I-beam 自定义鼠标光标，明亮模式为纯黑色，暗色模式为纯白色
  const customCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path d='M5 2h6v1H8.5v10H11v1H5v-1h2.5V3H5V2z' fill='${isDark ? 'white' : 'black'}'/></svg>") 8 8, text`;

  // 同步详情的编辑内容
  useEffect(() => {
    if (detailTodoId !== null) {
      const todo = todoState.todos.find(t => t.todoId === detailTodoId);
      if (todo) {
        setDetailEditValue(todo.content);
      }
    }
  }, [detailTodoId, todoState.todos]);

  // 抽屉关闭时自动重置为列表模式
  useEffect(() => {
    if (!isOpen) {
      setDetailTodoId(null);
    }
  }, [isOpen]);

  // 复制待办事项内容
  const handleCopy = async (e: React.MouseEvent, content: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  // 订阅登录状态与待办数据变化
  useEffect(() => {
    const unsubAuth = authStore.subscribe(setAuthState);
    const unsubTodo = todoStore.subscribe(setTodoState);
    return () => {
      unsubAuth();
      unsubTodo();
    };
  }, []);

  // 打开面板或登录状态切换时，加载待办事项
  useEffect(() => {
    if (isOpen) {
      todoStore.loadTodos(authState.isLoggedIn);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, authState.isLoggedIn]);

  // 排序：未完成的在上，已完成的沉底
  const sortedTodos = [...todoState.todos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  // 创建新待办
  const handleCreate = async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');
    await todoStore.createTodo(content, authState.isLoggedIn);
  };

  // 切换完成状态
  const handleToggle = async (todo: TodoItem) => {
    await todoStore.toggleTodo(todo.todoId, authState.isLoggedIn);
  };

  // 开始编辑（双击触发）
  const handleStartEdit = (todo: TodoItem) => {
    if (todo.completed) return;
    setEditingId(todo.todoId);
    setEditValue(todo.content);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  // 保存编辑结果
  const handleSaveEdit = async (todo: TodoItem) => {
    const content = editValue.trim();
    if (!content || editingId !== todo.todoId) return;

    setEditingId(null);
    await todoStore.updateTodo(todo.todoId, content, authState.isLoggedIn);
  };

  // 删除待办
  const handleDelete = async (todoId: string) => {
    await todoStore.deleteTodo(todoId, authState.isLoggedIn);
  };

  // 清除已完成
  const handleClearCompleted = async () => {
    await todoStore.clearCompleted(authState.isLoggedIn);
  };

  if (!isOpen) return null;

  const completedCount = todoState.todos.filter(t => t.completed).length;
  const hasCompleted = completedCount > 0;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />

      {/* 左侧面板 */}
      <div className="fixed top-0 right-0 h-full w-96 glass-panel shadow-2xl z-50 flex flex-col cursor-default text-text-primary transition-colors duration-300">
        {/* 面板头部 */}
        <div className="sticky top-0 bg-widget-bg backdrop-blur-xl border-b border-widget-border px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <h2 className="text-base text-text-primary flex items-center gap-2 font-medium">
            <CheckSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            待办事项
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-input-bg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* 输入区域 */}
        {detailTodoId === null ? (
          <div className="px-4 py-3 border-b border-widget-border transition-colors duration-300">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
              }}
              placeholder="新增待办事项，按回车添加..."
              className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-lg text-xs text-text-primary outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-neutral-900 transition-all placeholder-text-placeholder"
            />
          </div>
        ) : null}

        {/* 待办列表 / 详情专注视图 */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {detailTodoId !== null ? (
            (() => {
              const detailTodo = todoState.todos.find(t => t.todoId === detailTodoId);
              if (!detailTodo) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                    <p className="text-xs">该事项不存在</p>
                    <button
                      onClick={() => setDetailTodoId(null)}
                      className="mt-2 text-xs text-blue-500 hover:underline cursor-pointer"
                    >
                      返回列表
                    </button>
                  </div>
                );
              }
              return (
                <div className="flex-1 flex flex-col h-full bg-widget-bg cursor-default transition-colors duration-300">
                  {/* 返回顶栏 */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-widget-border bg-widget-bg cursor-default transition-colors duration-300">
                    <button
                      onClick={() => setDetailTodoId(null)}
                      className="p-1 rounded-full hover:bg-input-bg transition-colors cursor-pointer flex items-center justify-center"
                      title="返回列表"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                    <span className="text-xs font-semibold text-text-primary">编辑待办详情</span>
                  </div>

                  {/* 沉浸式文本框编辑区 - 明暗自适应对比布局 */}
                  <div className="flex-1 p-4 flex flex-col gap-3 min-h-0 cursor-default bg-widget-bg/30 transition-colors duration-300">
                    {detailTodo.createdAt ? (
                      <div className="text-[10px] text-text-secondary font-light select-none cursor-default">
                        创建时间：{formatDate(detailTodo.createdAt)}
                      </div>
                    ) : null}
                    <textarea
                      value={detailEditValue}
                      onChange={e => setDetailEditValue(e.target.value)}
                      onBlur={async () => {
                        if (detailEditValue.trim() && detailEditValue.trim() !== detailTodo.content) {
                          await todoStore.updateTodo(detailTodo.todoId, detailEditValue.trim(), authState.isLoggedIn);
                        }
                      }}
                      placeholder="在这里输入待办的详细内容..."
                      className="flex-1 w-full p-4 bg-input-bg border border-input-border rounded-xl text-xs text-text-primary outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 resize-none transition-colors duration-200 leading-relaxed caret-text-primary"
                      style={{
                        cursor: customCursor
                      }}
                    />
                    
                    {/* 底部控制 */}
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        onClick={() => setDetailTodoId(null)}
                        className="px-3 py-1.5 bg-input-bg hover:bg-gray-200 dark:hover:bg-neutral-800 text-text-primary rounded-lg transition-colors text-xs cursor-pointer border border-input-border"
                      >
                        返回
                      </button>
                      <button
                        onClick={async () => {
                          if (detailEditValue.trim()) {
                            await todoStore.updateTodo(detailTodo.todoId, detailEditValue.trim(), authState.isLoggedIn);
                          }
                          setDetailTodoId(null);
                        }}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-medium cursor-pointer"
                      >
                        保存并返回
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            todoState.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
              </div>
            ) : sortedTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                <CheckSquare className="w-10 h-10 mb-3 opacity-50 text-text-secondary" />
                <p className="text-sm">暂无待办事项</p>
              </div>
            ) : (
              <div className="py-1">
                {sortedTodos.map(todo => (
                  <div
                    key={todo.todoId}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg group transition-colors"
                  >
                    {/* 复选框 */}
                    <button
                      onClick={() => handleToggle(todo)}
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer"
                      style={{
                        borderColor: todo.completed ? '#22c55e' : (isDark ? '#404040' : '#d1d5db'),
                        backgroundColor: todo.completed ? '#22c55e' : 'transparent',
                      }}
                    >
                      {todo.completed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      )}
                      {!todo.completed && (
                        <Circle className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    {/* 待办内容 - 双击进入编辑模式 */}
                    {editingId === todo.todoId ? (
                      <div className="flex-1">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(todo)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit(todo);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full px-2 py-1 bg-input-bg border border-input-border rounded text-sm text-text-primary outline-none focus:border-blue-500 dark:focus:border-blue-400"
                          style={{
                            cursor: customCursor
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col min-w-0">
                        {todo.createdAt ? (
                          <span className="text-[10px] text-text-secondary font-light origin-left select-none mb-0.5">
                            {formatDate(todo.createdAt)}
                          </span>
                        ) : null}
                        <span
                          className={`text-sm transition-all duration-200 select-none line-clamp-5 break-all ${
                            todo.completed ? 'text-text-secondary line-through' : 'text-text-primary'
                          }`}
                          onDoubleClick={() => handleStartEdit(todo)}
                          title="双击编辑"
                          style={{
                            cursor: customCursor
                          }}
                        >
                          {todo.content}
                        </span>
                      </div>
                    )}

                    {/* 操作按钮组 (详情 & 复制 & 恢复 & 删除) */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                      {/* 详情按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailTodoId(todo.todoId);
                        }}
                        className="p-1 rounded hover:bg-input-bg text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer"
                        title="查看详情"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* 复制按钮 */}
                      <button
                        onClick={(e) => handleCopy(e, todo.content)}
                        className="p-1 rounded hover:bg-input-bg text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer"
                        title="复制文本"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* 恢复按钮 (仅已完成的显示) */}
                      {todo.completed ? (
                        <button
                          onClick={() => handleToggle(todo)}
                          className="p-1 rounded hover:bg-green-50 dark:hover:bg-green-950/20 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center justify-center cursor-pointer"
                          title="恢复为待办"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      {/* 删除按钮 (仅已完成项显示) */}
                      {todo.completed ? (
                        <button
                          onClick={() => handleDelete(todo.todoId)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center justify-center cursor-pointer"
                          title="删除任务"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* 底部：清除已完成按钮 */}
        {detailTodoId === null && hasCompleted ? (
          <div className="sticky bottom-0 bg-widget-bg backdrop-blur-xl border-t border-widget-border p-3 transition-colors duration-300">
            <button
              onClick={handleClearCompleted}
              className="w-full py-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 dark:text-red-400 rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer font-medium border border-red-200 dark:border-red-900/30"
            >
              <Trash2 className="w-3 h-3" />
              清除已完成（{completedCount}）
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
