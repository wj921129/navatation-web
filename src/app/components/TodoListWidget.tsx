import { useState, useEffect } from 'react';
import { TodoItem } from '../services/todo-service';
import { todoStore } from '../stores/todo-store';
import { authStore } from '../stores/auth-store';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

interface TodoListWidgetProps {
  onOpenTodoPanel: () => void;
}

/**
 * 首页左上角挂载的未完结待办事项小组件 (TodoListWidget)
 * 采用和顶部 TopDock 一致的胶囊卡片、半透明（Glassmorphism）和悬停激活视觉交互规范。
 * 用户可以直接在此处查看并一键勾选完成未完结的任务。
 */
export function TodoListWidget({ onOpenTodoPanel }: TodoListWidgetProps) {
  const [todoState, setTodoState] = useState(todoStore.getState());
  const [authState, setAuthState] = useState(authStore.getState());

  useEffect(() => {
    const unsubAuth = authStore.subscribe(setAuthState);
    const unsubTodo = todoStore.subscribe(setTodoState);
    
    // 初始化时加载一次数据
    todoStore.loadTodos(authStore.getState().isLoggedIn);

    return () => {
      unsubAuth();
      unsubTodo();
    };
  }, []);

  // 筛选未完结的待办事项
  const uncompletedTodos = todoState.todos.filter(t => !t.completed);

  // 待办事项为空时，隐藏左上角待办清单
  if (uncompletedTodos.length === 0) return null;

  // 勾选完成某个待办事项
  const handleToggle = async (e: React.MouseEvent, todoId: string) => {
    e.stopPropagation(); // 阻止触发卡片整体点击事件
    await todoStore.toggleTodo(todoId, authState.isLoggedIn);
  };

  return (
    <div 
      onClick={onOpenTodoPanel}
      className="flex flex-col gap-2 px-4 py-2.5 rounded-b-2xl border-t-0 border border-widget-border bg-widget-bg backdrop-blur-md shadow-md opacity-70 hover:opacity-100 hover:backdrop-blur-xl transition-all duration-300 cursor-pointer w-64 max-h-[220px] overflow-hidden group select-none"
    >
      {/* 头部标题与统计 */}
      <div className="flex items-center justify-between text-text-primary border-b border-widget-border pb-1">
        <div className="flex items-center gap-1.5">
          <ListTodo className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
          <span className="text-xs font-semibold dark:font-medium tracking-wide">待办清单</span>
        </div>
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-input-bg text-text-secondary">
          {uncompletedTodos.length} 项未完结
        </span>
      </div>

      {/* 待办事项精简列表 */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[140px] scrollbar-thin">
        {uncompletedTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-text-secondary">
            <span className="text-[11px] font-light">🎉 任务已全部完成！</span>
          </div>
        ) : (
          uncompletedTodos.map(todo => (
            <div
              key={todo.todoId}
              onClick={(e) => handleToggle(e, todo.todoId)}
              className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-input-bg group/item transition-colors"
            >
              {/* 一键勾选圆环 */}
              <div className="flex-shrink-0 mt-0.5 cursor-pointer">
                <Circle className="w-3.5 h-3.5 text-text-secondary group-hover/item:text-green-500 dark:group-hover/item:text-green-400 group-hover/item:scale-110 transition-all duration-200" />
              </div>

              {/* 任务简短文字 */}
              <span className="text-[11px] font-light text-text-secondary line-clamp-3 whitespace-normal break-all flex-1 group-hover/item:text-text-primary transition-colors">
                {todo.content}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* 底部悬浮指引 */}
      <div className="text-[9px] text-text-secondary text-center pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        点击面板查看完整列表
      </div>
    </div>
  );
}
