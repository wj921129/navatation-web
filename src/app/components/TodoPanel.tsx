import { X, CheckSquare, Trash2, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { todoService, TodoItem } from '../services/todo-service';
import { authStore } from '../stores/auth-store';

interface TodoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 本地存储键名 */
const LOCAL_TODOS_KEY = 'navatation_todos';

/** 本地待办 ID 自减计数器（使用负数避免与服务端冲突） */
let localIdCounter = 0;
function generateLocalId(): number {
  localIdCounter -= 1;
  return localIdCounter;
}

/**
 * 待办事项面板 - 从右侧滑出的面板组件
 * 支持创建、切换完成、双击编辑、删除和清除已完成功能。
 * 登录后通过 API 与云端同步，未登录则存储在 localStorage。
 */
export function TodoPanel({ isOpen, onClose }: TodoPanelProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState(authStore.getState());
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 订阅登录状态变化
  useEffect(() => {
    const unsub = authStore.subscribe(setAuthState);
    return unsub;
  }, []);

  // 获取本地存储的待办事项
  const getLocalTodos = useCallback((): TodoItem[] => {
    try {
      const raw = localStorage.getItem(LOCAL_TODOS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // 保存待办事项到本地存储
  const saveLocalTodos = useCallback((items: TodoItem[]) => {
    localStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(items));
  }, []);

  // 加载待办事项
  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      if (authState.isLoggedIn) {
        const res = await todoService.getList();
        if (res.code === 200) {
          // 若云端为空且本地有数据，则将本地数据同步到云端
          if (res.data.length === 0) {
            const local = getLocalTodos();
            if (local.length > 0) {
              for (const item of local) {
                await todoService.create(item.content);
              }
              localStorage.removeItem(LOCAL_TODOS_KEY);
              const newRes = await todoService.getList();
              if (newRes.code === 200) {
                setTodos(newRes.data);
                return;
              }
            }
          }
          setTodos(res.data);
        }
      } else {
        setTodos(getLocalTodos());
      }
    } catch (err) {
      console.error('获取待办事项失败', err);
    } finally {
      setLoading(false);
    }
  }, [authState.isLoggedIn, getLocalTodos]);

  // 面板打开时加载待办并聚焦输入框
  useEffect(() => {
    if (isOpen) {
      loadTodos();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, loadTodos]);

  // 排序：未完成的在上，已完成的沉底
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  // 创建新待办
  const handleCreate = async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');
    try {
      if (authState.isLoggedIn) {
        const res = await todoService.create(content);
        if (res.code === 200) await loadTodos();
      } else {
        const newTodo: TodoItem = {
          todoId: generateLocalId(),
          content,
          completed: false,
          sortOrder: todos.length,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        const updated = [...todos, newTodo];
        setTodos(updated);
        saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('创建待办失败', err);
    }
  };

  // 切换完成状态
  const handleToggle = async (todo: TodoItem) => {
    try {
      if (authState.isLoggedIn) {
        const res = await todoService.toggle(todo.todoId);
        if (res.code === 200) await loadTodos();
      } else {
        const updated = todos.map(t =>
          t.todoId === todo.todoId
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
            : t,
        );
        setTodos(updated);
        saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('切换待办状态失败', err);
    }
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
    try {
      if (authState.isLoggedIn) {
        const res = await todoService.update(todo.todoId, content);
        if (res.code === 200) await loadTodos();
      } else {
        const updated = todos.map(t =>
          t.todoId === todo.todoId ? { ...t, content } : t,
        );
        setTodos(updated);
        saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('编辑待办失败', err);
    }
  };

  // 删除待办
  const handleDelete = async (todoId: number) => {
    try {
      if (authState.isLoggedIn) {
        const res = await todoService.delete(todoId);
        if (res.code === 200) await loadTodos();
      } else {
        const updated = todos.filter(t => t.todoId !== todoId);
        setTodos(updated);
        saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('删除待办失败', err);
    }
  };

  // 清除所有已完成待办
  const handleClearCompleted = async () => {
    try {
      if (authState.isLoggedIn) {
        const res = await todoService.clearCompleted();
        if (res.code === 200) await loadTodos();
      } else {
        const updated = todos.filter(t => !t.completed);
        setTodos(updated);
        saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('清除已完成待办失败', err);
    }
  };

  if (!isOpen) return null;

  const completedCount = todos.filter(t => t.completed).length;
  const hasCompleted = completedCount > 0;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* 右侧面板 */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col">
        {/* 面板头部 */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base text-gray-800 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            待办事项
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 输入区域 */}
        <div className="px-4 py-3 border-b border-gray-100">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
            }}
            placeholder="新增待办事项，按回车添加..."
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* 待办列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : sortedTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckSquare className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">暂无待办事项</p>
            </div>
          ) : (
            <div className="py-1">
              {sortedTodos.map(todo => (
                <div
                  key={todo.todoId}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50 group transition-colors"
                >
                  {/* 复选框 */}
                  <button
                    onClick={() => handleToggle(todo)}
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: todo.completed ? '#22c55e' : '#d1d5db',
                      backgroundColor: todo.completed ? '#22c55e' : 'transparent',
                    }}
                  >
                    {todo.completed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                    {!todo.completed && (
                      <Circle className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>

                  {/* 待办内容 - 双击进入编辑模式 */}
                  {editingId === todo.todoId ? (
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
                      className="flex-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span
                      className={`flex-1 text-sm transition-all duration-200 ${
                        todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                      }`}
                      onDoubleClick={() => handleStartEdit(todo)}
                      title="双击编辑"
                    >
                      {todo.content}
                    </span>
                  )}

                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDelete(todo.todoId)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部：清除已完成按钮 */}
        {hasCompleted && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-3">
            <button
              onClick={handleClearCompleted}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              清除已完成（{completedCount}）
            </button>
          </div>
        )}
      </div>
    </>
  );
}
